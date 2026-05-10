import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Dimensions,
  Platform,
  SafeAreaView,
  FlatList
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Playlist } from '@/hooks/usePlaylists';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { Song, SONGS } from '@/constants/songs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlaylistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onRemoveSong: (songUrl: string) => void;
}

export const PlaylistDetailModal: React.FC<PlaylistDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  playlist, 
  onPlaySong,
  currentSong,
  isPlaying,
  onRemoveSong
}) => {
  const theme = useTheme();

  if (!playlist) return null;

  const playlistSongs = SONGS.filter(song => playlist.songUrls.includes(song.url));

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isActive = currentSong?.url === item.url;
    
    return (
      <TouchableOpacity 
        style={[styles.songItem, isActive && { backgroundColor: 'rgba(255,255,255,0.05)' }]} 
        onPress={() => onPlaySong(item)}
      >
        <ThemedText style={[styles.songIndex, isActive && { color: theme.accent }]}>
          {index + 1}
        </ThemedText>
        
        <View style={styles.songInfo}>
          <ThemedText style={[styles.songTitle, isActive && { color: theme.accent }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => onRemoveSong(item.url)}
        >
          <Ionicons name="remove-circle-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.headerGradient, { backgroundColor: playlist.color }]}>
           <SafeAreaView>
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                  <Ionicons name="chevron-down" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.playlistHero}>
                 <View style={styles.iconContainer}>
                    <Ionicons name="musical-notes" size={48} color="#fff" />
                 </View>
                 <ThemedText style={styles.playlistName}>{playlist.name}</ThemedText>
                 <ThemedText style={styles.playlistMeta}>{playlistSongs.length} Şarkı</ThemedText>
              </View>
           </SafeAreaView>
        </View>

        <FlatList
          data={playlistSongs}
          keyExtractor={(item) => item.url}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Bu liste henüz boş.</ThemedText>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: Spacing.four,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: Spacing.two,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.two,
  },
  backButton: {
    padding: Spacing.one,
  },
  playlistHero: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  playlistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  playlistMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.one,
  },
  listContent: {
    padding: Spacing.three,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 8,
    marginBottom: Spacing.one,
  },
  songIndex: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.5,
  },
  songInfo: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  removeButton: {
    padding: Spacing.two,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
    fontSize: 16,
  }
});
