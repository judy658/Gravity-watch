import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface VisualizerProps {
  isPlaying: boolean;
  isVisible: boolean;
  playbackRate?: number;
  accentColor: string;
  barCount?: number;
  height?: number;
}

const BAR_CONFIG = [
  { base: 0.2, peak: 0.9, delay: 0, jitter: 0.05 },
  { base: 0.3, peak: 0.7, delay: 80, jitter: 0.08 },
  { base: 0.15, peak: 1.0, delay: 180, jitter: 0.03 },
  { base: 0.25, peak: 0.65, delay: 40, jitter: 0.07 },
  { base: 0.1, peak: 0.85, delay: 220, jitter: 0.04 },
  { base: 0.35, peak: 0.75, delay: 120, jitter: 0.06 },
  { base: 0.2, peak: 0.95, delay: 60, jitter: 0.09 },
  { base: 0.3, peak: 0.6, delay: 160, jitter: 0.02 },
  { base: 0.15, peak: 0.88, delay: 20, jitter: 0.07 },
  { base: 0.25, peak: 0.72, delay: 200, jitter: 0.05 },
  { base: 0.1, peak: 0.78, delay: 100, jitter: 0.08 },
  { base: 0.3, peak: 0.92, delay: 140, jitter: 0.03 },
  { base: 0.2, peak: 0.68, delay: 240, jitter: 0.06 },
  { base: 0.35, peak: 0.82, delay: 70, jitter: 0.04 },
  { base: 0.15, peak: 0.95, delay: 190, jitter: 0.07 },
];

const VisualizerBar = memo(({ 
  config, 
  accentColor, 
  isPlaying, 
  isVisible,
  duration,
  maxHeight,
  index,
  totalBars,
}: { 
  config: typeof BAR_CONFIG[0];
  accentColor: string;
  isPlaying: boolean;
  isVisible: boolean;
  duration: number;
  maxHeight: number;
  index: number;
  totalBars: number;
}) => {
  const heightVal = useSharedValue(config.base);
  // Track if animation is currently running to avoid unnecessary restarts
  const isAnimatingRef = useRef(false);
  const lastDurationRef = useRef(duration);

  useEffect(() => {
    const shouldAnimate = isPlaying && isVisible;
    const durationChanged = lastDurationRef.current !== duration;
    lastDurationRef.current = duration;

    if (shouldAnimate && !isAnimatingRef.current) {
      // Start animation only if not already running
      isAnimatingRef.current = true;
      heightVal.value = config.base;
      heightVal.value = withDelay(
        config.delay,
        withRepeat(
          withSequence(
            withTiming(config.peak, { 
              duration: duration * 0.5, 
              easing: Easing.inOut(Easing.sin) 
            }),
            // Use deterministic jitter instead of Math.random()
            withTiming(config.base + config.jitter, { 
              duration: duration * 0.3,
              easing: Easing.inOut(Easing.sin)
            }),
            withTiming(config.peak * 0.7, { 
              duration: duration * 0.2, 
              easing: Easing.inOut(Easing.sin)
            }),
          ),
          -1,
          true
        )
      );
    } else if (!shouldAnimate && isAnimatingRef.current) {
      // Stop animation
      isAnimatingRef.current = false;
      cancelAnimation(heightVal);
      heightVal.value = withTiming(config.base, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      });
    }
    // Intentionally NOT restarting on duration change to prevent freeze
  }, [isPlaying, isVisible]);

  const animStyle = useAnimatedStyle(() => ({
    height: heightVal.value * maxHeight,
  }));

  const opacity = 0.5 + (index / totalBars) * 0.5;

  return (
    <Animated.View 
      style={[
        styles.bar, 
        { 
          backgroundColor: accentColor,
          opacity,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        },
        animStyle
      ]} 
    />
  );
});

export const Visualizer: React.FC<VisualizerProps> = memo(({
  isPlaying,
  isVisible,
  playbackRate = 1.0,
  accentColor,
  barCount = 15,
  height = 60,
}) => {
  // Use a stable duration - only recalculate on significant rate changes
  const baseDuration = Math.round(400 / playbackRate);
  const bars = BAR_CONFIG.slice(0, barCount);

  return (
    <View style={[styles.container, { height }]}>
      {bars.map((config, i) => (
        <VisualizerBar
          key={i}
          config={config}
          accentColor={accentColor}
          isPlaying={isPlaying}
          isVisible={isVisible}
          duration={baseDuration + (i % 3) * 60}
          maxHeight={height}
          index={i}
          totalBars={barCount}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  bar: {
    width: 4,
    minHeight: 4,
  },
});
