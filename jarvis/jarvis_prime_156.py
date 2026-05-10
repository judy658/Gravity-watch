import os
import sys
import time
import threading
import tkinter as tk
import customtkinter as ctk
import mss
import cv2
import numpy as np
import pydirectinput

# --- JARVIS PRIME 3.0 (v4.9 - 156 SCORE MASTERPIECE) ---
# Developed with Captain's Jump Simulation Theory
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class JarvisEye(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("J.A.R.V.I.S. Eye - PRIME 156")
        self.geometry("400x550")
        self.attributes("-topmost", True)
        self.transparent_color = "#ff00ff"
        self.configure(fg_color=self.transparent_color)
        try: self.wm_attributes("-transparentcolor", self.transparent_color)
        except: pass

        # Durum değişkenleri
        self.is_vision_active = False
        self.is_auto_mode = False
        self.last_jump_time = 0
        self.last_bird_y = 0
        self.GAP_SIZE = 155

        # Kontrol Paneli
        self.cp = ctk.CTkFrame(self, height=100, fg_color="#1e1e1e")
        self.cp.pack(side="top", fill="x")

        self.btn_v = ctk.CTkButton(self.cp, text="Gözü Aç", width=100, command=self.toggle_v)
        self.btn_v.grid(row=0, column=0, padx=10, pady=10)

        self.btn_a = ctk.CTkButton(self.cp, text="Otonom", width=100, state="disabled", command=self.toggle_a)
        self.btn_a.grid(row=0, column=1, padx=10, pady=10)

        self.debug = ctk.CTkCheckBox(self.cp, text="Vizyon", text_color="white")
        self.debug.grid(row=0, column=2, padx=5, pady=10)

        self.status = ctk.CTkEntry(self.cp, placeholder_text="Masterpiece System Active...", width=360)
        self.status.grid(row=1, column=0, columnspan=3, padx=10, pady=(0, 10))

        self.vf = tk.Frame(self, bg=self.transparent_color, highlightbackground="#00a8ff", highlightthickness=4)
        self.vf.pack(side="top", fill="both", expand=True, padx=2, pady=2)

    def toggle_v(self):
        self.is_vision_active = not self.is_vision_active
        if self.is_vision_active:
            self.btn_v.configure(text="Kapat", fg_color="green")
            self.btn_a.configure(state="normal")
            threading.Thread(target=self.vision_loop, daemon=True).start()
        else:
            self.btn_v.configure(text="Gözü Aç", fg_color="#3b8ed0")
            self.is_auto_mode = False

    def toggle_a(self):
        self.is_auto_mode = not self.is_auto_mode
        self.btn_a.configure(fg_color="orange" if self.is_auto_mode else "#3b8ed0")

    def log(self, text):
        self.status.delete(0, tk.END)
        self.status.insert(0, f"JARVIS: {text}")

    def vision_loop(self):
        with mss.mss() as sct:
            while self.is_vision_active:
                try:
                    x, y, w, h = self.vf.winfo_rootx(), self.vf.winfo_rooty(), self.vf.winfo_width(), self.vf.winfo_height()
                    if w < 50: 
                        time.sleep(0.1)
                        continue
                    
                    img = np.array(sct.grab({"top": y, "left": x, "width": w, "height": h}))
                    frame = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
                    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

                    bird_m = cv2.inRange(hsv, np.array([20, 100, 100]), np.array([40, 255, 255]))
                    pipe_m = cv2.inRange(hsv, np.array([35, 60, 60]), np.array([90, 255, 255]))
                    
                    bird_y, bird_x = None, None
                    cnts_b, _ = cv2.findContours(bird_m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    if cnts_b:
                        valid_birds = []
                        for c in cnts_b:
                            if cv2.contourArea(c) > 20:
                                bx, by, bw, bh = cv2.boundingRect(c)
                                if bx < w // 3 and by < h - 80:
                                    valid_birds.append(c)
                        if valid_birds:
                            c = max(valid_birds, key=cv2.contourArea)
                            bx, by, bw, bh = cv2.boundingRect(c)
                            bird_x, bird_y = bx + bw//2, by + bh//2

                    target_y = h // 2
                    top_pipe_bottom = 0
                    cnts_p, _ = cv2.findContours(pipe_m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    if cnts_p and bird_x:
                        pipes = []
                        for cp in cnts_p:
                            if cv2.contourArea(cp) > 500:
                                px, py, pw, ph = cv2.boundingRect(cp)
                                if py < h - 100 and px + pw > bird_x - 15:
                                    pipes.append((px, py, pw, ph))
                        
                        if pipes:
                            pipes.sort(key=lambda p: p[0])
                            active_x = pipes[0][0]
                            current = [p for p in pipes if abs(p[0] - active_x) < 40]
                            if len(current) >= 2:
                                current.sort(key=lambda p: p[1])
                                top_pipe_bottom = current[0][1] + current[0][3]
                                target_y = ((top_pipe_bottom + current[1][1]) // 2) + 10
                            elif len(current) == 1:
                                p = current[0]
                                if p[1] > h // 2:
                                    target_y = p[1] - (self.GAP_SIZE // 2) + 10
                                    top_pipe_bottom = target_y - (self.GAP_SIZE // 2) - 10
                                else:
                                    top_pipe_bottom = p[1] + p[3]
                                    target_y = top_pipe_bottom + (self.GAP_SIZE // 2) + 10

                    # --- PREDICTIVE REFLEKS MOTORU (v4.9 - SIMULATION) ---
                    if self.is_auto_mode and bird_y:
                        velocity = bird_y - self.last_bird_y
                        predicted_y = bird_y + (velocity * 2) 
                        on_ground = bird_y > h - 60
                        
                        jump_peak_y = predicted_y - 72
                        will_hit_ceiling_if_jump = jump_peak_y < top_pipe_bottom
                        safe_from_ceiling = (predicted_y - top_pipe_bottom) > 78
                        
                        status = f"B:{bird_y}|P:{int(predicted_y)}|T:{top_pipe_bottom} "
                        
                        if on_ground:
                            self.log(status + "BEKLEMEDE")
                        elif predicted_y > target_y + 10:
                            if will_hit_ceiling_if_jump:
                                self.log(status + "SİM: BEKLE")
                                if predicted_y > target_y + 35:
                                    if (time.time() - self.last_jump_time) > 0.16:
                                        pydirectinput.press('space')
                                        self.last_jump_time = time.time()
                                        self.log(status + "ZORUNLU!")
                            elif safe_from_ceiling:
                                if (time.time() - self.last_jump_time) > 0.16:
                                    pydirectinput.press('space')
                                    self.last_jump_time = time.time()
                                    self.log(status + "ZIPLA!")
                        else:
                            self.log(status + "TAKİP")
                        self.last_bird_y = bird_y

                    if self.debug.get():
                        if bird_y: cv2.circle(frame, (bird_x, bird_y), 5, (0,0,255), -1)
                        cv2.circle(frame, (w//2, target_y), 5, (255,0,0), -1)
                        cv2.imshow("Jarvis Masterpiece 156", frame)
                        cv2.waitKey(1)
                    else: cv2.destroyAllWindows()
                except: time.sleep(0.01)

    def on_close(self):
        self.is_vision_active = False
        self.destroy()
        sys.exit()

if __name__ == "__main__":
    app = JarvisEye()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
