import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Playlist, usePlaylists } from '@/hooks/usePlaylists';
import { Spacing } from '@/constants/theme';
import { Song } from '@/constants/songs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

const PLAYLIST_COLORS = [
  '#2a9d8f', '#e76f51', '#264653', '#f4a261', '#e9c46a', 
  '#457b9d', '#1d3557', '#a8dadc', '#6a040f', '#370617'
];

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, song }) => {
  const theme = useTheme();
  const { playlists, createPlaylist, addSongToPlaylist, isSongInPlaylist } = usePlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim() && song) {
      const randomColor = PLAYLIST_COLORS[Math.floor(Math.random() * PLAYLIST_COLORS.length)];
      const pl = createPlaylist(newPlaylistName.trim(), randomColor);
      addSongToPlaylist(pl.id, song.url);
      setNewPlaylistName('');
      setIsCreatingNew(false);
      onClose();
    }
  };

  const handleSelectPlaylist = (playlistId: string) => {
    if (song) {
      addSongToPlaylist(playlistId, song.url);
      onClose();
    }
  };

  const renderPlaylistOption = ({ item }: { item: Playlist }) => {
    if (!song) return null;
    const exists = isSongInPlaylist(item.id, song.url);
    
    return (
      <TouchableOpacity 
        style={[styles.playlistOption, { backgroundColor: theme.card }]} 
        onPress={() => handleSelectPlaylist(item.id)}
        disabled={exists}
      >
        <View style={[styles.colorBox, { backgroundColor: item.color }]} />
        <View style={styles.playlistInfo}>
           <ThemedText style={styles.playlistName}>{item.name}</ThemedText>
           <ThemedText style={styles.playlistCount}>{item.songUrls.length} Şarkı</ThemedText>
        </View>
        {exists && (
          <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Listeye Ekle</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          {song && (
            <View style={styles.songPreview}>
              <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
              <ThemedText style={styles.songArtist} numberOfLines={1}>{song.artist}</ThemedText>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.createButton, { borderColor: theme.accent }]} 
            onPress={() => setIsCreatingNew(true)}
          >
            <Ionicons name="add" size={24} color={theme.accent} />
            <ThemedText style={[styles.createText, { color: theme.accent }]}>Yeni Çalma Listesi Oluştur</ThemedText>
          </TouchableOpacity>

          {isCreatingNew && (
            <View style={styles.createBox}>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                placeholder="Liste ismi girin..."
                placeholderTextColor={theme.textSecondary}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
              />
              <View style={styles.createActions}>
                 <TouchableOpacity onPress={() => setIsCreatingNew(false)} style={styles.cancelBtn}>
                   <ThemedText style={{ color: theme.textSecondary }}>Vazgeç</ThemedText>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    onPress={handleCreateAndAdd} 
                    style={[styles.saveBtn, { backgroundColor: theme.accent }]}
                 >
                   <ThemedText style={{ color: '#000', fontWeight: 'bold' }}>Kaydet ve Ekle</ThemedText>
                 </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistOption}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isCreatingNew ? (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>Henüz çalma listeniz yok.</ThemedText>
                </View>
              ) : null
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.7,
    padding: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  songPreview: {
    marginBottom: Spacing.three,
    padding: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createBox: {
    marginBottom: Spacing.three,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  cancelBtn: {
    padding: Spacing.two,
  },
  saveBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: Spacing.three,
  },
  playlistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  colorBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: Spacing.two,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  }
});
