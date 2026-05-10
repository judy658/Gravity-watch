import json
import os
import requests
import threading
import sys

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    
    internal_path = os.path.join(base_path, relative_path)
    if os.path.exists(internal_path):
        return internal_path
    
    external_path = os.path.join(os.path.dirname(sys.executable), relative_path)
    return external_path

class GravityDataManager:
    def __init__(self, proxy_url="https://gravity-watch.onrender.com"):
        self.proxy_url = proxy_url
        self.current_email = None
        self.storage_path = None
        self.data = self._get_empty_data()

    def _get_empty_data(self):
        return {
            "likes": [], 
            "subscriptions": [], 
            "history": [], 
            "interests": {}, 
            "video_metadata": {}, 
            "nickname": "" 
        }

    def switch_user(self, email):
        if not email or email == self.current_email:
            return
        
        # Önceki kullanıcının verisini kaydet
        if self.current_email:
            self.save_local_data()
        
        self.current_email = email
        import hashlib
        email_hash = hashlib.md5(email.lower().encode()).hexdigest()
        self.storage_path = resource_path(f"gravity_user_{email_hash}.json")
        
        # Yeni kullanıcı için veriyi sıfırla
        self.data = self._get_empty_data()
        
        # MİGRASYON: Sadece ANA HESAP (geceninhakim) için eski verileri taşı
        OLD_DATA_FILE = resource_path("gravity_user_data.json")
        MAIN_EMAIL = "geceninhakimistudio@gmail.com"
        
        if email.lower() == MAIN_EMAIL.lower() and os.path.exists(OLD_DATA_FILE):
            try:
                print(f"🚛 [MIGRATION] Ana hesap için veri aktarımı başlatılıyor...")
                with open(OLD_DATA_FILE, "r", encoding="utf-8") as f:
                    old_data = json.load(f)
                    
                # Verileri birleştir
                for key in self.data:
                    if key in old_data:
                        if isinstance(self.data[key], list):
                            if key == 'history':
                                seen = set()
                                combined = self.data[key] + old_data[key]
                                new_history = []
                                for item in combined:
                                    vid = item.get('id')
                                    if vid and vid not in seen:
                                        new_history.append(item)
                                        seen.add(vid)
                                self.data[key] = new_history[:100]
                            else:
                                self.data[key] = list(dict.fromkeys(old_data[key] + self.data[key]))
                        elif isinstance(self.data[key], dict):
                            self.data[key].update(old_data[key])
                        else:
                            self.data[key] = old_data[key]
                
                self.save_local_data()
                print(f"✅ [MIGRATION] Başarılı! Veriler {self.storage_path} dosyasına aktarıldı.")
                
                # Dosyayı silmek yerine adını değiştirmeyi tekrar dene, hata alırsan içeriğini temizle
                try:
                    os.rename(OLD_DATA_FILE, OLD_DATA_FILE + ".migrated")
                except:
                    # Dosya kilitliyse en azından içeriğini boşalt ki diğer kullanıcılar çekmesin
                    with open(OLD_DATA_FILE, "w") as f:
                        f.write("{}")
                    print(f"⚠️ [MIGRATION] Dosya kilitliydi, içeriği temizlendi.")
                    
            except Exception as e:
                print(f"Error during migration: {e}")
        
        # Diğer kullanıcılar (Abdulkadir gibi) için eğer yanlışlıkla veri geldiyse ve dosya yeni ise temizle
        # (Bu sadece bir defalık temizlik için)
        if email.lower() != MAIN_EMAIL.lower() and os.path.exists(self.storage_path):
             # Eğer bulutta veri yoksa ve yerelde (yanlışlıkla) veri varsa temizle diyebiliriz 
             # ama riskli olabilir. Şimdilik sadece ana hesaba özel göçü sağladık.
             pass

        self.load_local_data()
        print(f"[USER] Kullanici degistirildi: {email} ({self.storage_path})")

    def load_local_data(self):
        if self.storage_path and os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    # Metadata ve nickname gibi kritik alanların üzerine yaz, diğerlerini güncelle
                    self.data.update(loaded)
            except Exception as e:
                print(f"Error loading local data: {e}")

    def save_local_data(self):
        if not self.storage_path: return
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"Error saving local data: {e}")

    def add_like(self, video_id, video_obj=None, email=None):
        if video_id not in self.data["likes"]:
            # En yeni begeniyi en basa ekle
            self.data["likes"].insert(0, video_id)
            if video_obj:
                self.save_metadata(video_id, video_obj)
            self.save_local_data()
            if email:
                # Buluta sadece 'like' aksiyonu gonder
                threading.Thread(target=self._cloud_action, args=(email, "likes", {
                    "video_id": video_id, 
                    "action_type": "like",
                    "tags": video_obj.get('tags', ['general']) if video_obj else ['general']
                })).start()

    def save_metadata(self, video_id, video_obj):
        if not video_id: return
        self.data["video_metadata"][video_id] = {
            "id": video_id,
            "title": video_obj.get("title", "Video"),
            "thumbnail": video_obj.get("thumbnail") or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
            "uploader": video_obj.get("uploader", "YouTube"),
            "channel_id": video_obj.get("channel_id")
        }

    def get_metadata(self, video_id):
        return self.data["video_metadata"].get(video_id)

    def remove_like(self, video_id, email=None):
        if video_id in self.data["likes"]:
            self.data["likes"].remove(video_id)
            self.save_local_data()
            if email:
                threading.Thread(target=self._cloud_action, args=(email, "likes", {"video_id": video_id, "action_type": "unlike"})).start()

    def is_liked(self, video_id):
        return video_id in self.data["likes"]

    def toggle_subscription(self, channel_id, channel_name, email=None):
        # UNIFIED ID: ID yoksa isimden uret (prefix ile)
        target_id = channel_id
        if not target_id and channel_name:
            target_id = f"name:{channel_name.strip().lower()}"
            
        if not target_id: return "error"

        is_subbing = False
        if target_id in self.data["subscriptions"]:
            # Cikarirken tum varyasyonlari temizle (Eski hatalardan kalanlari da temizlemek icin)
            self.data["subscriptions"] = [s for s in self.data["subscriptions"] if s != target_id and s != channel_name]
        else:
            self.data["subscriptions"].append(target_id)
            is_subbing = True
        
        self.save_local_data()
        
        if email:
            threading.Thread(target=self._cloud_action, args=(email, "subscriptions", {
                "channel_id": target_id,
                "channel_name": channel_name,
                "subscribe": is_subbing
            })).start()
        
        return "subscribed" if is_subbing else "unsubscribed"

    def add_to_history(self, video_obj):
        # Remove existing to move to top
        self.data["history"] = [v for v in self.data["history"] if v.get('id') != video_obj.get('id')]
        self.data["history"].insert(0, video_obj)
        # Cap at 100 items
        if len(self.data["history"]) > 100:
            self.data["history"] = self.data["history"][:100]
        self.save_local_data()

    def sync_with_cloud(self, email, retries=3):
        if not email: return
        print(f"[SYNC] Baslatiliyor: {email}")
        
        timeout = 30 
        for attempt in range(retries):
            try:
                # 1. Beğeniler (Interactions)
                resp = requests.get(f"{self.proxy_url}/api/interactions", headers={"X-User-Email": email}, timeout=timeout)
                if resp.ok:
                    data = resp.json()
                    # Sadece GERCEK begenileri filtrele (action_type == 'like')
                    cloud_ids = []
                    for item in data:
                        if item.get('action_type') == 'like' and item.get('video_id'):
                            cloud_ids.append(item['video_id'])
                    
                    # Yerel veriyle birleştir, mükerrerleri temizle, SIRALAMAYI KORU (Cloud daha oncelikli)
                    combined = cloud_ids + [lid for lid in self.data["likes"] if lid not in cloud_ids]
                    self.data["likes"] = combined
                    print(f"OK [SYNC] Begeniler: {len(cloud_ids)} (Bulut) | Toplam Yerel: {len(self.data['likes'])}")
                else:
                    print(f"❌ [SYNC] Beğeniler çekilemedi: {resp.status_code} - {resp.text}")
                
                # 2. Abonelikler
                resp = requests.get(f"{self.proxy_url}/api/subscriptions", headers={"X-User-Email": email}, timeout=timeout)
                if resp.ok:
                    data = resp.json()
                    cloud_subs = []
                    for s in data:
                        cid = s.get('channel_id')
                        cname = s.get('channel_name')
                        
                        # Sadece ID'yi ekle (Eger ID yoksa isimden uretilmis olmali zaten serverda)
                        if cid:
                            cloud_subs.append(cid)
                        elif cname:
                            cloud_subs.append(f"name:{cname.strip().lower()}")
                            
                    # Yerel veriyle birlestir ve TEKILE indir
                    self.data["subscriptions"] = list(set(cloud_subs + self.data["subscriptions"]))
                    print(f"OK [SYNC] Abonelikler: {len(cloud_subs)} (Bulut)")

                # 3. İlgi Alanları
                resp = requests.get(f"{self.proxy_url}/api/interests", headers={"X-User-Email": email}, timeout=timeout)
                if resp.ok:
                    data = resp.json()
                    for item in data:
                        tag = item.get('tag_name')
                        score = item.get('score', 0)
                        if tag:
                            self.data["interests"][tag] = max(self.data["interests"].get(tag, 0), score)
                    print(f"OK [SYNC] Ilgi Alanlari senkronize edildi.")

                # 4. Profil (Nickname)
                resp = requests.get(f"{self.proxy_url}/api/profile", headers={"X-User-Email": email}, timeout=timeout)
                if resp.ok:
                    pdata = resp.json()
                    if pdata.get("nickname"):
                        self.data["nickname"] = pdata["nickname"]
                        print(f"OK [SYNC] Nickname guncellendi: {self.data['nickname']}")

                self.save_local_data()
                print("DONE [SUCCESS] Bulut senkronizasyonu tamamlandi ve yerel veriler guncellendi!")
                return 
            except Exception as e:
                print(f"⚠️ [ERROR] Senkronizasyon hatası (Deneme {attempt + 1}): {e}")
                import time
                time.sleep(2)

    def _cloud_action(self, email, endpoint, payload):
        try:
            requests.post(f"{self.proxy_url}/api/{endpoint}", json=payload, headers={"X-User-Email": email}, timeout=10)
        except:
            pass
