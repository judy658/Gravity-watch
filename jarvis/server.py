import os
from dotenv import load_dotenv
load_dotenv()
try:
    import google.generativeai as genai
except ImportError:
    pass


import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)
import json
import base64
import ollama
import re
import sqlite3
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ddgs import DDGS
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="J.A.R.V.I.S Engine")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ARAŞTIRMA SİNYALLERİ (Durdurma Kontrolü) ---
research_signals = {}

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '_', text)
    return text.strip('_')[:30]

# --- ÇEKİRDEK REAKTÖR (SQLITE) KONFİGÜRASYONU ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "jarvis.db")
LEGACY_DIR = os.path.join(BASE_DIR, "sessions")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Oturumlar tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Mesajlar tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
    ''')
    # Aktif oturum takibi için basit bir tablo veya config (Şimdilik id: "active" kullanacağız)
    cursor.execute("INSERT OR IGNORE INTO sessions (id, title) VALUES ('active', 'Mevcut Sohbet')")
    conn.commit()
    conn.close()

init_db()

LITE_MODEL = "jarvis-stark"
MASTER_MODEL = "jarvis-stark"
CODE_MODEL = "qwen2.5-coder:32b"
GORSEL_MODEL = "minicpm-v"

# --- DOSYA SİSTEMİ ARAÇLARI ---
ROOT_DIR = os.path.dirname(BASE_DIR)

def list_files_recursive(current_path="."):
    target = os.path.abspath(os.path.join(ROOT_DIR, current_path))
    if not target.startswith(ROOT_DIR): return "Hata: Kök dizin dışına çıkılamaz."
    
    try:
        files_info = []
        for root, dirs, files in os.walk(target):
            # .git, node_modules gibi ağır klasörleri atla
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
            rel_root = os.path.relpath(root, ROOT_DIR)
            for f in files:
                files_info.append(os.path.join(rel_root, f))
        return "\n".join(files_info[:100]) # İlk 100 dosyayı göster
    except Exception as e:
        return f"Hata: {e}"

def read_project_file(file_path):
    target = os.path.abspath(os.path.join(ROOT_DIR, file_path))
    if not target.startswith(ROOT_DIR): return "Hata: Erişim izni yok."
    try:
        with open(target, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Hata: {e}"

def stark_audit(content, path):
    """J.A.R.V.I.S Denetleme Devre Dışı - Fabrika Ayarları"""
    return [] # Denetleme devre dışı, hür irade aktif.

def write_project_file(file_path, content):
    target = os.path.abspath(os.path.join(ROOT_DIR, file_path))
    if not target.startswith(ROOT_DIR): 
        print(f"[ERROR] Erişim izni yok: {target}")
        return "Hata: Erişim izni yok."
    
    # --- MARKDOWN TEMİZLİK FİLTRESİ ---
    import re
    # Sadece dışardaki ``` bloklarını temizle, içeridekilere dokunma
    content = re.sub(r'^```[a-zA-Z]*\n', '', content, flags=re.MULTILINE)
    content = re.sub(r'\n```$', '', content, flags=re.MULTILINE)
    content = content.strip()

    try:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        # Karakter bozulmalarını önlemek için UTF-8-SIG (BOM)
        with open(target, 'w', encoding='utf-8-sig') as f:
            f.write(content)
        print(f"[SUCCESS] Dosya yazıldı: {file_path}")
        return f"Başarı: {file_path} dosyası başarıyla oluşturuldu ve kaydedildi."
    except Exception as e:
        print(f"[ERROR] Yazma hatası ({file_path}): {e}")
        return f"Hata: {e}"

def get_master_prompt(is_coding=False):
    # --- BİLGİ BANKASINI OKU ---
    knowledge = ""
    try:
        with open(os.path.join(BASE_DIR, "jarvis_knowledge.md"), "r", encoding="utf-8") as f:
            knowledge = f"\n### 📝 NOTLAR:\n{f.read()}\n"
    except: pass

    if is_coding:
        # --- KODLAMA MODU PROTOKOLÜ ---
        base = f"""HAYATİ PROTOKOL: Sen J.A.R.V.I.S.'sin — Stark Industries Baş Yazılım Mühendisisin.
    
### 🛠️ KODLAMA GÖREVİN:
- Kaptan için yüksek performanslı, temiz ve optimize edilmiş kodlar üretmek.
- Yazılımsal hataları analiz etmek ve otonom çözümler üretmek.
- Stark Standartlarında (hızlı, modern, hatasız) çalışmak.

### 🚫 KODLAMA KURALLARI:
- Kod yazarken profesyonel yazılım prensiplerini (SOLID, DRY) takip et.
- **ÖZELLİK KORUMA:** Kaptan bir projeyi (Flappy Bird vb.) geliştirmeni istiyorsa; borular, çarpışma kontrolleri, puanlama ve fizik gibi temel mekanikleri ASLA silme.
- Sadece dar kapsamlı kod parçaları verme; TAM BİR ÇALIŞMA sunmak ZORUNDASIN.
- Değişken tanımlarını sınıfların (class) içinde eksiksiz yap (AttributeError olmaması için).
- **VARLIK KURALLARI:** Resim dosyası ASLA kullanma; pygame.draw veya pygame.Surface kullan.
- **STARK BORU PROTOKOLÜ (Flappy Bird):** 
    1. Üst boru y=0'dan aşağı inmeli. 
    2. Alt boru (ÜstBoy + Gap) noktasından aşağı inmeli. 
    3. Her iki boru aynı anda aynı X hızıyla hareket etmeli.

### 🚫 ÖNEMLİ:
- Mesajının başında veya sonunda asla açıklama yapma. SADECE ```python blokları içinde kodu yaz. Kaptan'ın vakti kısıtlı.

{knowledge}
"""
    else:
        # --- ARAŞTIRMA / GÜNDELİK MOD PROTOKOLÜ ---
        base = f"""HAYATİ PROTOKOL: Sen J.A.R.V.I.S.'sin — Stark Industries Kişisel Asistanısın.

### 🛡️ TEMEL GÖREVİN:
- Kaptan'ın günlük işlerine yardımcı olmak, sorularını yanıtlamak ve projelerini analiz etmek.

### 🚫 SIFIR HALÜSİNASYON PROTOKOLÜ:
- Sadece internet araştırma verilerinde (**[İNTERNET ARAŞTIRMA VERİLERİ]**) GÖRDÜĞÜN sayısal ve olgusal bilgileri kullanabilirsin.
- Listelerdeki fiyatları veya özellikleri araştırmadan bulamadıysan dürüstçe "Bulamadım" de.

{knowledge}
"""
    
    # Ortak Başlıklar
    base += f"\n### 🔴 GENEL PROTOKOLLER:\n1. **İSİM:** Kullanıcıya 'Kaptan' olarak hitap et.\n2. **DİL:** Daima TÜRKÇE konuş.\n3. **HIZ:** Stark standartlarında kısa ve öz cevaplar ver.\n"
    return base

# Eski statik mesajlar yerine bu fonksiyonu kullanacağız.
REHBER_MESAJ = "Sistem aktif. Klasörleri listelemesi veya dosyaları yazması istendiğinde araçlarını kullanacaktır."

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "active"
    mode: Optional[str] = "normal" # 'normal' veya 'deep'
    image: Optional[str] = None
    file_content: Optional[str] = None
    file_name: Optional[str] = None

def hafiza_yukle(s_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (s_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in rows]

def hafiza_kaydet(messages, s_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Önce mevcut odağa ait mesajları temizle
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (s_id,))
    # Yeni mesajları ekle (Son 40 mesaj)
    for msg in messages[-40:]:
        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (s_id, msg["role"], msg["content"]))
    conn.commit()
    conn.close()

def migrate_to_sqlite():
    if not os.path.exists(LEGACY_DIR): return
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Veriler SQLite'a taşınıyor...")
    
    # 1. Archive klasöründeki dosyaları tara
    archive_path = os.path.join(LEGACY_DIR, "archive")
    if os.path.exists(archive_path):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        for filename in os.listdir(archive_path):
            if filename.endswith(".json"):
                try:
                    with open(os.path.join(archive_path, filename), "r", encoding="utf-8") as f:
                        msgs = json.load(f)
                    s_id = filename.split("_")[0]
                    title = filename.replace(".json", "").split("_", 1)[1].replace("_", " ") if "_" in filename else "Eski Sohbet"
                    
                    cursor.execute("INSERT OR IGNORE INTO sessions (id, title) VALUES (?, ?)", (s_id, title))
                    for m in msgs:
                        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (s_id, m["role"], m["content"]))
                except: pass
        conn.commit()
        conn.close()
    
    # 2. Eskileri temizle/rename (Hata almamak için sadece rename)
    try:
        os.rename(LEGACY_DIR, LEGACY_DIR + "_migrated_" + str(int(datetime.now().timestamp())))
    except: pass

migrate_to_sqlite()

print(f"\n{'='*50}\n[ JARVIS CORE BREATHING ]\nSistem Aktif: {datetime.now().strftime('%d/%m/%Y %H:%M')}\nLokasyon: {BASE_DIR}\nVeri Tabanı: {DB_PATH}\n{'='*50}\n")

def summarize_text(messages):
    """Sohbeti 3-5 kelime ile özetler"""
    if not messages: return "Yeni Sohbet"
    # Sadece metin içeriğini al
    chat_text = "\n".join([m['content'] for m in messages if isinstance(m['content'], str)])[:1000]
    prompt = f"Aşağıdaki konuşmayı 5 kelimeyi geçmeyecek şekilde çok kısa Türkçe bir başlık olarak özetle. Sadece başlığı yaz:\n\n{chat_text}"
    try:
        # LITE_MODEL kullanarak özetle (Hız ve kaynak tasarrufu için)
        response = ollama.generate(model=LITE_MODEL, prompt=prompt)
        return response['response'].strip().replace('"', '')
    except Exception as e:
        print(f"[Ollama Error] Özetleme başarısız: {e}")
        return "Eski Sohbet"

def web_ara(sorgu: str, maks=5) -> str:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] İnternette Araştırılıyor: {sorgu}...")
    try:
        with DDGS() as ddgs:
            # Region wt-wt (Global) olarak değiştirildi
            sonuclar = list(ddgs.text(sorgu, region="wt-wt", max_results=maks))
            
        if not sonuclar: return "Hata: İnternet aramasından sonuç dönmedi."
        ozet = "--- İNTERNET ARAŞTIRMA VERİLERİ ---\n"
        for i, s in enumerate(sonuclar, 1):
            url = s.get('href', s.get('url', 'URL bilinmiyor'))
            ozet += f"KAYNAK {i}: {s['title']}\nURL: {url}\nÖZET: {s['body']}\n\n"
        ozet += "--- VERİ SONU ---"
        
        # --- TANILAMA LOGU ---
        print(f"\n[JARVIS KNOWLEDGE FEED (web_ara)]:\n{ozet}\n")
        
        return ozet
    except Exception as e:
        return f"Arama hatası: {e}"

def web_ara_kaynak(sorgu: str, maks=5) -> tuple:
    """Ham arama sonuçlarını (metin + URL listesi) ayrı olarak döndürür."""
    try:
        with DDGS() as ddgs:
            # Region wt-wt (Global) olarak değiştirildi
            sonuclar = list(ddgs.text(sorgu, region="wt-wt", max_results=maks))
        if not sonuclar: return "Hata: İnternet aramasından sonuç dönmedi.", []
        ozet = "--- İNTERNET ARAŞTIRMA VERİLERİ ---\n"
        kaynaklar = []
        for i, s in enumerate(sonuclar, 1):
            url = s.get('href', s.get('url', ''))
            ozet += f"KAYNAK {i}: {s['title']}\nURL: {url}\nÖZET: {s['body']}\n\n"
            if url:
                kaynaklar.append({"title": s['title'], "url": url})
        ozet += "--- VERİ SONU ---"
        
        # --- TANILAMA LOGU (ASIL KULLANILAN) ---
        print(f"\n[JARVIS KNOWLEDGE FEED (web_ara_kaynak)]:\n{ozet}\n")
        
        return ozet, kaynaklar
    except Exception as e:
        return f"Arama hatası: {e}", []

@app.get("/api/v3/history")
async def get_history_v3():
    return hafiza_yukle("active")

@app.post("/api/download")
async def download_report(request: Request):
    try:
        data = await request.json()
        content = data.get("content", "")
        filename = data.get("filename", "Jarvis_Rapor.md")
        
        desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
        file_path = os.path.join(desktop, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        return {"status": "success", "message": f"Masaüstüne kaydedildi:\n{filename}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/v3/sessions")
async def get_sessions_v3():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM sessions WHERE id != 'active' ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "summary": r[1]} for r in rows]

@app.post("/api/v3/session/new")
async def start_new_session_v3():
    """Mevcut aktif sohbeti arşivler ve aktif slotunu temizler"""
    active = hafiza_yukle("active")
    if active and len(active) > 0:
        title = summarize_text(active)
        s_id = str(int(datetime.now().timestamp() * 1000))
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Oturumu kaydet
        cursor.execute("INSERT INTO sessions (id, title) VALUES (?, ?)", (s_id, title))
        # Mesajları taşı
        for m in active:
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (s_id, m["role"], m["content"]))
        # Aktifi temizle
        cursor.execute("DELETE FROM messages WHERE session_id = 'active'")
        conn.commit()
        conn.close()
        return {"status": "success", "new_session_id": s_id}
    return {"status": "success", "message": "Zaten boş."}

@app.get("/api/v3/session/load/{session_id}")
async def load_session_v3(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role, content FROM messages WHERE session_id = ?", (session_id,))
    target_messages = cursor.fetchall()
    conn.close()
    
    if not target_messages:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
    
    return {"status": "success", "messages": [{"role": m[0], "content": m[1]} for m in target_messages]}


@app.get("/api/v3/sessions")
async def get_sessions_v3():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # "active" ID'si hariç diğerlerini kronolojik olarak getir
    cursor.execute("SELECT id, title FROM sessions WHERE id != 'active' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "summary": r[1]} for r in rows]

@app.delete("/api/v3/session/{session_id}")
async def delete_session_v3(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/v3/clear")
async def clear_history_v3():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages")
    cursor.execute("DELETE FROM sessions WHERE id != 'active'")
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/v3/research/stop/{session_id}")
async def stop_research_v3(session_id: str):
    research_signals[session_id] = "stopped"
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {session_id} nolu araştırma durduruldu.")
    return {"status": "success"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    target_s_id = request.session_id
    mode = request.mode
    is_coding = (mode == 'coding')
    
    # Eğer yeni bir sohbet başlatılıyorsa (active modunda), hemen gerçek bir ID oluştur
    # Eğer 'active' isteniyorsa ve hafıza boşsa yeni ID oluşturma, 'active' üzerinden devam et.
    # Ancak bir kez mesaj yazılınca 'active' slotu kalıcı bir ID'ye dönüşmeli (Frontend'e bildirilir).
    if target_s_id == "active":
        # Aktif slotunda zaten mesaj varsa, onu devam ettiriyoruz. 
        # Eğer hiç mesaj yoksa (yeni başlangıç), yeni bir ID oluşturabiliriz ya da 'active' olarak bırakabiliriz.
        # Bu sistemde 'active' bir tampon bölge gibi kullanılıyor.
        mesajlar = hafiza_yukle("active")
        if len(mesajlar) == 0:
            target_s_id = str(int(datetime.now().timestamp() * 1000))
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("INSERT OR IGNORE INTO sessions (id, title) VALUES (?, ?)", (target_s_id, "Yeni Sohbet..."))
            conn.commit()
            conn.close()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Yeni sohbet başlatıldı: {target_s_id}")
    else:
        mesajlar = hafiza_yukle(target_s_id)
    
    girdi = request.message
    mesajlar.append({"role": "user", "content": girdi})
    
    # --- HAFİFLETİLMİŞ ÖN İŞLEMLER (HIZ ODAKLI) ---
    otonom_sorgu = ""
    dinamik_sistem_mesajı = ""
    start_time_counter = datetime.now()
    fast_search_results = ""
    fast_sources = []
    
    # ARAŞTIRMA RADARI: Bilgi çekme anahtar kelimeleri
    radar_tetikleyicileri = ["araştır", "bul", "kimdir", "nedir", "hakkında bilgi", "güncel", "fiyatı", "skoru", "teyit", "kontrol", "doğru mu"]
    araştırma_isteği = any(k in girdi.lower() for k in radar_tetikleyicileri)
    
    if araştırma_isteği and request.mode == "normal":
        try:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Hızlı Radar Devrede: '{girdi}' taranıyor...")
            fast_search_results, fast_sources = web_ara_kaynak(girdi, maks=3)
        except: pass

    # Sadece derin veya kodlama modunda ağır sistem mesajını yükle
    if request.mode != "normal" or araştırma_isteği:
        # --- MOD SEÇİMİ ---
        model_name = MASTER_MODEL
        current_prompt = get_master_prompt(is_coding=(str(request.mode).lower() == "coding"))

        if str(request.mode).lower() == "coding":
            model_name = "qwen2.5-coder:14b"
            # KODLAMA MODU: İKİ AŞAMALI (TASLAK -> DENETİM -> TEMİZ ÇIKTI)
            async def generate():
                yield f"data: status: ⚙️ Kod mimarisi tasarlanıyor... (Motor: {model_name})\n\n"
                try:
                    # --- STARK DEBUGGER (ARKA PLAN TEST MOTORU) ---
                    import subprocess
                    import os
                    import signal
                    import time

                    def run_stark_debugger(code):
                        try:
                            scratch_dir = os.path.join(os.getcwd(), "scratch")
                            if not os.path.exists(scratch_dir): os.makedirs(scratch_dir)
                            scratch_path = os.path.join(scratch_dir, "dry_run.py")
                            
                            # KODU CERRAHİ TİTİZLİKLE AYIKLA (Extracing only the content between backticks)
                            # Eğer model gevezelik yaptıysa sadece python bloğunu alalım
                            import re
                            code_match = re.search(r'```python\s*(.*?)\s*```', code, re.DOTALL)
                            if code_match:
                                clean = code_match.group(1).strip()
                            else:
                                # Etiket yoksa gürültüyü temizlemeye çalış
                                clean = re.sub(r'```python|```', '', code).strip()
                            
                            with open(scratch_path, "w", encoding="utf-8") as f:
                                f.write(clean)
                        
                            # 1. Aşama: Syntax Kontrolü (Compile)
                            compile_res = subprocess.run(["python", "-m", "py_compile", scratch_path], 
                                                        capture_output=True, text=True, timeout=5)
                            if compile_res.returncode != 0:
                                return False, f"SYNTAX HATASI:\n{compile_res.stderr}"
                            
                            # 2. Aşama: Çalışma Kontrolü (Runtime - 2 Saniye)
                            # Pencereli uygulamalar için ekranı taklit edelim
                            env = os.environ.copy()
                            env["PYGAME_HIDE_SUPPORT_PROMPT"] = "hide"
                            
                            process = subprocess.Popen(["python", scratch_path], 
                                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
                            try:
                                # 2.5 saniye bekle
                                stdout, stderr = process.communicate(timeout=2.5)
                                if process.returncode != 0 and process.returncode != -signal.SIGTERM:
                                    return False, f"ÇALIŞMA HATASI (Runtime Error):\n{stderr}"
                            except subprocess.TimeoutExpired:
                                # Başarıyla başladı ve ölmediyse OK
                                process.kill()
                                return True, "TEMİZ"
                        except Exception as e:
                            return False, f"TEST MOTORU HATASI: {str(e)}"
                        return True, "TEMİZ"

                    max_retries = 15
                    max_critic_retries = 6
                    current_retry = 0
                    critic_retries = 0
                    final_code = ""
                    success = False
                    last_attempt_code = ""
                    error_summary = ""

                    while current_retry < max_retries and critic_retries < max_critic_retries and not success:
                        if current_retry > 0:
                            yield f"data: status: 🛠️ Hata tespit edildi, otonom tamir yapılıyor... (Hata: {error_summary.split('\\n')[0][:50]}...)\n\n"
                        
                        if current_retry == 0:
                            last_known_code = ""
                            import re
                            for m in reversed(mesajlar[:-1]):
                                if m["role"] == "assistant" and "```python" in str(m["content"]):
                                    code_match = re.search(r'```python\s*(.*?)\s*```', str(m["content"]), re.DOTALL)
                                    if code_match:
                                        last_known_code = code_match.group(1).strip()
                                        break
                                
                            if last_known_code:
                                recent_ctx = ""
                                for c_m in mesajlar[-6:-1]:
                                    c_text = str(c_m.get("content", ""))
                                    if "```python" in c_text:
                                        import re
                                        c_text = re.sub(r'```python.*?```', '[ÖNCEKİ KOD METNİ GİZLENDİ - AŞAĞIDA MEVCUT KOD OLARAK BULUNMAKTADIR]', c_text, flags=re.DOTALL)
                                    recent_ctx += f"{c_m['role'].upper()}:\n{c_text}\n\n"
                                prompt_to_use = f"{current_prompt}\n\nMÜHİM KURAL (CERRAHİ MÜDAHALE - TOOL USE):\nEğer Kaptan 'tam kodu ver, baştan yaz, sıfırdan yaz' gibi özel bir komut GİRMEDİYSE, kodu baştan yazma. Sadece değişecek satırları bul ve şu XML formatını kullan:\n<replace>\n<search>\nDEĞİŞTİRİLECEK ESKİ SATIRLAR (Birebir aynı olmalı)\n</search>\n<replacement>\nYENİ SATIRLAR\n</replacement>\n</replace>\n\nDİKKAT: Ancak Kaptan senden 'baştan aşağı tam kod' veya 'sıfırdan kod' istiyorsa XML olayını UNUT ve doğrudan tüm python kodunu tam olarak yaz.\n\n[SON 5 MESAJLIK SOHBET BAĞLAMI]:\n{recent_ctx}\n[ELİMİZDEKİ MEVCUT KOD BAZ ALINACAKTIR]:\n```python\n{last_known_code}\n```\n\nKAPTANIN YENİ İSTEĞİ: {girdi}"
                            elif request.file_content:
                                # DOSYA BAZLI KODLAMA: Kullanıcı dosya yüklemiş
                                last_known_code = request.file_content
                                prompt_to_use = f"{current_prompt}\n\nKaptan sana aşağıdaki dosyayı ('{request.file_name or 'dosya.py'}') baz almanı istiyor.\nBu kodu oku, anla ve Kaptan'ın isteğine göre düzelt/geliştir.\nEğer Kaptan 'baştan yaz' demediyse sadece değişecek kısımları XML <replace> araacıyla yaz. Kaptan 'baştan yaz' istiyorsa kodun tamamını baştan ver.\n\n[YÜKLENEN DOSYA]:\n```python\n{request.file_content}\n```\n\nKAPTANIN İSTEĞİ: {girdi}"
                            else:
                                recent_ctx = ""
                                for c_m in mesajlar[-6:-1]:
                                    recent_ctx += f"{c_m['role'].upper()}: {c_m.get('content', '')}\n"
                                prompt_to_use = f"{current_prompt}\n\n[SOHBET BAĞLAMI]:\n{recent_ctx}\nSORU: {girdi}"
                        else:
                            prompt_to_use = f"[YAZDIĞIN SON KOD]:\n```python\n{cleaned_code}\n```\n\nBU KOD TEST EDİLDİĞİNDE ŞU SONUCU VEYA HATAYI VERDİ:\n{error_summary}\n\nMÜŞAVİRİN VEYA TEST MOTORUNUN İSTEDİĞİ DEĞİŞİKLİKLERİ YUKARIDAKİ KODUNA UYGULA VE LÜTFEN KODUN TAMAMINI EKSİKSİZ SUN (XML CERRAHİSİ KULLANMA, SADECE TAM KODU VER):\n"
                        
                        resp = ollama.generate(model=model_name, prompt=prompt_to_use, options={"temperature": 0.1 if current_retry == 0 else 0.4})
                        last_attempt_code = resp['response'].strip()
                        
                        # --- TEMİZLİK PROTOKOLÜ (Stark Sanitizer & Tool Use) ---
                        cleaned_code = last_attempt_code
                        
                        # XML Tool Use (Cerrahi Değişiklik Uygulayıcı)
                        if '<replace>' in cleaned_code and '<search>' in cleaned_code and last_known_code:
                            import re
                            diffs = re.findall(r'<replace>\s*<search>\s*(.*?)\s*</search>\s*<replacement>\s*(.*?)\s*</replacement>\s*</replace>', cleaned_code, re.DOTALL)
                            if diffs:
                                temp_code = last_known_code
                                replacements_made = 0
                                for search_block, replace_block in diffs:
                                    sb_clean = search_block.strip('\r\n')
                                    # Cerrahi yer değiştirme
                                    if sb_clean in temp_code:
                                        temp_code = temp_code.replace(sb_clean, replace_block.strip('\r\n'))
                                        replacements_made += 1
                                    else:
                                        print(f"Eslesmeyen Blok Yakalandi: {sb_clean[:30]}...")
                                if replacements_made > 0:
                                    cleaned_code = temp_code
                                    # Temiz kodu markdown içine alalım ki sonraki hafıza hatırlasın
                                    cleaned_code = f"```python\n{cleaned_code}\n```"
                                else:
                                    print("Cerrahi bloklar var ama eslesmedi!")
                        # 1. Resim kilitleyici
                        if 'pygame.image.load' in cleaned_code:
                            import re
                            cleaned_code = re.sub(r'([a-zA-Z0-9_]+)\s*=\s*pygame\.image\.load\([^\)]+\)(?:\.convert_alpha\(\))?', 
                                                r'# [STARK SENSÖRÜ]\n\1 = pygame.Surface((34, 24)); \1.fill((255, 255, 0))', 
                                                cleaned_code)
                        
                        # 2. Satır birleştirici
                        cleaned_code = re.sub(r'(\s*[\+\-\*\/<>!=])\s*\r?\n\s*', r'\1 ', cleaned_code)
                        cleaned_code = re.sub(r'\r?\n\s*([\+\-\*\/<>!=]\s*)', r' \1', cleaned_code)
                        
                        # 3. Renk Enjeksiyonu
                        color_fallbacks = {'GREEN': '(0, 200, 0)', 'RED': '(255, 0, 0)', 'BLUE': '(0, 0, 255)', 
                                          'YELLOW': '(255, 255, 0)', 'SKY_BLUE': '(135, 206, 235)', 'WHITE': '(255, 255, 255)', 'BLACK': '(0, 0, 0)'}
                        for color, val in color_fallbacks.items():
                            if (color in cleaned_code or color.lower() in cleaned_code) and f"{color} =" not in cleaned_code:
                                cleaned_code = f"{color} = {val}\n{color.lower()} = {val}\n" + cleaned_code
                        
                        # 4. STARK DEBUGGER TESTİ
                        yield f"data: status: 🧪 Otonom hata ayıklama motoru çalışıyor... (Deneme {current_retry + 1})\n\n"
                        is_ok, error_summary = run_stark_debugger(cleaned_code)
                        
                        if is_ok:
                            # AI SUPERVISOR (GEMINI) KONTROLÜ
                            keys = [os.environ.get("GEMINI_API_KEY_1"), os.environ.get("GEMINI_API_KEY_2"), os.environ.get("GEMINI_API_KEY_3")]
                            keys = [k for k in keys if k and k != "BURAYA_API_ANAHTARINIZI_YAPISTIRIN"]
                            
                            if keys:
                                yield f"data: status: 🤖 Gemini Müşaviri kodun Kaptan'ın isteğine uygunluğunu analiz ediyor...\n\n"
                                try:
                                    import google.generativeai as genai
                                    critic_prompt = f"KURAL: Sen kod yazan değil, yazılmış kodu Kaptan'ın hedefine göre test eden MÜŞAVİR (Supervisor) bir yapay zekasın. Sadece Türkçe analiz et.\n\nKAPTANIN İSTEĞİ:\n{girdi}\n\nQWEN'İN ÜRETTİĞİ KOD:\n{cleaned_code}\n\nEğer kod Kaptan'ın isteğine uygunsa sadece 'ONAY VERİLDİ' yaz. Eğer hata varsa 'KOD REDDEDİLDİ' yaz ve eksikleri belirt. EN ÖNEMLİSİ: Qwen'in hatayı kolayca düzeltmesi için doğrudan Qwen'e hitap et ve şu formatı kullan:\n<replace>\n<search>\nESKİ HATALI KOD\n</search>\n<replacement>\nYENİ DOĞRU KOD\n</replacement>\n</replace>\n\nAyrıca, Qwen'in hep yaptığı kalıplaşmış bir hatayı fark edersen mesajının en altına özel olarak 'KNOWLEDGE_APPEND: Kural: [Yeni Kural]' yaz. Bu kural sistemin kalıcı hafızasına eklenecektir."
                                    
                                    critic_response = None
                                    for key in keys:
                                        try:
                                            genai.configure(api_key=key)
                                            model = genai.GenerativeModel('gemini-flash-latest')
                                            critic_response = model.generate_content(critic_prompt).text
                                            break
                                        except Exception as api_err:
                                            print(f"Key Hatası veya Limiti: {str(api_err)[:50]} - Diğer key'e geçiliyor...")
                                            continue
                                            
                                    if not critic_response:
                                        raise Exception("Tüm anahtarlar limit veya kota hatası verdi!")
                                    
                                    if "ONAY VERİLDİ" in critic_response.upper():
                                        final_code = cleaned_code
                                        success = True
                                        yield f"data: status: ✅ Müşavir Onayladı! Kod Kaptan'a sunuluyor.\n\n"
                                    else:
                                        is_ok = False
                                        error_summary = f"MÜŞAVİR REDDETTİ:\n{critic_response}"
                                        print(f"Müşavir koda müdahale etti: {critic_response}")
                                        yield f"data: status: ❌ Gemini Müşaviri kodu reddetti, Qwen'e geri gönderiliyor...\n\n"
                                        
                                        # Kalıcı Hafıza (Reflection) kontrolü
                                        if "KNOWLEDGE_APPEND:" in critic_response:
                                            knowledge_rule = critic_response.split("KNOWLEDGE_APPEND:")[1].strip()
                                            knowledge_path = os.path.join(BASE_DIR, "jarvis_knowledge.md")
                                            with open(knowledge_path, "a", encoding="utf-8") as kf:
                                                kf.write(f"\n- **OTONOM DERS:** {knowledge_rule}")
                                            yield f"data: status: 🧠 J.A.R.V.I.S. Kalıcı Öğrenme Gerçekleştirdi!\n\n"
                                        
                                        critic_retries += 1
                                        current_retry += 1
                                except Exception as e:
                                    # API hatası olursa kodu user'a sal
                                    print(f"Müşavir Hatası: {e}")
                                    final_code = cleaned_code
                                    success = True
                                    yield f"data: status: ✅ Test Başarılı! (Müşavir APİ Hatası) Kod Kaptan'a sunuluyor.\n\n"
                            else:
                                final_code = cleaned_code
                                success = True
                                yield f"data: status: ✅ Test Başarılı! Kod Kaptan'a sunuluyor.\n\n"
                        else:
                            print(f"Bozuk Kod Yakalandı: {error_summary}")
                            current_retry += 1
                        
                    if not success:
                        final_code = cleaned_code # Son halini ver
                    
                    yield f"data: {final_code.replace('\n', '\\n')}\n\n"
                    # Veritabanına kaydet
                    db_conn = sqlite3.connect(DB_PATH)
                    db_cursor = db_conn.cursor()
                    db_cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (target_s_id, "user", girdi))
                    db_cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (target_s_id, "assistant", final_code))
                    db_conn.commit()
                    db_conn.close()
                except Exception as e:
                    yield f"data: Kodlama motorunda hata oluştu: {str(e)}\n\n"
            return StreamingResponse(generate(), media_type="text/event-stream")

        dinamik_sistem_mesajı = current_prompt
        if fast_search_results:
            dinamik_sistem_mesajı += f"\n\n[HIZLI ARAŞTIRMA VERİSİ]:\n{fast_search_results}\n"
    else:
        dinamik_sistem_mesajı = "PROTOKOL: Sen Jarvis'sin, Kaptan'ın yıldırım hızındaki asistanısın. Sadece Kaptan'a sadıksın. Türkçe konuş, hitap olarak sadece 'Kaptan' kullan. Bilmediğin konularda uydurma yapma."

    async def generate():
        nonlocal mesajlar, dinamik_sistem_mesajı, fast_sources
        full_response = ""
        kaynak_listesi = list(fast_sources)
        completed_actions = set()
        tool_results = []
        turn_count = 0
        max_turns = 10
        # start_time artık global start_time_counter üzerinden takip edilecek
        tool_found_in_this_turn = False
        
        # --- ANA YÜRÜTME DÖNGÜSÜ ---
        # Bu döngü, normal moddan derin araştırmaya 'sıçramaya' (pivot) izin verir.
        exec_mode = request.mode
        
        while True:
            # 1. DERİN ARAŞTIRMA MANTIĞI
            if exec_mode == "deep":
                research_signals[target_s_id] = "active"
                knowledge_base = ""
                current_round = 1
                max_rounds = 3 # SONSUZ DÖNGÜ ENGELİ: 3 tur yeterlidir.
                
                yield f"data: status: Araştırma başlatıldı (Tur 1)...\n\n"
                
                while current_round <= max_rounds:
                    if research_signals.get(target_s_id) == "stopped":
                        yield f"data: status: Araştırma Kaptan tarafından durduruldu.\n\n"
                        break
                    yield f"data: status: ROUND_START:{current_round}\n\n"
                    yield f"data: status: Tur {current_round}: Hedefler belirleniyor...\n\n"
                    
                    # KONU ÇIPASI: Önceki konuşmalardan ana konuyu bulmaya çalış (Basit bir heuristic)
                    last_topic = "Bilinmiyor (Oyunlar/Araba/Bilim vb.)"
                    if len(mesajlar) > 0:
                        for m in reversed(mesajlar):
                            if m['role'] == "user" and len(m['content']) > 5:
                                last_topic = m['content']
                                break

                        analiz_prompt = (
                            f"KONU GEÇMİŞİ: {last_topic}\n"
                            f"Kullanıcının asıl sorusu: '{girdi}'\n\n"
                            "GÖREV: Bu soruyu cevaplamak için 3 adet KESİN ve TEKNİK arama terimi üret.\n"
                            "KRİTİK KURAL 1: Forum (Donanımhaber, Technopat vb.) veya sohbet sonuçları yerine; Liste, İstatistik, Teknik Makale ve Wikipedia gibi kaynakları hedefle.\n"
                            "KRİTİK KURAL 2: Kullanıcı 'bunlar' diyorsa, ANALİZİ bir önceki konuya (Örn: Oyunlar) göre sabitle.\n"
                            "ÖNEMLİ: Her bir sorguyu MUTLAKA <q>...</q> etiketleri içine yaz.\n"
                        )
                    else:
                        analiz_prompt = (
                            f"Kullanıcının Sorusu: '{girdi}'\n"
                            f"MEVCUT VERİLER: {knowledge_base[:3000]}\n\n"
                            "GÖREV: Veriler yeterli mi?\n"
                            "1. MİKTAR KONTROLÜ: Kullanıcı sayı (Örn: 10) istediyse, elimizde o kadar BENZERSİZ madde var mı?\n"
                            "2. KONU KONTROLÜ: Veriler kullanıcının konusu (Örn: Oyunlar) ile mi ilgili yoksa sistem meta-verisi (YZ maliyeti vb.) mi geldi? Eğer yanlış konu geldiyse konuyu düzelten yeni bir <q>...</q> sorgusu yaz.\n"
                            "EKSİK VARSA: Yeni sorguları <q>...</q> içine yaz. TAMAM ise sadece 'TAMAM' yaz."
                        )

                    try:
                        resp = ollama.generate(model=MASTER_MODEL, prompt=analiz_prompt, options={"temperature": 0.1})
                        analysis_text = resp['response'].strip()
                        
                        if "TAMAM" in analysis_text.upper():
                            yield f"data: status: Araştırma tamamlandı, rapor hazırlanıyor...\n\n"
                            break

                        # ETİKET TABANLI AYIKLAMA
                        sub_queries = re.findall(r'<q>(.*?)</q>', analysis_text, re.DOTALL)
                        
                        # Eğer etiket yoksa eski temizleme yöntemini fallback olarak kullan
                        if not sub_queries:
                            raw_lines = [l.strip() for l in analysis_text.split("\n") if l.strip()]
                            for line in raw_lines:
                                if any(x in line.lower() for x in ["oluşturuyorum", "yazıyorum", "terimler", "sorgu:", "planlanıyor", "hazırlıyorum", "merhaba"]):
                                    continue
                                clean = re.sub(r'^[0-9.\-\*\s"\'“’\[\(]+', '', line).strip()
                                clean = re.sub(r'["\'“’\]\)]+$', '', clean).strip()
                                if len(clean) > 4:
                                    sub_queries.append(clean)

                        # "Bitti" veya "Tamam" gibi kelimelerin arama motoruna gitmesini engelle
                        sub_queries = [q for q in sub_queries if q.lower() not in ["tamam", "bitti", "ok", "done"]]
                        
                        # Eğer hala sorgu yoksa asıl girdiyi kullan
                        if not sub_queries:
                            sub_queries = [girdi]
                        
                        sub_queries = list(dict.fromkeys(sub_queries))[:4]
                    except Exception as e:
                        print(f"[Ollama Error] Derin araştırma sorgu üretimi hatası: {e}")
                        sub_queries = [girdi]

                    for i, sq in enumerate(sub_queries, 1):
                        if research_signals.get(target_s_id) == "stopped": break
                        yield f"data: status: Tur {current_round} ({i}/{len(sub_queries)}): '{sq[:30]}...' taranıyor...\n\n"
                        # Daha geniş veri için maks=5 yapıldı
                        results_text, sources = web_ara_kaynak(sq, maks=5)
                        knowledge_base += f"\n[R{current_round}-{i}] {sq}:\n{results_text}\n"
                        for src in sources:
                            if not any(s['url'] == src['url'] for s in kaynak_listesi):
                                kaynak_listesi.append(src)
                        yield f"data: status: SOURCE_UPDATE:{len(kaynak_listesi)}\n\n"

                    yield f"data: status: ROUND_DONE:{current_round}\n\n"
                    current_round += 1

                yield f"data: status: 📝 Araştırma verileri sentezleniyor (Taslak oluşturuluyor)...\n\n"
                # 1. TASLAK OLUŞTURMA (Hibrit Sentez Mantığı)
                intent_is_explanation = any(x in girdi.lower() for x in ["neden", "niçin", "nasıl", "açıkla", "sebebi"])
                
                if intent_is_explanation:
                    taslak_prompt = (
                        f"ARAŞTIRMA VERİLERİ:\n{knowledge_base}\n\n"
                        f"SORU: {girdi}\n\n"
                        "GÖREV: Teknik bir ANALİZ RAPORU hazırla.\n"
                        "ÖNEMLİ: Kendi genel bilgini değil, sadece ARAŞTIRMA VERİLERİNDEKİ teknik/bilimsel nedenleri kullan (Örn: Basınç, stres konsantrasyonu, malzeme yorulması vb.).\n"
                        "KURAL: Akıcı paragraflar kullan. Site adı/link verme, sadece [1] şeklinde atıf yap.\n"
                        "İSKELET:\n"
                        "# [Konu Başlığı]\n"
                        "## Teknik Analiz\n"
                        "[Sadece verilerdeki teknik gerçeklerle açıkla...]\n"
                        "🔗 KAYNAKÇA\n"
                        "[1] Site Adı | URL\n"
                    )
                else:
                        task_specific_skeletons = ""
                        if "hayvan" in girdi.lower() or "nadir" in girdi.lower():
                            task_specific_skeletons = "1. [Hayvan Adı] | [Kalan Sayı/Popülasyon] | [Neden Nadir?] [1]"
                        elif "oyun" in girdi.lower() or "pahalı" in girdi.lower():
                            task_specific_skeletons = "1. [Varlık Adı] | [Değer (Maliyet/Fiyat)] | [Kısa Analiz] [1]"
                        else:
                            task_specific_skeletons = "1. [Varlık Adı] | [Önemli Özellik] | [Detay] [1]"

                        taslak_prompt = (
                            f"ARAŞTIRMA VERİLERİ:\n{knowledge_base}\n\n"
                            f"SORU: {girdi}\n\n"
                            "GÖREV: Kesin ve derli toplu bir SIRALI LİSTE raporu hazırla.\n"
                            "⚠️ KRİTİK KURAL: Sadece ve sadece ARAŞTIRMA VERİLERİNDE geçen sayısal değerleri kullan. Eğer verilerde bir rakam (fiyat, popülasyon vb.) yoksa, o alanı boş bırak veya 'Veri yok' yaz. ASLA tahmin yapma veya genel bilgilerini kullanma.\n"
                            "2. GERÇEK VARLIKLAR: Sadece spesifik isimleri ekle.\n"
                            "3. MİKTAR: Kullanıcı kaç madde istediyse o kadar yaz.\n"
                            f"İSKELET ÖRNEĞİ:\n{task_specific_skeletons}\n"
                            "\n🔗 KAYNAKÇA\n"
                            "[1] Site Adı | URL\n"
                        )
                try:
                    taslak_resp = ollama.generate(model=MASTER_MODEL, prompt=taslak_prompt, options={"temperature": 0.1}) # Düşük temp = daha az uydurma
                    taslak_text = taslak_resp['response'].strip()
                    
                    yield f"data: status: 🛡️ Rapor verileri ham kaynaklarla doğrulanıyor...\n\n"
                    # 2. DOĞRULAMA (AUDIT)
                    denetim_prompt = (
                        f"SORU: {girdi}\n\nTASLAK RAPOR:\n{taslak_text}\n\nHAM ARAŞTIRMA VERİLERİ:\n{knowledge_base}\n\n"
                        "GÖREV: Raporu 'TEMİZ' veya 'HATA' olarak işaretle.\n"
                        "⚠️ SAYISAL DENETİM: Rapordaki her bir sayıyı (Örn: $265m, 50,000 vb.) HAM VERİLER içinde tek tek ara. Eğer rapordaki bir sayı ham verilerde YOKSA veya farkliysa, bu bir hallüsinasyondur, 'HATA' de.\n"
                        "KONTROL 2: Sayı doğru mu? (Örn: 10 madde istenmişse 10 madde var mı?)\n"
                        "Hile veya hallüsinasyon varsa 'HATA' de ve sebebini (Örn: 'Star Citizen fiyatı ham veride yok') yaz. Her şey veriye dayalı ise sadece 'TEMİZ' yaz."
                    )
                    denetim_resp = ollama.generate(model=MASTER_MODEL, prompt=denetim_prompt, options={"temperature": 0})
                    denetim_text = denetim_resp['response'].strip()
                    
                    # 3. NİHAİ SENTEZ
                    if "TEMİZ" not in denetim_text.upper():
                        yield f"data: status: ✍️ Tespit edilen hatalar sessizce düzeltiliyor...\n\n"
                        sentez_prompt = (
                            f"SORU: {girdi}\n\nHAM VERİ:\n{knowledge_base}\n\nİNCELENECEK TASLAK:\n{taslak_text}\n\n"
                            "GÖREV: Taslaktaki tüm maddi ve teknik hataları HAM VERİ'ye bakarak SESSİZCE düzelt.\n"
                            "YASAK: Düzeltme yaptığını belirten hiçbir cümle kurma. Denetim notlarını veya hata isimlerini (Bağlam sapması vb.) rapora ekleme.\n"
                            "KURAL: Doğrudan nihai, temiz raporu yaz. 'Nihai Rapor' gibi başlıklar kullanma."
                        )
                        final_resp = ollama.generate(model=MASTER_MODEL, prompt=sentez_prompt, options={"temperature": 0.2})
                        full_response = final_resp['response'].strip()
                    else:
                        full_response = taslak_text

                    # EKSTRA TEMİZLİK (Regex)
                    banned_patterns = [
                        r'^\s*(NİHAİ RAPOR|DENETİM NOTLARI|HATA DÜZELTME|RAPOR|DÜZENLEME|TASLAK|Düzenlenmiş liste):?\s*',
                        r'^\s*(Düzenleme yapacağım|Düzenleme tamamlandı|Raporu hazırlıyorum|İşte istediğiniz liste):?\s*',
                        r'^\s*(notlar|notlar:|notlar\s*-|kaynaklar|kaynaklar:):?\s*',
                        r'^\s*\*+.*\*+\s*\n', # Yıldızlı başlık satırlarını temizle
                        r'\n(Düzenleme tamamlandı|Bitti|Tamamlandı\.?|notlar:.*|kaynaklar:.*)$'
                    ]
                    for pattern in banned_patterns:
                        full_response = re.sub(pattern, '', full_response, flags=re.IGNORECASE | re.MULTILINE)
                    full_response = full_response.strip()
                except Exception as e:
                    print(f"[Verification Error] {e}")
                    full_response = "Kaptan, verileri doğrularken bir teknik sorun oluştu:\n\n" + (taslak_text if 'taslak_text' in locals() else "Veri alınamadı.")

                # 4. YAZDIRMA (STREAMING SIMULATION)
                # Artık veri doğrulandı, kullanıcıya akıtabiliriz
                yield f"data: [TEMİZLE]\n\n"
                chunk_size = 10
                for i in range(0, len(full_response), chunk_size):
                    chunk = full_response[i:i+chunk_size]
                    yield f"data: {chunk.replace('\n', '\\n')}\n\n"
                
                mesajlar.append({"role": "assistant", "content": full_response})
                research_signals.pop(target_s_id, None)
                exec_mode = "done" # Sentez bitti
                break # Ana döngüden çık

            # 2. ÜRETİM DÖNGÜSÜ (Normal, Coding veya Sentez)
            pivot_to_deep = False
            while turn_count < max_turns:
                turn_count += 1
                full_response = ""
                tool_found_in_this_turn = False
                
                knowledge_rules = ""
                try:
                    with open(os.path.join(BASE_DIR, "jarvis_knowledge.md"), "r", encoding="utf-8") as f:
                        knowledge_rules = f.read()
                except: pass

                # TÜM SİSTEM TALİMATLARINI BİRLEŞTİR
                combined_system_prompt = ""
                if exec_mode == "normal":
                    combined_system_prompt = "PROTOKOL: Sen Jarvis'sin, Kaptan'ın zeki ve hızlı asistanısın. Hitap: Kaptan. Türkçe konuş. Uydurma yapma."
                else:
                    combined_system_prompt = dinamik_sistem_mesajı
                
                if knowledge_rules:
                    combined_system_prompt += f"\n\n### 🔴 ÖNEMLİ KURALLAR:\n{knowledge_rules}\n"
                
                combined_system_prompt += "\nKaptan'ın emirlerine odaklan. Kısa ve öz konuş."

                # Hafıza Optimizasyonu ve Mesaj Listesi Oluşturma
                current_messages = [{"role": "system", "content": combined_system_prompt}]
                
                if exec_mode == "normal":
                    # Normal modda sadece sondan 10 mesajı al (Hız için)
                    history_to_send = mesajlar[-10:] if len(mesajlar) > 10 else mesajlar
                else:
                    # Diğer modlarda tüm hafızayı al
                    history_to_send = mesajlar
                
                # SADECE user ve assistant olanları ekle (Sistem mesajları zaten en başta birleştirildi)
                for m in history_to_send:
                    if m["role"] in ["user", "assistant"]:
                        current_messages.append(m)
                
                if exec_mode == "coding":
                    aktif_model = CODE_MODEL
                    sıcaklık = 0.2
                    ctx_limit = 16384
                    kalıcılık = "5m"
                elif exec_mode == "deep" or exec_mode == "synthesis":
                    aktif_model = MASTER_MODEL
                    sıcaklık = 0.5
                    ctx_limit = 16384
                    kalıcılık = "5m"
                else:
                    # GÜNLÜK MOD (Yıldırım Hızı)
                    aktif_model = LITE_MODEL
                    sıcaklık = 0.4
                    ctx_limit = 2048
                    kalıcılık = "1m" # Hızlıca VRAM boşalt

                response = ollama.chat(
                    model=aktif_model,
                    messages=current_messages,
                    stream=True,
                    keep_alive=kalıcılık,
                    options={"temperature": sıcaklık, "num_ctx": ctx_limit}
                )

                try:
                    for chunk in response:
                        # ⚠️ AUTO-PIVOT KONTROLÜ (4sn Sınırı - Toplam Süre)
                        # Sadece mesaj uzunsa ve normal moddaysak derin araştırmaya geç
                        if exec_mode == "normal" and len(girdi) > 20:
                            elapsed = (datetime.now() - start_time_counter).total_seconds()
                            if elapsed > 4.0:
                                yield f"data: status: ⚠️ Araştırma derinleşiyor, Kaptan için daha kapsamlı bir tarama başlatılıyor...\n\n"
                                yield f"data: [TEMİZLE]\n\n" 
                                pivot_to_deep = True
                                break

                        content = chunk['message']['content']
                        if content:
                            full_response += content
                            
                            # NORMAL MODDA ARAÇ MANTIĞINI (REGEX) TAMAMEN PAS GEÇ
                            if exec_mode != "normal":
                                # Okuma Aracı
                                read_matches = re.finditer(r'<READ_FILE\s+path=["\']?([^"\'>\s]+)["\']?\s*\/>', full_response, re.IGNORECASE)
                                for m in read_matches:
                                    fpath = m.group(1)
                                    if f"read_{fpath}" not in completed_actions:
                                        yield f"data: status: [🔍 OKUNUYOR] {fpath}...\n\n"
                                        fbody = read_project_file(fpath)
                                        completed_actions.add(f"read_{fpath}")
                                        tool_found_in_this_turn = True
                                        tool_results.append(f"DOSYA İÇERİĞİ ({fpath}):\n{fbody}")
                                        msg = f"\n\n> [SİSTEM BİLGİSİ]: {fpath} dosyası okundu.\n"
                                        yield f"data: {msg.replace('\n', '\\n')}\n\n"

                            if not tool_found_in_this_turn:
                                yield f"data: {content.replace('\n', '\\n')}\n\n"
                except Exception as e:
                    error_msg = str(e)
                    if "10061" in error_msg or "ConnectError" in error_msg:
                        yield f"data: status: 🔴 HATA: Ollama'ya bağlanılamadı. Lütfen Ollama modelinin (veya uygulamasının) açık olduğundan emin olun, Kaptan.\n\n"
                    else:
                        yield f"data: status: 🔴 HATA: Bir sorun oluştu: {error_msg}\n\n"
                    break

                if pivot_to_deep:
                    exec_mode = "deep"
                    break 
                
                if not tool_found_in_this_turn:
                    break
                else:
                    mesajlar.append({"role": "assistant", "content": full_response})
                    mesajlar.append({"role": "user", "content": f"[İŞLEM RAPORU]:\n" + "\n".join(tool_results)})
                    tool_results = []
            
            if pivot_to_deep:
                continue 
            break 
        
        # Otonom Öneri
        if request.mode == "normal" and (len(full_response) > 400 or "bilmiyorum" in full_response.lower()):
            yield f"data: \n\n[SUGGEST_DEEP_RESEARCH]\n\n"

        # Final Kayıtları
        hafiza_kaydet(mesajlar, target_s_id)
        
        if len(mesajlar) <= 5: 
            new_title = summarize_text(mesajlar)
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("UPDATE sessions SET title = ? WHERE id = ?", (new_title, target_s_id))
            conn.commit()
            conn.close()

    return StreamingResponse(
        generate(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Session-Id": target_s_id
        }
    )

@app.post("/vision")
async def vision_endpoint(file: UploadFile = File(...), prompt: str = Form("Bu görselde ne var?")):
    try:
        contents = await file.read()
        gorsel_b64 = base64.b64encode(contents).decode()
        
        # Vision modeline sistem mesajı ve resmi gönderiyoruz.
        # Llava bazen sistem mesajını desteklemediği için kullanıcı mesajına ekliyoruz.
        ozel_prompt = f"{get_master_prompt()}\n\nKaptan bir görsel yükledi. Lütfen bu görseli profesyonel bir asistan (Jarvis) gibi analiz et ve çok kısa, öz bir özet sun. Gereksiz teknik detaylara girme.\nSoru: {prompt}"
        
        yanit = ollama.chat(
            model=GORSEL_MODEL,
            messages=[{
                "role": "user",
                "content": ozel_prompt,
                "images": [gorsel_b64]
            }]
        )
        
        yanit_metni = yanit["message"]["content"].strip()
        
        # Vizyon sonucunu hafızaya ekle (özet olarak)
        mesajlar = hafiza_yukle("active")
        mesajlar.append({"role": "user", "content": f"[Görsel Analizi İsteği: {prompt}]"})
        mesajlar.append({"role": "assistant", "content": yanit_metni})
        hafiza_kaydet(mesajlar, "active")
        
        return {"response": yanit_metni}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Static files service
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    from fastapi.responses import FileResponse
    return FileResponse(os.path.join("static", "index.html"))

@app.get("/{path_name:path}")
async def catch_all(path_name: str):
    # Try to serve a file from static, else index
    file_path = os.path.join("static", path_name)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
    from fastapi.responses import FileResponse
    return FileResponse(os.path.join("static", "index.html"))

@app.post("/api/v3/run")
async def run_code(request: Request):
    data = await request.json()
    code = data.get("code", "")
    if not code:
        raise HTTPException(status_code=400, detail="Kod bulunamadı!")

    import threading
    import subprocess
    import re

    def run_process():
        try:
            scratch_dir = os.path.join(os.getcwd(), "scratch")
            os.makedirs(scratch_dir, exist_ok=True)
            scratch_path = os.path.join(scratch_dir, "user_run.py")
            
            # --- STARK SENSITIZER (Çalıştırmadan önce gizli tamir) ---
            # Satır kırılmalarını düzelt (Örn: = \n - 50 -> = - 50)
            cleaned_code = re.sub(r'(\s*[\+\-\*\/<>!=])\s*\r?\n\s*', r'\1 ', code)
            cleaned_code = re.sub(r'\r?\n\s*([\+\-\*\/<>!=]\s*)', r' \1', cleaned_code)
            
            with open(scratch_path, "w", encoding="utf-8") as f:
                f.write(cleaned_code)
            
            # Pencereli uygulamalar için ekranı taklit edelim
            env = os.environ.copy()
            env["PYGAME_HIDE_SUPPORT_PROMPT"] = "hide"
            subprocess.Popen(["python", scratch_path], cwd=scratch_dir, env=env)
        except Exception as e:
            print("Run error:", e)

    threading.Thread(target=run_process).start()
    return {"status": "success", "message": "Oyun başlatıldı!"}

if __name__ == "__main__":
    import uvicorn
    # --- BAĞLANTI KONTROLÜ ---
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Ollama bağlantısı kontrol ediliyor...")
    try:
        # Küçük bir test sorgusu
        ollama.list()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Ollama erişilebilir durumda.")
    except Exception:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️ UYARI: Ollama'ya ulaşılamıyor! Lütfen Ollama uygulamasının çalıştığından emin olun.")
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sunucu yine de başlatılıyor ancak AI fonksiyonları hata verebilir.")

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
