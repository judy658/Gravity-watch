import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { lyricsService } from '@/services/lyricsService';
import { LyricLine, Song } from '@/constants/songs';

export const useLyrics = (song: Song | null, positionX: any, isActive: boolean = true) => {
  const [activeLyrics, setDynamicLyrics] = useState<LyricLine[] | undefined>(song?.lyrics);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1); // Scrolling için JS tarafı
  
  // GPU-Accelerated Index for Highlighting
  const activeIndexSV = useSharedValue(-1);

  // Şarkı değiştiğinde sözleri sıfırla
  useEffect(() => {
    activeIndexSV.value = -1;
    setCurrentIndex(-1);
    
    if (song?.lyrics) {
      setDynamicLyrics(song.lyrics);
    } else {
      setDynamicLyrics(undefined);
    }

    if (!song?.lyrics && song && isActive) {
      const fetchBotLyrics = async () => {
        setIsSearching(true);
        const result = await lyricsService.fetchSyncedLyrics(song.title, song.artist);
        if (result) {
          setDynamicLyrics(result);
        }
        setIsSearching(false);
      };
      fetchBotLyrics();
    }
  }, [song?.url, isActive]);

  // GPU SYNC LOGIC (The Professional Way)
  useAnimatedReaction(
    () => ({ pos: positionX?.value || 0, active: isActive }),
    (data) => {
      if (!data.active || !activeLyrics || activeLyrics.length === 0) {
        activeIndexSV.value = -1;
        return;
      }

      const currentPos = data.pos;
      let newIndex = -1;

      // Find current lyric index (Lyrics are in seconds, position is in ms)
      for (let i = 0; i < activeLyrics.length; i++) {
        if (currentPos >= activeLyrics[i].time * 1000) {
          newIndex = i;
        } else {
          break;
        }
      }

      if (newIndex !== activeIndexSV.value) {
        activeIndexSV.value = newIndex;
        // JS tarafına sadece index değiştiğinde sinyal gönder (Hafif Trafik - Sıfır Donma)
        runOnJS(setCurrentIndex)(newIndex);
      }
    },
    [activeLyrics, isActive]
  );

  return { 
    activeLyrics, 
    isSearching, 
    currentIndex, // Scrolling için (JS)
    activeIndexSV // Highlighting için (GPU)
  };
};
