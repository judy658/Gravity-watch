import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme';

/**
 * Simple authentication screen used when `session` is null.
 * Allows toggling between Login and Register modes.
 */
export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isRegister ? 'Yeni Hesap' : 'Hoş Geldin'}</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={COLORS.textDim}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={COLORS.textDim}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.switch}>
            {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.purple + '40',
    elevation: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  title: {
    color: COLORS.accent,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.purple + '20',
  },
  button: {
    backgroundColor: COLORS.accent,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.bg,
    fontSize: 18,
    fontWeight: '800',
  },
  switch: {
    color: COLORS.textDim,
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 13,
  },
});
