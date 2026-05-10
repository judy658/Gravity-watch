import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

const { width, height } = Dimensions.get('window');

interface TermsAgreementModalProps {
  isVisible: boolean;
  onAccept: () => void;
}

export const TERMS_STORE_KEY = '@sportify_premium_terms_accepted';

export const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({ isVisible, onAccept }) => {
  const theme = useTheme();

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(TERMS_STORE_KEY, 'true');
      onAccept();
    } catch (e) {
      console.error('Failed to save terms acceptance', e);
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.accent + '30' }]}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}>
              <Ionicons name="shield-checkmark" size={32} color={theme.accent} />
            </View>
            <ThemedText style={styles.title}>Sportify Premium</ThemedText>
            <ThemedText style={styles.subtitle}>Kullanım Şartları ve Gizlilik</ThemedText>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.sectionTitle}>1. Veri Saklama ve Güvenlik</ThemedText>
            <ThemedText style={styles.paragraph}>
              Sportify Premium, hesabınızı doğrulamak ve size özel deneyim sunmak amacıyla e-posta adresinizi güvenli veritabanlarında saklar. Verileriniz üçüncü taraflarla asla paylaşılmaz.
            </ThemedText>

            <ThemedText style={styles.sectionTitle}>2. Aktiflik Durumu</ThemedText>
            <ThemedText style={styles.paragraph}>
              Sosyal müzik deneyimini artırmak amacıyla, uygulamayı kullandığınız süre boyunca "Çevrimiçi" durumunuz diğer kullanıcılar tarafından görülebilir hale getirilir. Bu özellik, topluluk etkileşimini güçlendirmek için tasarlanmıştır.
            </ThemedText>

            <ThemedText style={styles.sectionTitle}>3. Kullanım Koşulları</ThemedText>
            <ThemedText style={styles.paragraph}>
              Uygulamayı kullanarak, sunulan içerikleri yalnızca kişisel amaçlarla kullanmayı ve sistemin işleyişini bozacak herhangi bir faaliyette bulunmamayı kabul etmiş sayılırsınız.
            </ThemedText>

            <ThemedText style={styles.sectionTitle}>4. Çerezler ve Analiz</ThemedText>
            <ThemedText style={styles.paragraph}>
              Uygulama performansını iyileştirmek ve hataları tespit etmek amacıyla cihazınızdan anonim kullanım verileri toplanabilir.
            </ThemedText>

            <View style={styles.footerSpace} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.acceptButton, { backgroundColor: theme.accent }]} 
              onPress={handleAccept}
            >
              <ThemedText style={styles.buttonText}>Okudum, Onaylıyorum</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.footerNote}>
              Devam ederek Premium sözleşmesini kabul etmiş olursunuz.
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.75,
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  acceptButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 11,
    opacity: 0.4,
    marginTop: 12,
    textAlign: 'center',
  },
  footerSpace: {
    height: 40,
  }
});
