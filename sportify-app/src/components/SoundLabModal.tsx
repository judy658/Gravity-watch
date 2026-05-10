import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SoundLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate: number;
  onRateChange: (rate: number, shouldCorrectPitch: boolean) => void;
  shouldCorrectPitch: boolean;
  volume: number;
  onVolumeChange: (value: number) => void;
  initialSleepTimer?: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
  spatialMode: 'off' | 'small_room' | 'concert_hall';
  onSpatialModeChange: (mode: 'off' | 'small_room' | 'concert_hall') => void;
  spatialDelay: number;
  onSpatialDelayChange: (value: number) => void;
  spatialVolume: number;
  onSpatialVolumeChange: (value: number) => void;
  is8DActive: boolean;
  on8DChange: (active: boolean) => void;
  rotationSpeed: number;
  onRotationSpeedChange: (value: number) => void;
}

export const SoundLabModal: React.FC<SoundLabModalProps> = ({
  isOpen,
  onClose,
  rate,
  onRateChange,
  shouldCorrectPitch,
  volume,
  onVolumeChange,
  initialSleepTimer,
  onSetSleepTimer,
  spatialMode,
  onSpatialModeChange,
  spatialDelay,
  onSpatialDelayChange,
  spatialVolume,
  onSpatialVolumeChange,
  is8DActive,
  on8DChange,
  rotationSpeed,
  onRotationSpeedChange
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

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const timerOptions = [
    { label: 'Kapat', value: null },
    { label: '15 dk', value: 15 },
    { label: '30 dk', value: 30 },
    { label: '45 dk', value: 45 },
    { label: '60 dk', value: 60 },
  ];

  if (!isOpen) return null;

  return (
    <View 
      style={[styles.overlay, { pointerEvents: isOpen ? 'auto' : 'none' }]}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <Animated.View style={[
        styles.container, 
        { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 20 },
        animatedStyle
      ]}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <Ionicons name="flask" size={24} color={theme.accent} />
          <ThemedText style={styles.headerTitle}>Ses Laboratuvarı</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Spatial Audio Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Uzamsal Ses Simülasyonu</ThemedText>
            <View style={styles.optionsGrid}>
              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: spatialMode === 'off' ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onSpatialModeChange('off')}
              >
                <Ionicons name="radio-button-off" size={20} color={spatialMode === 'off' ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: spatialMode === 'off' ? '#000' : theme.text, marginTop: 4 }]}>Kapalı</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: spatialMode === 'small_room' ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onSpatialModeChange('small_room')}
              >
                <Ionicons name="cube" size={20} color={spatialMode === 'small_room' ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: spatialMode === 'small_room' ? '#000' : theme.text, marginTop: 4 }]}>Geniş Oda</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: spatialMode === 'concert_hall' ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onSpatialModeChange('concert_hall')}
              >
                <Ionicons name="business" size={20} color={spatialMode === 'concert_hall' ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: spatialMode === 'concert_hall' ? '#000' : theme.text, marginTop: 4 }]}>Konser</ThemedText>
              </TouchableOpacity>
            </View>

            {spatialMode !== 'off' && (
              <Animated.View style={styles.customSpatialContainer}>
                <View style={styles.sliderRow}>
                  <View style={styles.sliderInfo}>
                    <ThemedText style={styles.sliderLabel}>Yankı Yoğunluğu</ThemedText>
                    <ThemedText style={[styles.sliderValue, { color: theme.accent }]}>{Math.round(spatialVolume * 100)}%</ThemedText>
                  </View>
                  <Slider
                    style={styles.labSlider}
                    minimumValue={0}
                    maximumValue={0.8}
                    value={spatialVolume}
                    onValueChange={onSpatialVolumeChange}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor="rgba(255,255,255,0.1)"
                    thumbTintColor={theme.accent}
                  />
                </View>

                <View style={styles.sliderRow}>
                  <View style={styles.sliderInfo}>
                    <ThemedText style={styles.sliderLabel}>Yankı Gecikmesi</ThemedText>
                    <ThemedText style={[styles.sliderValue, { color: theme.accent }]}>{spatialDelay}ms</ThemedText>
                  </View>
                  <Slider
                    style={styles.labSlider}
                    minimumValue={10}
                    maximumValue={250}
                    step={10}
                    value={spatialDelay}
                    onValueChange={onSpatialDelayChange}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor="rgba(255,255,255,0.1)"
                    thumbTintColor={theme.accent}
                  />
                </View>
              </Animated.View>
            )}
          </View>

          {/* 🌀 3D Depth Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
               <ThemedText style={styles.sectionTitle}>3D Ses Yakınlığı Derinliği (Deneysel)</ThemedText>
               <ThemedText style={[styles.sectionValue, { color: theme.accent }]}>{is8DActive ? 'Aktif' : 'Pasif'}</ThemedText>
            </View>
            <View style={styles.optionsGrid}>
               <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: is8DActive ? theme.accent : 'rgba(255,255,255,0.05)', width: '100%' }
                ]}
                onPress={() => on8DChange(!is8DActive)}
              >
                <Ionicons name="layers" size={24} color={is8DActive ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: is8DActive ? '#000' : theme.text, marginTop: 4 }]}>
                  {is8DActive ? '3D Derinliği Durdur' : '3D Derinliği Başlat'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {is8DActive && (
              <View style={[styles.customSpatialContainer, { marginTop: 15 }]}>
                <View style={styles.sliderRow}>
                  <View style={styles.sliderInfo}>
                    <ThemedText style={styles.sliderLabel}>Yakınlık Hızı</ThemedText>
                    <ThemedText style={[styles.sliderValue, { color: theme.accent }]}>
                      {rotationSpeed < 0.03 ? 'Yavaş' : rotationSpeed < 0.1 ? 'Orta' : 'Hızlı'}
                    </ThemedText>
                  </View>
                  <Slider
                    style={styles.labSlider}
                    minimumValue={0.01}
                    maximumValue={0.2}
                    value={rotationSpeed}
                    onValueChange={onRotationSpeedChange}
                    minimumTrackTintColor={theme.accent}
                    maximumTrackTintColor="rgba(255,255,255,0.1)"
                    thumbTintColor={theme.accent}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Vibe Modes Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Vibe Modları</ThemedText>
            <View style={styles.optionsGrid}>
              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: (rate === 1.0 && shouldCorrectPitch) ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onRateChange(1.0, true)}
              >
                <Ionicons name="musical-note" size={20} color={(rate === 1.0 && shouldCorrectPitch) ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: (rate === 1.0 && shouldCorrectPitch) ? '#000' : theme.text, marginTop: 4 }]}>Normal</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: (rate === 1.25 && !shouldCorrectPitch) ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onRateChange(1.25, false)}
              >
                <Ionicons name="flame" size={20} color={(rate === 1.25 && !shouldCorrectPitch) ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: (rate === 1.25 && !shouldCorrectPitch) ? '#000' : theme.text, marginTop: 4 }]}>Nightcore</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: (rate === 0.8 && !shouldCorrectPitch) ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onRateChange(0.8, false)}
              >
                <Ionicons name="cloud" size={20} color={(rate === 0.8 && !shouldCorrectPitch) ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: (rate === 0.8 && !shouldCorrectPitch) ? '#000' : theme.text, marginTop: 4 }]}>Slowed</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          {/* Volume Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
               <ThemedText style={styles.sectionTitle}>Ses Kontrolü</ThemedText>
               <ThemedText style={[styles.sectionValue, { color: theme.accent }]}>{Math.round(volume * 100)}%</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor="rgba(255,255,255,0.1)"
              thumbTintColor={theme.accent}
            />
            <View style={styles.optionsGrid}>
               <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: volume >= 1.0 ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onVolumeChange(1.0)}
              >
                <Ionicons name="volume-high" size={20} color={volume >= 1.0 ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: volume >= 1.0 ? '#000' : theme.text, marginTop: 4 }]}>Max Boost</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.vibeButton,
                  { backgroundColor: volume === 0.3 ? theme.accent : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => onVolumeChange(0.3)}
              >
                <Ionicons name="volume-low" size={20} color={volume === 0.3 ? '#000' : theme.text} />
                <ThemedText style={[styles.optionText, { color: volume === 0.3 ? '#000' : theme.text, marginTop: 4 }]}>Soft Mode</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Speed Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Oynatma Hızı</ThemedText>
            <View style={styles.optionsGrid}>
              {speedOptions.map((opt) => (
                <TouchableOpacity 
                  key={opt}
                  style={[
                    styles.optionButton,
                    { backgroundColor: rate === opt ? theme.accent : 'rgba(255,255,255,0.05)' }
                  ]}
                  onPress={() => onRateChange(opt, true)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    { color: (rate === opt && shouldCorrectPitch) ? '#000' : theme.text }
                  ]}>
                    {opt}x
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Timer Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Uyku Zamanlayıcısı</ThemedText>
            <View style={styles.optionsGrid}>
              {timerOptions.map((opt) => (
                <TouchableOpacity 
                  key={opt.label}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: initialSleepTimer === opt.value ? theme.accent : 'rgba(255,255,255,0.05)',
                      minWidth: '30%'
                    }
                  ]}
                  onPress={() => onSetSleepTimer(opt.value)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    { color: initialSleepTimer === opt.value ? '#000' : theme.text }
                  ]}>
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Simulated Bass Boost Info */}
          <View style={[styles.infoCard, { backgroundColor: 'rgba(29, 185, 84, 0.1)' }]}>
            <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
            <ThemedText style={styles.infoText}>
              Gelişmiş ekolayzer özellikleri yakında eklenecektir. Şu an için hız ve zamanlayıcıyı kullanabilirsiniz.
            </ThemedText>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
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
    maxHeight: SCREEN_HEIGHT * 0.7,
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
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.six,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: Spacing.two,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: '22%',
    alignItems: 'center',
  },
  vibeButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 16,
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderRadius: 16,
    gap: 12,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
    lineHeight: 18,
  },
  customSpatialContainer: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    gap: Spacing.three,
  },
  sliderRow: {
    width: '100%',
  },
  sliderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  labSlider: {
    width: '100%',
    height: 30,
  },
});
