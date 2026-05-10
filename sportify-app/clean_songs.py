import os
import re

file_path = "src/constants/songs.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# "cover": "https://...", satırlarını kaldır
new_content = re.sub(r'\s+"cover":\s+"https?://[^"]+",?', '', content)

# Eğer virgüllerde bozulma olduysa (çift virgül veya sonda kalan virgül) temizle
new_content = re.sub(r',(\s+})', r'\1', new_content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Kapak linkleri temizlendi.")
