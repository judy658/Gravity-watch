import yt_dlp
import json
import requests
import os
import random
import re
import concurrent.futures
import time
import threading
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

# GLOBAL THREAD POOL & THREAD LOCAL STORAGE (Hızın Sırrı)
# Bu sayede motorları her seferinde sıfırdan kurmak yerine hazırda bekletiyoruz.
executor = concurrent.futures.ThreadPoolExecutor(max_workers=20)
thread_local = threading.local()

def get_rss_videos(channel_id):
    """RSS uzerinden cok genis bir havuz ceker (Inadi kirmak icin)"""
    try:
        url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
        resp = requests.get(url, timeout=5)
        if not resp.ok: return []
        
        root = ET.fromstring(resp.content)
        namespace = {'atom': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}
        
        all_videos = []
        for entry in root.findall('atom:entry', namespace):
            video_id = entry.find('yt:videoId', namespace).text
            title = entry.find('atom:title', namespace).text
            uploader = entry.find('atom:author/atom:name', namespace).text
            
            all_videos.append({
                'id': video_id,
                'title': title,
                'thumbnail': f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                'uploader': uploader,
                'label': 'ABONELİK',
                'channel_id': channel_id
            })
        # Tum listeyi donuyoruz, sinirlama yapmiyoruz
        return all_videos
    except:
        return []

def get_ydl_instance():
    if not hasattr(thread_local, "ydl"):
        opts = {
            'quiet': True, 
            'extract_flat': True, 
            'no_warnings': True,
            'geo_bypass': True,
            'geo_bypass_country': 'TR',
            'cookiefile': COOKIES_FILE,
            'lazy_extract': True,
            'language': 'tr',
            'http_headers': {
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'User-Agent': 'com.google.android.youtube/19.05.36 (Linux; U; Android 14; tr_TR; Pixel 7 Build/UQ1A.240205.002) gzip'
            },
            'extractor_args': {
                'youtube': {
                    'lang': ['tr'],
                    'player_client': ['android', 'ios'],
                    'player_skip': ['webpage', 'configs']
                }
            }
        }
        thread_local.ydl = yt_dlp.YoutubeDL(opts)
    return thread_local.ydl

load_dotenv()

import sys

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        # Render'da dosyalar /opt/render/project/src altındadır
        base_path = "/opt/render/project/src" if os.path.exists("/opt/render/project/src") else os.getcwd()

    # Önce EXE içinde ara, yoksa EXE'nin yanındaki klasörde ara
    internal_path = os.path.join(base_path, relative_path)
    print(f"🔍 [DEBUG] Dosya araniyor: {internal_path} (Var mi: {os.path.exists(internal_path)})")
    if os.path.exists(internal_path):
        return internal_path
    
    # EXE'nin yanındaki gerçek klasör
    external_path = os.path.join(os.path.dirname(sys.executable), relative_path)
    print(f"🔍 [DEBUG] Yedek yol deneniyor: {external_path} (Var mi: {os.path.exists(external_path)})")
    return external_path
# EVRENSEL ÇEREZ AVCISI (Universal Cookie Detector)
def get_best_browser():
    for b in ['chrome', 'edge', 'opera', 'firefox', 'brave', 'vivaldi']:
        try: return b
        except: continue
    return None

BEST_BROWSER = get_best_browser()
# Evrensel JS Runtime ve FFMPEG Ayarları
FFMPEG_EXE = "ffmpeg" if os.name != 'nt' else resource_path("ffmpeg.exe")
COOKIES_FILE = resource_path("gravity_cookies.txt")

# Linux/Render için JS Runtime (Deno/Node) kontrolü
if os.name != 'nt':
    # Render'da node zaten var, ek yola gerek yok genelde ama deno varsa ekleyelim
    DENO_PATH = os.path.join(os.path.expanduser("~"), ".deno", "bin")
    if os.path.exists(DENO_PATH) and DENO_PATH not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + DENO_PATH
else:
    # Windows için eski mantık devam
    DENO_PATH = r"C:\Users\aliha\.deno\bin"
    if os.path.exists(DENO_PATH) and DENO_PATH not in os.environ["PATH"]:
        os.environ["PATH"] = DENO_PATH + os.pathsep + os.environ["PATH"]

