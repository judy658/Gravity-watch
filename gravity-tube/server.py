from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import os
import requests
import yt_dlp
import threading
from supabase import create_client, Client
from data_manager import GravityDataManager
from resolver import get_video_info, search_videos, get_home_feed, get_liked_videos_info, get_channel_info, resolve_video_split

app = Flask(__name__, static_folder='gravity-watch-mobile', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "X-User-Email"])

# SUPABASE DIRECT CONNECT
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None

data_manager = GravityDataManager()

@app.route('/')
def index():
    return send_from_directory('gravity-watch-mobile', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('gravity-watch-mobile', filename)

# --- SUPABASE SYNC LOGIC ---
def sync_user_data(email):
    print(f"🔄 [SYNC] Baslatiliyor. Email: {email}")
    if not email or not supabase: 
        print("⚠️ [SYNC] Email yok veya Supabase bagli degil!")
        return
    data_manager.switch_user(email)
    
    try:
        # Denenecek sütun isimleri
        possible_cols = ["email", "user_email", "user_id", "Email"]
        success = False
        
        for col in possible_cols:
            try:
                # Beğenileri Çek
                res = supabase.table("user_interactions").select("video_id").eq(col, email).eq("action_type", "like").execute()
                if res.data:
                    data_manager.data["likes"] = [item["video_id"] for item in res.data]
                
                # Abonelikleri Çek (user_interactions içindeki 'subscribe' aksiyonlari)
                res_sub = supabase.table("user_interactions").select("video_id").eq(col, email).eq("action_type", "subscribe").execute()
                if res_sub.data:
                    data_manager.data["subscriptions"] = [item["video_id"] for item in res_sub.data]
                
                success = True
                print(f"✅ [SYNC] Sütun bulundu: {col}")
                break
            except Exception as e:
                if "does not exist" not in str(e): print(f"⚠️ [SYNC] {col} denemesi hatasi: {e}")
                continue
        
        # Alternatif: local_subs tablosunu da kontrol et
        try:
            for col in possible_cols:
                try:
                    res_subs = supabase.table("local_subs").select("*").eq(col, email).execute()
                    if res_subs.data:
                        extra_subs = [s.get("channel_id") or s.get("video_id") for s in res_subs.data]
                        data_manager.data["subscriptions"] = list(set(data_manager.data["subscriptions"] + [s for s in extra_subs if s]))
                    break
                except: continue
        except: pass
        
        data_manager.save_local_data()
        print(f"✅ [SYNC] Tamamlandi. Likes: {len(data_manager.data['likes'])}, Subs: {len(data_manager.data['subscriptions'])}")
    except Exception as e:
        print(f"❌ [SYNC] Genel Hata: {e}")

@app.route('/api/home', methods=['POST'])
def home():
    user_email = request.headers.get('X-User-Email')
    if user_email: sync_user_data(user_email)
    
    data = request.json or {}
    page = int(data.get('page', 1))
    seen_ids = data.get('seen_ids', [])
    subs_only = data.get('subscriptions_only', False)
    
    feed = get_home_feed(user_email, data_manager.data.get("interests", {}), 
                         data_manager.data.get("subscriptions", []), 
                         page, seen_ids, subs_only=subs_only)
    return jsonify(feed)

@app.route('/api/resolve', methods=['GET'])
def resolve():
    info = get_video_info(request.args.get('url'))
    if info and not info.get('error') and request.headers.get('X-User-Email'):
        data_manager.add_to_history(info)
    return jsonify(info)

@app.route('/api/stream_download', methods=['GET'])
def stream_download():
    v_id = request.args.get('video_id')
    info = get_video_info(v_id)
    url = info.get('best_url')
    if not url: return "Error", 404
    
    try:
        resp = requests.get(url, stream=True, timeout=10)
        return Response(resp.iter_content(chunk_size=8192), 
                        content_type=resp.headers.get('Content-Type'),
                        headers={"Content-Disposition": f"attachment; filename={v_id}.mp4"})
    except Exception as e:
        return str(e), 500

@app.route('/api/comments', methods=['GET', 'POST', 'DELETE'])
def handle_comments():
    user_email = request.headers.get('X-User-Email')
    if not supabase: return jsonify([])
    
    if request.method == 'GET':
        v_id = request.args.get('video_id')
        res = supabase.table("video_comments").select("*").eq("video_id", v_id).order("created_at", desc=True).execute()
        return jsonify(res.data or [])
    elif request.method == 'POST':
        data = request.json
        data["email"] = user_email
        res = supabase.table("video_comments").insert(data).execute()
        return jsonify(res.data[0] if res.data else {"error": "failed"})
    elif request.method == 'DELETE':
        comment_id = request.args.get('id')
        res = supabase.table("video_comments").delete().eq("id", comment_id).eq("email", user_email).execute()
        return jsonify({"success": True})

@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    user_email = request.headers.get('X-User-Email')
    if not supabase: return jsonify({"nickname": ""})
    
    if request.method == 'GET':
        res = supabase.table("user_profiles").select("nickname").eq("email", user_email).execute()
        return jsonify(res.data[0] if res.data else {"nickname": ""})
    else:
        data = request.json
        res = supabase.table("user_profiles").upsert({"email": user_email, "nickname": data.get("nickname")}).execute()
        return jsonify({"success": True})

@app.route('/api/history', methods=['GET'])
def get_history():
    user_email = request.headers.get('X-User-Email')
    if user_email: data_manager.switch_user(user_email)
    return jsonify(data_manager.data.get("history", []))

@app.route('/api/liked_videos', methods=['GET'])
def get_likes():
    user_email = request.headers.get('X-User-Email')
    if user_email: sync_user_data(user_email)
    ids = data_manager.data.get("likes", [])
    return jsonify(get_liked_videos_info(ids[:20]))

@app.route('/api/channel_info', methods=['GET'])
def channel_info():
    c_id = request.args.get('channel_id')
    page = int(request.args.get('page', 1))
    return jsonify(get_channel_info(c_id, page=page))

@app.route('/api/search', methods=['GET'])
def search():
    return jsonify(search_videos(request.args.get('q')))

@app.route('/api/resolve_split', methods=['GET'])
def resolve_split():
    v_id = request.args.get('video_id')
    if not v_id: return jsonify({"error": "No ID"}), 400
    info = resolve_video_split(v_id)
    return jsonify(info)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, threaded=True)
