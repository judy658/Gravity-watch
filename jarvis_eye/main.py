import sys
import os
import re
import difflib
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QThread, pyqtSignal, QObject, QTimer
from overlay import ChatWindow, HotkeyListener
from vision import VisionEngine
from brain import BrainEngine
from utils import capture_screen

class AnalysisWorker(QObject):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)
    progress = pyqtSignal(str)

    def __init__(self, vision, brain, prompt, region, previous_action=""):
        super().__init__()
        self.vision = vision
        self.brain = brain
        self.prompt = prompt
        self.region = region
        self.previous_action = previous_action

    def run(self):
        try:
            print(f"\n[LOG] Analiz Başlatıldı: {self.prompt}")
            self.progress.emit("Jarvis odaklanıyor...")
            
            screenshot_path = capture_screen(region=self.region)
            
            # 1. Vizyon + OCR
            self.progress.emit("Jarvis ekranı inceliyor...")
            description = self.vision.analyze_image(screenshot_path)
            
            from utils import extract_text_with_coords
            ocr_results = extract_text_with_coords(screenshot_path)
            # Kendi yazılarını okumasını engelle (Filtreleme)
            filtered_texts = [
                item['text'] for item in ocr_results 
                if "Jarvis Eye" not in item['text'] and "Kaptan" not in item['text']
            ]
            ocr_text = ", ".join(filtered_texts)
            
            full_description = f"{description}\nEKRANDAKİ METİNLER: {ocr_text}"
            
            # 2. Beyin
            self.progress.emit("Jarvis cevabı hazırlıyor...")
            answer = self.brain.decide_action(self.prompt, full_description, self.previous_action)
            
            # 3. Araştırma Döngüsü
            if "ARAŞTIR:" in answer:
                query = answer.split("ARAŞTIR:")[1].strip().split("\n")[0]
                from utils import web_search
                research_data = web_search(query)
                answer = self.brain.decide_action(self.prompt, f"{full_description}\nARAŞTIRMA SONUÇLARI: {research_data}", self.previous_action)
            
            self.finished.emit(answer)
        except Exception as e:
            self.error.emit(str(e))

class JarvisEyeController:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.window = ChatWindow()
        self.vision = VisionEngine()
        self.brain = BrainEngine()
        
        self.is_mission_active = False
        self.current_mission_goal = ""
        self.last_mission_answer = ""
        self.active_threads = []
        self.active_workers = []
        
        from utils import get_reader
        QTimer.singleShot(100, get_reader) 
        
        self.window.analysis_callback = self.handle_user_request
        self.setup_hotkey()
        
        self.timer = QTimer()
        self.timer.setInterval(15000) 
        self.timer.timeout.connect(self.process_periodic_scan)
        self.window.auto_signal.connect(self.toggle_timer)
        
        print("[SYSTEM] Jarvis Eye Hazır.")

    def toggle_timer(self, active):
        if active: self.timer.start()
        else: self.timer.stop()

    def handle_user_request(self, prompt, region):
        mission_keywords = ["nasıl", "yükle", "indir", "çalıştır", "bul", "git", "minecraft"]
        if any(word in prompt.lower() for word in mission_keywords):
            self.is_mission_active = True
            self.current_mission_goal = prompt
            self.last_mission_answer = ""
            print(f"[MISSION] '{prompt}' görevi başlatıldı.")
            QTimer.singleShot(100, lambda: self.start_analysis_thread(prompt, None))
            self.timer.start()
        else:
            self.start_analysis_thread(prompt, region)

    def process_periodic_scan(self):
        if any(t.isRunning() for t in self.active_threads):
            return
        if self.is_mission_active:
            self.start_analysis_thread(self.current_mission_goal, None)
        elif self.window.auto_active:
            prompt = "Ekranda önemli bir değişiklik var mı? Yoksa [STABLE] yaz."
            region = {
                'top': self.window.vision_box.y(),
                'left': self.window.vision_box.x(),
                'width': self.window.vision_box.width(),
                'height': self.window.vision_box.height()
            }
            self.start_analysis_thread(prompt, region)

    def start_analysis_thread(self, prompt, region):
        thread = QThread()
        worker = AnalysisWorker(self.vision, self.brain, prompt, region, self.last_mission_answer)
        worker.moveToThread(thread)
        self.active_threads.append(thread)
        self.active_workers.append(worker)
        thread.started.connect(worker.run)
        worker.finished.connect(self.on_analysis_finished)
        worker.error.connect(self.on_analysis_error)
        worker.progress.connect(self.on_analysis_progress)
        worker.finished.connect(thread.quit)
        worker.finished.connect(worker.deleteLater)
        thread.finished.connect(thread.deleteLater)
        thread.finished.connect(lambda: self.active_threads.remove(thread) if thread in self.active_threads else None)
        worker.finished.connect(lambda: self.active_workers.remove(worker) if worker in self.active_workers else None)
        thread.start()

    def on_analysis_progress(self, msg):
        print(f"[STATUS] {msg}")

    def on_analysis_finished(self, answer):
        print(f"[LOG] Jarvis Ham Cevap: {answer}")
        
        # Gevezelik ve Kural Tekrarı Filtresi
        if "[STABLE]" in answer.upper() or "[WAITING]" in answer.upper() or "KURALLAR" in answer:
            return

        # Benzerlik Kontrolü (%80)
        similarity = difflib.SequenceMatcher(None, answer.strip(), self.last_mission_answer).ratio()
        if similarity > 0.8:
            return
        
        self.last_mission_answer = answer.strip()

        if "İŞARETLE:" in answer:
            try:
                match = re.search(r"İŞARETLE:\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(.*?)\]", answer)
                if match:
                    x, y, w, h, label = match.groups()
                    self.window.draw_on_screen(int(x), int(y), int(w), int(h), label.strip('"'))
                    answer = answer.replace(match.group(0), "").strip()
            except: pass

        if answer.strip():
            # Yanlışlıkla gelen 'CEVAP:' başlığını temizle
            answer = answer.replace("CEVAP:", "").strip()
            self.window.history.append(f"<b>Jarvis Eye:</b> {answer}")

    def on_analysis_error(self, err):
        print(f"[ERROR] {err}")

    def setup_hotkey(self):
        self.hotkey_thread = QThread()
        self.listener = HotkeyListener()
        self.listener.moveToThread(self.hotkey_thread)
        self.listener.toggle_signal.connect(self.window.toggle_visibility)
        self.hotkey_thread.started.connect(self.listener.run)
        self.hotkey_thread.start()

    def run(self):
        sys.exit(self.app.exec())

if __name__ == "__main__":
    controller = JarvisEyeController()
    controller.run()
