from pygame.locals import *

# Ekran Ayarları
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Renkler (Gradients, Sleek Dark Mode)
SKY_BLUE = (135, 206, 235)    # Gökyüzü rengi
WHITE = (255, 255, 255)       # Beyaz renk
GREEN = (0, 255, 0)           # Yeşil renk
RED = (255, 0, 0)             # Kırmızı renk

# Diğer Sabitler
GRAVITY = 0.5
FLAP_STRENGTH = -10
PIPE_WIDTH = 80
PIPE_HEIGHT = 320
PIPE_GAP = 150
PIPE_SPEED = 5
SPAWNPIPE = USEREVENT + 1
NEWPIPE = 2000               # Yeni çubuk üretimi sıklığı (ms)
class Settings:
    def __init__(self):
        self.speed = PIPE_SPEED         # Oyun hızı (çubuk hızı)
        self.score = 0                  # Mevcut skor
        self.increase_speed_threshold = 100  # Hızlanma eşiği

    def update(self):
        """Puan arttıkça oyun hızını artırır."""
        if self.score % self.increase_speed_threshold == 0 and self.speed < 15:
            self.speed += 0.2
import pygame
from constants import SKY_BLUE, WHITE, SCREEN_WIDTH, SCREEN_HEIGHT

class Background:
    def __init__(self, screen):
        self.screen = screen
        self.width, self.height = SCREEN_WIDTH, SCREEN_HEIGHT
        self.clouds = [
            {"x": 0, "y": 150},
            {"x": 200, "y": 180},
            {"x": 400, "y": 160},
        ]

    def draw(self):
        """Gökyüzü ve bulutları çizer."""
        self.screen.fill(SKY_BLUE)  # Gökyüzü rengi
        for cloud in self.clouds:
            pygame.draw.circle(self.screen, WHITE, (cloud["x"], cloud["y"]), 20)

    def update(self):
        """Bulutların hareketini sağlar."""
        for cloud in self.clouds:
            cloud["x"] -= 1
            if cloud["x"] < -20:
                cloud["x"] = SCREEN_WIDTH + 20
import pygame
from constants import RED, GRAVITY, FLAP_STRENGTH

class Bird(pygame.sprite.Sprite):
    def __init__(self, screen):
        super().__init__()
        self.screen = screen
        self.image = pygame.Surface((34, 24))
        self.image.fill(RED)
        self.rect = self.image.get_rect(center=(100, SCREEN_HEIGHT // 2))
        self.gravity = GRAVITY
        self.velocity = 0

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[K_SPACE]:
            self.flap()

        self.velocity += self.gravity
        self.rect.y += int(self.velocity)

        # Yan kenarlara çarpmayı engelle
        if self.rect.top <= 0:
            self.rect.top = 0
        if self.rect.bottom >= SCREEN_HEIGHT:
            self.rect.bottom = SCREEN_HEIGHT

    def flap(self):
        self.velocity = FLAP_STRENGTH
import pygame
from constants import GREEN, PIPE_WIDTH, PIPE_HEIGHT, SCREEN_HEIGHT, SPAWNPIPE

class Pipe(pygame.sprite.Sprite):
    def __init__(self, position):
        super().__init__()
        self.image = pygame.Surface((PIPE_WIDTH, PIPE_HEIGHT))
        self.image.fill(GREEN)
        if position == "bottom":
            self.rect = self.image.get_rect(midtop=(SCREEN_WIDTH + 50, position))
        else:
            self.rect = self.image.get_rect(midbottom=(SCREEN_WIDTH + 50, SCREEN_HEIGHT - position))

    def update(self, speed):
        self.rect.x -= int(speed)
        if self.rect.right <= 0:
            self.kill()
import pygame
from game.background import Background
from game.bird import Bird
from game.pipe import Pipe
from constants import WHITE, SCREEN_WIDTH, SCREEN_HEIGHT, SPAWNPIPE, NEWPIPE
from settings import Settings

pygame.init()

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
clock = pygame.time.Clock()
pygame.display.set_caption("Flappy Bird Utopia")

# Sesi yükle (isteğe bağlı)
jump_sound = pygame.mixer.Sound("sounds/jump.wav")
collision_sound = pygame.mixer.Sound("sounds/collision.wav")

background = Background(screen)
bird_group = pygame.sprite.GroupSingle(Bird(screen))
pipe_list = []
settings = Settings()

pygame.time.set_timer(SPAWNPIPE, NEWPIPE)

def create_pipe():
    random_height = random.randint(150, 450)
    bottom_pipe = Pipe(random_height)
    top_pipe = Pipe(SCREEN_HEIGHT - PIPE_GAP - random_height)
    return bottom_pipe, top_pipe

def main():
    score = 0
    font = pygame.font.Font(None, 36)

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            if event.type == SPAWNPIPE:
                pipe_list.extend(create_pipe())
            if event.type == KEYDOWN:
                if event.key == K_SPACE and bird_group.sprite.rect.top >= 50:
                    bird_group.sprite.flap()

        screen.fill(WHITE)
        
        background.draw()
        background.update()

        bird_group.draw(screen)
        bird_group.update()

        for pipe in pipe_list:
            screen.blit(pipe.image, pipe.rect)
            pipe.update(settings.speed)

        score_display = font.render(f"Skor: {score}", True, WHITE)
        screen.blit(score_display, (10, 10))

        if pygame.sprite.groupcollide(bird_group, pipe_list, False, False):
            collision_sound.play()
            # Oyun bitirme ve yeniden başlatma kodları eklenebilir
            break

        pygame.display.update()
        clock.tick(60)

if __name__ == "__main__":
    main()