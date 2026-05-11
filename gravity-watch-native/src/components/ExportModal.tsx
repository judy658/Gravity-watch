import React from 'react';
import { View, Text, Modal, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { DownloadProgress } from '../services/DownloadService';
import { CheckCircle2, AlertCircle, HardDriveDownload, FileVideo, AudioLines, Merge, Save } from 'lucide-react-native';

interface ExportModalProps {
  visible: boolean;
  progress: DownloadProgress;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ visible, progress, onClose }) => {
  const renderIcon = () => {
    switch (progress.phase) {
      case 'resolving': return <HardDriveDownload size={48} color="#FFD700" />;
      case 'downloading_video': return <FileVideo size={48} color="#00BFFF" />;
      case 'downloading_audio': return <AudioLines size={48} color="#ADFF2F" />;
      case 'muxing': return <Merge size={48} color="#FF4500" />;
      case 'saving': return <Save size={48} color="#9370DB" />;
      case 'success': return <CheckCircle2 size={64} color="#32CD32" />;
      case 'error': return <AlertCircle size={64} color="#FF0000" />;
      default: return <ActivityIndicator size="large" color="#FFF" />;
    }
  };

  const getProgressWidth = () => {
    if (progress.phase === 'downloading_video') return `${progress.videoProgress * 100}%`;
    if (progress.phase === 'downloading_audio') return `${progress.audioProgress * 100}%`;
    if (['muxing', 'saving', 'success'].includes(progress.phase)) return '100%';
    return '0%';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          
          <Text style={styles.title}>
            {progress.phase === 'success' ? 'TAMAMLANDI' : 
             progress.phase === 'error' ? 'HATA OLUŞTU' : 'DIŞA AKTARILIYOR'}
          </Text>
          
          <Text style={styles.message}>{progress.message}</Text>

          {['downloading_video', 'downloading_audio', 'muxing', 'saving'].includes(progress.phase) && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: getProgressWidth() }]} />
            </View>
          )}

          {(progress.phase === 'success' || progress.phase === 'error') && (
            <Text style={styles.closeBtn} onPress={onClose}>KAPAT</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  message: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  closeBtn: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    padding: 10,
  }
});

export default ExportModal;
