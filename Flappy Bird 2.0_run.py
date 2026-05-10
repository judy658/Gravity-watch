import pygame
import sys
import random

# Prensipler
WIDTH, HEIGHT = 1920, 1080
FPS = 60

# Renkler
GÖKYÜZÜ_RENGİ = (135, 206, 235)
KUŞ_RENGİ = (255, 255, 255)

# Kuş sınıfı
class Kuş:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT // 2
        self.yatay_hız = 0
        self.düzenli_hız = 5
        self.puan = 0
        self.kanat_cırpma_kareleri = []
        self.kanat_cırpma_sayısı = 0

    def kanat_cırpma(self):
        self.yatay_hız += 0.5
        self.x += self.yatay_hız
        self.kanat_cırpma_kareleri.append(pygame.Rect(self.x, self.y, 50, 50))
        self.kanat_cırpma_kareleri.append(pygame.Rect(self.x - 25, self.y - 25, 50, 50))
        self.kanat_cırpma_kareleri.append(pygame.Rect(self.x + 25, self.y - 25, 50, 50))
        self.kanat_cırpma_kareleri.append(pygame.Rect(self.x - 50, self.y + 25, 50, 50))
        self.kanat_cırpma_kareleri.append(pygame.Rect(self.x + 50, self.y + 25, 50, 50))
        self.kanat_cırpma_sayısı += 1
        if self.kanat_cırpma_sayısı > 4:
            self.kanat_cırpma_kareleri = []

    def draw(self, ekran):
        for kare in self.kanat_cırpma_kareleri:
            pygame.draw.rect(ekran, KUŞ_RENGİ, kare)

# Oyun sınıfı
class Oyun:
    def __init__(self):
        pygame.init()
        self.ekran = pygame.display.set_mode((WIDTH, HEIGHT))
        self.saat = pygame.time.Clock()
        self.kuş = Kuş()
        self.hız_sabiti = 1
        self.oyuncu_seçimi = None
        self.oyuncu_input_süresi = 0
        self.oyuncu_puanı = 0
        self.oyun_özelleştirme_seçenekleri = {
            "kuş_seçimi": ["Kuştan_1", "Kuştan_2", "Kuştan_3"],
            "arkaplan_seçimi": ["Gökyüzü", "Orman", "Kent"]
        }

    def hız_kontrol(self):
        self.kuş.yatay_hız += self.hız_sabiti

    def oyun_özelleştirme(self):
        if self.oyuncu_seçimi is None:
            self.oyuncu_seçimi = random.choice(self.oyun_özelleştirme_seçenekleri["kuş_seçimi"])
        if self.oyuncu_seçimi == "Kuştan_1":
            self.kuş.düzenli_hız = 5
        elif self.oyuncu_seçimi == "Kuştan_2":
            self.kuş.düzenli_hız = 7
        elif self.oyuncu_seçimi == "Kuştan_3":
            self.kuş.düzenli_hız = 10

    def oyuncu_input(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_SPACE]:
            self.oyuncu_input_süresi += 1
            self.kuş.yatay_hız += 0.5
            self.oyuncu_puanı += 1
        else:
            self.oyuncu_input_süresi = 0

    def draw_gökyüzü(self):
        self.ekran.fill(GÖKYÜZÜ_RENGİ)

    def draw_kuş(self):
        self.kuş.draw(self.ekran)

    def draw_puan(self):
        font = pygame.font.Font(None, 36)
        text = font.render(f"Puan: {self.oyuncu_puanı}", True, (0, 0, 0))
        self.ekran.blit(text, (10, 10))

    def hata_check(self):
        if self.kuş.x < 0 or self.kuş.x > WIDTH:
            return True
        return False

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

    def update(self):
        self.handle_events()
        self.ekran.fill(GÖKYÜZÜ_RENGİ)
        self.kuş.kanat_cırpma()
        self.kuş.y += self.kuş.yatay_hız
        if self.hata_check():
            print(f"Puan: {self.oyuncu_puanı}")
            pygame.quit()
            sys.exit()
        self.draw_kuş()
        self.draw_puan()
        pygame.display.flip()
        self.saat.tick(FPS)

    def run(self):
        while True:
            self.update()
            self.hız_kontrol()
            self.oyun_özelleştirme()
            self.oyuncu_input()

# Oyun örneği
oyun = Oyun()
oyun.run()