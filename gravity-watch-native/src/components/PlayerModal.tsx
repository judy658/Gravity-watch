import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Download } from 'lucide-react-native';
import { supabaseData, supabaseAuth } from '../lib/supabase';
import { DownloadService, DownloadProgress } from '../services/DownloadService';
import ExportModal from './ExportModal';

export default function PlayerModal({
  visible,
  video,
  isPlaying,
  onClose,
}: {
  visible: boolean;
  video: any | null;
  isPlaying: boolean;
  onClose: () => void;
  onToggleLike?: (video: any, isLiking: boolean) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    phase: 'idle',
    videoProgress: 0,
    audioProgress: 0,
    message: ''
  });

  useEffect(() => {
    if (visible && video) {
      checkStatus();
    }
  }, [visible, video]);

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session) return;
      const userEmail = session.user.email;

      // Check Like
      const { data: likeData } = await supabaseData
        .from('user_interactions')
        .select('id')
        .eq('user_id', userEmail)
        .eq('video_id', video.id)
        .eq('action_type', 'like')
        .maybeSingle();
      setIsLiked(!!likeData);

      // Check Subscription (Esnek arama: Büyük/küçük harf duyarlılığını kaldırır)
      const { data: subData } = await supabaseData
        .from('local_subs')
        .select('id')
        .eq('user_id', userEmail)
        .ilike('channel_name', video.author)
        .maybeSingle();
      setIsSubscribed(!!subData);
    } catch (e) {
      console.error("Durum kontrol hatası:", e);
    }
  };

  const handleLike = async () => {
    if (isActionLoading || !video) return;
    setIsActionLoading(true);
    try {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session) return;
      const userEmail = session.user.email;

      if (isLiked) {
        const { error } = await supabaseData
          .from('user_interactions')
          .delete()
          .eq('user_id', userEmail)
          .eq('video_id', video.id)
          .eq('action_type', 'like');
        
        if (error) {
          console.error("Beğeni kaldırma hatası:", error);
        } else {
          setIsLiked(false);
          if (onToggleLike) onToggleLike(video, false);
        }
      } else {
        const { error } = await supabaseData
          .from('user_interactions')
          .insert({ 
            user_id: userEmail, 
            video_id: video.id,
            action_type: 'like',
            tags: ['general']
          });
        if (error) {
          console.error("Beğeni ekleme hatası:", JSON.stringify(error));
        } else {
          setIsLiked(true);
          if (onToggleLike) onToggleLike(video, true);
        }
      }
    } catch (e) {
      console.error("Beğeni hatası:", e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (isActionLoading || !video) return;
    setIsActionLoading(true);
    try {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session) return;
      const userEmail = session.user.email;

      if (isSubscribed) {
        const { error } = await supabaseData.from('local_subs').delete().eq('user_id', userEmail).ilike('channel_name', video.author);
        if (error) {
          console.error("Abonelik kaldırma hatası:", error);
        } else {
          setIsSubscribed(false);
        }
      } else {
        const { error } = await supabaseData.from('local_subs').insert({
          user_id: userEmail,
          channel_name: video.author,
          channel_id: 'mobile_' + video.author.replace(/\s+/g, '_').toLowerCase()
        });
        if (error) {
          console.error("Abonelik ekleme hatası detay:", JSON.stringify(error));
        } else {
          setIsSubscribed(true);
        }
      }
    } catch (e) {
      console.error("Abonelik hatası:", e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!video) return;
    setExportVisible(true);
    await DownloadService.downloadVideo(video.id, (progress) => {
      setDownloadProgress(progress);
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Yüzen (Floating) Kapatma Butonu */}
        <TouchableOpacity onPress={onClose} style={styles.floatingCloseBtn}>
          <X color="#fff" size={32} />
        </TouchableOpacity>
        
        {/* Video area (WebView) */}
        {video ? (
          <WebView
            source={{ uri: `https://m.youtube.com/watch?v=${video.id}` }}
            style={styles.video}
            allowsInlineMediaPlayback={true}
            allowsFullscreenVideo={true} // EN KRİTİK AYAR: Android'de Tam Ekran tuşunun çalışmasını sağlar
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            injectedJavaScript={`
              if (!document.getElementById('gravity-css')) {
                var css = "" +
                  // Sadece üst barı ve yorumları gizle
                  "ytm-mobile-topbar-renderer, ytm-header-bar, ytm-item-section-renderer, ytm-single-column-watch-next-results-renderer, .ytp-youtube-button, ytm-promoted-sparkles-web-renderer { display: none !important; }" +
                  "body, html, ytm-app { background-color: #000 !important; margin: 0 !important; padding: 0 !important; }";
                var style = document.createElement('style');
                style.id = 'gravity-css';
                style.appendChild(document.createTextNode(css));
                document.head.appendChild(style);
              }

              // REKLAM ENGELLEYİCİ
              setInterval(() => {
                try {
                  var adClasses = ['.ytp-ad-overlay-container', '.ytp-ad-message-container', 'ytm-companion-ad-renderer'];
                  adClasses.forEach(cls => {
                    var els = document.querySelectorAll(cls);
                    els.forEach(e => e.style.display = 'none');
                  });

                  var skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
                  if (skipBtn) skipBtn.click();

                  var isAdPlaying = document.querySelector('.ad-showing') || document.querySelector('.ad-interrupting');
                  var video = document.querySelector('video');
                  if (isAdPlaying && video) {
                    if (video.duration && video.currentTime < video.duration - 1) {
                      video.currentTime = video.duration - 1;
                    }
                  }
                } catch(e) {}
              }, 300);
              true;
            `}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}
        
        {/* Alt Kısım: Bizim Özel Arayüzümüz (Beğen / Abone Ol) */}
        {video && (
          <View style={styles.actionPanel}>
            <View style={styles.videoInfo}>
              <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
              <Text style={styles.author}>{video.author}</Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, isLiked && styles.likedButton]} 
                onPress={handleLike}
                disabled={isActionLoading}
              >
                <Text style={[styles.actionButtonText, isLiked && styles.likedButtonText]}>
                  {isLiked ? '💖 Beğenildi' : '👍 Beğen'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, isSubscribed ? styles.subscribedButton : styles.subscribeButton]} 
                onPress={handleSubscribe}
                disabled={isActionLoading}
              >
                <Text style={[styles.subscribeButtonText, isSubscribed && styles.subscribedButtonText]}>
                  {isSubscribed ? 'Abone Olundu' : 'Abone Ol'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.downloadButton]} 
                onPress={handleDownload}
              >
                <Download size={20} color="#FFD700" />
                <Text style={styles.downloadButtonText}>İndir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ExportModal 
          visible={exportVisible} 
          progress={downloadProgress} 
          onClose={() => setExportVisible(false)} 
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 40, 
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  video: {
    flex: 1, // Üst kısmı olabildiğince kaplar
    width: '100%',
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: -1,
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
  },
  actionPanel: {
    height: 200, // Alt kısımda sabit bir alan ayırıyoruz
    backgroundColor: '#0f0e17', // Premium koyu arka plan
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
    padding: 20,
    justifyContent: 'space-between',
  },
  videoInfo: {
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    color: '#a0a0b0',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2a2a35',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  likedButton: {
    backgroundColor: 'rgba(124, 92, 252, 0.2)', // Gravity Moru
    borderColor: '#7c5cfc',
    borderWidth: 1,
  },
  likedButtonText: {
    color: '#7c5cfc',
  },
  subscribeButton: {
    backgroundColor: '#ff0000', // YouTube kırmızısı
  },
  subscribedButton: {
    backgroundColor: '#2a2a35', // Pasif gri
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscribedButtonText: {
    color: '#a0a0b0',
  },
  downloadButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
  },
  downloadButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
