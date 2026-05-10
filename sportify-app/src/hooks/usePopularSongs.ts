import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SONGS, Song } from '@/constants/songs';

export const usePopularSongs = () => {
  const [popularSongs, setPopularSongs] = useState<(Song & { play_count?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPopularSongs = async () => {
    setIsLoading(true);
    try {
      // song_stats tablosundan en çok dinlenen ilk 50 şarkıyı çek
      const { data, error } = await supabase
        .from('song_stats')
        .select('song_file, play_count')
        .order('play_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        // Veritabanındaki song_file isimlerini bizim yerel SONGS listemizle eşleştir
        const mappedSongs = data
          .map(stat => {
            const song = SONGS.find(s => s.filename === stat.song_file);
            return song ? { ...song, play_count: stat.play_count } : null;
          })
          .filter((song): song is (Song & { play_count: number }) => !!song);

        setPopularSongs(mappedSongs);
      }
    } catch (error) {
      console.error('Error fetching popular songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementPlayCount = async (song: Song) => {
    try {
      // Güvenli Veznedar (RPC) yöntemini kullanarak sayacı 1 artır
      await supabase.rpc('increment_song_play', { 
        target_song_file: song.filename 
      });
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  };

  useEffect(() => {
    fetchPopularSongs();
  }, []);

  return {
    popularSongs,
    isLoading,
    refreshPopularSongs: fetchPopularSongs,
    incrementPlayCount
  };
};
