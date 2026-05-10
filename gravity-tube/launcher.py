import os
import threading
import time
import webview
from app import app

# Profil verilerinin saklanacagi klasor
USER_DATA_DIR = os.path.join(os.getcwd(), ".gravity_data")
if not os.path.exists(USER_DATA_DIR):
    os.makedirs(USER_DATA_DIR)

def start_server():
    # 127.0.0.1 uzerinden calistirmak baglanti garantisi saglar
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

if __name__ == "__main__":
    print("\n" + "="*40)
    print("GRAVITY WATCH - NATIVE SHELL v2")
    print("="*40)
    
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    time.sleep(2)
    
    print("Masaustu Penceresi Aciliyor...")
    
    # 127.0.0.1 kullanarak localhost karmasasini onluyoruz
    window = webview.create_window(
        'Gravity Watch', 
        'http://127.0.0.1:5000',
        width=1280,
        height=720,
        background_color='#050a0f'
    )
    
    webview.start(debug=False, private_mode=False, storage_path=USER_DATA_DIR)
    
    print("\nGravity Watch kapatildi.")
