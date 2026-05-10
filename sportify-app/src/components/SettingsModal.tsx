import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  Linking, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useDownloadContext } from '@/context/DownloadContext';
import { useThemeContext } from '@/context/ThemeContext';
import { Colors, Spacing } from '@/constants/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const { clearAllDownloads, downloadedUrls } = useDownloadContext();

  const handleClearDownloads = () => {
    if (downloadedUrls.length === 0) {
      Alert.alert('Bilgi', 'Temizlenecek herhangi bir indirme bulunamadı.');
      return;
    }

    Alert.alert(
      'İndirmeleri Temizle',
      'Tüm indirilen şarkılar cihazınızdan silinecek. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Hepsini Sil', 
          style: 'destructive',
          onPress: clearAllDownloads 
        }
      ]
    );
  };

  const openDevStore = () => {
    Linking.openURL('https://judy658.github.io/judy658-devstore/');
  };

  const SettingItem = ({ icon, label, onPress, rightElement, color }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color || 'rgba(255,255,255,0.05)' }]}>
        <Ionicons name={icon} size={22} color={color ? '#fff' : theme.text} />
      </View>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <ThemedText style={styles.headerTitle}>Ayarlar</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Görünüm</ThemedText>
              <View style={styles.themeGrid}>
                {[
                  { id: 'dark', label: 'Siyah', icon: 'moon' },
                  { id: 'light', label: 'Beyaz', icon: 'sunny' },
                  { id: 'system', label: 'Sistem', icon: 'settings-outline' }
                ].map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.themeButton,
                      themeMode === mode.id && { backgroundColor: theme.accent }
                    ]}
                    onPress={() => setThemeMode(mode.id as any)}
                  >
                    <Ionicons 
                      name={mode.icon as any} 
                      size={20} 
                      color={themeMode === mode.id ? '#000' : theme.text} 
                    />
                    <ThemedText style={[
                      styles.themeButtonText,
                      { color: themeMode === mode.id ? '#000' : theme.text }
                    ]}>
                      {mode.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Depolama</ThemedText>
              <SettingItem 
                icon="trash-outline" 
                label="İndirmeleri Temizle" 
                color="#ff4444"
                onPress={handleClearDownloads}
                rightElement={
                  <ThemedText style={styles.badgeText}>
                    {downloadedUrls.length} Şarkı
                  </ThemedText>
                }
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Uygulama Hakkında</ThemedText>
              <SettingItem 
                icon="globe-outline" 
                label="Judy658 DevStore" 
                onPress={openDevStore}
              />
              <SettingItem 
                icon="information-circle-outline" 
                label="Sürüm" 
                rightElement={<ThemedText style={styles.versionText}>v6.15.0</ThemedText>}
              />
              <SettingItem 
                icon="shield-checkmark-outline" 
                label="Supabase Bağlantısı" 
                rightElement={
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <ThemedText style={styles.statusText}>Aktif</ThemedText>
                  </View>
                }
              />
            </View>

            <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 40 : 20 }]}>
              <ThemedText style={styles.footerText}>Sportify Mobile by Judy658</ThemedText>
              <ThemedText style={styles.footerSubText}>Tüm hakları saklıdır © 2026</ThemedText>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
  badgeText: {
    fontSize: 12,
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  footerSubText: {
    fontSize: 12,
    opacity: 0.4,
    marginTop: 4,
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 4,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
