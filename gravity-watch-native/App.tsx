import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Header from './src/components/Header';
import SearchBar from './src/components/SearchBar';
import VideoList from './src/components/VideoList';
import Sidebar from './src/components/Sidebar';
import PlayerModal from './src/components/PlayerModal';
import AuthScreen from './src/screens/AuthScreen';
import { useGravityData } from './src/hooks/useGravityData';
import { youtubeService } from './src/services/youtube';
import { supabaseAuth } from './src/lib/supabase';
import { COLORS } from './src/theme';

export default function App() {
  const { session, userProfile, stats, videos, likedVideos, subFeedVideos, historyVideos, loading, loadingMore, loadingLikes, loadingSubs, error, handleSearch, loadTrends, loadMoreTrends, loadLikedVideos, loadSubscriptionFeed, loadMoreSubscriptionFeed, loadHistory, addToHistory, toggleLocalLike, updateNickname, logout } =
    useGravityData();

  const [activeTab, setActiveTab] = useState('Keşfet');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  useEffect(() => {
    if (activeTab === 'Hesap') {
      setNicknameInput(userProfile?.nickname || '');
    }
  }, [activeTab, userProfile?.nickname]);

  useEffect(() => {
    if (activeTab === 'Beğeniler' && likedVideos.length === 0) {
      loadLikedVideos();
    }
    if (activeTab === 'Abonelikler' && subFeedVideos.length === 0) {
      loadSubscriptionFeed();
    }
    if (activeTab === 'Geçmiş') {
      loadHistory();
    }
  }, [activeTab]);

  const openVideo = async (video: any) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    addToHistory(video);
  };

  const closePlayer = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz!');
      return;
    }
    const result = await updateNickname(nicknameInput);
    if (result.success) {
      Alert.alert('Başarılı', 'Kullanıcı adınız güncellendi!');
    } else {
      Alert.alert('Hata', result.message || 'Güncellenirken bir sorun oluştu.');
    }
  };

  if (!session) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Header onMenuPress={() => setSidebarOpen(true)} />
        
        {activeTab === 'Keşfet' && (
          <SearchBar onSearch={handleSearch} loading={loading} />
        )}

        {(activeTab === 'Keşfet' || activeTab === 'Abonelikler' || activeTab === 'Beğeniler' || activeTab === 'Geçmiş') ? (
          <VideoList
            videos={
              activeTab === 'Beğeniler' ? likedVideos : 
              activeTab === 'Abonelikler' ? subFeedVideos : 
              activeTab === 'Geçmiş' ? historyVideos :
              videos
            }
            loading={
              activeTab === 'Beğeniler' ? loadingLikes : 
              activeTab === 'Abonelikler' ? loadingSubs : 
              activeTab === 'Geçmiş' ? false : // History is local/instant
              loading
            }
            loadingMore={
              (activeTab === 'Beğeniler' || activeTab === 'Geçmiş') ? false : loadingMore
            }
            onRefresh={
              activeTab === 'Beğeniler' ? loadLikedVideos : 
              activeTab === 'Abonelikler' ? loadSubscriptionFeed : 
              activeTab === 'Geçmiş' ? loadHistory :
              loadTrends
            }
            onLoadMore={
              (activeTab === 'Beğeniler' || activeTab === 'Geçmiş') ? undefined : 
              activeTab === 'Abonelikler' ? loadMoreSubscriptionFeed : 
              loadMoreTrends
            }
            onPressItem={openVideo}
          />
        ) : activeTab === 'Hesap' ? (
          <View style={styles.accountContainer}>
            <Text style={styles.accountTitle}>Hesap Bilgileri</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-Posta Adresi</Text>
              <TextInput
                style={[styles.input, { opacity: 0.7 }]}
                value={session.user.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kullanıcı Adı (Takma Ad)</Text>
              <TextInput
                style={styles.input}
                placeholder="Bir takma ad belirleyin"
                placeholderTextColor={COLORS.textDim}
                value={nicknameInput}
                onChangeText={setNicknameInput}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNickname}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textDim }}>Abonelikler: {stats.subs} | Beğeniler: {stats.likes}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{activeTab} Çok Yakında!</Text>
          </View>
        )}

        <Sidebar 
          visible={isSidebarOpen} 
          activeTab={activeTab} 
          onClose={() => setSidebarOpen(false)} 
          onSelectTab={setActiveTab}
          onSignOut={logout}
          stats={stats}
        />
        
        <PlayerModal
          visible={!!selectedVideo}
          video={selectedVideo}
          isPlaying={isPlaying}
          onClose={closePlayer}
          onToggleLike={toggleLocalLike}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  accountContainer: {
    flex: 1,
    padding: 20,
  },
  accountTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textDim,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
