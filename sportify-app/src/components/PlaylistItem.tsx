import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

const SPACING = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
};

export const PlaylistItem = memo(({ item, theme, onPress, onPlay }: any) => {
  return (
    <Pressable 
      style={styles.container}
      onPress={() => onPress(item)}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      <View style={[styles.miniCover, { backgroundColor: item.color || theme.accent }]}>
        <Ionicons name="list" size={24} color="#fff" />
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={styles.count}>{item.songUrls.length} Şarkı</ThemedText>
      </View>
      <TouchableOpacity 
        onPress={() => onPlay(item)}
        style={styles.playButton}
      >
        <Ionicons name="play-circle" size={36} color={theme.accent} />
      </TouchableOpacity>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.two,
    borderRadius: 12,
    marginBottom: SPACING.one,
  },
  miniCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.two,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  playButton: {
    padding: SPACING.one,
  },
});
