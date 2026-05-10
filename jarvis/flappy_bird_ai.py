import pygame
import random
import sys

# Pygame başlatma
pygame.init()

# Ekran ayarları
screen_width = 400
screen_height = 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Flappy Bird - J.A.R.V.I.S. AI Training Edition")

# Gelişmiş Renkler (Yapay Zeka Taraması İçin Yüksek Kontrastlı)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SKY_TOP = (113, 197, 207)    # Flappy Bird orijinal gökyüzü üst
SKY_BOTTOM = (224, 246, 245) # Flappy Bird orijinal gökyüzü alt
GROUND_COLOR = (222, 216, 149)
GROUND_LINE = (100, 70, 40) # Kahverengi (Borularla karışmaz)
BIRD_YELLOW = (244, 208, 63)
BIRD_ORANGE = (235, 152, 78)
PIPE_GREEN = (116, 191, 46)
PIPE_OUTLINE = (84, 129, 34)

# Oyun değişkenleri
gravity = 0.35
game_active = False
score = 0
ground_scroll = 0
scroll_speed = 4

# Fontlar
font = pygame.font.Font(None, 48)
small_font = pygame.font.Font(None, 32)

def draw_gradient_bg():
    for y in range(screen_height - 100):
        # Yüksekliğe göre renk interpolasyonu
        r = int(SKY_TOP[0] + (SKY_BOTTOM[0] - SKY_TOP[0]) * (y / (screen_height - 100)))
        g = int(SKY_TOP[1] + (SKY_BOTTOM[1] - SKY_TOP[1]) * (y / (screen_height - 100)))
        b = int(SKY_TOP[2] + (SKY_BOTTOM[2] - SKY_TOP[2]) * (y / (screen_height - 100)))
        pygame.draw.line(screen, (r, g, b), (0, y), (screen_width, y))