def export_cookies():
    """Sistemdeki tarayıcı çerezlerini dışa aktarır"""
    if os.path.exists(COOKIES_FILE):
        # Eğer dosya varsa ve 1 saatten yeniyse tekrar uğraşma
        if time.time() - os.path.getmtime(COOKIES_FILE) < 3600:
            return True
            
    ydl_opts = {
        'cookiesfrombrowser': (BEST_BROWSER,),
        'quiet': True,
        'no_warnings': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Çerezleri Netscape formatında kaydet
            ydl.cookiejar.save(COOKIES_FILE, ignore_discard=True, ignore_expires=True)
        return True
    except:
        return False

# Uygulama başında çerezleri hazırla
export_cookies()

def is_music(title, uploader):
    music_keywords = ['official video', 'official audio', 'lyric video', 'official music video', 'şarkısı', 'müzik', 'klibi', 'song', 'music video', 'lyrics', 'ft.', 'feat', 'prod.', 'remix', 'mix', 'mashup']
    full_text = (title + " " + (uploader or "")).lower()
    return any(word in full_text for word in music_keywords)

# Global cache for home feed to speed up refreshes
HOME_FEED_CACHE = {}
CACHE_EXPIRATION = 300 # 5 minutes

def get_home_feed(user_email=None, interest_data=None, subscriptions=None, page=1, external_seen_ids=None, refresh=False, subs_only=False):
    # Cache key based on user, page and mode
    cache_key = f"{user_email}_{page}_{'subs' if subs_only else 'home'}"
    now = time.time()
    
    if not refresh and cache_key in HOME_FEED_CACHE:
        cache_data, timestamp = HOME_FEED_CACHE[cache_key]
        if now - timestamp < CACHE_EXPIRATION:
            return cache_data

    final_results = []
    seen_ids = set(external_seen_ids or [])
    
    ydl_opts = {
        'quiet': True, 
        'extract_flat': True, 
        'no_warnings': True,
        'geo_bypass': True,
        'geo_bypass_country': 'TR',
        'cookiefile': COOKIES_FILE,
        'lazy_extract': True, # Ekstra hız için
        'http_headers': {
            'Accept-Language': 'tr-TR,tr;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
    }
    
    queries = []
    # Dinamik Arama Derinliği (Sayfa ilerledikçe daha derine bak)
    # Sayfa 1: 10 video, Sayfa 2: 20 video...
    search_depth = page * 10 + 5
    
    # Her sayfada farklı bir "şanslı" abone ve ilgi alanı seçerek çeşitlilik sağlıyoruz
    if subscriptions:
        sub_list = list(subscriptions)
        random.seed(page + int(time.time() / 3600)) # Sayfaya ve saate göre rastgelelik
        random.shuffle(sub_list)
        
        # Sayfa ilerledikçe farklı abonelere odaklan (Pagination)
        per_page_subs = 10 # Daha fazla abone taranıyor
        start_idx = ((page - 1) * per_page_subs) % len(sub_list)
        active_subs = (sub_list + sub_list)[start_idx : start_idx + per_page_subs]
        
        for channel in active_subs:
            clean_name = str(channel).replace('name:', '').strip()
            if str(channel).startswith('UC'):
                # ID tabanli kesin URL
                target_url = f"https://www.youtube.com/channel/{channel}/videos"
            else:
                # Handle/Isim URL'si (playlist_items burada calisir)
                target_url = f"https://www.youtube.com/@{clean_name}/videos"
            
            queries.append((target_url, 'ABONELİK', 0, 15, clean_name))
            
    if not subs_only:
        if interest_data:
            # İlgi Alanları (HEDEF: %30) - Sayfaya göre farklı etiketler
            active_interests = [tag for tag, score in interest_data.items() if score > 0]
            random.shuffle(active_interests)
            start_tag_idx = ((page - 1) * 3) % max(1, len(active_interests))
            for tag in active_interests[start_tag_idx : start_tag_idx + 4]:
                queries.append((f"ytsearch{search_depth}:{tag}", f'{tag.upper()}', 0, 6, 'YouTube'))
                
        # Trendler (HEDEF: %10) - Sayfa arttıkça daha fazla trend
        queries.append((f"ytsearch{search_depth}:popüler videolar türkiye", 'TREND', 0, 5, 'YouTube'))
        
        # Keşfet (HEDEF: %20) - Her sayfada farklı keşfet tagı
        discovery_tags = ['teknoloji', 'bilim', 'belgesel', 'oyun haberleri', 'gezi', 'vlog', 'ilginç bilgiler', 'clash royale', 'mrbeast', 'müzik dışı', 'belgesel', 'film fragmanları']
        tag_idx = (page - 1) % len(discovery_tags)
        random_tag = discovery_tags[tag_idx]
        queries.append((f"ytsearch{search_depth}:{random_tag}", 'KEŞFET', 0, 8, 'YouTube'))

    def fetch_query(q_tuple):
        q_str, label, offset, count, default_uploader = q_tuple
        res = []
        ydl = get_ydl_instance()
        
        # Sadece Kanal/Handle URL'leri icin playlist_items kullan (Derin Kazi)
        if 'youtube.com/channel/' in q_str or 'youtube.com/@' in q_str:
            start_idx = offset + 1
            end_idx = offset + 60
            ydl.params['playlist_items'] = f"{start_idx}-{end_idx}"
        else:
            # ytsearch icin playlist_items calismaz, o yuzden temizle
            if 'playlist_items' in ydl.params:
                del ydl.params['playlist_items']
            # Arama sonuclarindan daha fazla cekip seen_ids ile suzecegiz
            q_str = q_str.replace('ytsearch10:', 'ytsearch40:')
        
        try:
            info = ydl.extract_info(q_str, download=False)
            channel_title = info.get('title') or info.get('uploader') or default_uploader
            channel_title = re.sub(r' - YouTube| - Videolar| - Videos| - Home', '', str(channel_title), flags=re.IGNORECASE).strip()
            
            entries = info.get('entries', [])
            for e in entries:
                if not e or not e.get('id'): continue
                
                vid = str(e.get('id'))
                title = str(e.get('title', '')).lower()
                uploader = e.get('uploader') or channel_title
                
                # SHORTS YASAGI (Kesin ve Sert)
                if 'shorts' in vid.lower() or 'shorts' in title or 'short' in title:
                    continue
                
                if not is_music(e['title'], uploader):
                    res.append({
                        'id': vid, 'title': e['title'],
                        'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                        'uploader': uploader,
                        'label': label,
                        'channel_id': e.get('channel_id') or (info.get('id') if 'channel' in q_str or '@' in q_str else None)
                    })
        except Exception as e:
            print(f"Query error ({q_str}): {e}")
        return res

    # Küresel işçi havuzunu kullanıyoruz - SAYFA BASI 60 VIDEO KAYDIRMA
    page_offset = (page - 1) * 60
    future_results = [executor.submit(fetch_query, (q[0], q[1], page_offset, q[3], q[4])) for q in queries]
    raw_results = []
    for future in concurrent.futures.as_completed(future_results):
        try:
            res_list = future.result(timeout=10)
            if res_list: raw_results.extend(res_list)
        except: continue

    # KATEGORİSEL KOVALAR (Bucketing) & GÖRDÜKLERİNİ ELE
    buckets = {'ABONELİK': [], 'İLGİ': [], 'KEŞFET': [], 'TREND': []}
    for item in raw_results:
        if item['id'] in seen_ids: continue
        
        lbl = item.get('label', 'KEŞFET')
        if lbl in ['ABONELİK', 'RSS']: buckets['ABONELİK'].append(item)
        elif lbl in ['TREND', 'KEŞFET']: buckets[lbl].append(item)
        else: buckets['İLGİ'].append(item)
        # seen_ids.add(item['id']) # Bunu burada yapmiyoruz ki bir sonraki sayfada gelsinler

    # SERT ALTIN ORAN MONTAJI (4-3-2-1)
    for k in buckets: random.shuffle(buckets[k])
    interleaved = []
    loops = 0
    # Oranları korumak icin bir kova bosalırsa cok asırı yukleme yapma
    while len(interleaved) < 50 and loops < 50:
        loops += 1
        added_in_this_loop = 0
        # 4 Abone
        for _ in range(4): 
            if buckets['ABONELİK']: 
                interleaved.append(buckets['ABONELİK'].pop(0))
                added_in_this_loop += 1
        # 3 İlgi
        for _ in range(3): 
            if buckets['İLGİ']: 
                interleaved.append(buckets['İLGİ'].pop(0))
                added_in_this_loop += 1
        # 2 Keşfet
        for _ in range(2): 
            if buckets['KEŞFET']: 
                interleaved.append(buckets['KEŞFET'].pop(0))
                added_in_this_loop += 1
        # 1 Trend
        if buckets['TREND']: 
            interleaved.append(buckets['TREND'].pop(0))
            added_in_this_loop += 1
            
        if added_in_this_loop == 0: break # Hicbir sey eklenemediyse dur

    return interleaved

    # Eğer hala çok az video varsa (Tüm sonuçlar "görüldü" ise), rastgele tazeleme yap
    if not subs_only and len(final_results) < 15:
        extra_query = random.choice(['yeni videolar 2024', 'ilginç videolar', 'popüler shorts', 'youtube trendleri'])
        extra = fetch_query((f"ytsearch{search_depth + 20}:{extra_query}", 'KEŞFET', 0, 15, 'YouTube'))
        for v in extra:
            if v['id'] not in seen_ids:
                final_results.append(v)

    random.shuffle(final_results)
    
    HOME_FEED_CACHE[cache_key] = (final_results, now)
    return final_results

def get_video_info(url_or_id):
    video_id = url_or_id.split('=')[-1] if 'youtube.com' in url_or_id else url_or_id
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    # HIZLI VE KESİNTİSİZ MOD: Throttling ve PO Token Engelini Kırar
    def try_extract(client_list):
        export_cookies()
        ydl_opts = {
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    info = None
    # STRATEJİ: Önce en sağlam (mweb/web) sonra hızlı (ios) deniyoruz
    # Çünkü iOS şu an PO Token istiyor ve donmaya sebep olabiliyor.
    for clients in [['mweb', 'web'], ['ios', 'android_pro'], ['android_vr']]:
        try:
            info = try_extract(clients)
            if info: break
        except: continue

    if not info:
        try:
            # Son Çare: Basit Arama
            with yt_dlp.YoutubeDL({'format': 'best', 'quiet': True, 'no_warnings': True}) as ydl:
                search_res = ydl.extract_info(f"ytsearch1:{video_id}", download=False)
                if 'entries' in search_res: info = search_res['entries'][0]
        except: pass

    if not info:
        return {'error': 'YouTube su an bu videoyu vermiyor. Lutfen tarayici cerezlerini yenileyin veya baska videoya gecin.'}

    hq_audio_url = None
    dual_qualities = {}
    
    # Extract audio and video URLs
    for f in info.get('formats', []):
        if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
            if not hq_audio_url or f.get('abr', 0) > (info.get('best_abr', 0)):
                hq_audio_url = f['url']
                info['best_abr'] = f.get('abr', 0)
        
        if f.get('vcodec') != 'none':
            h = f.get('height') or 0
            q = "1080p" if h >= 1000 else "720p" if h >= 700 else "480p" if h >= 450 else "360p"
            if q not in dual_qualities:
                dual_qualities[q] = f['url']

    # TEK PARÇA (PROGRESSIVE) FORMATLAR
    prog_url = None
    for f in info.get('formats', []):
        if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
            h = f.get('height') or 0
            if h == 720: prog_url = f['url']
            elif h == 360 and not prog_url: prog_url = f['url']

    # 1080p ve Ses Ayrımları
    v_1080 = dual_qualities.get('1080p')
    # Ses yoksa progressive linki ses olarak kullan
    final_audio = hq_audio_url or prog_url
    
    return {
        'id': info.get('id'), 'title': info.get('title'),
        'thumbnail': info.get('thumbnail'), 'uploader': info.get('uploader') or info.get('channel'),
        'description': info.get('description', ''),
        'view_count': info.get('view_count', 0), 
        'channel_id': info.get('channel_id') or info.get('uploader_id'),
        'qualities': dual_qualities,
        'dual_qualities': dual_qualities,
        # Frontend'in beklediği kritik anahtarlar
        'best_url': prog_url or v_1080 or dual_qualities.get('720p') or dual_qualities.get('360p'),
        'hq_video_url': v_1080, # Eğer 1080p varsa ayrı gönder
        'hq_audio_url': final_audio if v_1080 else None, # Sadece 1080p varsa ayrı ses gönder
        'video_url': prog_url or v_1080,
        'audio_url': final_audio
    }

def search_videos(query):
    ydl_opts = {'quiet': True, 'extract_flat': True, 'no_warnings': True, 'geo_bypass': True, 'geo_bypass_country': 'TR', 'ffmpeg_location': './ffmpeg.exe', 'cookiefile': COOKIES_FILE}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(f"ytsearch25:{query}", download=False)
            return [{'id': e['id'], 'title': e['title'], 'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg", 'uploader': e.get('uploader', 'YouTube'), 'channel_id': e.get('channel_id')} for e in info.get('entries', [])]
        except: return []

def get_channel_info(channel_id, page=1):
    # Beğenilenlerde olduğu gibi iOS kapısını kullanıyoruz (Hızlı ve engelsiz)
    export_cookies()
    ydl_opts = {
        'quiet': True, 
        'extract_flat': True, 
        'geo_bypass': True, 
        'geo_bypass_country': 'TR', 
        'ffmpeg_location': FFMPEG_EXE,
        'cookiefile': COOKIES_FILE,
        'extractor_args': {'youtube': {'player_client': ['ios']}}
    }
    try:
        # Kanal URL tipine göre doğru yolu belirle
        if channel_id.startswith('@'):
            url = f"https://www.youtube.com/{channel_id}/videos"
        elif len(channel_id) > 20: # Muhtemelen UC... ile başlayan ID
            url = f"https://www.youtube.com/channel/{channel_id}/videos"
        else: # Handle/Name fallback
            url = f"https://www.youtube.com/@{channel_id}/videos"

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            all_entries = info.get('entries') or []
            
            # Sayfalama mantığı (Her sayfada 15 video)
            per_page = 15
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            
            paged_entries = all_entries[start_idx:end_idx]
            
            title = re.sub(r' - YouTube| - Videolar| - Videos| - Home', '', info.get('title', 'Kanal'), flags=re.IGNORECASE).strip()
            
            videos = []
            for e in paged_entries:
                if e and e.get('id'):
                    videos.append({
                        'id': e['id'], 
                        'title': e.get('title', 'Video'), 
                        'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg",
                        'uploader': title
                    })
            
            return {
                'title': title, 
                'channel_id': info.get('id') or channel_id, 
                'thumbnail': info['thumbnails'][-1]['url'] if info.get('thumbnails') else f"https://ui-avatars.com/api/?name={title}&background=random",
                'description': info.get('description', ''), 
                'subscriber_count': info.get('subscriber_count', 0),
                'videos': videos, 
                'has_more': len(all_entries) > end_idx,
                'total_videos': len(all_entries)
            }
    except Exception as e: 
        print(f"Channel fetch error: {e}")
        return {'error': str(e), 'videos': []}

def get_liked_videos_info(video_ids):
    if not video_ids: return []
    results = []
    # Beğenilenler için en hafif ve en az engel takılan protokol: ios
    export_cookies()
    ydl_opts = {
        'quiet': True, 
        'extract_flat': True, 
        'geo_bypass': True, 
        'geo_bypass_country': 'TR', 
        'ffmpeg_location': './ffmpeg.exe',
        'no_warnings': True,
        'cookiefile': COOKIES_FILE,
        'extractor_args': {'youtube': {'player_client': ['ios']}} # Hafif ve hızlı
    }
    
    def fetch_video(vid):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Sadece başlık ve temel bilgileri al (download=False)
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
                return {
                    'id': vid, 
                    'title': info.get('title', 'Video'), 
                    'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", 
                    'uploader': info.get('uploader', 'YouTube'), 
                    'channel_id': info.get('channel_id'), 
                    'label': 'BEĞENİLEN'
                }
        except:
            # YouTube cevap vermezse videoyu kaybetme, temel bilgilerle devam et
            return {
                'id': vid, 
                'title': 'Video (Bilgi Bekleniyor)', 
                'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", 
                'uploader': 'YouTube', 
                'label': 'BEĞENİLEN'
            }

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for res in executor.map(fetch_video, video_ids):
            if res: results.append(res)
    return results

def resolve_video_split(video_id):
    """BOT SAVAR (V5): Ayrisik Video ve Ses Akisi Saglayici"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    COOKIES_FILE = "gravity_cookies.txt"
    
    # Adim 1: yt-dlp ile formatlari ayristir
    for client in ['android', 'ios', 'web', 'mweb']:
        try:
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'quiet': True,
                'no_warnings': True,
                'javascript_runtimes': ['node'],
                'cookiefile': COOKIES_FILE if os.path.exists(COOKIES_FILE) else None,
                'extractor_args': {'youtube': {'player_client': [client]}},
                'nocheckcertificate': True
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                formats = info.get('formats', [])
                
                video_f = [f for f in formats if f.get('vcodec') != 'none' and f.get('acodec') == 'none' and f.get('ext') == 'mp4']
                if not video_f: video_f = [f for f in formats if f.get('vcodec') != 'none' and f.get('acodec') == 'none']
                audio_f = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                
                if video_f and audio_f:
                    best_v = video_f[-1]
                    best_a = audio_f[-1]
                    return {
                        "id": video_id,
                        "title": info.get('title'),
                        "video_url": best_v.get('url'),
                        "audio_url": best_a.get('url'),
                        "video_ext": best_v.get('ext'),
                        "audio_ext": best_a.get('ext'),
                        "method": f"yt-dlp-{client}"
                    }
        except: continue

    # Adim 2: Cobalt Fallback
    try:
        cobalt_res = requests.post("https://api.cobalt.tools/api/json", 
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            json={"url": url, "videoQuality": "1080"}, timeout=12)
        c_data = cobalt_res.json()
        if c_data.get('url'):
            return {
                "id": video_id,
                "video_url": c_data['url'],
                "audio_url": None,
                "title": "Cobalt Export",
                "method": "cobalt"
            }
    except: pass

    return {"error": "Split streamler bulunamadi veya YouTube engelledi."}
