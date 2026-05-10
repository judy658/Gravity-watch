import { useState, useEffect, useCallback } from 'react';
import { supabaseAuth, supabaseData } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { youtubeService } from '../services/youtube';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@gravity_history';
const LIKES_KEY = '@gravity_likes';
const HOME_CACHE_KEY = '@gravity_home_cache';

export interface GravityData {
  session: Session | null;
  userProfile: any | null;
  stats: { subs: number; likes: number };
  videos: any[];
  likedVideos: any[];
  subFeedVideos: any[];
  historyVideos: any[];
  loading: boolean;
  loadingMore: boolean;
  loadingLikes: boolean;
  loadingSubs: boolean;
  error: string | null;
  fetchUserData: (session: Session) => Promise<void>;
  loadTrends: () => Promise<void>;
  loadMoreTrends: () => Promise<void>;
  loadLikedVideos: (forceRefresh?: boolean) => Promise<void>;
  loadSubscriptionFeed: (append?: boolean) => Promise<void>;
  loadMoreSubscriptionFeed: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<{ success: boolean; message?: string }>;
  searchVideos: (query: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  addToHistory: (video: any) => Promise<void>;
  toggleLocalLike: (video: any, isLiking: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useGravityData = (): GravityData => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({ subs: 0, likes: 0 });
  const [videos, setVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [subFeedVideos, setSubFeedVideos] = useState<any[]>([]);
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (sess: Session) => {
    console.log('--- [Gravity Data Sync] Başlatılıyor ---');
    const userEmail = sess.user.email;
    try {
      // profile
      let { data: profile, error: pErr } = await supabaseData
        .from('user_profiles')
        .select('*')
        .eq('user_email', userEmail)
        .single();
      if (pErr) {
        const { data: pData } = await supabaseData
          .from('user_profiles')
          .select('*')
          .eq('user_email', userEmail)
          .single();
        profile = pData;
      }
      setUserProfile(profile);

      // subs & likes counts
      const { count: subCount } = await supabaseData
        .from('local_subs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userEmail);

      const { count: likeCount } = await supabaseData
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userEmail);

      setStats({ subs: subCount ?? 0, likes: likeCount ?? 0 });
      console.log(`Veri Özeti: ${subCount ?? 0} Abonelik, ${likeCount ?? 0} Beğeni.`);
    } catch (e) {
      console.error('Supabase veri çekme hatası:', e);
    }
  }, []);

  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const loadTrends = useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem(HOME_CACHE_KEY);
        if (cached) setVideos(JSON.parse(cached));
      } catch (e) {}
    }
    
