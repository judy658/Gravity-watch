import yt_dlp
import os
import time
import random

COOKIES_FILE = "gravity_cookies.txt"

def is_music_video(entry):
    title = entry.get('title', '').lower()
    uploader = entry.get('uploader', '').lower()
    music_keywords = ['official video', 'official audio', 'lyrics', 'music video', 'vevo', 'remix', 'ft.', 'feat.']
    if any(k in title for k in music_keywords): return True
    if uploader.endswith(' - topic'): return True
    return False

def fetch_safe_videos(ydl, query, count, seen_ids, label, page=1):
    """Dinamik sayfalama destekli, imposter ve muzik korumali arama"""
    results = []
    # Sayfa arttikca daha derinleri tara (Offset mantigi)
    start_index = (page - 1) * count
    search_limit = start_index + count + 20 # Filtreleme payi icin fazla ara
    
    search_query = f"intitle:{query}" if label == "ABONELIK" else query
    search_res = ydl.extract_info(f"ytsearch{search_limit}:{search_query}", download=False).get('entries', [])
    
    # Onceki sayfalarda cikanlari atla
    potential_entries = search_res[start_index:] if len(search_res) > start_index else search_res
    
    for entry in potential_entries:
        if not entry: continue
        if entry.get('id') in seen_ids: continue
        if is_music_video(entry): continue
        
        uploader = entry.get('uploader', '').lower()
        query_clean = query.lower()
        if label == "ABONELIK":
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
    """GELISTIRILMIS ALTIN KURAL (Dinamik Sayfalama & Katı Oran)"""
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
            # --- ABONELIKLER (%50 veya %100) ---
            sub_count = total_target if subs_only else 10
            if subscriptions:
                random.shuffle(subscriptions)
                for sub in subscriptions:
                    final_feed.extend(fetch_safe_videos(ydl, sub, 4, seen_ids, "ABONELIK", page))
                    if len(final_feed) >= sub_count: break
            
            if subs_only: return final_feed[:total_target]

            # --- KESFET ICIN DIGER KATEGORILER ---
            # 1. %30 ILGI ALANI (6 Video)
            if interests:
                top_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:3]
                for tag, _ in top_tags:
                    final_feed.extend(fetch_safe_videos(ydl, f"{tag} amazing", 2, seen_ids, "SANA OZEL", page))
                    if len(final_feed) >= 16: break # 10 sub + 6 like

            # 2. %10 TREND (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "trending now", 2, seen_ids, "TREND", page))

            # 3. %10 TR POPULER (2 Video)
            final_feed.extend(fetch_safe_videos(ydl, "türkiye popüler", 2, seen_ids, "TR POPULER", page))

            # --- EKSIK KALIRSA (ORANTI KORUYARAK TAMAMLA) ---
            if len(final_feed) < total_target:
                # Eger hala bosluk varsa trend ile doldur ama asla seyreltme
                final_feed.extend(fetch_safe_videos(ydl, "popular entertainment", total_target - len(final_feed), seen_ids, "KESFET", page))

            random.shuffle(final_feed)
            return final_feed[:total_target]

    except Exception as e:
        print(f"!!! Final Golden Rule Error: {e}")
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
            } for e in results if e and not is_music_video(e)]
    except Exception as e: return []
