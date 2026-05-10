import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client

app = Flask(__name__)
CORS(app)

# Bu anahtarları Render Panelinde "Environment Variables" olarak ekleyeceksin!
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def home():
    return "Gravity Watch Proxy Server is Active!"

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    try:
        res = supabase.auth.sign_in_with_password({"email": data['email'], "password": data['password']})
        return jsonify({"user": res.user.to_dict() if hasattr(res, 'user') else res.user}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        res = supabase.auth.sign_up({"email": data['email'], "password": data['password']})
        return jsonify({"user": res.user.to_dict() if hasattr(res, 'user') else res.user}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/comments', methods=['GET', 'POST'])
def handle_comments():
    if request.method == 'GET':
        video_id = request.args.get('video_id')
        res = supabase.table('video_comments').select('*').eq('video_id', video_id).order('created_at', desc=True).execute()
        return jsonify(res.data), 200
    else:
        data = request.json
        res = supabase.table('video_comments').insert(data).execute()
        return jsonify(res.data), 200

# Yardımcı Fonksiyon: Güvenli Sorgu
def get_user_data(table_name, email, select_query="*"):
    # Temiz sorgu: Sadece user_id veya user_email kolonlarına bak
    # email_variants ile yazım hatalarını ve büyük/küçük harf duyarlılığını aş
    email_variants = list(set([email, email.lower(), email.strip()]))
    
    all_data = []
    # Genelde 'user_id' veya 'user_email' kullanılır
    for col in ['user_id', 'user_email']:
        try:
            res = supabase.table(table_name).select(select_query).in_(col, email_variants).execute()
            if res.data:
                all_data.extend(res.data)
        except: pass
            
    # Tekil hale getir (Eğer hem user_id hem user_email ile eşleşirse mükerrer olmasın)
    seen = set()
    unique_data = []
    for item in all_data:
        # Satırın kendi ID'sini (PK) kullanarak tekilleştir
        row_id = item.get('id')
        if row_id and row_id not in seen:
            unique_data.append(item)
            seen.add(row_id)
    return unique_data

@app.route('/api/likes', methods=['GET', 'POST'])
def handle_likes():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401
    
    if request.method == 'GET':
        video_id = request.args.get('video_id')
        data = get_user_data('user_interactions', email)
        filtered = [item for item in data if item.get('video_id') == video_id and item.get('action_type') == 'like']
        return jsonify(filtered), 200
    else:
        data = request.json
        # Mevcut beğeniyi silmek için id bul
        existing = get_user_data('user_interactions', email)
        to_delete = [item['id'] for item in existing if item.get('video_id') == data['video_id'] and item.get('action_type') == 'like']
        
        for record_id in to_delete:
            try:
                supabase.table('user_interactions').delete().eq('id', record_id).execute()
            except: pass
        
        if data.get('is_like') or data.get('action_type') == 'like':
            res = supabase.table('user_interactions').insert({
                "user_id": email,
                "video_id": data['video_id'],
                "action_type": "like",
                "tags": data.get('tags', ['general'])
            }).execute()
            return jsonify(res.data), 200
        return jsonify({"status": "removed"}), 200

@app.route('/api/subscriptions', methods=['GET', 'POST'])
def handle_subs():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        data = get_user_data('local_subs', email)
        return jsonify(data), 200
    else:
        data = request.json
        # UNIFIED ID: Eğer ID yoksa isimden bir tane uret (prefix ile)
        channel_id = data.get('channel_id')
        channel_name = data.get('channel_name')
        
        if not channel_id and channel_name:
            channel_id = f"name:{channel_name.strip().lower()}"
        
        if not channel_id:
            return jsonify({"error": "No channel identified"}), 400

        # ABONELIKTEN CIKMA
        if not data.get('subscribe'):
            try:
                # Hem ID ile hem de (varsa) Isim ile ne varsa temizle
                # Sadece bu kullanıcıya ait olanları sil
                supabase.table('local_subs').delete().eq('user_id', email).eq('channel_id', channel_id).execute()
                if channel_name:
                    supabase.table('local_subs').delete().eq('user_id', email).eq('channel_name', channel_name).execute()
                return jsonify({"status": "unsubscribed"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        # ABONE OLMA (UPSERT)
        try:
            # Mevcut kaydı bulmaya çalış
            existing = supabase.table('local_subs').select('id').eq('user_id', email).eq('channel_id', channel_id).execute()
            
            payload = {
                "user_id": email,
                "channel_id": channel_id,
                "channel_name": channel_name
            }
            
            if existing.data:
                # Güncelle
                res = supabase.table('local_subs').update(payload).eq('id', existing.data[0]['id']).execute()
                return jsonify({"status": "updated", "data": res.data}), 200
            else:
                # Ekle
                res = supabase.table('local_subs').insert(payload).execute()
                return jsonify({"status": "subscribed", "data": res.data}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET', 'POST'])
def handle_history():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        data = get_user_data('user_history', email)
        return jsonify(data), 200
    else:
        data = request.json
        if isinstance(data, list):
            for item in data: item['user_id'] = email # Fallback column
        else:
            data['user_id'] = email
        res = supabase.table('user_history').upsert(data).execute()
        return jsonify(res.data), 200

@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        data = get_user_data('user_profiles', email)
        if data:
            return jsonify(data[0]), 200
        return jsonify({"nickname": "User"}), 200
    else:
        data = request.json
        res = supabase.table('user_profiles').upsert({"user_email": email, "nickname": data['nickname']}).execute()
        return jsonify(res.data), 200

@app.route('/api/interests', methods=['GET', 'POST'])
def handle_interests():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        data = get_user_data('user_interests', email, "tag_name, score")
        return jsonify(data), 200
    else:
        data = request.json
        if isinstance(data, list):
            for item in data: item['user_id'] = email
        else:
            data['user_id'] = email
        res = supabase.table("user_interests").upsert(data).execute()
        return jsonify(res.data), 200

@app.route('/api/interactions', methods=['GET', 'POST'])
def handle_interactions():
    email = request.headers.get('X-User-Email')
    if not email: return jsonify({"error": "Unauthorized"}), 401

    if request.method == 'GET':
        data = get_user_data('user_interactions', email, "video_id")
        return jsonify(data), 200
    else:
        data = request.json
        data['user_id'] = email
        res = supabase.table("user_interactions").insert(data).execute()
        return jsonify(res.data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
