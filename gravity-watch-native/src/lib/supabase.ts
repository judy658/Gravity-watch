import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStorage: Record<string, string> = {};

const CustomAsyncStorage = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn("[Storage] AsyncStorage hatası, hafızadan okunuyor:", key);
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("[Storage] AsyncStorage hatası, hafızaya yazılıyor.");
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },
};

// KAPI (Devstore) - Authentication için
const KAPI_URL = "https://jnuckqaiutmkiquptvzu.supabase.co";
const KAPI_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWNrcWFpdXRta2lxdXB0dnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDgzMTAsImV4cCI6MjA4ODk4NDMxMH0.sP_FoTrYOFWiIS7PdaFYtR1JbP5vGf_KLgc_jh7zhZY";

// EV (Gravity Watch) - Veriler için
const EV_URL = "https://nxpmocnezqsxhhsuwiiq.supabase.co";
const EV_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cG1vY25lenFzeGhoc3V3aWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTExMTUsImV4cCI6MjA5MzEyNzExNX0.52g_5VsgMdGaTJzghA3D__Ho58lnTBP8-prm8LReIdQ";

// Auth işlemleri (Kayıt/Giriş) bu client üzerinden yapılacak
export const supabaseAuth = createClient(KAPI_URL, KAPI_ANON_KEY, {
  auth: {
    storage: CustomAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Veri okuma/yazma (Abonelikler, Profil) bu client üzerinden yapılacak
export const supabaseData = createClient(EV_URL, EV_ANON_KEY, {
  auth: {
    storage: CustomAsyncStorage,
    storageKey: 'ev-auth-token', // KAPI token'ı ile çakışmaması için
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Geriye dönük uyumluluk için (şayet bir yerde sadece "supabase" kullanılıyorsa, Auth baz alınsın)
export const supabase = supabaseAuth;
