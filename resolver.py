import yt_dlp
import os
import time
import random
import concurrent.futures
import threading
import re
import requests

COOKIES_FILE = "gravity_cookies.txt"
executor = concurrent.futures.ThreadPoolExecutor(max_workers=20)

def get_ydl_instance(client='android'):
    opts = {
        'quiet': True, 
        'extract_flat': True, 
        'no_warnings': True,
        'javascript_runtimes': ['node'],
        'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None,
        'extractor_args': {
            'youtube': {
                'player_client': [client],
                'player_skip': ['webpage', 'configs']
            }
        }
    }
    return yt_dlp.YoutubeDL(opts)

def is_trash(title, uploader, duration=None):
    title = str(title).lower()
    uploader = str(uploader or "").lower()
    bot_tags = ['#keşfet', '#kesfet', '#fyp', '#trend', '#viral', '#shorts', '#short', '#reels']
    if any(tag in title for tag in bot_tags): return True
    music_keywords = ['official video', 'official audio', 'lyric', 'music video', 'video klip', 'şarkı', 'müzik', 'klip', 'song', 'ft.', 'feat', 'prod.', 'remix', 'vevo', 'pop', 'caz', 'jazz', 'rock', 'metal', 'hip hop', 'rap', 'arabesk', 'türkü', 'halk müziği', 'electronic', 'techno', 'playlist', 'albüm', 'album']
    if any(word in title for word in music_keywords): return True
    if uploader.endswith(' - topic'): return True
    if ' - ' in title or ' | ' in title or ' – ' in title:
        non_music = ['inceleme', 'haber', 'nasıl', 'rehber', 'vlog', 'ders', 'tutorial', 'review', 'guide', 'news']
        if not any(w in title for w in non_music): return True 
    if duration and duration < 60: return True
    other_trash = ['edit', 'clip', 'tiktok', 'whatsapp status', 'fan edit']
    if any(word in title for word in other_trash): return True
    ad_keywords = ['reklam', 'tanıtım', 'sponsorlu', 'iş birliği', 'fragman', 'trailer', 'teaser']
    if any(word in title for word in ad_keywords): return True
    return False

