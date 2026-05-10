import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { 
  createAudioPlayer, 
  setAudioModeAsync, 
  AudioPlayer,
  AudioStatus,
  AudioMetadata
} from 'expo-audio';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { SONGS, Song } from '@/constants/songs';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  rate: number;
  shouldCorrectPitch: boolean;
  volume: number;
  spatialMode: 'off' | 'small_room' | 'concert_hall';
  spatialDelay: number;
  spatialVolume: number;
  positionX: SharedValue<number>;
  durationX: SharedValue<number>;
  is8DActive: boolean;
  setIs8DActive: (active: boolean) => void;
  rotationSpeed: number;
  setRotationSpeed: (speed: number) => void;
  
  playSong: (song: Song, localUri?: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seek: (value: number) => Promise<void>;
  changeRate: (newRate: number, corrPitch?: boolean) => Promise<void>;
  changeVolume: (value: number) => Promise<void>;
  setSpatialMode: (mode: 'off' | 'small_room' | 'concert_hall') => void;
  setSpatialDelay: (delay: number) => void;
  setSpatialVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// GLOBAL TRACKER for all created players (to combat orphaned notifications)
const globalPlayersRegistry = new Set<AudioPlayer>();

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const ghostPlayerRef = useRef<AudioPlayer | null>(null);
  const expectedUrlRef = useRef<string | null>(null);
  
  // Agresif Temizlik Motoru
  const killAllPlayers = useCallback(async () => {
    // 1. Ghost player'ı hemen sustur ve temizle
    if (ghostPlayerRef.current) {
      try {
        ghostPlayerRef.current.setActiveForLockScreen(false);
        ghostPlayerRef.current.pause();
        ghostPlayerRef.current.remove();
      } catch (e) {}
      ghostPlayerRef.current = null;
    }

    // 2. Main player'ı temizle
    if (playerRef.current) {
      try {
        playerRef.current.setActiveForLockScreen(false);
        playerRef.current.replaceMetadata({});
        playerRef.current.pause();
        playerRef.current.remove();
      } catch (e) {}
      playerRef.current = null;
    }

    // 3. Kayıtlı tüm başıboş çalarları yok et
    globalPlayersRegistry.forEach(p => {
      try {
        p.setActiveForLockScreen(false);
        p.replaceMetadata({});
        p.pause();
        p.remove();
      } catch (e) {}
    });
    globalPlayersRegistry.clear();
    
    setPlayer(null);
  }, []);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [rate, setRate] = useState(1.0);
  const [shouldCorrectPitch, setShouldCorrectPitch] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [spatialMode, setSpatialMode] = useState<'off' | 'small_room' | 'concert_hall'>('off');
  const [spatialDelay, setSpatialDelay] = useState(50); // Default echo delay
  const [spatialVolume, setSpatialVolume] = useState(0.35); // Default echo volume multiplier
  
  // 8D Audio States
  const [is8DActive, setIs8DActive] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.05); // 0.01 - 0.2
  const rotationAngle = useRef(0);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);

  // SHARED VALUES FOR ZERO-RENDER UPDATES
  const positionX = useSharedValue(0);
  const durationX = useSharedValue(0);

  // REFS for internal logic
  const currentSongRef = useRef(currentSong);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const rateRef = useRef(rate);
  const volumeRef = useRef(volume);
  const spatialModeRef = useRef(spatialMode);
  const spatialDelayRef = useRef(spatialDelay);
  const spatialVolumeRef = useRef(spatialVolume);
  const ghostPlayerRef = useRef<AudioPlayer | null>(null);
  const spatialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { spatialModeRef.current = spatialMode; }, [spatialMode]);
  useEffect(() => { spatialDelayRef.current = spatialDelay; }, [spatialDelay]);
  useEffect(() => { spatialVolumeRef.current = spatialVolume; }, [spatialVolume]);
  useEffect(() => { spatialDelayRef.current = spatialDelay; }, [spatialDelay]);
  useEffect(() => { spatialVolumeRef.current = spatialVolume; }, [spatialVolume]);

  // INITIALIZE BACKGROUND AUDIO MODE (Safe Default)
  useEffect(() => {
    const initAudioMode = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: false, // Start with false
          interruptionModeAndroid: 'doNotMix',
          interruptionModeIOS: 'doNotMix',
          playsInSilentModeIOS: true,
          shouldRouteThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
        });
      } catch (e) {
        console.error('Audio Mode Init Error:', e);
      }
    };
    initAudioMode();
  }, []);

  // DYNAMIC BACKGROUND MODE (The Key for Android 10)
  useEffect(() => {
    setAudioModeAsync({ shouldPlayInBackground: isPlaying }).catch(() => {});
  }, [isPlaying]);

  // 🌀 8D ROTATION MOTOR
  useEffect(() => {
    let interval: any = null;
    
    if (is8DActive && isPlaying && playerRef.current) {
      console.log("🌀 8D Motoru Başlatıldı, Hız:", rotationSpeed);
      
      interval = setInterval(() => {
        if (!playerRef.current) return;
        
        rotationAngle.current += rotationSpeed;
        const panValue = Math.sin(rotationAngle.current);
        
        try {
          const players = [playerRef.current, ghostPlayerRef.current].filter(Boolean);
          
          players.forEach((p: any) => {
            // 1. Yazılımsal Mesafe Simülasyonu (Ses uzaklaşıp yakınlaşıyor gibi)
            // Volume 0.7 ile 1.0 arasında gidip gelsin
            const breathingVolume = 0.85 + (Math.cos(rotationAngle.current) * 0.15);
            p.volume = breathingVolume;

            // 2. Yalın Pan Komutları (Sadece sayı gönderiyoruz)
            if ('pan' in p) p.pan = panValue;
            if ('stereoPan' in p) p.stereoPan = panValue;
            
            // Metot olarak deneme
            if (typeof p.setPan === 'function') p.setPan(panValue);
            if (typeof p.setStereoPan === 'function') p.setStereoPan(panValue);
          });
        } catch (e) {
          // Hata olsa bile sessizce devam et
        }
      }, 50);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("🌀 8D Motoru Durduruldu");
      }
      if (playerRef.current) {
        try {
          if (typeof (playerRef.current as any).setPan === 'function') {
            (playerRef.current as any).setPan(0);
          } else {
            (playerRef.current as any).pan = 0;
          }
        } catch (e) {}
      }
      if (ghostPlayerRef.current) {
        try {
          if (typeof (ghostPlayerRef.current as any).setPan === 'function') {
            (ghostPlayerRef.current as any).setPan(0);
          } else {
            (ghostPlayerRef.current as any).pan = 0;
          }
        } catch (e) {}
      }
    };
  }, [is8DActive, isPlaying, rotationSpeed]);

  // Use a ref for isPlaying to avoid stale closures in the listener
  const isPlayingRef = useRef(false);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Debounce guard for playSong
  const isLoadingRef = useRef(false);

  const handlePlaybackStatusUpdate = useCallback((status: AudioStatus) => {
    // expo-audio uses seconds, convert to milliseconds for existing UI/SharedValues
    positionX.value = status.currentTime * 1000;
    durationX.value = status.duration * 1000;
    
    // Use ref to compare, not stale closure state
    if (status.playing !== isPlayingRef.current) {
      setIsPlaying(status.playing);
    }
    
    if (status.didJustFinish) {
      if (repeatModeRef.current === 'one') {
        const song = currentSongRef.current;
        if (song) playSong(song);
      } else {
        playNext();
      }
    }
  }, []);

  const playSong = async (song: Song, localUri?: string) => {
    // Guard: prevent double-tap race condition
    if (isLoadingRef.current) return;
    
    try {
      const playUri = localUri || song.url;
      
      // If same song is already playing, just restart from beginning
      if (playerRef.current && expectedUrlRef.current === playUri && isPlayingRef.current) {
        try {
          await playerRef.current.seekTo(0);
        } catch (e) {}
        return;
      }
      
      isLoadingRef.current = true;
      expectedUrlRef.current = playUri;

      setCurrentSong(song);
      setIsPlaying(true);
      positionX.value = 0;
      durationX.value = 0;

      // Kayıtlı tüm eski çalarları ve hayaletleri KESİN olarak temizle
      await killAllPlayers();

      // Small delay for native cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (expectedUrlRef.current !== playUri) {
        isLoadingRef.current = false;
        return;
      }

      try {
        const newPlayer = createAudioPlayer(playUri, { updateInterval: 100 });
        globalPlayersRegistry.add(newPlayer); // Register new player

        newPlayer.setPlaybackRate(rateRef.current);
        newPlayer.volume = volumeRef.current;
        newPlayer.shouldCorrectPitch = true;

        // Set Lock Screen Metadata
        const metadata: AudioMetadata = {
          title: song.title,
          artist: song.artist,
          albumTitle: "Sportify Premium",
          artworkUrl: song.artwork || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500"
        };
        
        // Activate lock screen FIRST, so the native session exists before playback starts
        try {
          const lockScreenOptions: any = {
            showSeekForward: true,
            showSeekBackward: true,
            showPlayPause: true,
            showSkipForward: true,
            showSkipBackward: true
          };
          newPlayer.setActiveForLockScreen(true, metadata, lockScreenOptions);
        } catch (e) {}

        // Add Status Listener
        newPlayer.addListener('playbackStatusUpdate', handlePlaybackStatusUpdate);

        playerRef.current = newPlayer;
        setPlayer(newPlayer);
        
        // Play AFTER lock screen is active to trigger the PLAYING state in MediaSession
        newPlayer.play();

        // Spatial audio logic (Ghost sound)
        if (spatialModeRef.current !== 'off') {
          const delay = spatialDelayRef.current;
          const ghostVolume = volumeRef.current * spatialVolumeRef.current;
            
          if (spatialTimeoutRef.current) clearTimeout(spatialTimeoutRef.current);
          spatialTimeoutRef.current = setTimeout(() => {
            if (expectedUrlRef.current !== playUri) return;
            try {
              const ghostPlayer = createAudioPlayer(playUri);
              globalPlayersRegistry.add(ghostPlayer); // Register ghost
              // Hayalet çalar bildirim panelinde ASLA gözükmemeli
              ghostPlayer.setActiveForLockScreen(false); 
              
              ghostPlayer.volume = ghostVolume;
              ghostPlayer.setPlaybackRate(rateRef.current);
              ghostPlayer.play();
              ghostPlayerRef.current = ghostPlayer;
              spatialTimeoutRef.current = null;
            } catch (e) {}
          }, delay);
        }
      } catch (error) {
        console.error('Audio player init error:', error);
        if (expectedUrlRef.current === playUri) setIsPlaying(false);
      } finally {
        isLoadingRef.current = false;
      }

    } catch (error) {
      setIsPlaying(false);
      isLoadingRef.current = false;
    }
  };

  const togglePlayback = async () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pause();
        if (ghostPlayerRef.current) ghostPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        if (ghostPlayerRef.current) ghostPlayerRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {}
  };

  const playNext = useCallback(() => {
    const current = currentSongRef.current;
    if (!current) return;
    
    const currentIndex = SONGS.findIndex(s => s.url === current.url);
    const nextIndex = isShuffleRef.current 
      ? Math.floor(Math.random() * SONGS.length) 
      : (currentIndex + 1) % SONGS.length;
      
    playSong(SONGS[nextIndex]);
  }, []);

  const playPrevious = useCallback(() => {
    const current = currentSongRef.current;
    if (!current) return;
    
    const currentIndex = SONGS.findIndex(s => s.url === current.url);
    const prevIndex = (currentIndex - 1 + SONGS.length) % SONGS.length;
    playSong(SONGS[prevIndex]);
  }, []);

  const toggleShuffle = () => setIsShuffle(p => !p);
  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIdx + 1) % modes.length]);
  };

  const seek = async (value: number) => {
    if (playerRef.current) {
      const seekPos = value / 1000;
      // Ana çaları kaydır
      await playerRef.current.seekTo(seekPos);
      
      // Hayalet çaları (yankı) da gecikme payını koruyarak kaydır
      if (ghostPlayerRef.current) {
        const delayInSec = spatialDelayRef.current / 1000;
        // Yankı, ana çalardan 'delay' kadar geride olmalı
        const ghostSeekPos = Math.max(0, seekPos - delayInSec);
        await ghostPlayerRef.current.seekTo(ghostSeekPos);
      }
    }
  };

  const changeRate = async (newRate: number, corrPitch = true) => {
    setRate(newRate);
    setShouldCorrectPitch(corrPitch);
    rateRef.current = newRate;
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(newRate);
      playerRef.current.shouldCorrectPitch = corrPitch;
    }
    // Also update ghost player so spatial echo matches the vibe mode
    if (ghostPlayerRef.current) {
      ghostPlayerRef.current.setPlaybackRate(newRate);
      ghostPlayerRef.current.shouldCorrectPitch = corrPitch;
    }
  };

  const changeVolume = async (v: number) => {
    setVolume(v);
    if (playerRef.current) playerRef.current.volume = v;
    if (ghostPlayerRef.current) {
       ghostPlayerRef.current.volume = v * spatialVolumeRef.current;
    }
  };

  // Instantly applies spatial mode change to the currently playing track
  const applySpatialMode = async (mode: 'off' | 'small_room' | 'concert_hall') => {
    setSpatialMode(mode);
    spatialModeRef.current = mode;

    if (mode === 'off') {
      // Kill ghost player immediately
      if (ghostPlayerRef.current) {
        try {
          ghostPlayerRef.current.pause();
          ghostPlayerRef.current.remove();
        } catch (e) {}
        ghostPlayerRef.current = null;
      }
      return;
    }

    // If a song is playing, start or update ghost player right now
    const song = currentSongRef.current;
    const mainPlayer = playerRef.current;
    if (!song || !mainPlayer) return;

    const playUri = song.url;
    const currentPositionSec = positionX.value / 1000;
    
    // Auto-set defaults based on mode if user hasn't customized yet
    if (mode === 'small_room') {
      setSpatialDelay(20);
      setSpatialVolume(0.4);
    } else if (mode === 'concert_hall') {
      setSpatialDelay(70);
      setSpatialVolume(0.3);
    }

    const delay = spatialDelayRef.current;
    const ghostVolume = volumeRef.current * spatialVolumeRef.current;

    // Remove existing ghost if switching between spatial modes
    if (ghostPlayerRef.current) {
      try {
        ghostPlayerRef.current.pause();
        ghostPlayerRef.current.remove();
      } catch (e) {}
      ghostPlayerRef.current = null;
    }

    // Create new ghost player synced to current position + delay
    setTimeout(async () => {
      // Make sure spatial mode hasn't changed again or song hasn't changed
      if (spatialModeRef.current !== mode || currentSongRef.current?.url !== playUri) return;
      try {
        const ghostPlayer = createAudioPlayer(playUri);
        ghostPlayer.volume = ghostVolume;
        ghostPlayer.setPlaybackRate(rateRef.current);
        ghostPlayer.shouldCorrectPitch = shouldCorrectPitch; // Match vibe mode
        // Sync to main player position
        await ghostPlayer.seekTo(currentPositionSec);
        if (isPlayingRef.current) ghostPlayer.play();
        ghostPlayerRef.current = ghostPlayer;
      } catch (e) {}
    }, delay);
  };

  const setSpatialDelayValue = (val: number) => {
    setSpatialDelay(val);
    spatialDelayRef.current = val;
    // If spatial is on, we might need to restart ghost to apply delay properly
    // but for now let's just let it apply on next song or mode toggle
  };

  const setSpatialVolumeValue = (val: number) => {
    setSpatialVolume(val);
    spatialVolumeRef.current = val;
    if (ghostPlayerRef.current) {
      ghostPlayerRef.current.volume = volumeRef.current * val;
    }
  };

  // APP STATE HANDLER: Uygulama arka plana geçtiğinde/kapatıldığında temizlik yap
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 AppState Değişti:', nextAppState);
      
      // Eğer uygulama arka plana geçiyorsa veya inaktif oluyorsa VE müzik çalmıyorsa
      // Bildirim panelindeki kontrolü temizle (Asılı kalmaması için)
      if (nextAppState.match(/inactive|background/)) {
        if (!isPlayingRef.current && playerRef.current) {
          console.log('🧹 Arka plan temizliği: Bildirim paneli kapatılıyor...');
          playerRef.current.setActiveForLockScreen(false);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spatialTimeoutRef.current) clearTimeout(spatialTimeoutRef.current);

      // GLOBAL TEMİZLİK: Kayıtlı tüm çalarları yok et ve bildirimleri kapat
      globalPlayersRegistry.forEach(p => {
        try {
          p.setActiveForLockScreen(false);
          p.replaceMetadata({});
          p.pause();
          p.remove();
        } catch (e) {}
      });
      globalPlayersRegistry.clear();

      playerRef.current = null;
      ghostPlayerRef.current = null;

      // ARKA PLANI KESİN OLARAK KAPAT
      setAudioModeAsync({ 
        shouldPlayInBackground: false,
        interruptionModeAndroid: 'doNotMix',
        interruptionModeIOS: 'doNotMix',
      }).catch(() => {});
    };
  }, []);


  return (
    <AudioContext.Provider value={{
      currentSong, isPlaying, isShuffle, repeatMode, rate, shouldCorrectPitch, volume, spatialMode,
      spatialDelay, spatialVolume,
      is8DActive, setIs8DActive,
      rotationSpeed, setRotationSpeed,
      positionX, durationX, playSong, togglePlayback, playNext, playPrevious,
      toggleShuffle, toggleRepeat, seek, changeRate, changeVolume, setSpatialMode: applySpatialMode,
      setSpatialDelay: setSpatialDelayValue, setSpatialVolume: setSpatialVolumeValue
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioContext must be used within AudioProvider');
  return context;
};
