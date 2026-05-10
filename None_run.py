import sys
import os
import pygame
import random

# Sistem Gereksinimleri
PYTHON_VERSION = sys.version_info
assert PYTHON_VERSION >= (3, 8), "Python 3.8 veya üstü gerekiyor"

# Oyun Designı
SCREEN_WIDTH, SCREEN_HEIGHT = 288, 512
FPS = 60

# Renkler
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLACK = (0, 0, 0)

# Gökyüzü Efektleri
class Sky:
    def __init__(self):
        self.color = WHITE

    def draw(self, screen):
        screen.fill(self.color)

# Kuş Animasyonu
class Bird:
    def __init__(self):
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT // 2
        self.vel = 0
        self.size = 20
        self.color = RED

    def update(self):
        self.vel += 0.2
        self.y += self.vel

        if self.y + self.size > SCREEN_HEIGHT:
            self.y = SCREEN_HEIGHT - self.size

    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.size, self.size))

# Boru Animasyonu
class Pipe:
    def __init__(self, x):
        self.x = x
        self.y = random.randint(100, SCREEN_HEIGHT - 150)
        self.width = 50
        self.height = SCREEN_HEIGHT - self.y - 150
        self.color = BLACK

    def update(self):
        self.x -= 2

    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, 0, self.width, self.y))
        pygame.draw.rect(screen, self.color, (self.x, self.y + 150, self.width, self.height))

# Puan Sistemi
class Score:
    def __init__(self):
        self.score = 0
        self.font = pygame.font.SysFont("arial", 24)

    def update(self):
        self.score += 0.01

    def draw(self, screen):
        text = self.font.render(f"Puan: {int(self.score)}", True, BLACK)
        screen.blit(text, (10, 10))

# Oyun Loop
def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    clock = pygame.time.Clock()

    sky = Sky()
    bird = Bird()
    pipe = Pipe(SCREEN_WIDTH)
    score = Score()

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        keys = pygame.key.get_pressed()
        if keys[pygame.K_SPACE]:
            bird.vel = -5

        bird.update()
        pipe.update()
        score.update()

        sky.draw(screen)
        bird.draw(screen)
        pipe.draw(screen)
        score.draw(screen)

        if bird.y + bird.size > SCREEN_HEIGHT or (pipe.x < bird.x + bird.size and pipe.x + pipe.width > bird.x):
            print("Game Over!")
            break

        pygame.display.update()
        clock.tick(FPS)

if __name__ == "__main__":
    main()