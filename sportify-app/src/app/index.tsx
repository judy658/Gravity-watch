import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { Buffer } from 'buffer';

// @ts-ignore
global.Buffer = Buffer;
import { 
  StyleSheet, 
  TextInput, 
  View, 
  Dimensions,
  Platform,
  Pressable,
  FlatList
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { SONGS, Song } from '@/constants/songs';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/hooks/use-theme';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePopularSongs } from '@/hooks/usePopularSongs';
import { PlayerModal } from '@/components/PlayerModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { PlaylistDetailModal } from '@/components/PlaylistDetailModal';
import { Sidebar } from '@/components/Sidebar';
import { SongItemComponent } from '@/components/SongItem';
import { PlaylistItem } from '@/components/PlaylistItem';
import { SoundLabModal } from '@/components/SoundLabModal';
import { SongOptionsModal } from '@/components/SongOptionsModal';
import { QueueModal } from '@/components/QueueModal';
import { FeaturedCard } from '@/components/FeaturedCard';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  FadeIn, 
  Layout, 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedReaction,
  useDerivedValue
} from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { CreatePlaylistModal } from '@/components/CreatePlaylistModal';
import { useDownloads } from '@/hooks/useDownloads';

// Manually defining theme constants here to prevent potential ReferenceErrors during module load
const MAX_CONTENT_WIDTH = 800;
const SPACING = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
};

