import json
import os
import threading

class GravityDataManager:
    def __init__(self):
        self.data = {
            "likes": [],
            "subscriptions": [],
            "history": [],
            "interests": {},
            "video_metadata": {}
        }
        self.current_email = None
        self.storage_path = None

    def switch_user(self, email):
        if not email or email == self.current_email:
            return
        
        self.current_email = email
        import hashlib
        email_hash = hashlib.md5(email.lower().encode()).hexdigest()
        self.storage_path = f"user_data_{email_hash}.json"
        
        self.load_local_data()

    def load_local_data(self):
        if self.storage_path and os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.data.update(json.load(f))
            except Exception as e:
                print(f"⚠️ [DATA] Yukleme hatasi: {e}")

    def save_local_data(self):
        if not self.storage_path: return
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"⚠️ [DATA] Kayit hatasi: {e}")

    def add_to_history(self, video_obj):
        if not video_obj or not video_obj.get('id'): return
        # Mukerrer kayitlari onle
        self.data["history"] = [v for v in self.data["history"] if v.get('id') != video_obj.get('id')]
        self.data["history"].insert(0, video_obj)
        self.data["history"] = self.data["history"][:50] # Limit 50
        self.save_local_data()
