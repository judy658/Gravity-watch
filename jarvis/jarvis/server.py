import re
import sqlite3

app = FastAPI(title="J.A.R.V.I.S Engine")

app = FastAPI(title="J.A.R.V.I.S Engine")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

MODEL = "llama3.1:8b"
GORSEL_MODEL = "minicpm-v"

SISTEM_MESAJI = """Sen Jarvis'sin — Türkçe konuşan, zeki ve yardımsever bir yapay zeka asistanısın (Stark Industries - J.A.R.V.I.S).
Kullanıcıya her zaman Türkçe cevap ver. SADECE TÜRKÇE VE LATİN ALFABESİ KARAKTERLERİNİ KULLAN. 
Net, özlü ve profesyonel ol. Kullanıcıya 'Efendim' veya 'Kaptan' diye hitap et.
İçsel bir yeteneğin var: Eğer güncel bilgiye ihtiyacın varsa sana 'İNTERNET ARAŞTIRMA VERİLERİ' bloğu sunulacaktır.
ÖNEMLİ: Eğer bir oyun/film/olay henüz gerçekleşmemişse veya çıkmamışsa kesinlikle 'yarın çıkıyor' veya 'çıktı' gibi uydurma bilgiler verme. Verilerde ne görüyorsan onu aktar. Bilgin yoksa dürüstçe 'Bilmiyorum ama araştırabilirim' de.
Şu anki tarih ve saat: """ + datetime.now().strftime("%d.%m.%Y %H:%M")

class ChatRequest(BaseModel):
    message: str
    include_search: bool = False
    image: Optional[str] = None

def hafiza_yukle():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role, content FROM messages WHERE session_id = 'active' ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in rows]

def hafiza_kaydet(messages):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Önce mevcut aktif mesajları temizle
    cursor.execute("DELETE FROM messages WHERE session_id = 'active'")
    # Yeni mesajları ekle (Son 40 mesaj)
    for msg in messages[-40:]:
        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES ('active', ?, ?)", (msg["role"], msg["content"]))
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
        response = ollama.generate(model=MODEL, prompt=prompt)
        return response['response'].strip().replace('"', '')
    except:
        return "Eski Sohbet"

def web_ara(sorgu: str, maks=5) -> str:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] İnternette Araştırılıyor: {sorgu}...")
    try:
        # Uyarıyı engellemek için yeni kullanım şekli (DDGS artık ana sınıf)
        with DDGS() as ddgs:
            sonuclar = list(ddgs.text(sorgu, max_results=maks))
        if not sonuclar: return "Arama sonucu bulunamadı."
        ozet = "--- İNTERNET ARAŞTIRMA VERİLERİ ---\n"
        for i, s in enumerate(sonuclar, 1):
            ozet += f"KAYNAK {i}: {s['title']}\nÖZET: {s['body']}\n\n"
        ozet += "--- VERİ SONU ---"
        return ozet
    except Exception as e:
        return f"Arama hatası: {e}"

@app.get("/api/v3/history")
async def get_history_v3():
    return hafiza_yukle()

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
    active = hafiza_yukle()
    if active:
        title = summarize_text(active)
        s_id = str(int(datetime.now().timestamp() * 1000))
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sessions (id, title) VALUES (?, ?)", (s_id, title))
        for m in active:
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (s_id, m["role"], m["content"]))
        # Aktifi temizle
        cursor.execute("DELETE FROM messages WHERE session_id = 'active'")
        conn.commit()
        conn.close()
    return {"status": "success"}

