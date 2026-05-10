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
        'ffmpeg_location': './ffmpeg.exe',
        'http_headers': {
            'Accept-Language': 'tr-TR,tr;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
    }
    
    queries = []
    search_depth = 40 if subs_only else 30
    
    if subscriptions:
        sub_list = list(subscriptions)
        # In subs_only mode, we might want to see more from each or more channels
        random.shuffle(sub_list)
        limit = 10 if subs_only else 5
        for channel in sub_list[:limit]:
            queries.append((f"ytsearch{search_depth}:{channel}", 'ABONELİK', 0, 8 if subs_only else 5, channel))
            
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
                entries = info.get('entries', [])
                for e in entries:
                    if not e or not e.get('id'): continue
                    if not is_music(e['title'], e.get('uploader')):
                        res.append({
                            'id': e['id'], 'title': e['title'],
                            'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg",
                            'uploader': e.get('uploader', default_uploader),
                            'label': label,
                            'channel_id': e.get('channel_id') or e.get('uploader_id')
                        })
            except Exception as e:
                print(f"Query error ({q_str}): {e}")
        return res

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        future_results = [executor.submit(fetch_query, q) for q in queries]
        for future in concurrent.futures.as_completed(future_results):
            res_list = future.result()
            for item in res_list:
                if item['id'] not in seen_ids:
                    final_results.append(item)
                    seen_ids.add(item['id'])

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
    
    # TAMAMEN STANDART WEB MODU (Sıfır Risk, Sıfır Kılık Değiştirme)
    # Optimize format selection to be more inclusive of vertical videos
    # EN GÜVENLİ MOD: Standart Web Protokolü (Ban Riskini Sıfırlar)
    ydl_opts = {
        'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'geo_bypass': True,
        'geo_bypass_country': 'TR',
        'ffmpeg_location': './ffmpeg.exe',
        'http_headers': {
            'Accept-Language': 'tr-TR,tr;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            hq_audio_url = None
            dual_qualities = {}
            
            for f in info.get('formats', []):
                # Audio selection
                if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                    if not hq_audio_url or f.get('abr', 0) > 120: hq_audio_url = f['url']
                
                # Video selection (Support both horizontal and vertical)
                if f.get('vcodec') != 'none' and f.get('acodec') == 'none':
                    h = f.get('height')
                    w = f.get('width')
                    
                    # Horizontal mapping
                    if h in [1080, 720, 480, 360]:
                        dual_qualities[f"{h}p"] = f['url']
                    # Vertical mapping (Shorts)
                    elif h == 1920 or w == 1080: dual_qualities["1080p"] = f['url']
                    elif h == 1280 or w == 720: dual_qualities["720p"] = f['url']
                    elif h == 854 or w == 480: dual_qualities["480p"] = f['url']
                    elif h == 640 or w == 360: dual_qualities["360p"] = f['url']
            
            qualities = {}
            for f in info.get('formats', []):
                if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                    h = f.get('height')
                    w = f.get('width')
                    if h in [360, 720] or w in [360, 720]: 
                        label = f"{h}p" if h in [360, 720] else f"{w}p"
                        qualities[label] = f['url']

            hq_video_url = dual_qualities.get('1080p') or dual_qualities.get('720p') or info.get('url')
            
            # Absolute fallback if hq_video_url is still None
            if not hq_video_url and info.get('formats'):
                for f in info['formats']:
                    if f.get('url'):
                        hq_video_url = f['url']
                        break

            return {
                'id': info.get('id'), 'title': info.get('title'),
                'thumbnail': info.get('thumbnail'), 'description': info.get('description'),
                'uploader': info.get('uploader'), 'view_count': info.get('view_count', 0),
                'channel_id': info.get('channel_id'),
                'qualities': qualities,
                'dual_qualities': dual_qualities,
                'best_url': hq_video_url or info.get('url'),
                'hq_video_url': hq_video_url,
                'hq_audio_url': hq_audio_url
            }
        except Exception as e:
            return {'error': f"YouTube Erişim Engeli Devam Ediyor: {str(e)}"}

def search_videos(query):
    ydl_opts = {'quiet': True, 'extract_flat': True, 'geo_bypass': True, 'geo_bypass_country': 'TR', 'ffmpeg_location': './ffmpeg.exe'}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(f"ytsearch25:{query}", download=False)
            return [{'id': e['id'], 'title': e['title'], 'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg", 'uploader': e.get('uploader', 'YouTube'), 'channel_id': e.get('channel_id')} for e in info.get('entries', [])]
        except: return []

def get_channel_info(channel_id):
    ydl_opts = {'quiet': True, 'extract_flat': True, 'geo_bypass': True, 'geo_bypass_country': 'TR', 'ffmpeg_location': './ffmpeg.exe'}
    try:
        url = f"https://www.youtube.com/{channel_id}/videos" if channel_id.startswith('@') else f"https://www.youtube.com/channel/{channel_id}/videos"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            all_entries = info.get('entries') or []
            title = re.sub(r' - YouTube| - Videolar| - Videos| - Home', '', info.get('title', 'Kanal'), flags=re.IGNORECASE).strip()
            videos = [{'id': e['id'], 'title': e['title'], 'thumbnail': f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg"} for e in all_entries[:15] if e and e.get('id')]
            return {
                'title': title, 'channel_id': info.get('id') or channel_id, 
                'thumbnail': info['thumbnails'][-1]['url'] if info.get('thumbnails') else '',
                'description': info.get('description', ''), 'subscriber_count': info.get('subscriber_count', 0),
                'videos': videos, 'has_more': len(all_entries) > 15, 'total_videos': len(all_entries)
            }
    except Exception as e: return {'error': str(e)}

def get_liked_videos_info(video_ids):
    if not video_ids: return []
    results = []
    ydl_opts = {'quiet': True, 'extract_flat': True, 'geo_bypass': True, 'geo_bypass_country': 'TR', 'ffmpeg_location': './ffmpeg.exe'}
    def fetch_video(vid):
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
                return {'id': vid, 'title': info.get('title', 'Video'), 'thumbnail': f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", 'uploader': info.get('uploader', 'YouTube'), 'channel_id': info.get('channel_id'), 'label': 'BEĞENİLEN'}
            except: return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for res in executor.map(fetch_video, video_ids):
            if res: results.append(res)
    return results
