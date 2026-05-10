from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from resolver import get_video_info, search_videos, get_home_feed, get_liked_videos_info, get_channel_info
from supabase import create_client, Client
import os
import time
import subprocess
import yt_dlp
from dotenv import load_dotenv

import threading
import sys
from data_manager import GravityDataManager

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    
    internal_path = os.path.join(base_path, relative_path)
    if os.path.exists(internal_path):
        return internal_path
    
    external_path = os.path.join(os.path.dirname(sys.executable), relative_path)
    return external_path

# Load .env from beside the EXE or from dev path
env_path = resource_path(".env")
load_dotenv(env_path)
# RENDER KOPRUSU ( .env'den cek, yoksa varsayilana don)
PROXY_URL = os.getenv("RENDER_BRIDGE_URL") or os.getenv("PROXY_URL") or "https://gravity-watch.onrender.com"

# GLOBAL DATA MANAGER
data_manager = GravityDataManager(proxy_url=PROXY_URL)
synced_emails = set() # Track synced users per session

app = Flask(__name__, 
            static_folder=resource_path('static'),
            static_url_path='',
            template_folder=resource_path('static'))
CORS(app)

@app.route('/')
def index():
    return send_from_directory(resource_path('static'), 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(resource_path('static'), filename)

@app.route('/api/home', methods=['POST'])
def home():
    user_email = request.headers.get('X-User-Email')
    data = request.json or {}
    
    # Kullanıcı Değişimi Kontrolü
    if user_email:
        data_manager.switch_user(user_email)
        
    # Startup Sync (User-specific)
    if user_email and user_email not in synced_emails:
        threading.Thread(target=data_manager.sync_with_cloud, args=(user_email,)).start()
        synced_emails.add(user_email)
    
    page = int(data.get('page', 1))
    seen_ids = data.get('seen_ids', [])
    refresh = data.get('refresh', False)
    subscriptions_only = data.get('subscriptions_only', False)
    
    interest_data = data_manager.data.get("interests", {})
    subscriptions = data_manager.data.get("subscriptions", [])
    interacted_ids = data_manager.data.get("likes", [])
    
    seen_ids.extend(interacted_ids)
    seen_ids = list(set(seen_ids))

    feed = get_home_feed(user_email, interest_data, subscriptions, page, seen_ids, refresh=refresh, subs_only=subscriptions_only)
    return jsonify(feed)

@app.route('/api/impression', methods=['POST'])
def impression_penalty():
    user_email = request.headers.get('X-User-Email')
    if not user_email: return jsonify({"status": "ignored"}), 200
    tags = request.json.get('tags', [])
    try:
        requests.post(f"{PROXY_URL}/api/impression", json={"tags": tags}, headers={"X-User-Email": user_email})
    except: pass
    return jsonify({"status": "penalized"})

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    user_email = request.headers.get('X-User-Email')
    if not user_email: return jsonify({"error": "Unauthorized"}), 401
    
    data_manager.switch_user(user_email)
    data = request.json
    
    channel_id = data.get('channel_id')
    channel_name = data.get('channel_name')
    
    # Redundant but kept for compatibility, uses toggle logic
    status = data_manager.toggle_subscription(channel_id, channel_name, email=user_email)
    return jsonify({"status": status}), 200

@app.route('/api/subscriptions', methods=['GET', 'POST'])
def handle_subscriptions():
    user_email = request.headers.get('X-User-Email')
    if not user_email: return jsonify([]), 200
    
    data_manager.switch_user(user_email)
    
    if request.method == 'GET':
        # Önce yerel veriyi dön (Hız ve çevrimdışı destek için)
        local_subs = data_manager.data.get("subscriptions", [])
        
        # Arka planda buluttan güncel listeyi çekmeye çalış (Opsiyonel)
        # Ama şu an için yerel veri en güncel olanı tutuyor (sync_with_cloud sayesinde)
        return jsonify(local_subs)
    else:
        # Proxy üzerinden buluta kaydet (POST)
        data = request.json
        subscribe_flag = data.get('subscribe', True)
        try:
            resp = requests.post(f"{PROXY_URL}/api/subscriptions", 
                                 headers={"X-User-Email": user_email}, 
                                 json={"channel_name": data.get('channel_name'), 
                                       "channel_id": data.get('channel_id'),
                                       "subscribe": subscribe_flag}, 
                                 timeout=10)
            
            # Yerel dosyayı da guncelle (toggle_subscription icinde zaten cloud_action var ama burada manuel kontrol ediyoruz)
            # Yerel durumu senkron tutmak icin toggle yerine direkt setleme mantigi daha iyi olurdu ama mevcut yapı toggle üzerine kurulu.
            # Şimdilik toggle_subscription'ı sadece yerel listede varsa/yoksa durumuna göre çağırıyoruz.
            current_subs = data_manager.data.get("subscriptions", [])
            target_id = data.get('channel_id') or f"name:{data.get('channel_name', '').strip().lower()}"
            
            is_currently_subbed = target_id in current_subs
            
            if is_currently_subbed != subscribe_flag:
                data_manager.toggle_subscription(data.get('channel_id'), data.get('channel_name'), email=None) # email=None cunku zaten buluta gonderdik
            
            return jsonify(resp.json() if resp.ok else {"status": "error"}), 200
        except Exception as e:
            print(f"Cloud sub error: {e}")
            # Bulut hataliysa bile yerele kaydet ki kullanıcı donmasın
            status = data_manager.toggle_subscription(data.get('channel_id'), data.get('channel_name'), email=user_email)
            return jsonify({"status": status}), 200

@app.route('/api/channel_info', methods=['GET'])
def channel_info():
    user_email = request.headers.get('X-User-Email')
    channel_id = request.args.get('channel_id')
    page = int(request.args.get('page', 1))
    if not channel_id:
        return jsonify({"error": "Missing channel_id"}), 400
    try:
        info = get_channel_info(channel_id, page=page)
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/resolve', methods=['GET'])
def resolve():
    info = get_video_info(request.args.get('url'))
    # Auto-add to history and save metadata on resolve if successful
    if info and not info.get('error'):
        v_obj = {
            "id": info.get('id'),
            "title": info.get('title'),
            "thumbnail": info.get('thumbnail'),
            "uploader": info.get('uploader'),
            "channel_id": info.get('channel_id'),
            "label": "GEÇMİŞ"
        }
        data_manager.add_to_history(v_obj)
        data_manager.save_metadata(v_obj['id'], v_obj)
    return jsonify(info)

@app.route('/api/search', methods=['GET'])
def search():
    return jsonify(search_videos(request.args.get('q')))

@app.route('/api/like', methods=['POST'])
def like_video():
    user_email = request.headers.get('X-User-Email')
    if not user_email: return jsonify({"error": "Unauthorized"}), 401
    
    data_manager.switch_user(user_email)
    data = request.json
    video_id = data.get('video_id')
    action = data.get('action_type', 'like')
    video_obj = data.get('video_obj') 
    
    if action == 'like':
        data_manager.add_like(video_id, video_obj=video_obj, email=user_email)
    else:
        data_manager.remove_like(video_id, email=user_email)
        
    return jsonify({"status": "success"}), 200

@app.route('/api/check_like', methods=['GET'])
def check_like():
    v_id = request.args.get('video_id')
    if not v_id: return jsonify({"liked": False})
    return jsonify({"liked": data_manager.is_liked(v_id)})

@app.route('/api/liked_videos', methods=['GET'])
def liked_videos():
    page = int(request.args.get('page', 1))
    all_ids = data_manager.data.get("likes", [])
    
    # Sayfalama
    per_page = 15
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    page_ids = all_ids[start_idx:end_idx]
    
    if not page_ids:
        return jsonify([])
        
    # Metadata Kontrolü (Hız İçin)
    final_videos = []
    missing_ids = []
    
    for vid in page_ids:
        meta = data_manager.get_metadata(vid)
        if meta:
            meta['label'] = 'BEĞENİLEN'
            final_videos.append(meta)
        else:
            missing_ids.append(vid)
            
    # Eksik olanları YouTube'dan çek (Sadece ilk seferlik)
    if missing_ids:
        try:
            fetched_videos = get_liked_videos_info(missing_ids)
            for v in fetched_videos:
                data_manager.save_metadata(v['id'], v)
            data_manager.save_local_data()
            final_videos.extend(fetched_videos)
        except Exception as e:
            print("Liked videos error:", e)
            
    # Orijinal sırayı koru (Son beğenilen en üstte)
    # IDs are already in order, let's sort final_videos to match page_ids order
    id_map = {v['id']: v for v in final_videos}
    ordered_videos = [id_map[vid] for vid in page_ids if vid in id_map]
    
    return jsonify(ordered_videos)

@app.route('/api/comments', methods=['GET'])
def get_comments():
    video_id = request.args.get('video_id')
    if not video_id: return jsonify([])
    try:
        # Proxy üzerinden yorumları çek
        resp = requests.get(f"{PROXY_URL}/api/comments?video_id={video_id}", timeout=10)
        if resp.ok:
            return jsonify(resp.json())
        return jsonify([])
    except Exception as e:
        print(f"Comments Fetch Error: {e}")
        return jsonify([])

@app.route('/api/profile', methods=['GET'])
def get_profile():
    user_email = request.headers.get('X-User-Email')
    if not user_email: return jsonify({}), 401
    
    data_manager.switch_user(user_email)
    # Yerelden dön (Hız için)
    nickname = data_manager.data.get("nickname")
    if nickname:
        return jsonify({"nickname": nickname})
        
    # Yerelde yoksa proxy'den çek
    try:
        resp = requests.get(f"{PROXY_URL}/api/profile", headers={"X-User-Email": user_email}, timeout=10)
        if resp.ok:
            data = resp.json()
            data_manager.data["nickname"] = data.get("nickname", "")
            data_manager.save_local_data()
            return jsonify(data)
    except: pass
    
    return jsonify({"nickname": ""})

@app.route('/api/profile', methods=['POST'])
def save_profile():
    user_email = request.headers.get('X-User-Email')
    data = request.json
    if not user_email or not data: return jsonify({"error": "Unauthorized"}), 401
    
    data_manager.switch_user(user_email)
    try:
        # Proxy üzerinden kaydet
        resp = requests.post(f"{PROXY_URL}/api/profile", json=data, headers={"X-User-Email": user_email}, timeout=10)
        if resp.ok:
            data_manager.data["nickname"] = data.get("nickname", "")
            data_manager.save_local_data()
            return jsonify({"success": True})
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/comments', methods=['POST'])
def post_comment():
    user_email = request.headers.get('X-User-Email')
    data = request.json
    if not user_email or not data: return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Proxy üzerinden yorum gönder
        resp = requests.post(f"{PROXY_URL}/api/comments", json=data, headers={"X-User-Email": user_email}, timeout=10)
        if resp.ok:
            return jsonify(resp.json())
        return jsonify({"error": "Failed to save"}), 500
    except Exception as e:
        print(f"Comment Post Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/comments', methods=['DELETE'])
def delete_comment():
    user_email = request.headers.get('X-User-Email')
    comment_id = request.args.get('id')
    if not user_email or not comment_id: return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Proxy üzerinden sil
        resp = requests.delete(f"{PROXY_URL}/api/comments?id={comment_id}", headers={"X-User-Email": user_email}, timeout=10)
        if resp.ok:
            return jsonify({"success": True})
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        print(f"Comment Delete Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET', 'POST'])
def handle_history():
    user_email = request.headers.get('X-User-Email')
    if user_email:
        data_manager.switch_user(user_email)
        
    if request.method == 'GET':
        return jsonify(data_manager.data.get("history", [])), 200
    else:
        video_obj = request.json
        if video_obj:
            data_manager.add_to_history(video_obj)
        return jsonify({"status": "success"}), 200

FFMPEG_EXE = resource_path("ffmpeg.exe")

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.json
    video_id = data.get('video_id')
    title = data.get('title', 'video')
    if not video_id: return jsonify({"error": "Missing video_id"}), 400
    
    # İndirme Klasörü Oluştur
    download_path = os.path.join(os.getcwd(), "gravity_downloads")
    if not os.path.exists(download_path):
        os.makedirs(download_path)
        
    def do_download():
        try:
            # GÜÇLÜ İNDİRME MOTORU: YouTube Engellerini Birer Birer Aşar
            ydl_opts = {
                'format': 'bestvideo[height<=1080]+bestaudio/best[ext=m4a]/best', # Akıllı Format Seçimi
                'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
                'ffmpeg_location': FFMPEG_EXE,
                'quiet': True,
                'no_warnings': True,
                'n_sig_cache': True,
                'extractor_args': {
                    'youtube': {
                        # VR ve Pro protokolleri indirmede en güvenli limandır
                        'player_client': ['android_vr', 'ios', 'android_pro', 'web'],
                        'remote_components': ['ejs:github']
                    }
                },
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
            print(f"Download Finished: {title}")
        except Exception as e:
            print(f"Download Error (Attempt 1): {e}")
            try:
                # FALLBACK: Eğer yüksek kalite engellenirse, en stabil tek parça formatı indir
                with yt_dlp.YoutubeDL({'format': 'best', 'outtmpl': os.path.join(download_path, '%(title)s_fallback.%(ext)s')}) as ydl:
                    ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
            except: pass

    # Ana uygulamayı dondurmamak için arka planda (Thread) başlat
    import threading
    threading.Thread(target=do_download).start()
    
    return jsonify({"status": "success", "message": "İndirme arka planda başlatıldı. 'gravity_downloads' klasörüne bakabilirsin."})

if __name__ == '__main__':
    app.run(debug=False, port=5000, host='127.0.0.1', threaded=True)
