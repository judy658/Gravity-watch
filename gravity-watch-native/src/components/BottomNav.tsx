import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Home, Compass, Library } from 'lucide-react-native';
import { COLORS } from '../theme';

/**
 * BottomNav – simple three‑button navigation bar.
 * Props (optional):
 *   activeTab?: string – name of the currently selected tab (e.g., 'Home').
 *   onSelect?: (tab: string) => void – callback when a tab is pressed.
 */
export default function BottomNav({
  activeTab = 'Home',
  onSelect = () => {},
}: {
  activeTab?: string;
  onSelect?: (tab: string) => void;
}) {
  const tabs = [
    { name: 'Home', icon: Home },
    { name: 'Explore', icon: Compass },
    { name: 'Library', icon: Library },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(({ name, icon: Icon }) => (
        <TouchableOpacity
          key={name}
          style={styles.item}
          onPress={() => onSelect(name)}
        >
          <Icon color={activeTab === name ? COLORS.accent : COLORS.textDim} size={24} />
          <Text style={[styles.label, { color: activeTab === name ? COLORS.accent : COLORS.textDim }]}>{name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 0 : 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.purple + '30',
  },
  item: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});
