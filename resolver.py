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

def get_home_feed(user_email=None, page=1):
    """Ana sayfa icin karma algoritma - HIZLANDIRILMIS"""
    cache_key = f"home_{page}"
    if cache_key in HOME_FEED_CACHE:
        data, ts = HOME_FEED_CACHE[cache_key]
        if time.time() - ts < CACHE_TTL:
            return data

    # Yedek Liste (Eger YT-DLP cok yavas kalirsa uygulama bos gorunmesin)
    fallback_videos = [
        {"id": "dQw4w9WgXcQ", "title": "Never Gonna Give You Up", "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "uploader": "Rick Astley", "label": "CLASSIC"},
        {"id": "jNQXAC9IVRw", "title": "Me at the zoo", "thumbnail": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg", "uploader": "jawed", "label": "FIRST"}
    ]

    # Standart kesif listesi - Arama sayisini 20'den 12'ye dusurduk (Hiz icin)
    search_queries = ["trending", "popular music", "tech news", "space discovery"]
    query = random.choice(search_queries)
    
    # Zaman asimi ekleyerek sunucuyu kitlemeyi onle
    ydl_opts = {
        'quiet': True,
        'extract_flat': True, # Sadece metadata (HIZLI)
        'force_generic_extractor': False,
        'socket_timeout': 10 # 10 saniye sonra birak
    }
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(f"ytsearch12:{query}", download=False).get('entries', [])
            feed = []
            for entry in results:
                if not entry: continue
                feed.append({
                    "id": entry.get('id'),
                    "title": entry.get('title'),
                    "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                    "uploader": entry.get('uploader') or "YouTube",
                    "channel_id": entry.get('channel_id'),
                    "label": "DISCOVER"
                })
            
            if not feed: return fallback_videos # Eger bos gelirse yedekleri gonder
            
            HOME_FEED_CACHE[cache_key] = (feed, time.time())
            return feed
    except Exception as e:
        print(f"!!! Home Feed Error: {e}")
        return fallback_videos

def search_videos(query):
    if not query: return []
    with get_ydl_instance() as ydl:
        try:
            results = ydl.extract_info(f"ytsearch15:{query}", download=False).get('entries', [])
            return [{
                "id": e.get('id'),
                "title": e.get('title'),
                "thumbnail": e.get('thumbnail'),
                "uploader": e.get('uploader'),
                "channel_id": e.get('channel_id')
            } for e in results if e]
        except:
            return []
