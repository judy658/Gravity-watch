import React, { useEffect, useState } from 'react';
import { 
  StyleSheet,
  View, 
  Dimensions, 
  TouchableWithoutFeedback,
  Platform,
  Image
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.8, 300);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(isOpen ? 0 : -SIDEBAR_WIDTH) }
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpen ? 1 : 0),
      pointerEvents: isOpen ? 'auto' : 'none',
    };
  });

  const menuItems = [
    { id: 'all', label: 'Tümü', icon: 'musical-notes' },
    { id: 'popular', label: 'Top 50 Popüler', icon: 'flame' },
    { id: 'favorites', label: 'Favoriler', icon: 'heart' },
    { id: 'playlists', label: 'Çalma Listeleri', icon: 'list' },
    { id: 'downloads', label: 'İndirilenler', icon: 'download' },
  ];

  return (
    <>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Sidebar Content */}
      <Animated.View style={[
        styles.sidebar, 
        { backgroundColor: theme.background }, 
        animatedStyle
      ]}>
        <View style={styles.header}>
          <View style={styles.profileContent}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.sidebarLogo} 
              resizeMode="contain"
            />
            <View style={styles.profileInfo}>
              <ThemedText style={styles.logo}>Sportify Premium</ThemedText>
              <ThemedText numberOfLines={1} style={styles.userEmail}>
                {user?.email || 'Misafir'}
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.menuItem, 
                  isActive && { backgroundColor: theme.card }
                ]}
                onPress={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={22} 
                  color={isActive ? theme.accent : theme.textSecondary} 
                />
                <ThemedText style={[
                  styles.menuLabel, 
                  isActive && { color: theme.accent, fontWeight: 'bold' }
                ]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
            <ThemedText style={styles.logoutLabel}>Çıkış Yap</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.footerText}>Versiyon v6.15.2</ThemedText>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 101,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.six,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sidebarLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileInfo: {
    marginLeft: Spacing.three,
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    opacity: 0.6,
  },
  closeButton: {
    padding: Spacing.one,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.one,
  },
  menuLabel: {
    marginLeft: Spacing.four,
    fontSize: 16,
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  logoutLabel: {
    marginLeft: Spacing.four,
    color: '#ff4d4d',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});
