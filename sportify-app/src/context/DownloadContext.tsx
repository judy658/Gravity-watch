import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { 
  documentDirectory, 
  cacheDirectory, 
  makeDirectoryAsync, 
  getInfoAsync, 
  createDownloadResumable, 
  deleteAsync 
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '@/constants/songs';

const DOWNLOADS_KEY = 'sportify_downloads';

// Helper to get consistent download directory
const getDownloadDir = () => {
  // documentDirectory null ise cacheDirectory'ye fallback yap
  let root = documentDirectory;
  if (!root) {
    console.warn('documentDirectory null, cacheDirectory deneniyor...');
    root = cacheDirectory;
  }
  
  // EĞER HALA NULL İSE (Canary sürümü hatası): Android için manuel yol tanımla
  if (!root && Platform.OS === 'android') {
    console.warn('Expo dizinleri NULL, manuel yol (Hard Fallback) kullanılıyor.');
    root = 'file:///data/user/0/com.judy638.sportifyappnative/files/';
  }
  
  if (!root || Platform.OS === 'web') return null;
  
  // Yolun doğru formatlandığından emin ol
  const cleanRoot = root.endsWith('/') ? root : `${root}/`;
  return `${cleanRoot}downloads/`;
};

interface DownloadContextType {
  downloadedUrls: string[];
  isDownloaded: (url: string) => boolean;
  downloadSong: (song: Song) => Promise<void>;
  removeDownload: (url: string) => Promise<void>;
  isDownloading: Record<string, boolean>;
  getLocalUri: (url: string) => string;
  clearAllDownloads: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadedUrls, setDownloadedUrls] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  const ensureDir = async (): Promise<{ success: boolean; error?: string }> => {
    const dir = getDownloadDir();
    if (!dir) {
      if (Platform.OS === 'web') return { success: false, error: 'Web üzerinde dosya sistemi erişimi yok.' };
      const docDir = documentDirectory ? 'Mevcut' : 'NULL';
      const cacheDir = cacheDirectory ? 'Mevcut' : 'NULL';
      return { 
        success: false, 
        error: `Cihazın ana dizini bulunamadı.\n(DocDir: ${docDir}, CacheDir: ${cacheDir})` 
      };
    }

    try {
      const dirInfo = await getInfoAsync(dir);
      
      if (dirInfo.exists) {
        if (dirInfo.isDirectory) {
          return { success: true };
        } else {
          // It exists but it's a file, we need to delete it first
          console.warn('Downloads bir dosya olarak mevcut, klasöre dönüştürülüyor:', dir);
          await deleteAsync(dir);
        }
      }

      console.log('İndirme klasörü oluşturuluyor:', dir);
      await makeDirectoryAsync(dir, { intermediates: true });
      
      // Re-verify after creation
      const verify = await getInfoAsync(dir);
      if (!verify.exists || !verify.isDirectory) {
        return { 
          success: false, 
          error: `Klasör oluşturulamadı veya erişilemiyor. (Yol: ${dir.split('/').pop() || '...'}/)` 
        };
      }
      
      return { success: true };
    } catch (e: any) {
      console.error('ensureDir Error:', e);
      return { 
        success: false, 
        error: `Sistem Hatası: ${e.message || 'Bilinmiyor'}\nKlasör: ${dir.split('/').pop()}/` 
      };
    }
  };

  // Initialize directory on Native
  useEffect(() => {
    ensureDir();
  }, []);

  // Load downloads list
  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const saved = await AsyncStorage.getItem(DOWNLOADS_KEY);
        if (saved) {
          setDownloadedUrls(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load downloads list', e);
      }
    };
    loadDownloads();
  }, []);

  // Save downloads list
  useEffect(() => {
    const saveDownloads = async () => {
      try {
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloadedUrls));
      } catch (e) {
        console.error('Failed to save downloads list', e);
      }
    };
    saveDownloads();
  }, [downloadedUrls]);

  const getLocalUri = useCallback((url: string) => {
    const dir = getDownloadDir();
    if (Platform.OS === 'web' || !dir) return url;
    
    // Sanitize filename
    const baseUrl = url.split('?')[0]; 
    const rawFilename = baseUrl.split('/').pop() || 'song.mp3';
    const filename = rawFilename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return `${dir}${filename}`;
  }, []);

  const isDownloaded = useCallback(
    (url: string) => downloadedUrls.includes(url),
    [downloadedUrls]
  );

  const downloadSong = async (song: Song) => {
    if (isDownloaded(song.url)) {
      Alert.alert('Zaten İndirildi', 'Bu şarkı zaten cihazınızda mevcut.');
      return;
    }
    
    setIsDownloading(prev => ({ ...prev, [song.url]: true }));
    
    if (Platform.OS !== 'web') {
      Alert.alert('İndiriliyor', `${song.title} indirilmeye başlandı...`);
    }

    try {
      if (Platform.OS === 'web') {
        setDownloadedUrls(prev => [...prev, song.url]);
      } else {
        // Double check directory exists
        const dirStatus = await ensureDir();
        if (!dirStatus.success) {
          throw new Error(dirStatus.error || 'İndirme klasörü hazır değil.');
        }

        const localUri = getLocalUri(song.url);
        
        // Create download resumable
        const downloadResumable = createDownloadResumable(
          song.url,
          localUri,
          {},
          (downloadProgress) => {
            // Optional: Track progress if needed in UI
            // const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          }
        );

        const result = await downloadResumable.downloadAsync();
        
        if (result && result.status >= 200 && result.status < 300) {
          // Double check the file was actually written where we expect
          const fileCheck = await getInfoAsync(localUri);
          if (fileCheck.exists && fileCheck.size > 0) {
            setDownloadedUrls(prev => [...prev, song.url]);
            Alert.alert('Tamamlandı', `${song.title} başarıyla indirildi. ✨`);
          } else {
            throw new Error('Dosya indirildi görünüyor ancak cihazda bulunamadı.');
          }
        } else {
          const status = result?.status || 'Bilinmiyor';
          throw new Error(`İndirme başarısız oldu (Kod: ${status}).`);
        }
      }
    } catch (e: any) {
      console.error('Download execution error:', e);
      Alert.alert('İndirme Hatası', `İşlem tamamlanamadı.\n\n${e.message}`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [song.url]: false }));
    }
  };

  const clearAllDownloads = async () => {
    try {
      if (Platform.OS !== 'web') {
        const dir = getDownloadDir();
        if (dir) {
          const dirInfo = await getInfoAsync(dir);
          if (dirInfo.exists) {
            await deleteAsync(dir);
            await makeDirectoryAsync(dir, { intermediates: true });
          }
        }
      }
      setDownloadedUrls([]);
      Alert.alert('Temizlendi', 'Tüm indirilen şarkılar cihazınızdan silindi.');
    } catch (e: any) {
      console.error('Failed to clear all downloads', e);
      Alert.alert('Hata', 'İndirmeler temizlenirken bir hata oluştu.');
    }
  };

  const removeDownload = async (url: string) => {
    try {
      if (Platform.OS !== 'web') {
        const localUri = getLocalUri(url);
        const fileInfo = await getInfoAsync(localUri);
        if (fileInfo.exists) {
          await deleteAsync(localUri);
          Alert.alert('Silindi', 'Şarkı cihazınızdan kaldırıldı.');
        }
      }
      setDownloadedUrls(prev => prev.filter(u => u !== url));
    } catch (e: any) {
      console.error('Failed to remove download', e);
      Alert.alert('Hata', `Dosya silinirken bir hata oluştu: ${e.message}`);
    }
  };

  const value = {
    downloadedUrls,
    isDownloaded,
    downloadSong,
    removeDownload,
    isDownloading,
    getLocalUri,
    clearAllDownloads
  };

  return <DownloadContext.Provider value={value}>{children}</DownloadContext.Provider>;
};

export const useDownloadContext = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownloadContext must be used within a DownloadProvider');
  }
  return context;
};
