import webview
import threading
import uvicorn
import os
import sys
import time
import webbrowser
from server import app

# --- KONFİGÜRASYON ---
PORT = 8000
URL = f"http://localhost:{PORT}"

def start_server():
    """FastAPI sunucusunu arka planda başlatır"""
    config = uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="error")
    server = uvicorn.Server(config)
    server.run()

class JSApi:
    def open_browser(self, url):
        """Linkleri varsayılan tarayıcıda açar"""
        webbrowser.open(url)

def run_jarvis():
    # 1. Sunucuyu ayrı bir kanalda (thread) başlat
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # 2. Sunucunun hazır olması için kısa bir bekleme
    time.sleep(2)

    # 3. Native Masaüstü Penceresini Oluştur
    window = webview.create_window(
        title='J.A.R.V.I.S — Desktop Core Edition',
        url=URL,
        width=1200,
        height=800,
        resizable=True,
        text_select=True,
        background_color='#0a0a0a',
        js_api=JSApi()
    )

    # 4. Uygulamayı Başlat
    print(f"\n{'='*50}\n[ JARVIS DESKTOP CORE ONLINE ]\nSistem native pencerede aktif edildi.\n{'='*50}\n")
    webview.start()

if __name__ == "__main__":
    run_jarvis()
