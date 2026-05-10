import yt_dlp
import os
import time
import random

COOKIES_FILE = "gravity_cookies.txt"

def is_trash_video(entry):
    """Muzik, Shorts, Edit ve Clip videolarini filtreler"""
    title = entry.get('title', '').lower()
    uploader = entry.get('uploader', '').lower()
    
    # Yasakli kelimeler listesi
    trash_keywords = [
        'official video', 'official audio', 'lyrics', 'music video', 'vevo', 'remix', 
        'shorts', '#shorts', 'edit', 'clip', 'fan edit', 'whatsapp status', 'tiktok'
    ]
    
    if any(k in title for k in trash_keywords): return True
    if uploader.endswith(' - topic'): return True
    
    # Eger duration bilgisi varsa ve 60 saniyeden kisaysa muhtemelen shorts'tur
    duration = entry.get('duration')
    if duration and duration < 60: return True
    
    return False

def fetch_safe_videos(ydl, query, count, seen_ids, label, page=1, sort_date=False):
    """Gelistirilmis filtreleme ve derin arama"""
    results = []
    # Her sayfa icin farkli bir offset/limit kullanarak YouTube'un derinlerine in
    # Sayfa basina 15-20 video ekleyerek arama ufkunu genislet
    search_offset = (page - 1) * count
    search_limit = search_offset + count + 30 
    
    # Abonelikler icin tarihe gore arama yap (Fresh content)
    prefix = "ytsearchdate" if sort_date else "ytsearch"
    search_trigger = f"{prefix}{search_limit}:{query}"
    
    try:
        search_res = ydl.extract_info(search_trigger, download=False).get('entries', [])
        # Onceki sayfadaki sonuclari atla
        potential_entries = search_res[search_offset:] if len(search_res) > search_offset else search_res
        
        for entry in potential_entries:
            if not entry: continue
            if entry.get('id') in seen_ids: continue
            if is_trash_video(entry): continue
            
            # Abonelikler icin uploader dogrulamasi (Imposter korumasi)
            if label == "ABONELIK":
                uploader = entry.get('uploader', '').lower()
                query_clean = query.lower()
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
    except:
        pass
    return results

def get_home_feed(user_data=None, page=1):
    """
    KESIN DEMIR YUMRUK KURALI:
    %50 Abone | %30 Begeni | %10 Populer | %10 TR Trend
    Shorts, Clip, Edit, Sarki YASAKTIR.
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
                    final_feed.extend(fetch_safe_videos(ydl, sub, 5, seen_ids, "ABONELIK", page, sort_date=True))
                    if len(final_feed) >= total_target: break
                return final_feed[:total_target]

            # --- DURUM 2: KESFET (DEMIR YUMRUK ORANLARI) ---
            
            # 1. %50 ABONELIKLER (10 Video) - En yeni videolara oncelik ver
            if subscriptions:
                random.shuffle(subscriptions)
                for sub in subscriptions:
                    final_feed.extend(fetch_safe_videos(ydl, sub, 3, seen_ids, "ABONELIK", page, sort_date=True))
                    if len(final_feed) >= 10: break
            
            # 2. %30 BEGENI/ILGI (6 Video)
            if interests:
                top_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:3]
                for tag, _ in top_tags:
                    final_feed.extend(fetch_safe_videos(ydl, f"{tag} amazing", 2, seen_ids, "SANA OZEL", page))
                    if len(final_feed) >= 16: break # 10 + 6

            # 3. %10 POPULER (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "popular entertainment", 2, seen_ids, "POPULER", page))

            # 4. %10 TR TREND (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "türkiye trend", 2, seen_ids, "TR TREND", page))

            # EKSIK KALIRSA (Trend ile tamamla)
            if len(final_feed) < total_target:
                final_feed.extend(fetch_safe_videos(ydl, "new content", total_target - len(final_feed), seen_ids, "KESFET", page))

            random.shuffle(final_feed)
            return final_feed[:total_target]

    except Exception as e:
        print(f"!!! Iron Fist Error: {e}")
        return []

def resolve_video(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        ydl_opts = {'format': 'best', 'quiet': True, 'nocheckcertificate': True}
        if os.path.exists(COOKIES_FILE): ydl_opts['cookiefile'] = COOKIES_FILE
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "id": video_id, "title": info.get('title'), "thumbnail": info.get('thumbnail'),
                "uploader": info.get('uploader'), "best_url": info.get('url'),
                "qualities": {f"{f.get('height')}p": f.get('url') for f in info.get('formats', []) if f.get('height') and f.get('url')}
            }
    except Exception as e: return {"error": str(e)}

def search_videos(query):
    if not query: return []
    ydl_opts = {'quiet': True, 'extract_flat': True, 'socket_timeout': 10}
    if os.path.exists(COOKIES_FILE): ydl_opts['cookiefile'] = COOKIES_FILE
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(f"ytsearch15:{query}", download=False).get('entries', [])
            return [{
                "id": e.get('id'), "title": e.get('title'),
                "thumbnail": e.get('thumbnail') or f"https://i.ytimg.com/vi/{e.get('id')}/hqdefault.jpg",
                "uploader": e.get('uploader') or "YouTube"
            } for e in results if e and not is_trash_video(e)]
    except Exception as e: return []
