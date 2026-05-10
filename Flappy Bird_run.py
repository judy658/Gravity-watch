import pygame
import sys

# Ekran boyutları
ekran_boyutu = (640, 480)

# Renkler
renk_gök_gökyüzü = (135, 206, 235)
renk_kuş = (255, 255, 255)

class Kuş:
    def __init__(self):
        self.x = 100
        self.y = 230
        self.yatay_hareket = 0
        self.düzen_hareket = 5
        self.canat_chirpmasi = 0
        self.kanat_chirpmasi_baslama = False
        self.kanat_chirpmasi_süre = 10
        self.puan = 0
        self.hız = 1

    def hareket(self, dt):
        # Yatay hareket
        self.x += self.yatay_hareket * dt

        # Kanat açma ve kapama animasyonu
        self.kanat_chirpmasi += 1
        if self.kanat_chirpmasi >= self.kanat_chirpmasi_süre:
            self.kanat_chirpmasi = 0
            self.kanat_chirpmasi_baslama = not self.kanat_chirpmasi_baslama

        # Puan arttıkça hızlandırma
        self.puan += 1
        self.hız += 0.01

    def draw(self, ekran):
        # Kuşun gövdesini çiz
        pygame.draw.rect(ekran, renk_kuş, (self.x, self.y, 50, 50))

        # Kanat animasyonu
        if self.kanat_chirpmasi_baslama:
            pygame.draw.polygon(ekran, renk_kuş, [(self.x + 20, self.y), (self.x + 50, self.y - 20), (self.x + 30, self.y - 50)])
            pygame.draw.polygon(ekran, renk_kuş, [(self.x, self.y), (self.x + 50, self.y + 20), (self.x + 30, self.y + 50)])
        else:
            pygame.draw.polygon(ekran, renk_kuş, [(self.x + 20, self.y), (self.x + 50, self.y + 20), (self.x + 30, self.y + 50)])
            pygame.draw.polygon(ekran, renk_kuş, [(self.x, self.y), (self.x + 50, self.y - 20), (self.x + 30, self.y - 50)])

class Gökyüzü:
    def __init__(self):
        self.renk = renk_gök_gökyüzü

    def draw(self, ekran):
        ekran.fill(self.renk)

class Oyun:
    def __init__(self):
        self.kuş = Kuş()
        self.gökyüzü = Gökyüzü()
        self.puan = 0

    def hareket(self, dt):
        self.kuş.hareket(dt)

    def draw(self, ekran):
        self.gökyüzü.draw(ekran)
        self.kuş.draw(ekran)

        # Puan ekranda göster
        font = pygame.font.Font(None, 36)
        text = font.render("Puan: " + str(self.kuş.puan), True, (255, 255, 255))
        ekran.blit(text, (10, 10))

def main():
    pygame.init()
    ekran = pygame.display.set_mode(ekran_boyutu)
    saati = pygame.time.Clock()

    oyun = Oyun()

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    oyun.kuş.yatay_hareket = -10
                    oyun.kuş.düzen_hareket = 5

        # Oyunun hareketi
        dt = saati.tick(60) / 1000
        oyun.hareket(dt)

        # Oyunun gövdesini çiz
        oyun.draw(ekran)

        # Ekran güncelleme
        pygame.display.flip()

        # Oyun bittiğinde
        if oyun.kuş.x < 0 or oyun.kuş.x > ekran_boyutu[0] - 50:
            print("Oyun bitti!")
            pygame.quit()
            sys.exit()

if __name__ == "__main__":
    main()