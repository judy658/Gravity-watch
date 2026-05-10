import pygame
import random

# Pygame başlatma
pygame.init()

# Ekran ayarları
screen_width = 400
screen_height = 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("J.A.R.V.I.S. Flappy Bird Oyun Alanı")

# Renkler
bg_color = (135, 206, 235)  # Açık Mavi
bird_color = (255, 255, 0)   # Sarı
pipe_color = (0, 128, 0)     # Yeşil

# Kuş ayarları
class Bird(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((34, 24))
        self.image.fill(bird_color)
        self.rect = self.image.get_rect(center=(100, screen_height // 2))
        self.gravity = 0.5
        self.movement = 0

    def update(self):
        self.movement += self.gravity
        self.rect.y += self.movement
        if self.rect.top <= 0:
            self.rect.top = 0
        if self.rect.bottom >= screen_height:
            self.rect.bottom = screen_height

# Boru ayarları
class Pipe(pygame.sprite.Sprite):
    def __init__(self, position):
        super().__init__()
        self.image = pygame.Surface((70, random.randint(150, 400)))
        self.image.fill(pipe_color)
        if position == 'top':
            # ANTIGRAVITY DÜZELTMESİ 1: midbottom yerine topleft
            self.rect = self.image.get_rect(topleft=(screen_width + 50, 0))
        else:
            self.image = pygame.Surface((70, screen_height - (self.image.get_height() + 150)))
            self.image.fill(pipe_color)
            self.rect = self.image.get_rect(midtop=(screen_width + 50, self.image.get_height() + 150))
        self.passed = False

    def update(self):
        self.rect.x -= 5
        if self.rect.right <= 0:
            self.kill()

# Gruplar
bird_group = pygame.sprite.GroupSingle()
bird_group.add(Bird())
pipe_group = pygame.sprite.Group()

# Skor ve oyun durumu
score = 0
game_active = True

# Zamanlayıcı
clock = pygame.time.Clock()

# Boru oluşturma eventi
SPAWNPIPE = pygame.USEREVENT
pygame.time.set_timer(SPAWNPIPE, 1200)

font = pygame.font.Font(None, 36)

# Oyun döngüsü
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
        if game_active:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bird_group.sprite.movement = 0
                    bird_group.sprite.movement -= 12
            if event.type == SPAWNPIPE:
                pipe_group.add(Pipe('top'))
                pipe_group.add(Pipe('bottom'))
        else:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    game_active = True
                    bird_group.sprite.rect.center = (100, screen_height // 2)
                    bird_group.sprite.movement = 0
                    pipe_group.empty()
                    score = 0

    screen.fill(bg_color)

    if game_active:
        bird_group.draw(screen)
        bird_group.update()

        pipe_group.draw(screen)
        pipe_group.update()

        # ANTIGRAVITY DÜZELTMESİ 2 & 3: Çarpışma ve skor mantığı
        for pipe in pipe_group.sprites():
            if bird_group.sprite.rect.colliderect(pipe.rect):
                game_active = False
            
            # Skor: boru kuşun soluna geçtikçe
            if pipe.rect.right < bird_group.sprite.rect.left and not getattr(pipe, 'passed', False):
                score += 0.5  # Her boru geçişinde 2 obje olduğu için 0.5 ile dengelenir
                pipe.passed = True

    else:
        text_surface = font.render('OYUN BİTTİ - YENİDEN BAŞLAMAK İÇİN BOŞLUĞA BAS', True, (255, 0, 0))
        screen.blit(text_surface, (20, screen_height // 2))

    score_surface = font.render(f'Skor: {int(score)}', True, (255, 255, 255))
    screen.blit(score_surface, (10, 10))

    pygame.display.update()
    clock.tick(60)
