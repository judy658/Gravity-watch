import mss
import mss.tools
from PIL import Image
import os
from datetime import datetime

def capture_screen(save_path="temp_screenshot.png", region=None):
    """
    Captures the primary monitor or a specific region and saves it.
    """
    with mss.mss() as sct:
        if region:
            # mss uses top, left, width, height
            monitor = region
        else:
            monitor = sct.monitors[1]
            
        screenshot = sct.grab(monitor)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
        img.save(save_path)
        return save_path

def get_mouse_pos():
    """Returns the current mouse position (optional, for debugging)."""
    import pyautogui
    return pyautogui.position()

# Global reader instance to avoid reloading models
import easyocr
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        print("[SYSTEM] OCR Modelleri Yükleniyor (TR/EN)...")
        _reader = easyocr.Reader(['tr', 'en'], gpu=False) # GPU varsa True yapılabilir
    return _reader

def extract_text_with_coords(image_path):
    """
    Ekrandaki metinleri koordinatlarıyla birlikte okur.
    """
    try:
        reader = get_reader()
        results = reader.readtext(image_path)
        
        extracted_data = []
        for (bbox, text, prob) in results:
            if prob > 0.4: # Sadece emin olduğumuz metinleri alalım
                extracted_data.append({
                    'text': text,
                    'confidence': prob,
                    'coords': bbox # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                })
        return extracted_data
    except Exception as e:
        print(f"[ERROR] OCR Hatası: {str(e)}")
        return []

def web_search(query):
    """
    İnternette arama yapar ve özet döndürür.
    """
    from duckduckgo_search import DDGS
    print(f"[SYSTEM] İnternette araştırılıyor: {query}")
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, region='tr-tr', max_results=3):
                results.append(f"Kaynak: {r['href']}\nBilgi: {r['body']}")
        
        return "\n\n".join(results) if results else "Sonuç bulunamadı."
    except Exception as e:
        return f"Arama hatası: {str(e)}"