export default function HomeScreen() {
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlayback,
    playNext, 
    playPrevious,
    volume,
    changeVolume,
    spatialMode,
    setSpatialMode,
    spatialDelay,
    setSpatialDelay,
    spatialVolume,
    setSpatialVolume,
    positionX,
    durationX,
    seek,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    rate,
    shouldCorrectPitch,
    changeRate,
    is8DActive,
    setIs8DActive,
    rotationSpeed,
    setRotationSpeed,
  } = useAudioPlayer();

  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  
  // New Modal States
  const [isSoundLabOpen, setIsSoundLabOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);


  // Mini progress bar percentage (Safe-Derived - Zero warnings)
  const progressPercent = useDerivedValue(() => {
    return durationX.value > 0 ? (positionX.value / durationX.value) * 100 : 0;
  });

  const miniProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressPercent.value}%`, // Sadece worklet içinde okunur
    };
  });
  
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { isDownloaded } = useDownloads();
  const theme = useTheme();
  const { playlists, removeSongFromPlaylist, addSongToPlaylist } = usePlaylists();
  const { popularSongs, incrementPlayCount } = usePopularSongs();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'Tünaydın';
    return 'İyi Akşamlar';
  };

  // Stabilize filteredSongs calculation
  const filteredSongs = useMemo(() => {
    let songs = SONGS;
    if (activeTab === 'favorites') {
      songs = SONGS.filter(s => favorites.includes(s.url));
    } else if (activeTab === 'downloads') {
      songs = SONGS.filter(s => isDownloaded(s.url));
    } else if (activeTab === 'popular') {
      songs = popularSongs;
    }
    
    if (search) {
      const s = search.toLowerCase();
      songs = songs.filter(song => 
        song.title.toLowerCase().includes(s) || 
        song.artist.toLowerCase().includes(s)
      );
    }
    return songs;
  }, [search, activeTab, popularSongs, favorites.length, isDownloaded]); // Reduced dependencies

  const handlePlaySong = useCallback((song: Song) => {
    if (currentSong?.url === song.url) {
      togglePlayback();
    } else {
      playSong(song);
      incrementPlayCount(song);
    }
  }, [currentSong?.url, playSong, togglePlayback, incrementPlayCount]);

  return (
    <ThemedView style={styles.container}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color={theme.text} />
            </TouchableOpacity>
            <View>
              <ThemedText style={styles.greetingText}>{getGreeting()}, Kaptan! 👋</ThemedText>
              <ThemedText style={styles.headerTitle}>
                {activeTab === 'all' ? 'Keşfet' : 
                 activeTab === 'favorites' ? 'Sizinkiler' : 
                 activeTab === 'popular' ? 'Top 50 Popüler' : 
                 activeTab === 'playlists' ? 'Listelerin' : 'İndirilenler'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => setIsSettingsModalOpen(true)} style={styles.settingsButton}>
             <View style={[styles.avatarCircle, { backgroundColor: theme.accent + '20' }]}>
                <Ionicons name="person" size={18} color={theme.accent} />
             </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Şarkı veya sanatçı ara..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </Animated.View>

        {useMemo(() => (
          <FlatList
            data={activeTab === 'playlists' ? playlists : filteredSongs}
            keyExtractor={(item: any) => item.id || item.url}
            ListHeaderComponent={
              <>
                {activeTab === 'all' && !search && (
                  <View style={styles.featuredSection}>
                    <ThemedText style={styles.sectionTitle}>Günün Hitleri</ThemedText>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={popularSongs.slice(0, 5)}
                      keyExtractor={(item) => item.url}
                      renderItem={({ item, index }) => (
                        <FeaturedCard 
                          song={item} 
                          index={index} 
                          theme={theme}
                          onPress={() => handlePlaySong(item)}
                        />
                      )}
                    />
                    <ThemedText style={[styles.sectionTitle, { marginTop: SPACING.four }]}>Kütüphane</ThemedText>
                  </View>
                )}
                {activeTab === 'playlists' && (
                  <TouchableOpacity 
                    style={[styles.createPlaylistRow, { borderColor: theme.border }]}
                    onPress={() => setIsCreatePlaylistModalOpen(true)}
                  >
                    <Ionicons name="add" size={24} color={theme.accent} />
                    <ThemedText style={{ color: theme.accent, fontWeight: '600' }}>Yeni Çalma Listesi Oluştur</ThemedText>
                  </TouchableOpacity>
                )}
              </>
            }
            renderItem={({ item, index }) => (
              activeTab === 'playlists' ? (
                  <PlaylistItem 
                    item={item}
                    theme={theme}
                    onPress={(p: any) => setSelectedPlaylist(p)}
                    onPlay={() => {}} // Opsiyonel: Tüm listeyi çal
                  />
              ) : (
                  <SongItemComponent 
                    song={item}
                    isCurrentlyPlaying={currentSong?.url === item.url}
                    isPlaying={isPlaying}
                    isFavorite={isFavorite(item.url)}
                    onToggleFavorite={() => toggleFavorite(item.url)}
                    onPress={() => handlePlaySong(item)}
                    onLongPress={() => setSelectedSongForPlaylist(item)}
                    theme={theme}
                    playCount={(item as any).play_count}
                  />
              )
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name={activeTab === 'playlists' ? "list" : "musical-notes-outline"} size={64} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                <ThemedText style={styles.emptyText}>
                  {search ? 'Sonuç bulunamadı' : (activeTab === 'playlists' ? 'Henüz hiçbir listen yok' : 'Burada henüz bir şey yok')}
                </ThemedText>
              </View>
            }
          />
        ), [activeTab, search, filteredSongs, playlists, currentSong?.url, isPlaying, favorites.length, theme])}
      </SafeAreaView>

      {/* Mini Player with Safe Glass Effect */}
      {currentSong && !isPlayerModalOpen && (
        <Animated.View 
          entering={FadeInUp.delay(500)}
          style={[styles.playerWrapper, { backgroundColor: 'rgba(20, 20, 20, 0.95)' }]}
        >
          <Pressable 
            style={styles.playerBar}
            onPress={() => setIsPlayerModalOpen(true)}
          >
            <View style={styles.playerInfo}>
              <View style={[styles.miniCover, { backgroundColor: theme.card }]}>
                <Ionicons name="musical-note" size={20} color={theme.accent} />
              </View>
              <View style={styles.playerTextContainer}>
                <ThemedText numberOfLines={1} style={styles.playerTitle}>{currentSong.title}</ThemedText>
                <ThemedText numberOfLines={1} style={styles.playerArtist}>{currentSong.artist}</ThemedText>
              </View>
            </View>
            
            <View style={styles.playerControls}>
              <TouchableOpacity onPress={playPrevious} style={styles.controlIcon} hitSlop={10}>
                <Ionicons name="play-back" size={22} color={theme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={togglePlayback} style={styles.playButtonMain} hitSlop={10}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={theme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={playNext} style={styles.controlIcon} hitSlop={10}>
                <Ionicons name="play-forward" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
          </Pressable>
          {/* Mini progress bar */}
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { backgroundColor: theme.accent },
                miniProgressStyle
              ]} 
            />
          </View>
        </Animated.View>
      )}

      {/* Modals */}
      <PlayerModal 
        isOpen={isPlayerModalOpen} 
        onClose={() => setIsPlayerModalOpen(false)} 
        song={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
        onNext={playNext}
        onPrevious={playPrevious}
        positionX={positionX}
        durationX={durationX}
        onSeek={seek}
        isFavorite={currentSong ? isFavorite(currentSong.url) : false}
        onToggleFavorite={() => currentSong && toggleFavorite(currentSong.url)}
        isShuffle={isShuffle}
        repeatMode={repeatMode as any}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onOpenSoundLab={() => setIsSoundLabOpen(true)}
        onOpenOptions={() => setIsOptionsOpen(true)}
        playbackRate={rate}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <AddToPlaylistModal
        isOpen={!!selectedSongForPlaylist}
        song={selectedSongForPlaylist}
        onClose={() => setSelectedSongForPlaylist(null)}
      />

      <PlaylistDetailModal
        isOpen={!!selectedPlaylist}
        playlist={selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
        onRemoveSong={(url) => selectedPlaylist && removeSongFromPlaylist(selectedPlaylist.id, url)}
        onPlaySong={handlePlaySong}
        currentSong={currentSong}
        isPlaying={isPlaying}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
      />

      <SoundLabModal
        isOpen={isSoundLabOpen}
        onClose={() => setIsSoundLabOpen(false)}
        rate={rate}
        shouldCorrectPitch={shouldCorrectPitch}
        volume={volume}
        onVolumeChange={changeVolume}
        onRateChange={(newRate, corr) => changeRate(newRate, corr)}
        spatialMode={spatialMode}
        onSpatialModeChange={setSpatialMode}
        spatialDelay={spatialDelay}
        onSpatialDelayChange={setSpatialDelay}
        spatialVolume={spatialVolume}
        onSpatialVolumeChange={setSpatialVolume}
        initialSleepTimer={sleepTimer}
        onSetSleepTimer={(mins) => {
          setSleepTimer(mins);
          setIsSoundLabOpen(false);
        }}
        is8DActive={is8DActive}
        on8DChange={setIs8DActive}
        rotationSpeed={rotationSpeed}
        onRotationSpeedChange={setRotationSpeed}
      />

      <SongOptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        song={currentSong}
        onAddToPlaylist={() => {
          setIsOptionsOpen(false);
          setSelectedSongForPlaylist(currentSong);
        }}
        onShowQueue={() => {
          setIsOptionsOpen(false);
          setIsQueueOpen(true);
        }}
      />

      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentSong={currentSong}
        onPlaySong={(song) => {
          handlePlaySong(song);
          setIsQueueOpen(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MAX_CONTENT_WIDTH,
    paddingHorizontal: SPACING.three,
  },
  header: {
    paddingHorizontal: SPACING.three,
    paddingVertical: SPACING.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.one,
  },
  featuredSection: {
    paddingVertical: SPACING.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.two,
  },
  greetingText: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: SPACING.one,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.three,
    marginHorizontal: SPACING.three,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 14,
    marginBottom: SPACING.four,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: SPACING.one,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 120, // Space for player bar
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.two,
    borderRadius: 8,
    marginBottom: SPACING.one,
  },
  activeSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  songIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.two,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  playerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 40,
    left: SPACING.three,
    right: SPACING.three,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.two,
    paddingVertical: SPACING.one,
    justifyContent: 'space-between',
  },
  playerInfo: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  playerTextContainer: {
    marginLeft: SPACING.two,
    flex: 1,
  },
  playerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  playerArtist: {
    fontSize: 11,
    opacity: 0.8,
  },
  playerControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.one,
  },
  controlIcon: {
    padding: SPACING.one,
  },
  playButtonMain: {
    width: 44,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.two,
  },
  menuButton: {
    padding: SPACING.one,
  },
  favButton: {
    padding: SPACING.two,
  },
  actionIconCell: {
    padding: SPACING.two,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: SPACING.three,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  progressBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  createPlaylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: SPACING.three,
    gap: SPACING.two,
  },
  playCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 10,
  },
  playCountText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
