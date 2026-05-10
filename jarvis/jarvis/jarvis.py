import ollama
import json
import os
import base64
from datetime import datetime
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from duckduckgo_search import DDGS

console = Console()

HAFIZA_DOSYASI = "jarvis_hafiza.json"
MODEL = "llama3.1:8b"          # veya "llama3.1:8b", "qwen2.5:14b"
GORSEL_MODEL = "llava"      # görsel okuma için

SISTEM_MESAJI = """Sen Jarvis'sin — Türkçe konuşan, zeki ve yardımsever bir yapay zeka asistanısın.
Kullanıcıya her zaman Türkçe cevap ver. Net, özlü ve faydalı ol.
Eğer web araması yaptıysan sonuçları kendi cümlelerinle özetle.
Tarih ve saat bilgin var. Şu an: """ + datetime.now().strftime("%d.%m.%Y %H:%M")

def hafiza_yukle():
    if os.path.exists(HAFIZA_DOSYASI):
        with open(HAFIZA_DOSYASI, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def hafiza_kaydet(mesajlar):
    # Son 20 mesajı tut (bellek yönetimi)
    son_mesajlar = mesajlar[-20:]
    with open(HAFIZA_DOSYASI, "w", encoding="utf-8") as f:
        json.dump(son_mesajlar, f, ensure_ascii=False, indent=2)

def web_ara(sorgu: str, maks=3) -> str:
    """DuckDuckGo ile web araması yap"""
    try:
        with DDGS() as ddgs:
            sonuclar = list(ddgs.text(sorgu, max_results=maks))
        if not sonuclar:
            return "Arama sonucu bulunamadı."
        ozet = ""
        for i, s in enumerate(sonuclar, 1):
            ozet += f"{i}. {s['title']}\n{s['body']}\nKaynak: {s['href']}\n\n"
        return ozet
    except Exception as e:
        return f"Arama hatası: {e}"

def gorsel_oku(dosya_yolu: str, soru: str = "Bu görselde ne var?") -> str:
    """llava modeli ile görsel analiz et"""
    try:
        with open(dosya_yolu, "rb") as f:
            gorsel_b64 = base64.b64encode(f.read()).decode()
        yanit = ollama.chat(
            model=GORSEL_MODEL,
            messages=[{
                "role": "user",
                "content": soru,
                "images": [gorsel_b64]
            }]
        )
        return yanit["message"]["content"]
    except Exception as e:
        return f"Görsel okuma hatası: {e}"

def komut_isle(girdi: str, mesajlar: list) -> tuple[str, list]:
    """Kullanıcı girdisini analiz et ve uygun aracı çağır"""
    
    girdi_kucuk = girdi.lower()
    
    # Web arama komutu
    if any(k in girdi_kucuk for k in ["ara:", "search:", "internet:", "web:"]):
        sorgu = girdi.split(":", 1)[1].strip()
        console.print(f"[dim]🌐 Web'de aranıyor: {sorgu}[/dim]")
        arama_sonucu = web_ara(sorgu)
        ekstra_baglam = f"\n\n[Web Arama Sonuçları - {sorgu}]:\n{arama_sonucu}"
        mesajlar.append({"role": "user", "content": girdi + ekstra_baglam})
    
    # Görsel okuma komutu
    elif girdi_kucuk.startswith("gorsel:") or girdi_kucuk.startswith("görsel:"):
        parcalar = girdi.split(" ", 1)
        dosya = parcalar[0].split(":", 1)[1].strip()
        soru = parcalar[1] if len(parcalar) > 1 else "Bu görselde ne var? Türkçe açıkla."
        console.print(f"[dim]🖼️ Görsel okunuyor: {dosya}[/dim]")
        gorsel_yanit = gorsel_oku(dosya, soru)
        mesajlar.append({"role": "user", "content": f"Görsel analiz sonucu:\n{gorsel_yanit}\n\nBu sonucu Türkçe olarak bana açıkla."})
    
    # Normal sohbet
    else:
        mesajlar.append({"role": "user", "content": girdi})
    
    # Ollama'ya gönder
    yanit = ollama.chat(
        model=MODEL,
        messages=[{"role": "system", "content": SISTEM_MESAJI}] + mesajlar
    )
    
    yanit_metni = yanit["message"]["content"]
    mesajlar.append({"role": "assistant", "content": yanit_metni})
    
    return yanit_metni, mesajlar


def main():
    console.print(Panel.fit(
        "[bold purple]J.A.R.V.I.S[/bold purple]\n"
        "[dim]Yerel Yapay Zeka Asistanı — Tamamen Ücretsiz[/dim]\n\n"
        "[green]Komutlar:[/green]\n"
        "  [cyan]ara: <konu>[/cyan]     → İnternette ara\n"
        "  [cyan]gorsel: <dosya>[/cyan] → Görsel analiz et\n"
        "  [cyan]temizle[/cyan]         → Sohbet geçmişini sıfırla\n"
        "  [cyan]çıkış[/cyan]           → Jarvis'i kapat",
        title="🤖 Hoş Geldiniz",
        border_style="purple"
    ))
    
    mesajlar = hafiza_yukle()
    if mesajlar:
        console.print(f"[dim]📂 {len(mesajlar)} önceki mesaj yüklendi.[/dim]\n")
    
    while True:
        try:
            girdi = console.input("[bold cyan]Sen: [/bold cyan]").strip()
            
            if not girdi:
                continue
            
            if girdi.lower() in ["çıkış", "cikis", "exit", "quit"]:
                console.print("[dim]Jarvis kapatılıyor. Görüşürüz![/dim]")
                break
            
            if girdi.lower() == "temizle":
                mesajlar = []
                hafiza_kaydet(mesajlar)
                console.print("[green]✓ Sohbet geçmişi temizlendi.[/green]")
                continue
            
            with console.status("[dim]Jarvis düşünüyor...[/dim]"):
                yanit, mesajlar = komut_isle(girdi, mesajlar)
            
            console.print()
            console.print(Panel(
                Markdown(yanit),
                title="[bold purple]Jarvis[/bold purple]",
                border_style="purple",
                padding=(0, 1)
            ))
            console.print()
            
            hafiza_kaydet(mesajlar)
            
        except KeyboardInterrupt:
            console.print("\n[dim]Jarvis kapatılıyor...[/dim]")
            break
        except Exception as e:
            console.print(f"[red]Hata: {e}[/red]")


if __name__ == "__main__":
    main()