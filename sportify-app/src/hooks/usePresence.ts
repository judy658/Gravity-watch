import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Device from 'expo-device';

export const usePresence = (session: Session | null) => {
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if this is the first ping of the session
  const isFirstPing = useRef(true);

  const updatePresence = async (isOnline: boolean) => {
    if (!session?.user?.email) return;

    try {
      // Security Check: Always check for ban and existing device info
      const { data: presenceData, error: fetchError } = await supabase
        .from('user_presence')
        .select('is_banned, first_device')
        .eq('email', session.user.email)
        .maybeSingle();

      if (presenceData && presenceData.is_banned === true) {
        console.log('[Presence] Account BANNED. Signing out...');
        await supabase.auth.signOut();
        return;
      }

      // Deletion check (only if not first ping)
      if (!isFirstPing.current && !presenceData && fetchError?.code === 'PGRST116') {
        console.log('[Presence] Account deleted from DB. Signing out...');
        await supabase.auth.signOut();
        return;
      }

        const deviceName = `${Device.brand || ''} ${Device.modelName || Device.deviceName || 'Mobil Cihaz'}`.trim();
        
        const upsertData: any = {
          user_id: session.user.id,
          email: session.user.email,
          last_seen: new Date().toISOString(),
          is_online: isOnline,
          is_dead: false,
          current_app: 'sportify',
          last_device: deviceName
        };

        // Eğer ilk cihaz bilgisi yoksa (yeni kullanıcı veya eski kayıt), doldur
        if (!presenceData || !presenceData.first_device) {
          upsertData.first_device = deviceName;
        }

        // Sadece ilk kayıt hiç yoksa created_at ekle
        if (isFirstPing.current && !presenceData) {
          upsertData.created_at = new Date().toISOString();
        }

        await supabase
          .from('user_presence')
          .upsert(upsertData, { 
            onConflict: 'email'
          });

      isFirstPing.current = false;
      isFirstPing.current = false;
    } catch (err) {
      console.error('[Presence] Unexpected error:', err);
    }
  };

  useEffect(() => {
    if (!session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }


    // Initial ping
    updatePresence(true);

    // Heartbeat every 30 seconds
    intervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        updatePresence(true);
      }
    }, 30000);

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      subscription.remove();
    };
  }, [session?.user?.id]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      updatePresence(true);
    } else if (nextAppState.match(/inactive|background/)) {
      updatePresence(false);
    }
    appState.current = nextAppState;
  };
};
