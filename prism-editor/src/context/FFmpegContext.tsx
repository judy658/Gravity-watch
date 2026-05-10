import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  loaded: boolean;
  loading: boolean;
  progress: number;
  logs: string[];
  loadFFmpeg: () => Promise<void>;
}

const FFmpegContext = createContext<FFmpegContextType | undefined>(undefined);

export const FFmpegProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());

  const loadFFmpeg = async () => {
    if (loaded || loading) return;

    setLoading(true);
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('log', ({ message }) => {
      setLogs((prev) => [...prev.slice(-100), message]);
      console.log('[FFmpeg Log]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress * 100);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FFmpegContext.Provider value={{ 
      ffmpeg: ffmpegRef.current, 
      loaded, 
      loading, 
      progress, 
      logs, 
      loadFFmpeg 
    }}>
      {children}
    </FFmpegContext.Provider>
  );
};

export const useFFmpeg = () => {
  const context = useContext(FFmpegContext);
  if (context === undefined) {
    throw new Error('useFFmpeg must be used within an FFmpegProvider');
  }
  return context;
};
