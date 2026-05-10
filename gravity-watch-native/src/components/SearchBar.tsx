import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS } from '../theme';

/**
 * SearchBar – simple input with a search icon.
 * Props:
 *   onSearch: (query: string) => void
 *   loading: boolean (shows spinner while search in progress)
 */
export default function SearchBar({
  onSearch,
  loading,
}: {
  onSearch: (query: string) => void;
  loading: boolean;
}) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSearch(text.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Search color={COLORS.textDim} size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Video veya kanal ara..."
        placeholderTextColor={COLORS.textDim}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmit}
        editable={!loading}
      />
      {loading && <ActivityIndicator size="small" color={COLORS.accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.purple + '20',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
});
