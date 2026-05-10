import yt_dlp
import os
import time
import random
import concurrent.futures
import threading
import re

COOKIES_FILE = "gravity_cookies.txt"
executor = concurrent.futures.ThreadPoolExecutor(max_workers=20)
thread_local = threading.local()

def get_ydl_instance():
    if not hasattr(thread_local, "ydl"):
        opts = {
            'quiet': True, 'extract_flat': True, 'no_warnings': True,
            'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None,
            'http_headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        }
        thread_local.ydl = yt_dlp.YoutubeDL(opts)
    return thread_local.ydl

def is_trash(title, uploader, duration=None):
    """Gelistirilmis Akilli Filtre: Muzik Sezgisi, Shorts, Reklam"""
    title = str(title).lower()
    uploader = str(uploader or "").lower()
    
    # 1. Botlarin kullandigi ucuz etiketler
    bot_tags = ['#keşfet', '#kesfet', '#fyp', '#trend', '#viral', '#shorts', '#short', '#reels']
    if any(tag in title for tag in bot_tags): return True

    # 2. Klasik Muzik ve Klip Kelimeleri
    music_keywords = [
        'official video', 'official audio', 'lyric', 'music video', 'video klip', 'şarkı', 'müzik', 'klip', 'song', 
        'ft.', 'feat', 'prod.', 'remix', 'vevo', 'pop', 'caz', 'jazz', 'rock', 'metal', 'hip hop', 'rap', 
        'arabesk', 'türkü', 'halk müziği', 'electronic', 'techno', 'playlist', 'albüm', 'album'
    ]
    if any(word in title for word in music_keywords): return True
    if uploader.endswith(' - topic'): return True

    # --- YENİ: MUZIK SEZGISI (Daha Agresif) ---
    # Baslikta " - " veya " | " varsa (Sanatci - Eser yapisi)
    if ' - ' in title or ' | ' in title or ' – ' in title:
        # Eger baslikta bu yapi varsa artik sureyi bile beklemiyoruz, direkt süpheli!
        non_music = ['inceleme', 'haber', 'nasıl', 'rehber', 'vlog', 'ders', 'tutorial', 'review', 'guide', 'news']
        if not any(w in title for w in non_music):
            return True 

    # Suresi sarkı kadarsa (Garantici yaklasim)
    if duration and 90 <= duration <= 360:
        # Extra kontrol gerekirse buraya eklenir
        pass

    # 3. Reklam ve Tanitim
    ad_keywords = ['reklam', 'tanıtım', 'sponsorlu', 'iş birliği', 'fragman', 'trailer', 'teaser']
    if any(word in title for word in ad_keywords): return True

    # 4. Shorts ve Diger Copler
    if duration and duration < 60: return True # Shorts korumasi
    other_trash = ['edit', 'clip', 'tiktok', 'whatsapp status', 'fan edit']
    if any(word in title for word in other_trash): return True

    return False

def fetch_query(q_tuple):
    q_str, label, seen_ids = q_tuple
    ydl = get_ydl_instance()
    res = []
    try:
        # Arama ufku genisletildi
        query = q_str.replace('ytsearch10:', 'ytsearch40:').replace('ytsearch15:', 'ytsearch40:')
        info = ydl.extract_info(query, download=False)
        entries = info.get('entries', [])
        for e in entries:
            if not e or not e.get('id'): continue
            vid = str(e['id'])
            if vid in seen_ids: continue
            
            title = e.get('title', '')
            uploader = e.get('uploader', 'YouTube')
            duration = e.get('duration')
            
            if not is_trash(title, uploader, duration):
                res.append({
                    'id': vid, 'title': title,
                    'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                    'uploader': uploader,
                    'label': label
                })
    except: pass
    return res

def get_home_feed(user_data=None, page=1):
    """ORIJINAL SERT ALTIN ORAN (4-3-2-1 MONTAJI)"""
    user_data = user_data or {}
    interests = user_data.get('interests', {})
    subscriptions = user_data.get('subscriptions', [])
    subs_only = user_data.get('subscriptions_only', False)
    seen_ids = set(user_data.get('seen_ids', []))
    
    queries = []
    # Dinamik Arama Derinligi
    depth = 20 + (page * 5)

    if subscriptions:
        sub_list = list(subscriptions)
        random.shuffle(sub_list)
        for sub in sub_list[:10]: # Her seferinde 10 farkli aboneye odaklan
            queries.append((f"ytsearch{depth}:{sub}", 'ABONELİK', seen_ids))

    if not subs_only:
        if interests:
            active_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:4]
            for tag, _ in active_tags:
                queries.append((f"ytsearch{depth}:{tag} news", 'İLGİ', seen_ids))
        
        # --- GLOBAL VIP POPÜLER (%10) ---
        global_vips = ['MrBeast', 'Mark Rober', 'Dude Perfect', 'Veritasium', 'Sidemen']
        queries.append((f"ytsearch{depth}:{random.choice(global_vips)} new video", 'TREND', seen_ids))
        
        # --- TR VIP POPÜLER (%10) ---
        tr_vips = ['Enes Batur', 'Ruhi Çenet', 'Alper Rende', 'Barış Özcan', 'Orkun Işıtmak']
        queries.append((f"ytsearch{depth}:{random.choice(tr_vips)} son video", 'KEŞFET', seen_ids))

    # PARALEL MOTOR CALISIYOR
    raw_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as pool:
        future_results = [pool.submit(fetch_query, q) for q in queries]
        for future in concurrent.futures.as_completed(future_results):
            try:
                res_list = future.result(timeout=12)
                if res_list: raw_results.extend(res_list)
            except: continue

    # KATEGORİ KOVALARI (Bucketing)
    buckets = {'ABONELİK': [], 'İLGİ': [], 'KEŞFET': [], 'TREND': []}
    for item in raw_results:
        lbl = item.get('label', 'KEŞFET')
        if lbl in buckets: buckets[lbl].append(item)

    for k in buckets: random.shuffle(buckets[k])

    # SERT ALTIN ORAN MONTAJI (4-3-2-1)
    interleaved = []
    loops = 0
    while len(interleaved) < 20 and loops < 50:
        loops += 1
        added = 0
        # 4 Abone
        for _ in range(4): 
            if buckets['ABONELİK']: interleaved.append(buckets['ABONELİK'].pop(0)); added += 1
        # 3 İlgi
        for _ in range(3): 
            if buckets['İLGİ']: interleaved.append(buckets['İLGİ'].pop(0)); added += 1
        # 2 Keşfet
        for _ in range(2): 
            if buckets['KEŞFET']: interleaved.append(buckets['KEŞFET'].pop(0)); added += 1
        # 1 Trend
        if buckets['TREND']: interleaved.append(buckets['TREND'].pop(0)); added += 1
        
        if added == 0: break

    # Sadece abonelikler moduysa tum havuzu dondur
    if subs_only:
        sub_only_list = [i for i in raw_results if i['label'] == 'ABONELİK']
        random.shuffle(sub_only_list)
        return sub_only_list[:20]

    return interleaved[:20]

def resolve_video(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        ydl_opts = {'format': 'best', 'quiet': True, 'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None}
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
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(f"ytsearch20:{query}", download=False).get('entries', [])
            return [{
                "id": e.get('id'), "title": e.get('title'),
                "thumbnail": f"https://i.ytimg.com/vi/{e.get('id')}/hqdefault.jpg",
                "uploader": e.get('uploader') or "YouTube"
            } for e in results if e and not is_trash(e.get('title'), e.get('uploader'), e.get('duration'))]
    except: return []
