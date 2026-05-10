import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';

// Metro Bundler bazen paketi bulamıyor, bu yüzden doğrudan dist dosyasına gidiyoruz
const jsmediatags = require('jsmediatags/dist/jsmediatags.min.js');

export const useAlbumArt = (url: string | null) => {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setAlbumArt(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setAlbumArt(null); // Yeni şarkı yüklendiğinde eski kapağı hemen temizle
    setError(null);

    const fetchMetadata = async () => {
      try {
        if (typeof url !== 'string') return;
        const isRemote = url.startsWith('http');
        
        if (isRemote) {
          const response = await fetch(url, { headers: { Range: 'bytes=0-262143' } });
          const blob = await response.blob();
          
          new jsmediatags.Reader(blob)
            .read({
              onSuccess: (tag: any) => {
                if (!isMounted) return;
                processTag(tag);
              },
              onError: (err: any) => {
                if (!isMounted) return;
                setIsLoading(false);
              }
            });
        } else {
          new jsmediatags.Reader(url)
            .read({
              onSuccess: (tag: any) => {
                if (!isMounted) return;
                processTag(tag);
              },
              onError: (err: any) => {
                if (!isMounted) return;
                setIsLoading(false);
              }
            });
        }
      } catch (e: any) {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    const processTag = (tag: any) => {
      const image = tag.tags.picture;
      if (image) {
        const { data, format } = image;
        const base64 = `data:${format};base64,${Buffer.from(data).toString('base64')}`;
        setAlbumArt(base64);
      } else {
        setAlbumArt(null);
      }
      setIsLoading(false);
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { albumArt, isLoading, error };
};
