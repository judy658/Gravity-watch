import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Playlist } from '@/hooks/usePlaylists';
import { Spacing } from '@/constants/theme';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress: () => void;
  onDelete: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onPress, onDelete }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: playlist.color || theme.card }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name="musical-notes" size={28} color="#fff" />
        </View>
      </View>
      
      <View style={styles.info}>
        <ThemedText style={styles.name} numberOfLines={1}>{playlist.name}</ThemedText>
        <ThemedText style={styles.count}>{playlist.songUrls.length} Şarkı</ThemedText>
      </View>

      <RNTouchableOpacity 
        style={styles.deleteButton} 
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.6)" />
      </RNTouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginRight: Spacing.three,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  count: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.one,
  }
});