@app.get("/api/v3/session/load/{session_id}")
async def load_session_v3(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Mevcut aktifi arşive kaldır (eğer doluysa)
    active = hafiza_yukle()
    if active:
        title_old = summarize_text(active)
        s_id_old = str(int(datetime.now().timestamp() * 1000) + 1)
        cursor.execute("INSERT INTO sessions (id, title) VALUES (?, ?)", (s_id_old, title_old))
        for m in active:
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (s_id_old, m["role"], m["content"]))
            
    # 2. Arşivden hedefi çekip aktife yaz
    cursor.execute("SELECT role, content FROM messages WHERE session_id = ?", (session_id,))
    target_messages = cursor.fetchall()
    
    if not target_messages:
        conn.close()
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
    
    cursor.execute("DELETE FROM messages WHERE session_id = 'active'")
    for m in target_messages:
        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES ('active', ?, ?)", (m[0], m[1]))
    
    # 3. Yüklenen arşivi sil
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    
    conn.commit()
    conn.close()
    return {"status": "success", "messages": [{"role": m[0], "content": m[1]} for m in target_messages]}

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

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    data = hafiza_yukle()
    mesajlar = data.get("active", [])
    
    girdi = request.message
    mesajlar.append({"role": "user", "content": girdi})
    ekstra_baglam = ""
    
    # Arşiv özetlerini sisteme fısılda (Sadece kullanıcı geçmişten bahsederse)
    arşiv_özetleri = [s.get("summary") for s in data.get("archive", [])]
    özet_metni = ""
    
    # Kullanıcı geçmişten bir anahtar kelime kullanıyor mu kontrol et
    gecmis_tetiklendi = any(s.lower() in girdi.lower() for s in arşiv_özetleri) or any(k in girdi.lower() for k in ["hatırla", "geçmiş", "eski", "önceki"])
    
    if gecmis_tetiklendi and arşiv_özetleri:
        özet_metni = ", ".join(arşiv_özetleri)
        ek_talimat = f"\n\nKaptan geçmişteki şu konulardan bahsettiği için bunları hatırlıyorsun: [{özet_metni}]. Sadece bu konularla ilgili cevap ver."
    else:
        ek_talimat = "\n\nŞu an yeni bir sohbettesin. Kullanıcı geçmişten bahsetmediği sürece eski konuları bilmiyormuş gibi davran."

    dinamik_sistem_mesajı = SISTEM_MESAJI + ek_talimat

    # --- OTONOM ARAMA KARARI (AGENTIC STEP) ---
    otonom_sorgu = ""
    # Bazı kelimeler doğrudan aramayı tetikler (Mecburi İstihbarat)
    mecburi_arama = any(k in girdi.lower() for k in ["güncel", "yeni", "popüler", "en iyi", "score", "fiyat"])
    
    decision_prompt = f"Şu anki tarih: {datetime.now().strftime('%d.%m.%Y')}\nKullanıcı mesajı: '{girdi}'\n\nBu mesajı cevaplamak için internet aramasına ihtiyaç var mı? (Hava durumu, haber, en popüler listeler, güncel olaylar vb.)\nEğer gerekliyse sadece 'EVET: <sorgu>' şeklinde cevap ver. Gerekli değilse sadece 'HAYIR' de."
    
    try:
        # Eğer mecburi bir kelime varsa direkt EVET kabul et
        if mecburi_arama:
            decision_text = f"EVET: {girdi}"
        else:
            decision_resp = ollama.generate(model=MODEL, prompt=decision_prompt, options={"temperature": 0})
            decision_text = decision_resp['response'].strip()
        
        if decision_text.startswith("EVET:"):
            otonom_sorgu = decision_text.split(":", 1)[1].strip()
            arama_sonucu = web_ara(otonom_sorgu)
            # İnternet verisini ayrı bir mesaj olarak gönder
            mesajlar.append({
                "role": "system", 
                "content": f"SİSTEM NOTU ({datetime.now().strftime('%d.%m.%Y')}): İnternet araştırması yapıldı. Veriler şunlardır:\n{arama_sonucu}\nLütfen sadece bu verilere dayanarak cevap ver. Henüz gelmemiş tarihler (Eylül 2026 vb.) hakkında 'çıktı/mevcut' deme."
            })
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Otonom karar: Arama verisi enjekte edildi.")
    except Exception as e:
        print(f"Arama kararı hatası: {e}")

    def generate():
        nonlocal mesajlar
        full_response = ""
        
        # 1. AŞAMA: HAM ALGI (Eğer görsel varsa)
        raw_vision_analysis = ""
        if request.image:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Stage 1: Görsel analizi başlatıldı ({GORSEL_MODEL})...")
            try:
                # MiniCPM-V gibi modeller için hızlı ve OCR odaklı bir prompt
                vision_response = ollama.chat(
                    model=GORSEL_MODEL,
                    messages=[{
                        "role": "user",
                        "content": "Bu görselde ne var? Özellikle tüm başlıkları, oyun isimlerini ve yazıları oku. Çok kısa ve öz bir özet çıkar.",
                        "images": [request.image]
                    }]
                )
                raw_vision_analysis = vision_response["message"]["content"].strip()
            except Exception as e:
                print(f"Vision hatası: {e}")
                raw_vision_analysis = ""

            if not raw_vision_analysis:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Stage 1 başarısız (Boş yanıt).")
                raw_vision_analysis = "Görsel analiz edilemedi. Lütfen kullanıcıya görseli göremediğini belirt."
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Stage 1 tamamlandı. Analiz boyutu: {len(raw_vision_analysis)} karakter.")
            
            # Ana modele iletilecek olan, analiz sonuçlu prompt
            girdi_with_vision = f"[Kaptan bir görsel yükledi. Görsel Analiz Raporu: {raw_vision_analysis}]\n\nKullanıcının asıl sorusu: {girdi}"
            mesajlar[-1]["content"] = girdi_with_vision

        # 2. AŞAMA: JARVIS YORUMU
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Stage 2: Jarvis yanıt hazırlıyor ({MODEL})...")
        current_messages = [{"role": "system", "content": dinamik_sistem_mesajı}] + mesajlar
        
        response = ollama.chat(
            model=MODEL,
            messages=current_messages,
            stream=True
        )
        for chunk in response:
            content = chunk['message']['content']
            full_response += content
            yield content
        
        # Akış bittikten sonra kaydet
        mesajlar.append({"role": "assistant", "content": full_response})
        hafiza_kaydet(mesajlar)

    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/vision")
async def vision_endpoint(file: UploadFile = File(...), prompt: str = Form("Bu görselde ne var?")):
    try:
        contents = await file.read()
        gorsel_b64 = base64.b64encode(contents).decode()
        
        # Vision modeline sistem mesajı ve resmi gönderiyoruz.
        # Llava bazen sistem mesajını desteklemediği için kullanıcı mesajına ekliyoruz.
        ozel_prompt = f"{SISTEM_MESAJI}\n\nKaptan bir görsel yükledi. Lütfen bu görseli profesyonel bir asistan (Jarvis) gibi analiz et ve çok kısa, öz bir özet sun. Gereksiz teknik detaylara girme.\nSoru: {prompt}"
        
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
        mesajlar = hafiza_yukle()
        mesajlar.append({"role": "user", "content": f"[Görsel Analizi İsteği: {prompt}]"})
        mesajlar.append({"role": "assistant", "content": yanit_metni})
        hafiza_kaydet(mesajlar)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