def fetch_query(q_tuple):
    q_str, label, seen_ids, sub_name = q_tuple
    ydl = get_ydl_instance('web')
    res = []
    try:
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
            if label == 'ABONELİK' and sub_name:
                if str(sub_name).lower() not in uploader.lower() and uploader.lower() not in str(sub_name).lower():
                    continue
            if not is_trash(title, uploader, duration):
                res.append({'id': vid, 'title': title, 'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", 'uploader': uploader, 'label': label})
    except: pass
    return res

def get_home_feed(user_data=None, page=1):
    user_data = user_data or {}
    interests = user_data.get('interests', {})
    subscriptions = user_data.get('subscriptions', [])
    subs_only = user_data.get('subscriptions_only', False)
    seen_ids = set(user_data.get('seen_ids', []))
    queries = []
    depth = 20 + (page * 5)
    if subscriptions:
        sub_list = list(subscriptions)
        random.shuffle(sub_list)
        sub_limit = 20 if subs_only else 10
        for sub in sub_list[:sub_limit]:
            queries.append((f"ytsearch{depth}:{sub}", 'ABONELİK', seen_ids, sub))
    if not subs_only:
        if interests:
            active_tags = sorted(interests.items(), key=lambda x: x[1], reverse=True)[:4]
            for tag, _ in active_tags:
                queries.append((f"ytsearch{depth}:{tag} news", 'İLGİ', seen_ids, None))
        global_vips = ['MrBeast', 'Mark Rober', 'Dude Perfect', 'Veritasium', 'Sidemen']
        queries.append((f"ytsearch{depth}:{random.choice(global_vips)} türkçe", 'TREND', seen_ids, None))
        tr_vips = ['Enes Batur', 'Ruhi Çenet', 'Alper Rende', 'Barış Özcan', 'Orkun Işıtmak']
        queries.append((f"ytsearch{depth}:{random.choice(tr_vips)} son video", 'KEŞFET', seen_ids, None))
    raw_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as pool:
        future_results = [pool.submit(fetch_query, q) for q in queries]
        for future in concurrent.futures.as_completed(future_results):
            try:
                res_list = future.result(timeout=12)
                if res_list: raw_results.extend(res_list)
            except: continue
    buckets = {'ABONELİK': [], 'İLGİ': [], 'KEŞFET': [], 'TREND': []}
    for item in raw_results:
        lbl = item.get('label', 'KEŞFET')
        if lbl in buckets: buckets[lbl].append(item)
    for k in buckets: random.shuffle(buckets[k])
    interleaved = []
    local_seen = set()
    loops = 0
    while len(interleaved) < 20 and loops < 50:
        loops += 1
        added = 0
        def try_add(bucket_name):
            if buckets[bucket_name]:
                item = buckets[bucket_name].pop(0)
                if item['id'] not in local_seen and item['id'] not in seen_ids:
                    interleaved.append(item)
                    local_seen.add(item['id'])
                    return True
            return False
        for _ in range(4): 
            if try_add('ABONELİK'): added += 1
        for _ in range(3): 
            if try_add('İLGİ'): added += 1
        for _ in range(2): 
            if try_add('KEŞFET'): added += 1
        if try_add('TREND'): added += 1
        if added == 0: break
    if subs_only:
        sub_only_list = []
        for item in raw_results:
            if item['label'] == 'ABONELİK' and item['id'] not in seen_ids and item['id'] not in local_seen:
                sub_only_list.append(item); local_seen.add(item['id'])
        random.shuffle(sub_only_list)
        return sub_only_list[:20]
    return interleaved[:20]

def resolve_video(video_id):
    """BOT SAVAR (V2): Kendi gucumuz yetmezse Cobalt yardima kosar"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # ADIM 1: Kendi Manifest Hunter stratejimiz
    clients = ['android_vr', 'ios', 'android', 'mweb']
    for client in clients:
        try:
            ydl_opts = {
                'format': 'best[ext=mp4]/best',
                'quiet': True,
                'no_warnings': True,
                'javascript_runtimes': ['node'],
                'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None,
                'extractor_args': {'youtube': {'player_client': [client]}},
                'nocheckcertificate': True,
                'socket_timeout': 7
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if info and info.get('url'):
                    return {
                        "id": video_id, "title": info.get('title'), "best_url": info.get('url'),
                        "uploader": info.get('uploader')
                    }
        except: continue
            
    # ADIM 2: Cobalt API (Yedek Plan - Hayat Kurtaran)
    print(f"!!! Kendi gucumuz yetmedi, Cobalt devreye giriyor: {video_id}")
    try:
        cobalt_res = requests.post("https://api.cobalt.tools/api/json", 
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            json={"url": url, "videoQuality": "1080"}, timeout=10)
        if cobalt_res.status_code == 200:
            c_data = cobalt_res.json()
            if c_data.get('url'):
                return {"id": video_id, "best_url": c_data['url'], "title": "Cobalt HD"}
    except: pass
    
    return {"error": "Video kilitli. Lutfen baska bir video deneyin veya cerezleri tazeleyin."}

def search_videos(query):
    if not query: return []
    ydl = get_ydl_instance('web')
    try:
        results = ydl.extract_info(f"ytsearch20:{query}", download=False).get('entries', [])
        return [{
            "id": e.get('id'), "title": e.get('title'),
            "thumbnail": f"https://i.ytimg.com/vi/{e.get('id')}/hqdefault.jpg",
            "uploader": e.get('uploader') or "YouTube"
        } for e in results if e and not is_trash(e.get('title'), e.get('uploader'), e.get('duration'))]
    except: return []
