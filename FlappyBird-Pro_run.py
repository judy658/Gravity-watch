import pygame
import sys
import random

# Ekran ayarları
ekran_genisligi = 800
ekran_yuksekligi = 600

# Renkler
KIRMIZI = (255, 0, 0)
YEŞİL = (0, 255, 0)
Mavi = (0, 0, 255)

# Oyun motoru ayarları
pygame.init()
ekran = pygame.display.set_mode((ekran_genisligi, ekran_yuksekligi))
pygame.display.set_caption('FlappyBird-Pro')
clock = pygame.time.Clock()

class Bird:
    def __init__(self):
        self.width = 50
        self.height = 50
        self.x = ekran_genisligi // 2 - self.width // 2
        self.y = ekran_yuksekligi // 2 - self.height // 2
        self.speed = 5
        self.gravity = 0.6
        self.lift = -15
        self.velocity = 0

    def update(self):
        self.velocity += self.gravity
        self.y += self.velocity
        if self.y > ekran_yuksekligi:
            self.y = ekran_yuksekligi
            self.velocity = 0

    def jump(self):
        self.velocity = self.lift

    def draw(self):
        pygame.draw.rect(ekran, YEŞİL, (self.x, self.y, self.width, self.height))

class Score:
    def __init__(self):
        self.score = 0
        self.font = pygame.font.Font(None, 36)

    def update(self):
        self.score += 1

    def draw(self):
        score_text = self.font.render(f'Score: {self.score}', True, Mavi)
        ekran.blit(score_text, (10, 10))

class Sky:
    def __init__(self):
        self.sky_width = ekran_genisligi
        self.sky_height = ekran_yuksekligi

    def draw(self):
        pygame.draw.rect(ekran, Mavi, (0, 0, self.sky_width, self.sky_height))

class Obstacle:
    def __init__(self, x):
        self.x = x
        self.height = random.randint(50, ekran_yuksekligi // 2)
        self.gap = 100
        self.top_obstacle_height = self.height
        self.bottom_obstacle_height = ekran_yuksekligi - self.height - self.gap

    def draw(self):
        pygame.draw.rect(ekran, KIRMIZI, (self.x, 0, 50, self.top_obstacle_height))
        pygame.draw.rect(ekran, KIRMIZI, (self.x, ekran_yuksekligi - self.bottom_obstacle_height, 50, self.bottom_obstacle_height))

def main():
    bird = Bird()
    score = Score()
    sky = Sky()
    obstacles = []
    current_x = ekran_genisligi

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bird.jump()

        # Hareket ve Çizdirme
        bird.update()
        sky.draw()
        for obstacle in obstacles:
            obstacle.draw()
        bird.draw()
        score.draw()

        # Oyun Mekanikleri
        current_x -= 5
        if len(obstacles) == 0 or current_x < obstacles[0].x + 100:
            new_obstacle = Obstacle(current_x)
            obstacles.append(new_obstacle)
        for obstacle in obstacles:
            if bird.x + bird.width > obstacle.x and bird.x < obstacle.x + 50:
                if bird.y < obstacle.top_obstacle_height or bird.y + bird.height > obstacle.bottom_obstacle_height:
                    print("Game Over")
                    pygame.quit()
                    sys.exit()
        obstacles = [obs for obs in obstacles if obs.x + 50 > 0]

        # Pygame ekranı güncelleme
        pygame.display.update()
        clock.tick(60)

if __name__ == "__main__":
    main()