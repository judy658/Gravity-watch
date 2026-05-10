import React, { memo, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  FlatList,
  Text
} from 'react-native';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue
} from 'react-native-reanimated';
import { LyricLine } from '@/constants/songs';
import { Spacing } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 80; 

interface LyricsViewProps {
  lyrics: LyricLine[] | undefined;
  currentIndex: number; // Scrolling için (JS)
  activeIndexSV: SharedValue<number>; // Highlighting için (GPU)
  isSearching?: boolean;
  theme: any;
  songTitle: string;
  artist: string;
  isVisible: boolean; 
}

export const LyricsView = memo(({ lyrics, currentIndex, activeIndexSV, isSearching, theme, songTitle, artist, isVisible }: LyricsViewProps) => {
  const listRef = useRef<FlatList>(null);
  
  // Worklet-safe interaction tracking
  const isUserInteractingSV = useSharedValue(false);
  const lastInteractionTimeSV = useSharedValue(0);

  // AUTO-SCROLL (JS thread monitoring state - stable for FlatList)
  useEffect(() => {
    if (isVisible && currentIndex >= 0 && !isUserInteractingSV.value && listRef.current) {
      const now = Date.now();
      if (now - lastInteractionTimeSV.value > 3000) {
        listRef.current.scrollToIndex({
          index: currentIndex,
          animated: true,
          viewPosition: 0.3
        });
      }
    }
  }, [currentIndex, isVisible]);

  const handleSearchLyrics = () => {
    const query = encodeURIComponent(`${songTitle} ${artist} lyrics`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  if (isSearching) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.emptyText, { color: theme.text, marginTop: 20 }]}>Sözler aranıyor... ✨</Text>
      </View>
    );
  }

  if (!lyrics || lyrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.text }]}>Söz bulunamadı.</Text>
        <TouchableOpacity style={[styles.searchButton, { borderColor: theme.accent }]} onPress={handleSearchLyrics}>
          <Text style={[styles.searchButtonText, { color: theme.accent }]}>Manuel Ara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: LyricLine; index: number }) => (
    <LyricItem 
      text={item.text} 
      index={index} 
      activeIndexSV={activeIndexSV} 
      theme={theme} 
    />
  );

  return (
    <View style={styles.outerContainer}>
      <FlatList
        ref={listRef}
        data={lyrics}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={[styles.contentContainer, { paddingTop: 60, paddingBottom: SCREEN_HEIGHT / 2 }]}
        onScrollBeginDrag={() => { isUserInteractingSV.value = true; }}
        onScrollEndDrag={() => { 
          isUserInteractingSV.value = false; 
          lastInteractionTimeSV.value = Date.now();
        }}
        onMomentumScrollEnd={() => {
          isUserInteractingSV.value = false; 
          lastInteractionTimeSV.value = Date.now();
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true} 
      />
    </View>
  );
});

// GPU-ACCELERATED ITEM (ZERO LAG)
const LyricItem = memo(({ text, index, activeIndexSV, theme }: { 
  text: string; 
  index: number; 
  activeIndexSV: SharedValue<number>; 
  theme: any 
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeIndexSV.value === index;
    return {
      color: withTiming(isActive ? theme.accent : theme.text, { duration: 250 }),
      opacity: withTiming(isActive ? 1 : 0.3, { duration: 250 }),
      transform: [
        { scale: withTiming(isActive ? 1.05 : 1.0, { duration: 250 }) }
      ]
    };
  });

  return (
    <View style={styles.lineHost}>
      <Animated.Text style={[styles.lineText, animatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: { flex: 1, width: '100%' },
  contentContainer: { paddingHorizontal: Spacing.four },
  lineHost: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lineText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 28 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.six },
  emptyText: { fontSize: 18, opacity: 0.7, textAlign: 'center', marginBottom: Spacing.four },
  searchButton: { borderWidth: 1.5, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 30, marginTop: 10 },
  searchButtonText: { fontSize: 16, fontWeight: 'bold' },
});
