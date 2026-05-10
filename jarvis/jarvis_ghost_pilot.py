import time
import pyautogui
import PIL.ImageGrab
import numpy as np
import cv2

# =============================================
# JARVIS EYE - GHOST SNIPER PILOT (EXTERNAL)
# =============================================

KEYS = {
    "UP": "j",
    "DOWN": "p",
    "LEFT": "s",
    "RIGHT": "g",
    "SHOOT": "i",
    "INVIS": "u",
    "DECOY": "o"
}

def start_mission():
    print("--- JARVIS EYE: GHOST MISSION START ---")
    time.sleep(3)
    
    last_shot_time = 0
    invis_active = False

    while True:
        # Ekran görüntüsü al
        screenshot = np.array(PIL.ImageGrab.grab())
        frame = cv2.cvtColor(screenshot, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Düşman Kırmızı Rengi
        lower_red = np.array([0, 150, 150])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)
        
        lower_red2 = np.array([170, 150, 150])
        upper_red2 = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        
        mask = mask1 + mask2
        
        # JARVIS PANELI ICIN GORUNTUYU ISLE
        res = cv2.bitwise_and(frame, frame, mask=mask)
        
        # Panelin üzerine Jarvis yazıları ekle
        cv2.putText(res, "JARVIS VISION: ACTIVE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.putText(res, "SCANNING FOR ENEMIES...", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        
        # Düşman piksellerini bul ve işaretle
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        enemy_detected = False
        
        for cnt in contours:
            if cv2.contourArea(cnt) > 50:
                enemy_detected = True
                M = cv2.moments(cnt)
                if M["m00"] != 0:
                    ex = int(M["m10"] / M["m00"])
                    ey = int(M["m01"] / M["m00"])
                    
                    # Hedefi ekranda işaretle (Artı işareti)
                    cv2.drawContours(res, [cnt], -1, (0, 0, 255), 2)
                    cv2.line(res, (ex-10, ey), (ex+10, ey), (0, 255, 0), 2)
                    cv2.line(res, (ex, ey-10), (ex, ey+10), (0, 255, 0), 2)
                    
                    # Tetiği Çek
                    current_time = time.time()
                    if current_time - last_shot_time > 1.5:
                        pyautogui.press(KEYS["SHOOT"])
                        last_shot_time = current_time
                        print("Jarvis: HEDEF IMHA EDILDI.")
        
        if not invis_active:
            pyautogui.press(KEYS["INVIS"])
            invis_active = True

        # PANELI GOSTER
        cv2.imshow("JARVIS TACTICAL HUB", res)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
        time.sleep(0.01)

    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_mission()
