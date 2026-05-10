import sys
import keyboard
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QLineEdit, QTextEdit, QFrame, QSizeGrip)
from PyQt6.QtCore import Qt, pyqtSignal, QObject, QThread, QSize, QPoint
from PyQt6.QtGui import QPainter, QRadialGradient, QColor

class HotkeyListener(QObject):
    toggle_signal = pyqtSignal()

    def run(self):
        keyboard.add_hotkey('alt+c', self.toggle_signal.emit)
        keyboard.wait()

class SelectionWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | 
                            Qt.WindowType.WindowStaysOnTopHint | 
                            Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setGeometry(200, 200, 400, 300)
        
        # Resize Grip
        self.sizegrip = QSizeGrip(self)
        self.sizegrip.setStyleSheet("background-color: rgba(0, 255, 255, 100);")
        
        self.is_visible = False
        self.hide()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        pen = painter.pen()
        pen.setColor(QColor(0, 255, 255, 200))
        pen.setWidth(2)
        painter.setPen(pen)
        painter.setBrush(QColor(0, 150, 255, 30))
        painter.drawRect(self.rect())
        
        # Corner markers
        pen.setWidth(5)
        painter.setPen(pen)
        painter.drawLine(0, 0, 15, 0)
        painter.drawLine(0, 0, 0, 15)
        painter.drawLine(self.width(), self.height(), self.width()-15, self.height())
        painter.drawLine(self.width(), self.height(), self.width(), self.height()-15)

    def resizeEvent(self, event):
        self.sizegrip.move(self.width() - 20, self.height() - 20)
        super().resizeEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_pos)
            event.accept()

class IndicatorOrb(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | 
                            Qt.WindowType.WindowStaysOnTopHint | 
                            Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setFixedSize(40, 40)
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.width() - 50, screen.height() - 50)
        self.show()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        gradient = QRadialGradient(20, 20, 20)
        gradient.setColorAt(0, QColor(0, 255, 255, 180))
        gradient.setColorAt(0.7, QColor(0, 150, 255, 100))
        gradient.setColorAt(1, QColor(0, 100, 255, 0))
        painter.setBrush(gradient)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(0, 0, 40, 40)

class CanvasLayer(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | 
                            Qt.WindowType.WindowStaysOnTopHint | 
                            Qt.WindowType.Tool |
                            Qt.WindowType.WindowTransparentForInput) # Tıklamaları alta geçirir
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setGeometry(QApplication.primaryScreen().geometry())
        self.indicators = [] # [(x, y, w, h, label), ...]
        self.show()

    def add_indicator(self, x, y, w, h, label=""):
        self.indicators.append((x, y, w, h, label))
        self.update()
        # 5 saniye sonra sil
        from PyQt6.QtCore import QTimer
        QTimer.singleShot(5000, self.clear_indicators)

    def clear_indicators(self):
        self.indicators = []
        self.update()

    def paintEvent(self, event):
        if not self.indicators:
            return
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        for x, y, w, h, label in self.indicators:
            # Kırmızı/Neon Kare
            pen = painter.pen()
            pen.setColor(QColor(255, 0, 0, 200))
            pen.setWidth(3)
            painter.setPen(pen)
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawRect(x, y, w, h)
            
            # Etiket
            if label:
                painter.setBrush(QColor(255, 0, 0, 150))
                painter.drawRect(x, y - 20, len(label)*10, 20)
                painter.setPen(QColor(255, 255, 255))
                painter.drawText(x + 5, y - 5, label)

