import React from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { Download } from 'lucide-react-native';

/**
 * VideoList – displays a list of video cards.
 * Props:
 *   videos: array of video objects (id, title, thumbnail, author, duration)
 *   loading: boolean – shows spinner while fetching
 *   onRefresh: function – pull‑to‑refresh handler
 *   onPressItem: function – called with video object when a card is tapped
 */
export default function VideoList({
  videos,
  loading,
  loadingMore,
  onRefresh,
  onLoadMore,
  onPressItem,
  onDownload,
}: {
  videos: any[];
  loading: boolean;
  loadingMore?: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  onPressItem: (video: any) => void;
  onDownload?: (video: any) => void;
}) {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPressItem(item)}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration ?? '0:00'}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author}>{item.author || 'YouTube'}</Text>
        </View>
        {onDownload && (
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
          >
            <Download color={COLORS.accent} size={22} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && videos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.status}>Yükleniyor...</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  };

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      contentContainerStyle={{ paddingBottom: 20 }}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  info: {
    flex: 1,
  },
  downloadBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginLeft: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 5,
  },
  author: {
    color: COLORS.textDim,
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  status: {
    color: COLORS.accent,
    marginTop: 10,
    fontSize: 16,
  },
});
