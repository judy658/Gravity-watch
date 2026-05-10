import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const PLAYLISTS_KEY = 'sportify_playlists';

export type Playlist = {
  id: string;
  name: string;
  songUrls: string[];
  color: string;
  createdAt: number;
};

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, color: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songUrl: string) => void;
  removeSongFromPlaylist: (playlistId: string, songUrl: string) => void;
  isSongInPlaylist: (playlistId: string, songUrl: string) => boolean;
  syncWithCloud: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const isSyncingRef = useRef(false);

  // Load local playlists first for speed
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const saved = await AsyncStorage.getItem(PLAYLISTS_KEY);
        if (saved) setPlaylists(JSON.parse(saved));
      } catch (e) {}
    };
    loadLocal();
  }, []);

  // Sync with Supabase cloud
  const syncWithCloud = useCallback(async () => {
    if (isSyncingRef.current) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlaylists([]);
        return;
      }

      isSyncingRef.current = true;
      const { data, error } = await supabase
        .from('playlists')
        .select('local_id, name, color, song_urls, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      // Cloud data is the absolute truth
      const cloudPlaylists: Playlist[] = data ? data.map(p => ({
        id: p.local_id,
        name: p.name,
        color: p.color,
        songUrls: p.song_urls,
        createdAt: new Date(p.created_at).getTime()
      })) : [];

      setPlaylists(cloudPlaylists);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(cloudPlaylists));
    } catch (e) {
      console.error('Playlist Cloud Sync Error:', e);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Update cloud whenever playlists change
  const updateCloud = useCallback(async (updatedPlaylists: Playlist[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        console.log('No user session found for playlist cloud update');
        return;
      }

      console.log('Syncing playlists to cloud...', updatedPlaylists.length);

      // Simplest way: upsert all playlists
      const upsertData = updatedPlaylists.map(p => ({
        user_id: user.id,
        local_id: p.id,
        name: p.name,
        color: p.color,
        song_urls: p.songUrls,
        created_at: new Date(p.createdAt).toISOString()
      }));

      const { error } = await supabase.from('playlists').upsert(upsertData, { onConflict: 'user_id,local_id' });
      if (error) console.error('Playlist Cloud Upsert Error:', error.message);
      else console.log('Playlist Cloud Sync Success!');

    } catch (e) {
      console.error('Playlist Cloud Update Exception:', e);
    }
  }, []);

  // Auto-sync on auth change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncWithCloud();
      if (event === 'SIGNED_OUT') {
        setPlaylists([]);
        AsyncStorage.removeItem(PLAYLISTS_KEY);
      }
    });
    
    syncWithCloud();
    return () => subscription.unsubscribe();
  }, [syncWithCloud]);

  const createPlaylist = useCallback((name: string, color: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substring(7),
      name,
      songUrls: [],
      color,
      createdAt: Date.now(),
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    updateCloud(updated);
    return newPlaylist;
  }, [playlists, updateCloud]);

  const deletePlaylist = useCallback(async (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    
    // Also delete from cloud
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('playlists').delete().eq('user_id', user.id).eq('local_id', id);
      }
    } catch (e) {}
  }, [playlists]);

  const addSongToPlaylist = useCallback((playlistId: string, songUrl: string) => {
    const updated = playlists.map((p) =>
      p.id === playlistId
        ? { ...p, songUrls: p.songUrls.includes(songUrl) ? p.songUrls : [...p.songUrls, songUrl] }
        : p
    );
    setPlaylists(updated);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    updateCloud(updated);
  }, [playlists, updateCloud]);

  const removeSongFromPlaylist = useCallback((playlistId: string, songUrl: string) => {
    const updated = playlists.map((p) =>
      p.id === playlistId
        ? { ...p, songUrls: p.songUrls.filter((url) => url !== songUrl) }
        : p
    );
    setPlaylists(updated);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    updateCloud(updated);
  }, [playlists, updateCloud]);

  const isSongInPlaylist = useCallback(
    (playlistId: string, songUrl: string) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      return playlist ? playlist.songUrls.includes(songUrl) : false;
    },
    [playlists]
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        isSongInPlaylist,
        syncWithCloud
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylistContext = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylistContext must be used within a PlaylistProvider');
  }
  return context;
};
