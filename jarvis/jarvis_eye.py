import os
import sys
import time
import json
import threading
import tkinter as tk
import customtkinter as ctk
import mss
import cv2
import numpy as np
import pydirectinput

# --- JARVIS MULTI-GAME EDITION (v6.0 - ZORTORANT ADDED) ---
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class JarvisEye(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("J.A.R.V.I.S. Eye - Tactical Hub")
        self.geometry("420x600")
        self.attributes("-topmost", True)
        
        # Şeffaf çerçeve için sihirli renk
        self.transparent_color = "#ff00ff"
        self.configure(fg_color=self.transparent_color)
        try: self.wm_attributes("-transparentcolor", self.transparent_color)
        except: pass

        # Hafıza ayarları
        self.current_game = "zortorant"
        self.is_vision_active = False
        self.is_auto_mode = False
        self.last_shot_time = 0

        # --- KONTROL PANELİ ---
        self.cp = ctk.CTkFrame(self, height=180, fg_color="#1e1e1e", corner_radius=15)
        self.cp.pack(side="top", fill="x", padx=10, pady=10)

        # Başlık
        self.title_lbl = ctk.CTkLabel(self.cp, text="STARK INDUSTRIES - VISION", font=("Orbitron", 14, "bold"), text_color="#00a8ff")
        self.title_lbl.grid(row=0, column=0, columnspan=3, pady=10)

        # Oyun Seçimi
        self.game_selector = ctk.CTkOptionMenu(self.cp, values=["zortorant", "flappy_bird", "snake"], 
                                              command=self.change_game)
        self.game_selector.grid(row=1, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.game_selector.set("zortorant")

        # Butonlar
        self.btn_v = ctk.CTkButton(self.cp, text="GÖZÜ AÇ", fg_color="#00a8ff", hover_color="#007acc", command=self.toggle_v)
        self.btn_v.grid(row=2, column=0, padx=10, pady=10)

        self.btn_a = ctk.CTkButton(self.cp, text="OTONOM", fg_color="#333333", state="disabled", command=self.toggle_a)
        self.btn_a.grid(row=2, column=1, padx=10, pady=10)

        self.debug = ctk.CTkCheckBox(self.cp, text="Vision Debug", text_color="white")
        self.debug.grid(row=2, column=2, padx=5, pady=5)

        # Durum Mesajı
        self.status = ctk.CTkEntry(self.cp, placeholder_text="Sistemler Hazır, Kaptan...", width=380, fg_color="#0a0a0a", text_color="#00ff00")
        self.status.grid(row=3, column=0, columnspan=3, padx=10, pady=10)

        # ŞEFFAF VİZYON ÇERÇEVESİ (Mavi halka gibi düşünebilirsin)
        self.vf = tk.Frame(self, bg=self.transparent_color, highlightbackground="#00a8ff", highlightthickness=4)
        self.vf.pack(side="top", fill="both", expand=True, padx=5, pady=5)

    def change_game(self, game_key):
        self.current_game = game_key
        self.log(f"{game_key.upper()} Moduna Geçildi.")

    def toggle_v(self):
        self.is_vision_active = not self.is_vision_active
        if self.is_vision_active:
            self.btn_v.configure(text="GÖZÜ KAPAT", fg_color="#e74c3c")
            self.btn_a.configure(state="normal")
            threading.Thread(target=self.vision_loop, daemon=True).start()
        else:
            self.btn_v.configure(text="GÖZÜ AÇ", fg_color="#00a8ff")
            self.is_auto_mode = False

    def toggle_a(self):
        self.is_auto_mode = not self.is_auto_mode
        self.btn_a.configure(text="OTONOM: ON" if self.is_auto_mode else "OTONOM: OFF", 
                             fg_color="#f1c40f" if self.is_auto_mode else "#333333")
        self.log("OTONOM MOD AKTİF" if self.is_auto_mode else "OTONOM DURDURULDU")

    def log(self, text):
        self.status.delete(0, tk.END)
        self.status.insert(0, f"JARVIS: {text}")

    def vision_loop(self):
        with mss.mss() as sct:
            while self.is_vision_active:
                try:
                    # Şeffaf çerçevenin konumunu al
                    x, y, w, h = self.vf.winfo_rootx(), self.vf.winfo_rooty(), self.vf.winfo_width(), self.vf.winfo_height()
                    if w < 50: 
                        time.sleep(0.1); continue
                    
                    # Çerçevenin altındaki ekranı yakala
                    img = np.array(sct.grab({"top": y, "left": x, "width": w, "height": h}))
                    frame = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
                    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

                    if self.current_game == "zortorant":
                        # Düşman Kırmızı Rengi Taraması
                        lower_red1 = np.array([0, 150, 150])
                        upper_red1 = np.array([10, 255, 255])
                        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
                        
                        lower_red2 = np.array([170, 150, 150])
                        upper_red2 = np.array([180, 255, 255])
                        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
                        
                        mask = mask1 + mask2
                        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                        
                        enemy_found = False
                        for c in cnts:
                            if cv2.contourArea(c) > 40: # Hedef boyutu
                                enemy_found = True
                                if self.is_auto_mode:
                                    # Pusu Ateşi (Jarvis İ tuşu)
                                    if time.time() - self.last_shot_time > 1.2:
                                        pydirectinput.press('i')
                                        self.last_shot_time = time.time()
                                        self.log("HEDEF İMHA EDİLDİ!")
                                break
                        
                        if self.debug.get():
                            cv2.imshow("Jarvis Tactical Vision", mask)
                            cv2.waitKey(1)
                        else: cv2.destroyAllWindows()

                    # Diğer oyun mantıkları (Flappy vb. buraya eklenebilir)
                    
                    time.sleep(0.02)
                except: time.sleep(0.01)

    def on_close(self):
        self.is_vision_active = False
        self.destroy()
        sys.exit()

if __name__ == "__main__":
    app = JarvisEye()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
