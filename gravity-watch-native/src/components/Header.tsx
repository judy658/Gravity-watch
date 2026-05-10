import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { COLORS } from '../theme';

/**
 * Header component – displays a hamburger menu button and the app logo.
 */
export default function Header({
  onMenuPress,
}: {
  onMenuPress: () => void;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
          <Menu color={COLORS.text} size={28} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>GRAVITY</Text>
          <Text style={styles.tagline}>Watch the Future</Text>
        </View>
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.bg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  menuBtn: {
    padding: 5,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  spacer: {
    width: 38, // to balance the menu button width
  },
});