class ChatWindow(QMainWindow):
    auto_signal = pyqtSignal(bool) # Otonom modu main.py'ye bildirir

    def __init__(self):
        super().__init__()
        self.indicator = IndicatorOrb()
        self.vision_box = SelectionWindow()
        self.canvas = CanvasLayer() # Yeni çizim katmanı
        self.init_ui()
        self.is_visible = False
        self.hide()

    def init_ui(self):
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | 
                            Qt.WindowType.WindowStaysOnTopHint | 
                            Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen.width() - 470, screen.height() - 400, 450, 300)

        self.central_widget = QFrame(self)
        self.central_widget.setObjectName("MainFrame")
        self.central_widget.setStyleSheet("""
            #MainFrame {
                background-color: rgba(10, 10, 15, 230);
                border: 2px solid rgba(0, 255, 255, 180);
                border-radius: 15px;
            }
            QLineEdit {
                background-color: rgba(30, 30, 50, 200);
                border: 1px solid rgba(0, 255, 255, 120);
                border-radius: 10px;
                color: #00ffff;
                padding: 12px;
                font-size: 15px;
            }
            QTextEdit {
                background-color: transparent;
                border: none;
                color: #ffffff;
                font-size: 13px;
            }
        """)

        layout = QVBoxLayout(self.central_widget)
        
        # Otonom Mod Butonu
        self.auto_btn = QFrame()
        self.auto_btn.setFixedSize(120, 30)
        self.auto_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.auto_btn.setObjectName("AutoBtn")
        self.auto_btn.mousePressEvent = self.toggle_auto_mode
        self.auto_active = False
        
        self.update_auto_btn_style()
        layout.addWidget(self.auto_btn, alignment=Qt.AlignmentFlag.AlignRight)

        self.history = QTextEdit()
        self.history.setReadOnly(True)
        layout.addWidget(self.history)
        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Jarvis Eye: Kutuyu odakla, Kaptan.")
        self.input_field.returnPressed.connect(self.process_input)
        layout.addWidget(self.input_field)

        self.sizegrip = QSizeGrip(self)
        self.setCentralWidget(self.central_widget)

    def update_auto_btn_style(self):
        color = "rgba(0, 255, 255, 180)" if self.auto_active else "rgba(100, 100, 100, 100)"
        text = "OTONOM: AÇIK" if self.auto_active else "OTONOM: KAPALI"
        self.auto_btn.setStyleSheet(f"""
            #AutoBtn {{
                background-color: {color};
                border: 1px solid #00ffff;
                border-radius: 5px;
            }}
        """)
        # Buton üzerine yazı eklemek için (Basitlik adına QLabel yerine paintEvent veya toolTip kullanabiliriz)
        self.auto_btn.setToolTip(text)

    def toggle_auto_mode(self, event):
        self.auto_active = not self.auto_active
        self.update_auto_btn_style()
        self.auto_signal.emit(self.auto_active)
        status = "aktif edildi" if self.auto_active else "devre dışı bırakıldı"
        self.history.append(f"<b style='color:#00ffff;'>Sistem:</b> Otonom tarama {status}.")
        if self.auto_active:
            # Otonom başlarken vizyon kutusunu bir kez işaretle
            self.draw_on_screen(self.vision_box.x(), self.vision_box.y(), 
                               self.vision_box.width(), self.vision_box.height(), "IZLEME_ALANI")

    def draw_on_screen(self, x, y, w, h, label=""):
        self.canvas.add_indicator(x, y, w, h, label)

    def resizeEvent(self, event):
        self.sizegrip.move(self.width() - 30, self.height() - 30)
        super().resizeEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_pos)
            event.accept()

    def toggle_visibility(self):
        if self.is_visible:
            self.hide()
            self.vision_box.hide()
            self.is_visible = False
        else:
            self.show()
            self.vision_box.show()
            self.activateWindow()
            self.input_field.setFocus()
            self.is_visible = True

    def process_input(self):
        text = self.input_field.text()
        if text:
            self.history.append(f"<b style='color:#00ffff;'>Kaptan:</b> {text}")
            self.input_field.clear()
            
            # GÖREV TESPİTİ (Mission Detection)
            mission_keywords = ["nasıl", "yükle", "indir", "çalıştır", "bul", "git"]
            is_mission = any(word in text.lower() for word in mission_keywords)
            
            if is_mission:
                if self.auto_active:
                    self.toggle_auto_mode(None) # Otonomu kapat
                self.history.append(f"<b style='color:#ff00ff;'>[GÖREV MODU AKTİF]</b>")
                # Görev modunda tam ekran tara (region=None)
                self.trigger_analysis(text, is_mission=True)
            else:
                self.trigger_analysis(text)

    def trigger_analysis(self, prompt, is_mission=False):
        # UI sakla
        self.hide()
        self.vision_box.hide()
        QApplication.processEvents()
        
        # Görev modundaysak region=None (Full Screen)
        region = None if is_mission else {
            'top': self.vision_box.y(),
            'left': self.vision_box.x(),
            'width': self.vision_box.width(),
            'height': self.vision_box.height()
        }
        
        if hasattr(self, 'analysis_callback'):
            self.analysis_callback(prompt, region)
            
        self.show()
        if not is_mission: # Görev modunda vizyon kutusunu geri getirme (isteğe bağlı)
            self.vision_box.show()
        self.input_field.setFocus()
