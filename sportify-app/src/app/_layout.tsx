import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Session } from '@supabase/supabase-js';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { supabase } from '@/lib/supabase';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { FavoriteProvider } from '@/context/FavoriteContext';
import { DownloadProvider } from '@/context/DownloadContext';
import { AudioProvider } from '@/context/AudioContext';
import { ThemeProvider as AppThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { usePresence } from '@/hooks/usePresence';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TermsAgreementModal, TERMS_STORE_KEY } from '@/components/TermsAgreementModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent({ session, initialized, hasAcceptedTerms, setHasAcceptedTerms }: any) {
  const { resolvedTheme } = useThemeContext();
  const segments = useSegments();
  const router = useRouter();

  // Auth redirection logic
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, initialized, segments]);

  return (
    <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <TermsAgreementModal 
        isVisible={!hasAcceptedTerms} 
        onAccept={() => setHasAcceptedTerms(true)} 
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(true); // Default to hide

  // Track global presence
  usePresence(session);

  useEffect(() => {
    // Check if terms are accepted
    AsyncStorage.getItem(TERMS_STORE_KEY).then(val => {
      if (val !== 'true') {
        setHasAcceptedTerms(false);
      }
    });

    // Initial session check with 5s timeout safety
    const initTimeout = setTimeout(() => {
      if (!initialized) {
        console.warn("Initialization timed out, proceeding...");
        setInitialized(true);
      }
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(initTimeout);
      setSession(session);
      setInitialized(true);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Handle splash screen hiding
  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignore if already hidden */
      });
    }
  }, [initialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AudioProvider>
          <DownloadProvider>
            <FavoriteProvider>
              <PlaylistProvider>
                <RootLayoutContent 
                  session={session}
                  initialized={initialized}
                  hasAcceptedTerms={hasAcceptedTerms}
                  setHasAcceptedTerms={setHasAcceptedTerms}
                />
              </PlaylistProvider>
            </FavoriteProvider>
          </DownloadProvider>
        </AudioProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
