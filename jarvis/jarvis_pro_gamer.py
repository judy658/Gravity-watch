import pygame
import random
import sys
import time

# --- STARK ENDÜSTRİLERİ - JARVIS PRO-GAMER SİSTEMİ ---
pygame.init()

# Ekran Ayarları
WIDTH, HEIGHT = 600, 600 # HUD için biraz daha geniş
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("J.A.R.V.I.S. - Pro-Gamer Protocol")

# Renkler (Stark Palette)
STARK_RED = (255, 45, 45)
STARK_BLUE = (0, 168, 255)
STARK_GOLD = (255, 215, 0)
BG_DARK = (15, 15, 15)
SKY_COLOR = (113, 197, 207)
PIPE_COLOR = (75, 175, 80)
WHITE = (255, 255, 255)

# Fontlar
font_large = pygame.font.Font(None, 48)
font_small = pygame.font.Font(None, 24)

# Oyun Değişkenleri
GRAVITY = 0.35
JUMP_STRENGTH = -7
PIPE_SPEED = 4
GAP_SIZE = 155

class Bird:
    def __init__(self):
        self.rect = pygame.Rect(100, HEIGHT // 2, 34, 24)
        self.velocity = 0
        self.angle = 0

    def jump(self):
        self.velocity = JUMP_STRENGTH
        self.angle = 25

    def update(self):
        self.velocity += GRAVITY
        self.rect.y += self.velocity
        
        # Açı Hesaplama
        if self.velocity < 0: self.angle = 25
        else: self.angle = max(-90, self.angle - 3)

        if self.rect.top < 0: self.rect.top = 0
        if self.rect.bottom > HEIGHT - 100:
            self.rect.bottom = HEIGHT - 100
            return False
        return True

    def draw(self, surface):
        # Jarvis Tarzı Kuş Çizimi
        bird_surf = pygame.Surface((40, 30), pygame.SRCALPHA)
        pygame.draw.ellipse(bird_surf, STARK_GOLD, (0, 0, 34, 24))
        pygame.draw.circle(bird_surf, WHITE, (25, 8), 5) # Göz
        pygame.draw.circle(bird_surf, (0, 0, 0), (27, 8), 2) # Göz Bebeği
        
        rotated = pygame.transform.rotate(bird_surf, self.angle)
        surface.blit(rotated, rotated.get_rect(center=self.rect.center))

class Pipe:
    def __init__(self, x):
        self.gap_y = random.randint(150, HEIGHT - 250)
        self.rect_top = pygame.Rect(x, 0, 60, self.gap_y - GAP_SIZE // 2)
        self.rect_bottom = pygame.Rect(x, self.gap_y + GAP_SIZE // 2, 60, HEIGHT - (self.gap_y + GAP_SIZE // 2))
        self.passed = False

    def update(self):
        self.rect_top.x -= PIPE_SPEED
        self.rect_bottom.x -= PIPE_SPEED

    def draw(self, surface):
        pygame.draw.rect(surface, PIPE_COLOR, self.rect_top)
        pygame.draw.rect(surface, PIPE_COLOR, self.rect_bottom)
        # Boru kenarlarına Stark çizgisi
        pygame.draw.rect(surface, STARK_BLUE, self.rect_top, 2)
        pygame.draw.rect(surface, STARK_BLUE, self.rect_bottom, 2)

class JarvisHUD:
    def __init__(self):
        self.active = False
        self.last_decision = "BEKLEMEDE"

    def draw(self, surface, bird, pipes, score):
        # Sağ panel (HUD)
        hud_rect = pygame.Rect(450, 0, 150, HEIGHT)
        pygame.draw.rect(surface, (25, 25, 25), hud_rect)
        pygame.draw.line(surface, STARK_BLUE, (450, 0), (450, HEIGHT), 3)

        # Durum Yazıları
        status_color = STARK_RED if not self.active else (0, 255, 0)
        status_txt = font_small.render(f"OTONOM: {'AÇIK' if self.active else 'KAPALI'}", True, status_color)
        surface.blit(status_txt, (460, 20))

        score_txt = font_large.render(str(score), True, WHITE)
        surface.blit(score_txt, (500, 60))

        # Canlı Veri Analizi
        if self.active:
            target_pipe = None
            for p in pipes:
                if p.rect_top.right > bird.rect.left:
                    target_pipe = p
                    break
            
            if target_pipe:
                # Veri Çizgileri
                pygame.draw.line(surface, STARK_BLUE, bird.rect.center, (target_pipe.rect_top.x, target_pipe.gap_y), 1)
                pygame.draw.circle(surface, STARK_RED, (target_pipe.rect_top.centerx, target_pipe.gap_y), 5, 1)
                
                dist_txt = font_small.render(f"Y-FARK: {int(bird.rect.y - target_pipe.gap_y)}", True, STARK_BLUE)
                surface.blit(dist_txt, (460, 120))
                
                decision_txt = font_small.render(f"KARAR: {self.last_decision}", True, WHITE)
                surface.blit(decision_txt, (460, 150))

        # Kontrol İpucu
        hint = font_small.render("'A' - OTONOM", True, (150, 150, 150))
        surface.blit(hint, (460, HEIGHT - 40))

def main():
    clock = pygame.time.Clock()
    bird = Bird()
    pipes = [Pipe(600), Pipe(900)]
    hud = JarvisHUD()
    score = 0
    game_active = False

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    if game_active: bird.jump()
                    else: # Restart
                        bird = Bird()
                        pipes = [Pipe(600), Pipe(900)]
                        score = 0
                        game_active = True
                if event.key == pygame.K_a:
                    hud.active = not hud.active

        screen.fill(SKY_COLOR)

        if game_active:
            # --- JARVIS AI MANTIK (Doğrudan Veri Erişimi) ---
            if hud.active:
                # En yakın boruyu bul
                target_pipe = None
                for p in pipes:
                    if p.rect_top.right > bird.rect.left:
                        target_pipe = p
                        break
                
                if target_pipe:
                    # JARVIS KARAR MEKANİZMASI
                    # Kuşun merkezi boru boşluğunun 15px altındaysa zıpla
                    if bird.rect.centery > target_pipe.gap_y + 15:
                        bird.jump()
                        hud.last_decision = "ZIPLA"
                    else:
                        hud.last_decision = "SÜZÜL"
                else:
                    # Boru yoksa ekran ortasında kal
                    if bird.rect.centery > HEIGHT // 2 + 10:
                        bird.jump()

            # Güncellemeler
            if not bird.update():
                game_active = False
            
            for pipe in pipes:
                pipe.update()
                if pipe.rect_top.colliderect(bird.rect) or pipe.rect_bottom.colliderect(bird.rect):
                    game_active = False
                
                if pipe.rect_top.right < bird.rect.left and not pipe.passed:
                    pipe.passed = True
                    score += 1
                    pipes.append(Pipe(pipes[-1].rect_top.x + 300))

            # Temizlik
            pipes = [p for p in pipes if p.rect_top.right > -50]

            # Çizim
            for pipe in pipes: pipe.draw(screen)
            bird.draw(screen)
            
            # Zemin
            pygame.draw.rect(screen, (222, 216, 149), (0, HEIGHT - 100, 450, 100))
            pygame.draw.line(screen, (100, 70, 40), (0, HEIGHT - 100), (450, HEIGHT - 100), 5)

        else:
            msg = font_large.render("SİSTEM ÇEVRİMDIŞI", True, STARK_RED)
            screen.blit(msg, (50, HEIGHT // 2 - 50))
            hint = font_small.render("BAŞLATMAK İÇİN 'SPACE'", True, WHITE)
            screen.blit(hint, (100, HEIGHT // 2 + 20))

        # HUD her zaman çizilir
        hud.draw(screen, bird, pipes, score)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
