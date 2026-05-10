import { useAudioContext } from '@/context/AudioContext';

/**
 * useAudioPlayer Hook - V2 (Hardware Accelerated)
 * 
 * Artık tüm ses mantığı AudioContext üzerinden merkezi olarak yönetiliyor.
 * Bu hook, Context'e erişmek için kullanılan bir sarmalayıcıdır.
 * 
 * Performance Note: Bu hook artık saniye (position) değişimlerinde COMPONENT RENDER TETİKLEMEZ.
 * İlerleme çubuğu gibi saniye bazlı değişimler için SharedValue (positionX) kullanılmalıdır.
 */
export const useAudioPlayer = () => {
  const context = useAudioContext();

  return {
    ...context,
    // Geriye dönük uyumluluk için (Hala React state'i bekleyen eski bileşenler için 0 döndürüyoruz)
    // Bu bileşenler yavaş yavaş positionX kullanacak şekilde güncellenmelidir.
    position: 0, 
    duration: 0,
  };
};
