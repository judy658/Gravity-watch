import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Song } from '@/constants/songs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SongOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onAddToPlaylist: () => void;
  onShowQueue: () => void;
}

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  isOpen,
  onClose,
  song,
  onAddToPlaylist,
  onShowQueue,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withSpring(isOpen ? 0 : SCREEN_HEIGHT, { damping: 20, stiffness: 90 }) }
      ],
    };
  });

  if (!song) return null;

  const options = [
    { id: 'playlist', label: 'Çalma Listesine Ekle', icon: 'add-circle-outline', action: onAddToPlaylist },
    { id: 'queue', label: 'Sıradaki Şarkıları Gör', icon: 'list-outline', action: onShowQueue },
    { id: 'info', label: 'Şarkı Bilgisi', icon: 'information-circle-outline', action: () => {} },
  ];

  if (!isOpen) return null;

  return (
    <View style={[styles.overlay, { pointerEvents: isOpen ? 'auto' : 'none' }]}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[
        styles.container, 
        { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 20 },
        animatedStyle
      ]}>
        <View style={styles.handle} />
        
        <View style={styles.songHeader}>
          <View style={[styles.miniArt, { backgroundColor: theme.card }]}>
            <Ionicons name="musical-note" size={24} color={theme.accent} />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
            <ThemedText style={styles.songArtist} numberOfLines={1}>{song.artist}</ThemedText>
          </View>
        </View>

        <View style={styles.menu}>
          {options.map((opt) => (
            <TouchableOpacity 
              key={opt.id}
              style={styles.menuItem}
              onPress={() => {
                opt.action();
                onClose();
              }}
            >
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name={opt.icon as any} size={22} color={theme.text} />
              </View>
              <ThemedText style={styles.menuLabel}>{opt.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2500,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.four,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.six,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.two,
  },
  miniArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: Spacing.three,
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 14,
    opacity: 0.6,
  },
  menu: {
    paddingTop: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: Spacing.four,
    fontSize: 16,
    fontWeight: '500',
  },
});
