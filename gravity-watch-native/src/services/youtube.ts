import axios from 'axios';

// Dynamic InnerTube API Service
const YOUTUBE_WEB_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const GOOGLE_VISITOR_ID = "CgtDUF96Rzl0M1lZayis_660BjIKCg1UUiIDVVNEKgoyNDA5NDgyNjY0";

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
      console.log("[YouTubeService] Taze API Anahtarı Yakalandı:", currentApiKey);
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
      // console.log(`[YouTubeService] Bulut üzerinden arama başlatılıyor: ${query}`);
      const RENDER_SEARCH = `https://gravity-watch-1.onrender.com/api/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(RENDER_SEARCH);
      const data = await res.json();
      if (data && data.length > 0) {
        // Müzik videolarını (şarkıları) filtrele (Arama sonuçları için, Beğeniler için değil)
        const filteredVideos = skipFilter ? data : data.filter((item: any) => {
          const t = item.title?.toLowerCase() || '';
          const u = item.uploader?.toLowerCase() || '';
          
          const isMusic = 
            t.includes('official video') || 
            t.includes('official audio') || 
            t.includes('lyrics') || 
            t.includes('music video') ||
            u.includes('vevo') || 
            u.endsWith(' - topic');
            
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
    // STRATEJİ: Gravity-Tube PC Versiyonundaki "Manifest Hunter" Stratejisi
    // Render sunucumuzdaki resolver.py, yt-dlp ile ios/mweb/android_vr istemcilerini dönerek
    // IP kilidi OLMAYAN (IP unbound) direkt YouTube CDN linklerini çeker.
    // Bu sadece link çektiği için Render sunucusundan KB boyutunda veri harcar, 100GB limitini asla etkilemez!
    
    console.log("[YouTubeService] Bulut köprüsü (Render) deneniyor... (Uyku modundaysa biraz sürebilir)");
    try {
      const RENDER_PROXY = "https://gravity-watch-1.onrender.com/api/resolve?url=";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15sn bekle
      
      const proxyRes = await fetch(`${RENDER_PROXY}${videoId}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData && proxyData.best_url && !proxyData.error) {
          console.log("[YouTubeService] Render üzerinden IP kilitsiz link başarıyla çekildi!");
          return proxyData.best_url;
        } else if (proxyData.error) {
          console.error("[YouTubeService] Render Proxy Hatası:", proxyData.error);
        }
      }
    } catch (e) {
      console.error("[YouTubeService] Bulut köprüsü zaman aşımına uğradı veya hata verdi.");
    }

    // STRATEJİ 4: COBALT API (Kurtarıcı Melek)
    // Eğer Render'daki çerezlerin süresi dolduysa, Cobalt'ın güçlü açık kaynaklı sunucusunu devreye sokarız.
    console.log("[YouTubeService] Çerezler ölü! Yedek plan devreye giriyor: Cobalt API...");
    try {
      const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          videoQuality: "720",
          isAudioOnly: false,
          disableMetadata: true
        })
      });

      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json();
        // Cobalt başarılı olduğunda direkt link yönlendirmesi yapar (status: "redirect" veya "stream")
        if (cobaltData && cobaltData.url) {
          console.log("[YouTubeService] Cobalt üzerinden direkt MP4 linki başarıyla alındı!");
          return cobaltData.url;
        }
      }
    } catch (e) {
      console.error("[YouTubeService] Cobalt API başarısız oldu:", e);
    }

    // STRATEJİ 5: INVIDIOUS API (Son Çare)
    console.log("[YouTubeService] Invidious API deneniyor...");
    const invidiousInstances = [
      "https://vid.puffyan.us",
      "https://inv.tux.pizza",
      "https://invidious.asir.dev"
    ];

    for (const inv of invidiousInstances) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${inv}/api/v1/videos/${videoId}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.formatStreams && data.formatStreams.length > 0) {
            // Sesi ve Görüntüsü bir arada olan MP4 formatı
            const mp4Streams = data.formatStreams.filter((s: any) => s.container === "mp4");
            if (mp4Streams.length > 0) {
              console.log(`[YouTubeService] Invidious (${inv}) üzerinden link alındı!`);
              return mp4Streams[0].url;
            }
          }
        }
      } catch (e) {
        console.warn(`[YouTubeService] Invidious (${inv}) başarısız.`);
      }
    }

    return null;
  }
};
