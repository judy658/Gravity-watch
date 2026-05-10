import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const FAVORITES_KEY = 'sportify_favorites';

interface FavoriteContextType {
  favorites: string[];
  isFavorite: (url: string) => boolean;
  toggleFavorite: (url: string) => void;
  syncWithCloud: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const isSyncingRef = useRef(false);

  // Load local favorites first for speed
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const saved = await AsyncStorage.getItem(FAVORITES_KEY);
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) {}
    };
    loadLocal();
  }, []);

  // Function to sync with Supabase cloud
  const syncWithCloud = useCallback(async () => {
    if (isSyncingRef.current) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No user, clear state just in case
        setFavorites([]);
        return;
      }

      isSyncingRef.current = true;
      const { data, error } = await supabase
        .from('favorites')
        .select('song_url')
        .eq('user_id', user.id);

      if (error) throw error;

      // Cloud data is the absolute truth
      const cloudFavorites = data ? data.map(f => f.song_url) : [];
      setFavorites(cloudFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(cloudFavorites));
    } catch (e) {
      console.error('Cloud Sync Error:', e);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Auto-sync and CLEAR on auth change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth Event:', event);
      if (event === 'SIGNED_IN') {
        syncWithCloud();
      }
      if (event === 'SIGNED_OUT') {
        // IMMEDIATE CLEARING - CRITICAL
        setFavorites([]);
        AsyncStorage.removeItem(FAVORITES_KEY).catch(() => {});
      }
    });
    
    // Check initial session
    syncWithCloud();

    return () => subscription.unsubscribe();
  }, [syncWithCloud]);

  const isFavorite = useCallback(
    (url: string) => favorites.includes(url),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (url: string) => {
      console.log('🚨 KAPTAN: toggleFavorite BUTONUNA BASILDI! URL:', url);
      const isRemoving = favorites.includes(url);
      
      // 1. Update UI instantly
      setFavorites((prev) =>
        isRemoving ? prev.filter((u) => u !== url) : [...prev, url]
      );

      // 2. Update Local Storage
      try {
        const newFavs = isRemoving ? favorites.filter((u) => u !== url) : [...favorites, url];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
      } catch (e) {}

      // 3. Update Cloud if logged in
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          console.log(isRemoving ? 'Removing from cloud...' : 'Adding to cloud...', url);
          if (isRemoving) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('song_url', url);
            if (error) console.error('Cloud Delete Error:', error.message);
          } else {
            const { error } = await supabase.from('favorites').insert({ user_id: user.id, song_url: url });
            if (error) console.error('Cloud Insert Error:', error.message);
          }
        } else {
          console.log('No user session found for cloud sync');
        }
      } catch (e) {
        console.error('Cloud Update Exception:', e);
      }
    },
    [favorites]
  );

  const value = {
    favorites,
    isFavorite,
    toggleFavorite,
    syncWithCloud
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};

export const useFavoriteContext = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavoriteContext must be used within a FavoriteProvider');
  }
  return context;
};
