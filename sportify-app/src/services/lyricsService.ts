import { LyricLine } from '@/constants/songs';

const LRCLIB_URL = 'https://lrclib.net/api';

export interface LrcResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  syncedLyrics?: string;
  plainLyrics?: string;
}

export const lyricsService = {
  /**
   * LRC formatındaki string'i LyricLine[] dizisine çevirir
   * Metadata (ID tag) satırlarını filtreler [ar:, ti: vb.]
   */
  parseLrc(lrc: string): LyricLine[] {
    const lines = lrc.split('\n');
    const result: LyricLine[] = [];
    
    // Regex: [00:00.00] lyrics (dakika:saniye.milisaniye)
    // Metadata filtreleme: Satır bir zaman damgasıyla başlamalıdır
    const lrcRegex = /^\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]\s?(.*)$/;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const match = lrcRegex.exec(trimmedLine);
      
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const text = match[3] || '';
        
        result.push({
          time: minutes * 60 + seconds,
          text: text.trim()
        });
      }
    });

    return result.sort((a, b) => a.time - b.time);
  },

  /**
   * Belirli bir şarkı için senkronize sözleri arar
   */
  async fetchSyncedLyrics(trackName: string, artistName: string, duration?: number): Promise<LyricLine[] | null> {
    try {
      // Önce en iyi eşleşmeyi deneyelim
      let url = `${LRCLIB_URL}/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
      if (duration) url += `&duration=${Math.floor(duration / 1000)}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SportifyMobile/1.0 (https://github.com/judy658)'
        }
      });

      if (!response.ok) {
        // Tam eşleşme bulunamadıysa aramaya geçelim
        const searchUrl = `${LRCLIB_URL}/search?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (Array.isArray(searchData) && searchData.length > 0) {
          // Senkronize sözü olan ilk sonucu alalım
          const bestMatch = searchData.find((item: LrcResponse) => item.syncedLyrics);
          if (bestMatch && bestMatch.syncedLyrics) {
            return this.parseLrc(bestMatch.syncedLyrics);
          }
        }
        return null;
      }

      const data: LrcResponse = await response.json();
      if (data.syncedLyrics) {
        return this.parseLrc(data.syncedLyrics);
      }

      return null;
    } catch (error) {
      console.error('Sportify AI Bot Error:', error);
      return null;
    }
  }
};
