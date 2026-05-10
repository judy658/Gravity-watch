import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Compass, Users, Heart, User, Clock, LogOut } from 'lucide-react-native';
import { COLORS } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.7;

interface SidebarProps {
  visible: boolean;
  activeTab: string;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSignOut: () => void;
  stats: { subs: number; likes: number };
}

export default function Sidebar({ visible, activeTab, onClose, onSelectTab, onSignOut, stats }: SidebarProps) {
  const tabs = [
    { id: 'Keşfet', icon: Compass },
    { id: 'Abonelikler', icon: Users },
    { id: 'Beğeniler', icon: Heart },
    { id: 'Hesap', icon: User },
    { id: 'Geçmiş', icon: Clock },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sidebar}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.logo}>GRAVITY</Text>
            </View>

            <View style={styles.menu}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => {
                      onSelectTab(tab.id);
                      onClose();
                    }}
                  >
                    <Icon color={isActive ? COLORS.bg : COLORS.textDim} size={24} />
                    <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                      {tab.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footer}>
              <View style={styles.stats}>
                <Text style={styles.statText}>{stats.subs} Abone</Text>
                <Text style={styles.statText}>{stats.likes} Beğeni</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={onSignOut}>
                <LogOut color={COLORS.error} size={20} />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.bg,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: COLORS.surface,
    elevation: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    marginBottom: 10,
  },
  logo: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  menu: {
    flex: 1,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 5,
  },
  activeMenuItem: {
    backgroundColor: COLORS.accent,
  },
  menuText: {
    color: COLORS.textDim,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  activeMenuText: {
    color: COLORS.bg,
    fontWeight: '800',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
