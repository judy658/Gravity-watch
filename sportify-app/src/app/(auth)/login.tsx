import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('E-posta veya şifre yanlış!');
        setLoading(false);
        return;
      }

      if (authData.user) {
        // --- Security Check: Strictly verify presence record exists ---
        const { data: presence, error: presenceError } = await supabase
          .from('user_presence')
          .select('last_seen, warned_at, is_banned')
          .eq('email', email)
          .maybeSingle();

        if (presence && presence.is_banned === true) {
          // Banned check
          await supabase.auth.signOut();
          setError('Hesabınız kalıcı olarak yasaklanmıştır. Lütfen yöneticiyle iletişime geçin.');
          setLoading(false);
          return;
        }

        const now = new Date();
        const lastSeen = presence ? new Date(presence.last_seen) : null;
        
        if (lastSeen) {
          const diffDays = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
          const INACTIVITY_LIMIT_DAYS = 7;
          const warningDate = (presence && presence.warned_at) ? new Date(presence.warned_at) : null;
          const isWarnedAndExpired = warningDate && (now.getTime() - warningDate.getTime()) > (24 * 60 * 60 * 1000);

          if (diffDays >= INACTIVITY_LIMIT_DAYS || isWarnedAndExpired) {
            await supabase.auth.signOut();
            setError('Hesabınız 7 gündür aktif olmadığı için dondurulmuştur. Lütfen web sitesi üzerinden destek alın.');
            setLoading(false);
            return;
          }
        }
        // If everything is fine, the Root layout will handle the redirect
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: theme.accent }]}>
              <Ionicons name="musical-notes" size={40} color="#000" />
            </View>
            <ThemedText style={styles.logoText}>Sportify</ThemedText>
            <ThemedText style={styles.subtitle}>Müziğin Ritmini Yakala</ThemedText>
          </View>

          {/* Form Section */}
          <BlurView intensity={20} tint="dark" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>E-posta</ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="ornek@gmail.com"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Şifre</ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="********"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.accent }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <ThemedText style={styles.infoText}>
                Hesabınız yok mu? Lütfen web sitesi üzerinden kayıt olun.
              </ThemedText>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.eight,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: Spacing.one,
  },
  formCard: {
    width: '100%',
    padding: Spacing.six,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: Spacing.six,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
