import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
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
import { Song, SONGS } from '@/constants/songs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  onPlaySong: (song: Song) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  onPlaySong
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

  const renderItem = ({ item }: { item: Song }) => {
    const isActive = item.url === currentSong?.url;
    return (
      <TouchableOpacity 
        style={[styles.item, isActive && { backgroundColor: theme.accent + '15' }]}
        onPress={() => onPlaySong(item)}
      >
        <Ionicons 
          name={isActive ? "volume-high" : "musical-note"} 
          size={18} 
          color={isActive ? theme.accent : theme.textSecondary} 
        />
        <View style={styles.itemInfo}>
          <ThemedText style={[styles.title, isActive && { color: theme.accent }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.artist} numberOfLines={1}>{item.artist}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isOpen) return null;

  return (
    <View style={[styles.overlay, { pointerEvents: isOpen ? 'auto' : 'none' }]}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[
        styles.container, 
        { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom },
        animatedStyle
      ]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Sıradaki Şarkılar</ThemedText>
          <TouchableOpacity onPress={onClose}>
             <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={SONGS}
          keyExtractor={(item) => item.url}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.75,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
    opacity: 0.6,
  },
});
