import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ThemedText } from './themed-text';
import { Song } from '@/constants/songs';
import { useAlbumArt } from '@/hooks/useAlbumArt';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

const SPACING = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
};

interface FeaturedCardProps {
  song: Song & { play_count?: number };
  onPress: () => void;
  index: number;
  theme: any;
}

export const FeaturedCard = memo(({ song, onPress, index, theme }: FeaturedCardProps) => {
  const { albumArt } = useAlbumArt(song?.url);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.card }]}
      >
        <Image 
          source={{ uri: albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop' }} 
          style={styles.image}
          resizeMode="cover"
        />
        {/* Safe Fallback Overlay instead of LinearGradient */}
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>{song.title}</ThemedText>
            <View style={styles.artistRow}>
              <ThemedText style={styles.artist} numberOfLines={1}>{song.artist}</ThemedText>
              {song.play_count !== undefined && (
                <View style={styles.miniStats}>
                  <Ionicons name="stats-chart" size={10} color={theme.accent} style={{ marginRight: 3 }} />
                  <ThemedText style={[styles.statsText, { color: theme.accent }]}>
                    {song.play_count >= 1000 ? `${(song.play_count / 1000).toFixed(1)}K` : song.play_count}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          
          <View style={[styles.playButton, { backgroundColor: theme.accent }]}>
            <Ionicons name="play" size={24} color="#000" />
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.badgeText}>HİT</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginRight: SPACING.four,
    paddingVertical: SPACING.two,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.two,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  artist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.two,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: SPACING.three,
    right: SPACING.three,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
});
