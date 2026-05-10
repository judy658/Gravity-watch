import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { usePlaylists } from '@/hooks/usePlaylists';
import { Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLAYLIST_COLORS = [
  '#2a9d8f', '#e76f51', '#264653', '#f4a261', '#e9c46a', 
  '#457b9d', '#1d3557', '#a8dadc', '#6a040f', '#370617'
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { createPlaylist } = usePlaylists();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      const randomColor = PLAYLIST_COLORS[Math.floor(Math.random() * PLAYLIST_COLORS.length)];
      createPlaylist(name.trim(), randomColor);
      setName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Yeni Çalma Listesi</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
            placeholder="Liste ismi..."
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelBtn]} 
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.textSecondary }}>İptal</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.createBtn, { backgroundColor: theme.accent }]} 
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <ThemedText style={{ color: '#000', fontWeight: 'bold' }}>Oluştur</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.four,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  cancelBtn: {
  },
  createBtn: {
  }
});
