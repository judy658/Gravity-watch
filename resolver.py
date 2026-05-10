import yt_dlp
import os
import time
import random

COOKIES_FILE = "gravity_cookies.txt"
HOME_FEED_CACHE = {}
CACHE_TTL = 600 # 10 dakika

def get_ydl_instance(quiet=True):
    ydl_opts = {
        'quiet': quiet,
        'no_warnings': True,
        'format': 'best',
        'nocheckcertificate': True,
        'ignoreerrors': True,
        'no_color': True,
    }
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE
    return yt_dlp.YoutubeDL(ydl_opts)

def resolve_video(video_id):
    """Video linklerini ve bilgilerini cozer"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        # 1080p Dual Stream Denemesi
        ydl_opts_hq = {
            'format': 'bestvideo[height<=1080]+bestaudio/best',
            'quiet': True,
            'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None
        }
        with yt_dlp.YoutubeDL(ydl_opts_hq) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Kaliteleri ayikla
            formats = info.get('formats', [])
            qualities = {}
            for f in formats:
                h = f.get('height')
                if h and f.get('url') and f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                    qualities[f"{h}p"] = f['url']

            return {
                "id": video_id,
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "uploader": info.get('uploader'),
                "channel_id": info.get('channel_id'),
                "description": info.get('description', ''),
                "view_count": info.get('view_count', 0),
                "best_url": info.get('url'),
                "qualities": qualities,
                "hq_video_url": next((f['url'] for f in formats if f.get('height') == 1080 and f.get('acodec') == 'none'), None),
                "hq_audio_url": next((f['url'] for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none'), None)
            }
    except Exception as e:
        return {"error": str(e)}

def get_home_feed(user_data=None, page=1):
    """Kullaniciya ozel, akilli ana sayfa algoritmasi"""
    user_data = user_data or {}
    interests = user_data.get('interests', {})
    subscriptions = user_data.get('subscriptions', [])
    subs_only = user_data.get('subscriptions_only', False)

    # 1. Arama Sorgusunu Olustur
    if subs_only and subscriptions:
        # Sadece abonelikler: Abone olunan kanallardan birini rastgele sec
        query = f"channel:{random.choice(subscriptions)} new videos"
    elif interests:
        # İlgi alanlarina gore: En cok ilgilenilen 2 etiketi birlestir
        top_interests = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:2]
        query = " ".join([i[0] for i in top_interests]) + " news"
    else:
        # Hic veri yoksa genel trendler
        query = random.choice(["trending technology", "popular science", "latest gaming"])

    # 2. YT-DLP Ayarlari
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'socket_timeout': 15
    }
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Sayfa basina 15 video ara
            search_trigger = f"ytsearch15:{query}"
            results = ydl.extract_info(search_trigger, download=False).get('entries', [])
            
            feed = []
            for entry in results:
                if not entry: continue
                feed.append({
                    "id": entry.get('id'),
                    "title": entry.get('title'),
                    "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                    "uploader": entry.get('uploader') or "YouTube",
                    "channel_id": entry.get('channel_id'),
                    "label": "SUBS" if subs_only else "FOR YOU"
                })
            
            return feed
    except Exception as e:
        print(f"!!! Smart Feed Error: {e}")
        return []

def search_videos(query):
    if not query: return []
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'socket_timeout': 10
    }
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE

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
