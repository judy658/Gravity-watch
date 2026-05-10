import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Song } from '@/constants/songs';

const SPACING = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
};

export const SongItemComponent = memo(({ 
  song, 
  isCurrentlyPlaying, 
  isPlaying, 
  isFavorite,
  onToggleFavorite,
  theme,
  onPress,
  onLongPress,
  playCount
}: {
  song: Song;
  isCurrentlyPlaying: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  theme: any;
  onPress: () => void;
  onLongPress: () => void;
  playCount?: number;
}) => {
  return (
    <View style={[styles.songItem, isCurrentlyPlaying && styles.activeSongItem]}>
      <Pressable 
        style={styles.songContent}
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      >
        <View style={[styles.songIconContainer, { backgroundColor: isCurrentlyPlaying ? theme.accent + '20' : 'rgba(255,255,255,0.05)' }]}>
          <Ionicons 
            name={isCurrentlyPlaying && isPlaying ? "pause" : "play"} 
            size={20} 
            color={isCurrentlyPlaying ? theme.accent : theme.text} 
          />
        </View>
        <View style={styles.songInfo}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.songTitle, isCurrentlyPlaying && { color: theme.accent }]} numberOfLines={1}>
              {song.title}
            </ThemedText>
            {playCount !== undefined && (
              <View style={styles.playCountBadge}>
                <Ionicons name="stats-chart" size={10} color={theme.accent} style={{ marginRight: 2 }} />
                <ThemedText style={[styles.playCountText, { color: theme.accent }]}>
                  {playCount >= 1000 ? `${(playCount / 1000).toFixed(1)}K` : playCount}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.songArtist} numberOfLines={1}>
            {song.artist}
          </ThemedText>
        </View>
      </Pressable>

      <TouchableOpacity 
        onPress={onToggleFavorite}
        style={styles.heartButton}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={22} 
          color={isFavorite ? "#ff2d55" : theme.textSecondary} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onLongPress}
        style={styles.optionsButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: SPACING.one,
    overflow: 'hidden',
  },
  activeSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.two,
  },
  songIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: SPACING.two,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.two,
  },
  playCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  heartButton: {
    padding: SPACING.two,
    marginRight: SPACING.one,
  },
  optionsButton: {
    padding: SPACING.two,
    paddingRight: SPACING.three,
  },
});
