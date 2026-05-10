import yt_dlp
import os
import time
import random

COOKIES_FILE = "gravity_cookies.txt"

def is_music_video(entry):
    """Video muzik mi kontrol eder (Baslik ve Yukleyiciye bakarak)"""
    title = entry.get('title', '').lower()
    uploader = entry.get('uploader', '').lower()
    
    music_keywords = ['official video', 'official audio', 'lyrics', 'music video', 'vevo', 'remix', 'ft.', 'feat.']
    if any(k in title for k in music_keywords): return True
    if uploader.endswith(' - topic'): return True
    return False

def resolve_video(video_id):
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

def fetch_safe_videos(ydl, query, count, seen_ids, label):
    """Muzik olmayan, gorulmemis ve kanal onayli videolari toplar"""
    results = []
    # İmpoosterlari engellemek icin arama terimini daha spesifik yap
    search_query = f"intitle:{query}" if label == "ABONELIK" else query
    
    search_res = ydl.extract_info(f"ytsearch{count + 15}:{search_query}", download=False).get('entries', [])
    for entry in search_res:
        if not entry: continue
        if entry.get('id') in seen_ids: continue
        if is_music_video(entry): continue
        
        uploader = entry.get('uploader', '').lower()
        query_clean = query.lower()
        
        # --- KIMLIK KONTROLU (ABONELIK ICIN) ---
        if label == "ABONELIK":
            # Kanal ismi yukleyici isminde gecmeli veya tam tersi (kucuk harf duyarsiz)
            if query_clean not in uploader and uploader not in query_clean:
                continue 
        
        results.append({
            "id": entry.get('id'),
            "title": entry.get('title'),
            "thumbnail": entry.get('thumbnail') or f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
            "uploader": entry.get('uploader') or "YouTube",
            "label": label
        })
        if len(results) >= count: break
    return results

def get_home_feed(user_data=None, page=1):
    """
    KEŞFET: %50 Abone, %30 Beğeni, %10 Trend, %10 TR
    ABONELİKLER: %100 Sadece Abone Olunan Kanallar
    Müzik videoları kesinlikle yasaktir.
    """
    user_data = user_data or {}
    interests = user_data.get('interests', {})
    subscriptions = user_data.get('subscriptions', [])
    subs_only = user_data.get('subscriptions_only', False)
    seen_ids = user_data.get('seen_ids', [])
    
    total_target = 20
    final_feed = []
    ydl_opts = {'quiet': True, 'extract_flat': True, 'socket_timeout': 15}
    if os.path.exists(COOKIES_FILE): ydl_opts['cookiefile'] = COOKIES_FILE

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # --- DURUM 1: SADECE ABONELIKLER (%100) ---
            if subs_only:
                if not subscriptions: return []
                random.shuffle(subscriptions)
                for sub in subscriptions:
                    final_feed.extend(fetch_safe_videos(ydl, sub, 5, seen_ids, "ABONELIK"))
                    if len(final_feed) >= total_target: break
                return final_feed[:total_target]

            # --- DURUM 2: KESFET (ALTIN KURAL) ---
            counts = {"SUBS": 10, "LIKE": 6, "TREND": 2, "TR": 2}

            # 1. %50 ABONELIKLER
            if subscriptions:
                random.shuffle(subscriptions)
                sub_pool = []
                for sub in subscriptions:
                    sub_pool.extend(fetch_safe_videos(ydl, sub, 3, seen_ids, "ABONELIK"))
                    if len(sub_pool) >= counts["SUBS"]: break
                final_feed.extend(sub_pool[:counts["SUBS"]])

            # 2. %30 BEGENI/ILGI
            if interests:
                top_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:3]
                like_pool = []
                for tag, _ in top_tags:
                    like_pool.extend(fetch_safe_videos(ydl, f"{tag} amazing", 2, seen_ids, "SANA OZEL"))
                final_feed.extend(like_pool[:counts["LIKE"]])

            # 3. %10 TREND (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "trending worldwide", counts["TREND"], seen_ids, "TREND"))

            # 4. %10 TR POPULER (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "trending turkey", counts["TR"], seen_ids, "TR POPULER"))

            # EKSİKLERİ TAMAMLA
            if len(final_feed) < total_target:
                missing = total_target - len(final_feed)
                final_feed.extend(fetch_safe_videos(ydl, "most popular", missing, seen_ids, "KESFET"))

            random.shuffle(final_feed)
            return final_feed[:total_target]

    except Exception as e:
        print(f"!!! Feed Logic Error: {e}")
        return []

    except Exception as e:
        print(f"!!! Golden Rule Constitution Error: {e}")
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
            } for e in results if e and not is_music_video(e)]
    except Exception as e:
        print(f"!!! Search Error: {e}")
        return []
