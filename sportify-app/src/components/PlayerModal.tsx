import React from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  Platform,
  StatusBar,
  Share,
  Image
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  useAnimatedReaction,
  runOnJS,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Song } from '@/constants/songs';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDownloads } from '@/hooks/useDownloads';
import { useAlbumArt } from '@/hooks/useAlbumArt';
import { useDownloadContext } from '@/context/DownloadContext';
import { Visualizer } from './Visualizer';
import { LyricsView } from './LyricsView';
import { useLyrics } from '@/hooks/useLyrics';
import { AnimatedTimeText } from './AnimatedTimeText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  positionX: any; // SharedValue<number>
  durationX: any; // SharedValue<number>
  onSeek: (value: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenSoundLab: () => void;
  onOpenOptions: () => void;
  playbackRate?: number;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  song,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  positionX,
  durationX,
  onSeek,
  isFavorite,
  onToggleFavorite,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  onOpenSoundLab,
  onOpenOptions,
  playbackRate = 1.0,
}) => {
  const theme = useTheme();
  const { isDownloaded, downloadSong, removeDownload, isDownloading } = useDownloads();
  const { getLocalUri } = useDownloadContext();
  
  // Şarkı indirilmişse yerel yolu, değilse uzak URL'i kullan
  const currentUrl = song ? (isDownloaded(song.url) ? getLocalUri(song.url) : song.url) : null;
  const { albumArt, isLoading: artLoading } = useAlbumArt(currentUrl);
  
  const [imageError, setImageError] = React.useState(false);
  const [showLyrics, setShowLyrics] = React.useState(false);

  // Slider thumb position (0-100), synced from SharedValue when not scrubbing
  const [sliderValue, setSliderValue] = React.useState(0);
  const isSeekingRef = useRef(false);

  // Bridge SharedValue → React state for slider thumb (runs on UI thread)
  // Guard: only compute when duration is actually loaded (> 1000ms = 1 second)
  useAnimatedReaction(
    () => {
      const pos = positionX.value || 0;
      const dur = durationX.value;
      if (dur < 1000) return -1; // sentinel: duration not yet loaded
      return Math.min(100, Math.max(0, (pos / dur) * 100));
    },
    (progress) => {
      if (!isSeekingRef.current && progress >= 0) {
        runOnJS(setSliderValue)(progress);
      }
    }
  );

  // Lyrics Sync Logic (GPU Accelerated)
  const { currentIndex, activeIndexSV, activeLyrics, isSearching } = useLyrics(song, positionX, isOpen);

  // Şarkı değiştiğinde hata durumunu sıfırla
  React.useEffect(() => {
    setImageError(false);
    // Reset slider to 0 on song change
    setSliderValue(0);
  }, [song?.url]);


  const handleShare = async () => {
    if (!song) return;
    try {
      await Share.share({
        message: `Şu an Dinliyorum: ${song.title} - ${song.artist}\n\nSen de indirmek veya Sportify'a göz atmak istersen tıkla:\nhttps://judy658.github.io/judy658-devstore/`,
      });
    } catch (error) {
      console.error('Error sharing song:', error);
    }
  };

  const handleDownload = async () => {
    if (!song) return;
    if (isDownloaded(song.url)) {
      removeDownload(song.url);
    } else {
      downloadSong(song);
    }
  };

  const insets = useSafeAreaInsets();

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withSpring(isOpen ? 0 : SCREEN_HEIGHT, { damping: 20, stiffness: 90 }) }
      ],
      opacity: isOpen ? 1 : withTiming(0, { duration: 300 }),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpen ? 0.15 : 0, { duration: 300 }),
    };
  });

  // No longer needed - Slider handles its own track fill natively

  if (!song) return null;

  const isDl = isDownloaded(song.url);
  const isDlLoading = isDownloading[song.url];

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: theme.background }, animatedStyle]}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.glow, { backgroundColor: theme.accent }, glowStyle]} />

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={30} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>ŞİMDİ ÇALIYOR</ThemedText>
          <TouchableOpacity 
            onPress={() => setShowLyrics(!showLyrics)} 
            style={[styles.headerButton, showLyrics && { backgroundColor: theme.accent + '30', borderRadius: 12 }]}
          >
            <Ionicons name="text" size={24} color={showLyrics ? theme.accent : theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.artworkContainer}>
          {showLyrics && isOpen ? (
            <LyricsView 
              lyrics={activeLyrics} 
              currentIndex={currentIndex} // Scrolling (JS)
              activeIndexSV={activeIndexSV} // Highlighting (GPU)
              isSearching={isSearching}
              theme={theme}
              songTitle={song.title}
              artist={song.artist}
              isVisible={isOpen && showLyrics}
            />
          ) : (
            <View style={[styles.artwork, { backgroundColor: theme.card, shadowColor: theme.accent, overflow: 'hidden' }]}>
               {albumArt && !imageError ? (
                 <Image 
                   source={{ uri: albumArt }} 
                   style={styles.artworkImage}
                   resizeMode="cover"
                   onError={() => setImageError(true)}
                 />
               ) : (
                 <Ionicons name="musical-notes" size={100} color={theme.accent} />
               )}
               
               {!imageError && song.cover && (
                  <View style={[styles.logoBadge, { borderColor: theme.accent, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                     <ThemedText style={[styles.logoText, { color: theme.accent }]}>Sportify Premium</ThemedText>
                  </View>
               )}
 
               {(imageError || !song.cover) && (
                  <View style={[styles.logoBadge, { borderColor: theme.accent }]}>
                     <ThemedText style={[styles.logoText, { color: theme.accent }]}>Sportify Premium</ThemedText>
                  </View>
               )}
            </View>
          )}
        </View>

        {/* Visualizer */}
        <View style={styles.visualizerContainer}>
          <Visualizer
            isPlaying={isPlaying}
            isVisible={isOpen}
            playbackRate={playbackRate}
            accentColor={theme.accent}
            barCount={15}
            height={55}
          />
        </View>

        {/* Title & Artist Section */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
              <ThemedText style={styles.songArtist} numberOfLines={1}>{song.artist}</ThemedText>
            </View>
            <TouchableOpacity onPress={onToggleFavorite} style={styles.favButton}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={32} 
                color={isFavorite ? theme.accent : theme.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Section - Single native Slider for perfect thumb+fill alignment */}
        <View style={styles.progressSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={sliderValue}
            onSlidingStart={() => { isSeekingRef.current = true; }}
            onValueChange={(val) => { if (isSeekingRef.current) setSliderValue(val); }}
            onSlidingComplete={(val) => {
              const seekPos = (val / 100) * durationX.value;
              onSeek(seekPos);
              isSeekingRef.current = false;
            }}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor={theme.accent}
          />
          <View style={styles.timeRow}>
            <AnimatedTimeText millis={positionX} style={styles.timeText} />
            <AnimatedTimeText millis={durationX} style={styles.timeText} />
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.controlsSection}>
          <TouchableOpacity 
            style={styles.secondaryControl} 
            onPress={onToggleShuffle}
            activeOpacity={0.6}
          >
            <Ionicons 
              name="shuffle" 
              size={24} 
              color={isShuffle ? theme.accent : theme.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onPrevious} style={styles.primaryControl}>
            <Ionicons name="play-back" size={36} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onTogglePlay} style={styles.playButton}>
            <View style={[styles.playIconContainer, { backgroundColor: theme.accent }]}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#000" style={!isPlaying && { marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNext} style={styles.primaryControl}>
            <Ionicons name="play-forward" size={36} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryControl} 
            onPress={onToggleRepeat}
            activeOpacity={0.6}
          >
            <Ionicons 
              name={repeatMode === 'one' ? "repeat-outline" : "repeat"} 
              size={24} 
              color={repeatMode !== 'off' ? theme.accent : theme.textSecondary} 
            />
            {repeatMode === 'one' && (
              <View style={{ position: 'absolute', backgroundColor: theme.accent, borderRadius: 5, padding: 1, top: -2, right: -2 }}>
                <ThemedText style={{ fontSize: 8, color: '#000', fontWeight: 'bold' }}>1</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem} onPress={handleShare}>
             <Ionicons name="share-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.footerItem}
            onPress={handleDownload}
            disabled={isDlLoading}
          >
             <Ionicons 
               name={isDlLoading ? "sync" : isDl ? "download" : "download-outline"} 
               size={24} 
               color={isDl ? theme.accent : theme.textSecondary} 
             />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={onOpenSoundLab}>
             <Ionicons name="options-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -150,
    left: -50,
    right: -50,
    height: 400,
    borderRadius: 200,
    transform: [{ scale: 2 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.six,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.9,
  },
  closeButton: {
    padding: Spacing.one,
  },
  headerButton: {
    padding: Spacing.one,
  },
  artworkContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  artwork: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  logoBadge: {
    position: 'absolute',
    bottom: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  songTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 2,
  },
  favButton: {
    padding: Spacing.one,
  },
  progressSection: {
    marginBottom: Spacing.three,
    paddingHorizontal: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    marginTop: -6,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.5,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  playIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  playButton: {
  },
  primaryControl: {
    padding: Spacing.one,
  },
  secondaryControl: {
    padding: Spacing.one,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  footerItem: {
    padding: Spacing.two,
  },
  visualizerContainer: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.three,
    alignItems: 'center',
  },
});
