import axios from 'axios';

const API_URL = 'https://gravity-watch-1.onrender.com';
const YOUTUBE_WEB_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let currentApiKey: string | null = null;

const getFreshKey = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://www.youtube.com', {
      headers: { 'User-Agent': YOUTUBE_WEB_UA },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const text = await response.text();
    const keyMatch = text.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (keyMatch) {
      currentApiKey = keyMatch[1];
      return currentApiKey;
    }
  } catch (e) {
    console.error("Key extraction failed:", e);
  }
  return null;
};

export const youtubeService = {
  search: async (query: string, skipFilter: boolean = false) => {
    try {
      const RENDER_SEARCH = `${API_URL}/api/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(RENDER_SEARCH);
      const data = await res.json();
      if (data && data.length > 0) {
        const filteredVideos = skipFilter ? data : data.filter((item: any) => {
          const t = item.title?.toLowerCase() || '';
          const u = item.uploader?.toLowerCase() || '';
          const isMusic = t.includes('official video') || t.includes('official audio') || t.includes('lyrics') || t.includes('music video') || u.includes('vevo') || u.endsWith(' - topic');
          return !isMusic;
        });

        return filteredVideos.map((item: any) => ({
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail,
          author: item.uploader || "YouTube",
          duration: "0:00"
        }));
      }
    } catch (cloudError) {
      console.error("Bulut arama başarısız:", cloudError);
    }
    return [];
  },

  getVideoStream: async (videoId: string) => {
    try {
      const RENDER_PROXY = `${API_URL}/api/resolve?url=`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const proxyRes = await fetch(`${RENDER_PROXY}${videoId}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData && proxyData.best_url && !proxyData.error) {
          return proxyData.best_url;
        }
      }
    } catch (e) {}

    // Fallback logic
    try {
      const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}`, videoQuality: "720" })
      });
      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.ok ? await cobaltRes.json() : null;
        if (cobaltData && cobaltData.url) return cobaltData.url;
      }
    } catch (e) {}

    return null;
  },

  async getDownloadUrl(videoId: string) {
    try {
      const response = await axios.get(`${API_URL}/api/get_download_url`, {
        params: { video_id: videoId }
      });
      return response.data;
    } catch (error) {
      console.error('Download URL fetch error:', error);
      return null;
    }
  },
};
