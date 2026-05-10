import yt_dlp
import os
import time
import random

COOKIES_FILE = "gravity_cookies.txt"

def resolve_video(video_id):
    """Video linklerini cozer"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None,
            'nocheckcertificate': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "id": video_id,
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "uploader": info.get('uploader'),
                "best_url": info.get('url'),
                "qualities": {f"{f.get('height')}p": f.get('url') for f in info.get('formats', []) if f.get('height') and f.get('url')}
            }
    except Exception as e:
        return {"error": str(e)}

def get_home_feed(user_data=None, page=1):
    """ALTIN KURAL (GOLDEN RATIO) ALGORITMASI"""
    user_data = user_data or {}
    interests = user_data.get('interests', {})
    subscriptions = user_data.get('subscriptions', [])
    subs_only = user_data.get('subscriptions_only', False)
    seen_ids = user_data.get('seen_ids', [])

    final_feed = []
    
    # YT-DLP Ayarlari
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'socket_timeout': 10
    }
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # --- 1. ABONELIKLERDEN VERI CEK ---
            if subscriptions:
                # Abone olunan kanallardan 3 tanesini secip son videolarini al
                target_subs = random.sample(subscriptions, min(len(subscriptions), 3))
                for sub in target_subs:
                    res = ydl.extract_info(f"ytsearch5:{sub}", download=False).get('entries', [])
                    for entry in res:
                        if entry and entry.get('id') not in seen_ids:
                            final_feed.append({
                                "id": entry.get('id'),
                                "title": entry.get('title'),
                                "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                                "uploader": entry.get('uploader') or sub,
                                "label": "ABONELIK"
                            })

            # --- 2. ILGI ALANLARINDAN VERI CEK (Eger subs_only degilse) ---
            if not subs_only and interests:
                top_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:2]
                for tag, weight in top_tags:
                    res = ydl.extract_info(f"ytsearch5:{tag} trend", download=False).get('entries', [])
                    for entry in res:
                        if entry and entry.get('id') not in seen_ids:
                            final_feed.append({
                                "id": entry.get('id'),
                                "title": entry.get('title'),
                                "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                                "uploader": entry.get('uploader') or "YouTube",
                                "label": "SANA OZEL"
                            })

            # --- 3. GENEL TRENDLER (Liste cok kucukse takviye yap) ---
            if len(final_feed) < 10 and not subs_only:
                res = ydl.extract_info("ytsearch10:trending", download=False).get('entries', [])
                for entry in res:
                    if entry and entry.get('id') not in seen_ids:
                        final_feed.append({
                            "id": entry.get('id'),
                            "title": entry.get('title'),
                            "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                            "uploader": entry.get('uploader') or "YouTube",
                            "label": "KESFET"
                        })

            # Listeyi karistir ve dondur
            random.shuffle(final_feed)
            return final_feed[:20] # Limit 20

    except Exception as e:
        print(f"!!! Golden Ratio Error: {e}")
        return []

def search_videos(query):
    if not query: return []
    ydl_opts = {'quiet': True, 'extract_flat': True, 'socket_timeout': 10}
    if os.path.exists(COOKIES_FILE): ydl_opts['cookiefile'] = COOKIES_FILE
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(f"ytsearch15:{query}", download=False).get('entries', [])
            return [{
                "id": e.get('id'),
                "title": e.get('title'),
                "thumbnail": e.get('thumbnail') or f"https://i.ytimg.com/vi/{e.get('id')}/hqdefault.jpg",
                "uploader": e.get('uploader') or "YouTube",
                "channel_id": e.get('channel_id')
            } for e in results if e]
    except Exception as e:
        print(f"!!! Search Error: {e}")
        return []