# Kuş Sınıfı (Gelişmiş Görsel)
class Bird(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # Yapay zekanın algılaması kolay olsun diye net bir hit-box ve görsel
        self.rect = pygame.Rect(100, screen_height // 2, 34, 24)
        self.movement = 0
        self.angle = 0

    def update(self):
        self.movement += gravity
        self.rect.y += self.movement
        
        # Düşüş hızına göre dönme efekti
        self.angle = -self.movement * 3
        if self.angle < -90: self.angle = -90
        if self.angle > 20: self.angle = 20

        self.boundary_check()

    def jump(self):
        self.movement = -7
        self.angle = 20

    def boundary_check(self):
        if self.rect.top <= 0:
            self.rect.top = 0
            self.movement = 0
        if self.rect.bottom >= screen_height - 100: # Yere çarpma
            self.rect.bottom = screen_height - 100

    def draw(self, surface):
        # Kuşun görselliğini çiz (Kare yerine detaylı çizim)
        # Dönme işlemi için geçici bir surface oluştur
        temp_surface = pygame.Surface((40, 30), pygame.SRCALPHA)
        
        # Gövde
        pygame.draw.ellipse(temp_surface, BLACK, (1, 1, 32, 22)) # Dış çizgi (Yapay zeka için kontrast)
        pygame.draw.ellipse(temp_surface, BIRD_YELLOW, (2, 2, 30, 20))
        
        # Kanat
        pygame.draw.ellipse(temp_surface, WHITE, (5, 8, 14, 10))
        pygame.draw.ellipse(temp_surface, BLACK, (5, 8, 14, 10), 1)
        
        # Göz
        pygame.draw.circle(temp_surface, WHITE, (24, 8), 5)
        pygame.draw.circle(temp_surface, BLACK, (24, 8), 5, 1)
        pygame.draw.circle(temp_surface, BLACK, (26, 8), 2) # Göz bebeği
        
        # Gaga
        pygame.draw.polygon(temp_surface, BIRD_ORANGE, [(28, 12), (36, 12), (30, 18)])
        pygame.draw.polygon(temp_surface, BLACK, [(28, 12), (36, 12), (30, 18)], 1)

        # Çizimi döndür
        rotated_bird = pygame.transform.rotate(temp_surface, self.angle)
        new_rect = rotated_bird.get_rect(center=self.rect.center)
        surface.blit(rotated_bird, new_rect.topleft)

# Boru Sınıfı (Gelişmiş Görsel)
class Pipe(pygame.sprite.Sprite):
    def __init__(self, x, y, position_type):
        super().__init__()
        self.type = position_type  
        self.rect = pygame.Rect(x, y if position_type == "bottom" else y - 600, 52, 600)
        self.passed = False

    def update(self):
        self.rect.x -= scroll_speed
        if self.rect.right <= 0:
            self.kill()
            
    def draw(self, surface):
        # Boru ana gövdesi
        pygame.draw.rect(surface, PIPE_GREEN, self.rect)
        pygame.draw.rect(surface, PIPE_OUTLINE, self.rect, 2) # Dış çizgi
        
        # Boru kapağı (Cap)
        cap_height = 24
        cap_width = 60
        cap_x = self.rect.x - 4
        
        if self.type == "bottom":
            cap_rect = pygame.Rect(cap_x, self.rect.y, cap_width, cap_height)
        else:
            cap_rect = pygame.Rect(cap_x, self.rect.bottom - cap_height, cap_width, cap_height)
            
        pygame.draw.rect(surface, PIPE_GREEN, cap_rect)
        pygame.draw.rect(surface, PIPE_OUTLINE, cap_rect, 2)
        
        # Işık/Gölge efekti (3D hissi için sol tarafa açık yeşil çizgi)
        pygame.draw.line(surface, (150, 220, 80), (self.rect.x + 5, self.rect.y), (self.rect.x + 5, self.rect.bottom), 3)
        pygame.draw.line(surface, (150, 220, 80), (cap_rect.x + 5, cap_rect.y), (cap_rect.x + 5, cap_rect.bottom), 3)

bird = Bird()
pipe_group = pygame.sprite.Group()

def create_pipe():
    gap_y = random.randint(150, 350)
    gap_size = 140 # Yapay zeka eğitiminde gap_size sabit ve belirgin olmalı
    top_pipe = Pipe(screen_width + 50, gap_y - (gap_size // 2), "top")
    bottom_pipe = Pipe(screen_width + 50, gap_y + (gap_size // 2), "bottom")
    return top_pipe, bottom_pipe

def draw_ground():
    global ground_scroll
    ground_rect = pygame.Rect(0, screen_height - 100, screen_width, 100)
    pygame.draw.rect(screen, GROUND_COLOR, ground_rect)
    pygame.draw.line(screen, GROUND_LINE, (0, screen_height - 100), (screen_width, screen_height - 100), 4)
    
    # Hareket hissi veren çizgiler
    ground_scroll -= scroll_speed
    if ground_scroll <= -30:
        ground_scroll = 0
        
    for i in range(15):
        pygame.draw.line(screen, (200, 190, 130), 
                        (i * 30 + ground_scroll, screen_height - 100), 
                        (i * 30 + ground_scroll - 20, screen_height), 3)

clock = pygame.time.Clock()
SPAWNPIPE = pygame.USEREVENT
pygame.time.set_timer(SPAWNPIPE, 1300)

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and game_active:
                bird.jump()
            if event.key == pygame.K_w and not game_active: # W tuşu ile başla
                game_active = True
                pipe_group.empty()
                bird.rect.center = (100, screen_height // 2)
                bird.movement = 0
                bird.angle = 0
                score = 0

        if event.type == SPAWNPIPE and game_active:
            pipes = create_pipe()
            pipe_group.add(pipes[0])
            pipe_group.add(pipes[1])

    # 1. Arka Plan
    draw_gradient_bg()

    if game_active:
        # 2. Borular
        for pipe in pipe_group:
            pipe.update()
            pipe.draw(screen)

        # Çarpışma kontrolü (Zemine çarpma dahil)
        for pipe in pipe_group:
            if bird.rect.colliderect(pipe.rect):
                game_active = False
                
        if bird.rect.bottom >= screen_height - 100:
            game_active = False

        # Skor güncelleme
        for pipe in pipe_group:
            if pipe.rect.right < bird.rect.left and not pipe.passed:
                pipe.passed = True
                if pipe.type == "top":  
                    score += 1
        
        # 3. Zemin
        draw_ground()
        
        # 4. Kuş
        bird.update()
        bird.draw(screen)
        
        # Skor Çizimi
        score_surface = font.render(str(score), True, WHITE)
        # Yapay zekanın skoru metin olarak ayırt edebilmesi için gölge
        score_shadow = font.render(str(score), True, BLACK)
        screen.blit(score_shadow, (screen_width // 2 + 2, 42))
        screen.blit(score_surface, (screen_width // 2, 40))
        
    else:
        # Oyun bitik/başlangıç durumu
        # Statik zemin
        pygame.draw.rect(screen, GROUND_COLOR, (0, screen_height - 100, screen_width, 100))
        pygame.draw.line(screen, GROUND_LINE, (0, screen_height - 100), (screen_width, screen_height - 100), 4)
        
        bird.draw(screen)
        
        # UI
        title_surf = font.render("FLAPPY AI", True, WHITE)
        title_shadow = font.render("FLAPPY AI", True, BLACK)
        title_rect = title_surf.get_rect(center=(screen_width // 2, 150))
        screen.blit(title_shadow, (title_rect.x + 2, title_rect.y + 2))
        screen.blit(title_surf, title_rect)
        
        score_surf = small_font.render(f'Skor: {score}', True, WHITE)
        score_shadow = small_font.render(f'Skor: {score}', True, BLACK)
        score_rect = score_surf.get_rect(center=(screen_width // 2, screen_height // 2 - 40))
        screen.blit(score_shadow, (score_rect.x + 2, score_rect.y + 2))
        screen.blit(score_surf, score_rect)
        
        start_surf = small_font.render("Baslamak icin 'W' Tusu", True, WHITE)
        start_rect = start_surf.get_rect(center=(screen_width // 2, screen_height // 2 + 40))
        # UI Arka planı (Daha rahat okunması için)
        bg_rect = start_rect.inflate(20, 20)
        pygame.draw.rect(screen, BLACK, bg_rect, border_radius=10)
        screen.blit(start_surf, start_rect)

    pygame.display.flip()
    clock.tick(60)
