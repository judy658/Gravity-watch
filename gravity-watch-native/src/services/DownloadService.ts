import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:5000'; // Bu kismi dinamiklestirmek gerekebilir

export interface DownloadProgress {
  phase: 'idle' | 'resolving' | 'downloading_video' | 'downloading_audio' | 'muxing' | 'saving' | 'success' | 'error';
  videoProgress: number;
  audioProgress: number;
  message: string;
}

export class DownloadService {
  static async downloadVideo(
    videoId: string, 
    onProgress: (progress: DownloadProgress) => void
  ) {
    try {
      // Phase 1: Resolve URLs
      onProgress({ phase: 'resolving', videoProgress: 0, audioProgress: 0, message: 'Linkler hazirlaniyor...' });
      const resolveRes = await axios.get(`${API_BASE_URL}/api/resolve_split?video_id=${videoId}`);
      const { video_url, audio_url, title } = resolveRes.data;

      if (!video_url) throw new Error('Video linki bulunamadi.');

      const tempVideoPath = `${FileSystem.cacheDirectory}temp_video_${videoId}.mp4`;
      const tempAudioPath = `${FileSystem.cacheDirectory}temp_audio_${videoId}.webm`;
      const outputPath = `${FileSystem.cacheDirectory}${title.replace(/[^a-z0-9]/gi, '_')}.mp4`;

      // Phase 2: Download Video
      onProgress({ phase: 'downloading_video', videoProgress: 0, audioProgress: 0, message: 'Goruntu indiriliyor...' });
      const videoRes = await FileSystem.downloadAsync(
        video_url,
        tempVideoPath,
        {
          progressCallback: (p) => {
            onProgress({ 
              phase: 'downloading_video', 
              videoProgress: p.totalBytesWritten / p.totalBytesExpectedToWrite, 
              audioProgress: 0, 
              message: `Goruntu: %${Math.round((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100)}` 
            });
          }
        }
      );

      // Phase 3: Download Audio (if separate)
      let audioFile = null;
      if (audio_url) {
        onProgress({ phase: 'downloading_audio', videoProgress: 1, audioProgress: 0, message: 'Ses indiriliyor...' });
        audioFile = await FileSystem.downloadAsync(
          audio_url,
          tempAudioPath,
          {
            progressCallback: (p) => {
              onProgress({ 
                phase: 'downloading_audio', 
                videoProgress: 1, 
                audioProgress: p.totalBytesWritten / p.totalBytesExpectedToWrite, 
                message: `Ses: %${Math.round((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100)}` 
              });
            }
          }
        );
      }

      // Phase 4: Muxing with FFmpeg
      onProgress({ phase: 'muxing', videoProgress: 1, audioProgress: 1, message: 'Parcalar birlestiriliyor (Export)...' });
      
      let ffmpegCommand = '';
      if (audio_url) {
        // Mux video and audio
        ffmpegCommand = `-i "${tempVideoPath}" -i "${tempAudioPath}" -c copy -y "${outputPath}"`;
      } else {
        // Just move/rename if it was already combined (e.g. Cobalt)
        ffmpegCommand = `-i "${tempVideoPath}" -c copy -y "${outputPath}"`;
      }

      const session = await FFmpegKit.execute(ffmpegCommand);
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        // Phase 5: Saving to Gallery
        onProgress({ phase: 'saving', videoProgress: 1, audioProgress: 1, message: 'Galeriye kaydediliyor...' });
        
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.createAssetAsync(outputPath);
          onProgress({ phase: 'success', videoProgress: 1, audioProgress: 1, message: 'Basariyla kaydedildi!' });
        } else {
          // Fallback to Sharing
          await Sharing.shareAsync(outputPath);
          onProgress({ phase: 'success', videoProgress: 1, audioProgress: 1, message: 'Dosya paylasildi.' });
        }
      } else {
        throw new Error('FFmpeg birlestirme hatasi olustu.');
      }

      // Cleanup
      await FileSystem.deleteAsync(tempVideoPath, { idempotent: true });
      if (audio_url) await FileSystem.deleteAsync(tempAudioPath, { idempotent: true });

    } catch (error: any) {
      console.error('Download Error:', error);
      onProgress({ phase: 'error', videoProgress: 0, audioProgress: 0, message: `Hata: ${error.message}` });
    }
  }
}
