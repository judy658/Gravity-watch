import re
import json

main_gd_path = r'c:\Users\aliha\Desktop\gfgfgf\sportify-v-6-(15)\main.gd'
output_ts_path = r'c:\Users\aliha\Desktop\gfgfgf\sportify-v-6-(15)\sportify-app\src\constants\songs.ts'

with open(main_gd_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

songs = []
repo_urls = {
    'repo_1': 'https://github.com/judy658/sportify-music/releases/download/v1.0/',
    'repo_2': 'https://github.com/judy658/sportify-music2/releases/download/v1.0/'
}
base_url = repo_urls['repo_1']

# Regex to match each song entry like ["file.mp3", "title", "artist"] or ["file.mp3", "title", "artist", "repo"]
song_pattern = re.compile(r'\[\s*\"(?P<filename>.*?)\",\s*\"(?P<title>.*?)\",\s*\"(?P<artist>.*?)\"(?:,\s*\"(?P<repo>.*?)\")?\s*\]')

capture = False
for line in lines:
    if 'const RAW_SONGS' in line:
        capture = True
        continue
    if capture and ']' in line and '[' not in line: # End of array
        # Note: this is a bit simplistic but should work for this file
        pass # We'll keep going until we hit the next major block or find enough songs
    
    if capture:
        m = song_pattern.search(line)
        if m:
            filename = m.group('filename').strip()
            title = m.group('title').strip()
            artist = m.group('artist').strip()
            repo = m.group('repo').strip() if m.group('repo') else 'repo_1'
            
            url = repo_urls.get(repo, base_url) + filename
            songs.append({
                'url': url,
                'title': title,
                'artist': artist,
                'filename': filename
            })
        
        # Stop capturing if we see another const or func after some songs
        if len(songs) > 0 and ('const ' in line or 'func ' in line) and '[' not in line:
            if 'RAW_SONGS' not in line:
                break

with open(output_ts_path, 'w', encoding='utf-8') as f:
    f.write('export type Song = {\n  url: string;\n  title: string;\n  artist: string;\n  filename: string;\n};\n\n')
    f.write('export const SONGS: Song[] = ' + json.dumps(songs, indent=2, ensure_ascii=False) + ';\n')

print(f'Successfully wrote {len(songs)} songs to {output_ts_path}')
