from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import os
import requests
from supabase import create_client, Client
from data_manager import GravityDataManager
from resolver import resolve_video, get_home_feed, search_videos

app = Flask(__name__, static_folder='gravity-watch-mobile', static_url_path='')
CORS(app)

import traceback

# SUPABASE
# Render'in proxy ayarlarini hem os hem de local düzeyde sil
for key in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
    if key in os.environ:
        del os.environ[key]

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"⚠️ [SUPABASE] Missing Env Variables!")
else:
    try:
        # En yalın haliyle bağlanmayı dene
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase Connected Successfully")
    except Exception as e:
        print(f"❌ Supabase Connection Failed!")
        traceback.print_exc() # Hatayı tüm detaylarıyla (satır satır) yazdır

data_manager = GravityDataManager()

@app.route('/')
def index():
    return send_from_directory('gravity-watch-mobile', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('gravity-watch-mobile', path)

# --- API ENDPOINTS ---

@app.route('/api/home', methods=['POST'])
def home():
    user_email = request.headers.get('X-User-Email')
    if user_email: data_manager.switch_user(user_email)
    
    data = request.json or {}
    page = data.get('page', 1)
    
    feed = get_home_feed(user_email, page)
    return jsonify(feed)

@app.route('/api/resolve', methods=['GET'])
def resolve():
    v_id = request.args.get('url')
    info = resolve_video(v_id)
    
    user_email = request.headers.get('X-User-Email')
    if user_email and not info.get('error'):
        data_manager.switch_user(user_email)
        data_manager.add_to_history(info)
        
    return jsonify(info)

@app.route('/api/search', methods=['GET'])
def search():
    q = request.args.get('q')
    return jsonify(search_videos(q))

@app.route('/api/subscriptions', methods=['GET', 'POST'])
def handle_subscriptions():
    user_email = request.headers.get('X-User-Email')
    if not supabase or not user_email: return jsonify([])
    
    if request.method == 'GET':
        res = supabase.table("user_interactions").select("video_id").eq("user_email", user_email).eq("action_type", "subscribe").execute()
        return jsonify(res.data or [])
    else:
        data = request.json
        # Sync logic here...
        return jsonify({"success": True})

@app.route('/api/check_like', methods=['GET'])
def check_like():
    return jsonify({"liked": False}) # Fallback

@app.route('/api/comments', methods=['GET', 'POST', 'DELETE'])
def handle_comments():
    # Minimal comments implementation
    return jsonify([])

@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    return jsonify({"nickname": "Traveler"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