    setError(null);
    try {
      const { data: { session: currentSession } } = await supabaseAuth.auth.getSession();
      if (!currentSession) {
        setLoading(false);
        return;
      }
      const userEmail = currentSession.user.email;

      const { data: likes } = await supabaseData
        .from('user_interactions')
        .select('tags')
        .eq('user_id', userEmail)
        .limit(10);
      
      let interests: any = {};
      if (likes) {
        likes.forEach((item: any) => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((t: string) => {
              if (t !== 'general') interests[t] = (interests[t] || 0) + 1;
            });
          }
        });
      }

      const { data: subs } = await supabaseData
        .from('local_subs')
        .select('channel_name')
        .eq('user_id', userEmail)
        .limit(20);
      
      const subNames = subs ? subs.map((s: any) => s.channel_name) : [];

      const RENDER_URL = "https://gravity-watch-1.onrender.com";
      const response = await fetch(`${RENDER_URL}/api/home`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail 
        },
        body: JSON.stringify({
          page: append ? Math.floor(videos.length / 20) + 1 : 1,
          interests: interests,
          subscriptions: subNames,
          seen_ids: videos.map(v => v.id)
        })
      });
      
      const freshVideos = await response.json();

      if (Array.isArray(freshVideos) && freshVideos.length > 0) {
        const formatted = freshVideos.map(v => ({
          ...v,
          author: v.uploader || v.author,
          label: v.label || 'KEŞFET'
        }));

        if (append) {
          setVideos(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            return [...prev, ...formatted.filter(v => !existingIds.has(v.id))];
          });
        } else {
          setVideos(formatted);
          await AsyncStorage.setItem(HOME_CACHE_KEY, JSON.stringify(formatted));
        }
      }
    } catch (e) {
      console.error('Home feed error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videos.length]);

  const loadMoreTrends = useCallback(async () => {
    if (loading || loadingMore) return;
    await loadTrends(true);
  }, [loading, loadingMore, loadTrends]);

  const loadLikedVideos = useCallback(async (forceRefresh = false) => {
    setLoadingLikes(true);
    try {
      // 1. Read local first
      const stored = await AsyncStorage.getItem(LIKES_KEY);
      let localData = stored ? JSON.parse(stored) : [];
      setLikedVideos(localData);

      // 2. If empty or forced, fetch from cloud
      if (localData.length === 0 || forceRefresh) {
        const { data: { session: currentSession } } = await supabaseAuth.auth.getSession();
        if (!currentSession) return;
        const userEmail = currentSession.user.email;

        // Use the optimized backend endpoint that handles multiple IDs at once
        const RENDER_URL = "https://gravity-watch-1.onrender.com";
        const response = await fetch(`${RENDER_URL}/api/liked_videos?page=1`, {
          headers: { 'X-User-Email': userEmail }
        });
        const cloudLikes = await response.json();

        if (Array.isArray(cloudLikes) && cloudLikes.length > 0) {
          const formattedLikes = cloudLikes.map(v => ({
            ...v,
            author: v.uploader || v.author,
            label: 'BEĞENİLEN'
          }));
          
          await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(formattedLikes));
          setLikedVideos(formattedLikes);
        }
      }
    } catch (e) {
      console.error("Beğeniler çekilirken hata:", e);
    } finally {
      setLoadingLikes(false);
    }
  }, []);

  const loadSubscriptionFeed = useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    else setLoadingSubs(true);
    
    try {
      const { data: { session: currentSession } } = await supabaseAuth.auth.getSession();
      if (!currentSession) return;
      const userEmail = currentSession.user.email;

      const { data: subs } = await supabaseData
        .from('local_subs')
        .select('channel_name')
        .eq('user_id', userEmail);

      const subNames = subs ? subs.map((s: any) => s.channel_name) : [];

      const RENDER_URL = "https://gravity-watch-1.onrender.com";
      const response = await fetch(`${RENDER_URL}/api/home`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail 
        },
        body: JSON.stringify({
          page: append ? Math.floor(subFeedVideos.length / 20) + 1 : 1,
          subscriptions: subNames,
          subscriptions_only: true,
          seen_ids: subFeedVideos.map(v => v.id)
        })
      });
      
      const freshSubs = await response.json();

      if (Array.isArray(freshSubs) && freshSubs.length > 0) {
        const formatted = freshSubs.map(v => ({
          ...v,
          author: v.uploader || v.author,
          label: 'ABONELİK'
        }));

        if (append) {
          setSubFeedVideos(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            return [...prev, ...formatted.filter(v => !existingIds.has(v.id))];
          });
        } else {
          setSubFeedVideos(formatted);
        }
      }
    } catch (e) {
      console.error("Abonelik feed hatası:", e);
    } finally {
      setLoadingSubs(false);
      setLoadingMore(false);
    }
  }, [subFeedVideos.length]);

  const loadMoreSubscriptionFeed = useCallback(async () => {
    if (loadingSubs || loadingMore) return;
    await loadSubscriptionFeed(true);
  }, [loadingSubs, loadingMore, loadSubscriptionFeed]);

  const updateNickname = useCallback(async (newNickname: string) => {
    try {
      const { data: { session: currentSession } } = await supabaseAuth.auth.getSession();
      if (!currentSession) return { success: false, message: 'Oturum bulunamadı.' };
      const userEmail = currentSession.user.email;

      // 1. Benzersizlik kontrolü: Bu takma ad başka birine ait mi?
      const { data: existing } = await supabaseData
        .from('user_profiles')
        .select('user_email')
        .eq('nickname', newNickname)
        .neq('user_email', userEmail)
        .single();
        
      if (existing) {
        return { success: false, message: 'Bu takma ad zaten kullanılıyor, lütfen başka bir tane seçin.' };
      }

      // 2. Sorun yoksa güncelle (upsert)
      const { error } = await supabaseData
        .from('user_profiles')
        .upsert(
          { user_email: userEmail, nickname: newNickname, updated_at: new Date().toISOString() },
          { onConflict: 'user_email' }
        );

      if (error) {
        console.error("Nickname güncellenemedi:", error);
        return { success: false, message: 'Veritabanı hatası oluştu.' };
      }
      
      setUserProfile((prev: any) => ({ ...prev, nickname: newNickname }));
      return { success: true };
    } catch (e) {
      console.error("Nickname güncellenirken hata:", e);
      return { success: false, message: 'Sistemsel bir hata oluştu.' };
    }
  }, []);

  const searchVideos = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const results = await youtubeService.search(query);
      setVideos(results);
    } catch (e) {
      setError('Arama başarısız.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistoryVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error('History load error:', e);
    }
  }, []);

  const addToHistory = useCallback(async (video: any) => {
    if (!video || !video.id) return;
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      let history = stored ? JSON.parse(stored) : [];
      
      // Remove duplicate to move to top
      history = history.filter((v: any) => v.id !== video.id);
      
      const newItem = {
        id: video.id,
        title: video.title,
        author: video.author || video.uploader,
        thumbnail: video.thumbnail,
        label: 'GEÇMİŞ'
      };
      
      history.unshift(newItem);
      if (history.length > 50) history = history.slice(0, 50);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      setHistoryVideos(history);
    } catch (e) {
      console.error('History save error:', e);
    }
  }, []);

  const toggleLocalLike = useCallback(async (video: any, isLiking: boolean) => {
    if (!video || !video.id) return;
    try {
      const stored = await AsyncStorage.getItem(LIKES_KEY);
      let likes = stored ? JSON.parse(stored) : [];
      
      if (isLiking) {
        // Add to top if not exists
        if (!likes.find((v: any) => v.id === video.id)) {
          likes.unshift({
            id: video.id,
            title: video.title,
            author: video.author || video.uploader,
            thumbnail: video.thumbnail,
            label: 'BEĞENİLEN'
          });
        }
      } else {
        likes = likes.filter((v: any) => v.id !== video.id);
      }
      
      await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likes));
      setLikedVideos(likes);
    } catch (e) {
      console.error('Likes save error:', e);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    await searchVideos(query);
  }, [searchVideos]);

  const logout = useCallback(async () => {
    await supabaseAuth.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setStats({ subs: 0, likes: 0 });
    setVideos([]);
  }, []);

  // listen to auth changes
  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session).then(() => {
          // Trigger loadTrends after data is fetched
          setTimeout(() => loadTrends(), 500);
        });
      }
    });
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        fetchUserData(sess).then(() => {
          // Trigger loadTrends after data is fetched
          setTimeout(() => loadTrends(), 500);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    userProfile,
    stats,
    videos,
    likedVideos,
    subFeedVideos,
    historyVideos,
    loading,
    loadingMore,
    loadingLikes,
    loadingSubs,
    error,
    fetchUserData,
    loadTrends,
    loadMoreTrends,
    loadLikedVideos,
    loadSubscriptionFeed,
    loadMoreSubscriptionFeed,
    updateNickname,
    searchVideos,
    loadHistory,
    addToHistory,
    toggleLocalLike,
    handleSearch,
    logout,
  };
};
