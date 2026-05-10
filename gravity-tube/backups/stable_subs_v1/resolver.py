import yt_dlp
import json
import requests
import os
import random
import re
import concurrent.futures
import time
from dotenv import load_dotenv

load_dotenv()

import sys

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    # Önce EXE içinde ara, yoksa EXE'nin yanındaki klasörde ara
    internal_path = os.path.join(base_path, relative_path)
    if os.path.exists(internal_path):
        return internal_path
    
    # EXE'nin yanındaki gerçek klasör
    external_path = os.path.join(os.path.dirname(sys.executable), relative_path)
    return external_path
# EVRENSEL ÇEREZ AVCISI (Universal Cookie Detector)
def get_best_browser():
    for b in ['chrome', 'edge', 'opera', 'firefox', 'brave', 'vivaldi']:
        try: return b
        except: continue
    return None

BEST_BROWSER = get_best_browser()
COOKIES_FILE = resource_path("gravity_cookies.txt")
FFMPEG_EXE = resource_path("ffmpeg.exe")

# Deno Yolunu Zorla Ekle (n-challenge çözümü için)
DENO_PATH = r"C:\Users\aliha\.deno\bin"
if os.path.exists(DENO_PATH) and DENO_PATH not in os.environ["PATH"]:
    os.environ["PATH"] = DENO_PATH + os.pathsep + os.environ["PATH"]

COOKIES_FILE = "gravity_cookies.txt"

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
    # Arama derinliği (Hız için ultra yüzeysel)
    search_depth = 10
    
    if subscriptions:
        sub_list = list(subscriptions)
        random.shuffle(sub_list)
        # Garanti Yöntem: Direkt URL'ler üzerinden tarama
        for channel in sub_list[:10]:
            clean_name = str(channel).replace('name:', '').strip()
            
            if str(channel).startswith('UC'):
                # ID tabanlı kesin URL
                target_url = f"https://www.youtube.com/channel/{channel}/videos"
            else:
                # Handle/İsim tabanlı kesin URL
                target_url = f"https://www.youtube.com/@{clean_name}/videos"
            
            queries.append((target_url, 'ABONELİK', 0, 10, clean_name))
            
    if not subs_only:
        if interest_data:
            active_interests = [tag for tag, score in interest_data.items() if score > 0]
            random.shuffle(active_interests)
            for tag in active_interests[:5]:
                queries.append((f"ytsearch{search_depth}:{tag}", f'{tag.upper()}', 0, 5, 'YouTube'))
                
        queries.append((f"ytsearch{search_depth}:popüler videolar türkiye", 'TREND', 0, 10, 'YouTube'))
        
        discovery_tags = ['teknoloji', 'bilim', 'belgesel', 'oyun haberleri', 'gezi', 'vlog', 'ilginç bilgiler', 'clash royale', 'mrbeast', 'müzik dışı']
        random_tag = random.choice(discovery_tags)
        queries.append((f"ytsearch{search_depth}:{random_tag}", 'KEŞFET', 0, 5, 'YouTube'))

    def fetch_query(q_tuple):
        q_str, label, offset, count, default_uploader = q_tuple
        res = []
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(q_str, download=False)
                channel_title = info.get('title') or info.get('uploader') or default_uploader
                channel_title = re.sub(r' - YouTube| - Videolar| - Videos| - Home', '', str(channel_title), flags=re.IGNORECASE).strip()
                
                entries = info.get('entries', [])
                for e in entries[:count]:
                    if not e or not e.get('id'): continue
                    
                    uploader = e.get('uploader') or channel_title
                    cid = e.get('channel_id')
                    
                    if not is_music(e['title'], uploader):
                        res.append({
                            'id': e['id'], 'title': e['title'],
                            'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg",
                            'uploader': uploader,
                            'label': label,
                            'channel_id': cid or (info.get('id') if 'channel' in q_str or '@' in q_str else None)
                        })
            except Exception as e:
                print(f"Query error ({q_str}): {e}")
        return res

    # Max workers (Eski hızlı ayara geri dönüş: 15)
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        future_results = [executor.submit(fetch_query, q) for q in queries]
        for future in concurrent.futures.as_completed(future_results):
            try:
                res_list = future.result(timeout=10) # Timeout 10sn
                if res_list:
                    for item in res_list:
                        if item['id'] not in seen_ids:
                            final_results.append(item)
                            seen_ids.add(item['id'])
            except: continue

    if not subs_only and len(final_results) < 10:
        extra = fetch_query((f"ytsearch20:yeni videolar", 'GENEL', 0, 10, 'YouTube'))
        for item in extra:
            if item['id'] not in seen_ids:
                final_results.append(item)

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
            'format': 'bestvideo[height<=1080]+bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'geo_bypass': True,
            'geo_bypass_country': 'TR',
            'ffmpeg_location': FFMPEG_EXE,
            'cookiefile': COOKIES_FILE,
            'n_sig_cache': True,
            'extractor_args': {
                'youtube': {
                    'player_client': client_list,
                    'remote_components': ['ejs:github']
                }
            },
            'socket_timeout': 10 # 10 saniye sonra vazgeç (Donmayı engeller)
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
