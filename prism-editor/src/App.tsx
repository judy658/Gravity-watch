import { useEffect, useState } from 'react'
import './App.css'
import { FFmpegProvider, useFFmpeg } from './context/FFmpegContext'

interface Asset {
  id: string;
  file: File;
  thumbnail: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number; // in seconds
}

interface TimelineItem {
  id: string;
  assetId: string;
  track: 'visual' | 'video' | 'audio';
  start: number; // in seconds
  duration: number; // in seconds
}

function Editor() {
  const { ffmpeg, loaded, progress, loadFFmpeg } = useFFmpeg();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const type = file.type.startsWith('video/') ? 'video' : 'audio';
      const element = document.createElement(type === 'video' ? 'video' : 'audio');
      element.preload = 'metadata';
      element.onloadedmetadata = () => {
        resolve(element.duration);
      };
      element.src = URL.createObjectURL(file);
    });
  };

  const addAssets = async (files: FileList | File[]) => {
    const newAssets: Asset[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type: 'video' | 'audio' | 'image' | null = null;
      
      if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('image/')) type = 'image';
      
      if (!type) continue;
      
      const id = Math.random().toString(36).substr(2, 9);
      let thumbnail = '';
      let duration = 5; // Default for images
      
      if (type === 'video' || type === 'image') {
        thumbnail = URL.createObjectURL(file);
        if (type === 'video') {
          duration = await getDuration(file);
        }
      } else if (type === 'audio') {
        thumbnail = 'https://img.icons8.com/ios-filled/100/ffffff/music.png';
        duration = await getDuration(file);
      }
      
      newAssets.push({ id, file, thumbnail, name: file.name, type, duration });
    }
    setAssets((prev) => [...prev, ...newAssets]);
  };

  const PIXELS_PER_SECOND = 20;

  const handleDropToTimeline = (track: 'visual' | 'video' | 'audio', assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    if (track === 'audio' && asset.type !== 'audio') {
      alert('Ses katmanına sadece müzik dosyaları ekleyebilirsiniz!');
      return;
    }
    if ((track === 'video' || track === 'visual') && asset.type === 'audio') {
      alert('Bu katmana ses dosyası ekleyemezsiniz!');
      return;
    }

    const newItem: TimelineItem = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      track,
      start: 0,
      duration: asset.duration
    };
    setTimelineItems([...timelineItems, newItem]);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 50; // 50px is the track header width
    if (x < 0) return;
    const newTime = x / PIXELS_PER_SECOND;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 30);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  const exportVideo = async () => {
    if (!ffmpeg || !selectedAsset) return;

    setProcessing(true);
    try {
      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedAsset.file));

      const duration = Math.max(0.1, endTime - startTime);
      const args = [
        '-ss', startTime.toString(),
        '-i', 'input.mp4',
        '-t', duration.toString(),
        '-c', 'copy',
        '-y',
        'output.mp4'
      ];

      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile('output.mp4');
      
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prism-cut-${Date.now()}.mp4`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!loaded) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="prism-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>PRISM</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Yapay Zeka Video Motoru Hazırlanıyor...</p>
          <div style={{ width: '300px', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--prism-gradient)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="prism-logo" style={{ fontSize: '2rem', marginBottom: '1rem' }}>İŞLENİYOR</div>
            <p style={{ color: 'var(--text-secondary)' }}>Şaheseriniz dövülüyor...</p>
            <div style={{ width: '300px', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', marginTop: '1rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--prism-gradient)', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="glass" style={{ height: '50px', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="prism-logo" style={{ fontSize: '1.2rem' }}>PRISM PRO</div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Dosya</span>
            <span>Düzenle</span>
            <span>Ayarlar</span>
            <span>Yardım</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={exportVideo}
            disabled={!selectedAsset || processing}
            className="glass" 
            style={{ padding: '6px 20px', color: 'white', background: 'var(--prism-purple)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            DIŞA AKTAR
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* FAR LEFT NAVIGATION SIDEBAR */}
        <nav style={{ width: '60px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '25px', borderRight: '1px solid var(--border-subtle)' }}>
           <div title="Dosyalarım" style={{ cursor: 'pointer', opacity: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
           </div>
           <div title="Müzik" style={{ cursor: 'pointer', opacity: 0.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
           </div>
           <div title="Geçişler" style={{ cursor: 'pointer', opacity: 0.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8V6a2 2 0 0 1 2-2h2"/><path d="M22 8V6a2 2 0 0 0-2-2h-2"/><path d="M2 16v2a2 2 0 0 0 2 2h2"/><path d="M22 16v2a2 2 0 0 1-2 2h-2"/><circle cx="12" cy="12" r="3"/><path d="m11 15-4-4 4-4"/><path d="m13 15 4-4-4-4"/></svg>
           </div>
           <div title="Metin" style={{ cursor: 'pointer', opacity: 0.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
           </div>
           <div title="Filtreler" style={{ cursor: 'pointer', opacity: 0.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
           </div>
        </nav>

        {/* ASSET LIBRARY (SECONDARY SIDEBAR) */}
        <aside className="sidebar" 
          style={{ width: '300px', padding: '15px', borderRight: '1px solid var(--border-subtle)' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addAssets(e.dataTransfer.files);
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>İçe Aktarılanlar</h2>
            <label htmlFor="file-input" style={{ cursor: 'pointer', color: 'var(--prism-cyan)', fontSize: '1.2rem', padding: '0 5px' }}>+</label>
            <input id="file-input" type="file" multiple accept="video/*,audio/*,image/*" style={{ display: 'none' }} onChange={(e) => e.target.files && addAssets(e.target.files)} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', overflowY: 'auto', paddingRight: '5px' }}>
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                draggable
                onDragStart={(e) => e.dataTransfer.setData('assetId', asset.id)}
                onClick={() => setSelectedAsset(asset)}
                className="glass"
                style={{ 
                  aspectRatio: '16/9', 
                  overflow: 'hidden', 
                  position: 'relative', 
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: selectedAsset?.id === asset.id ? '2px solid var(--prism-purple)' : '1px solid var(--border-subtle)'
                }}
              >
                {asset.type === 'audio' ? (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)' }}>
                      <img src={asset.thumbnail} style={{ width: '24px', opacity: 0.5 }} />
                   </div>
                ) : asset.type === 'video' ? (
                  <video src={asset.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={asset.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', fontSize: '0.55rem', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.name}
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <div style={{ gridColumn: '1/3', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', border: '1px dashed var(--border-subtle)', borderRadius: '6px' }}>
                Buraya dosya ekle
              </div>
            )}
          </div>
        </aside>

        {/* PREVIEW AND MONITOR AREA */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
           <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              {selectedAsset ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <video 
                    ref={videoRef}
                    key={selectedAsset.id}
                    src={URL.createObjectURL(selectedAsset.file)} 
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} 
                  />
                </div>
              ) : (
                <div className="prism-logo" style={{ opacity: 0.1, fontSize: '4rem' }}>PRISM</div>
              )}
           </div>

           {/* MONITOR CONTROLS */}
           <div style={{ height: '40px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                 <svg style={{ cursor: 'pointer', opacity: 0.6 }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m11 17-5-5 5-5v10zm9 0-5-5 5-5v10z"/></svg>
                 <div onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                    }
                 }} style={{ cursor: 'pointer', background: 'var(--prism-purple)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}><path d="m7 4 12 8-12 8V4z"/></svg>
                    )}
                 </div>
                 <svg style={{ cursor: 'pointer', opacity: 0.6 }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m13 17 5-5-5-5v10zM4 17l5-5-5-5v10z"/></svg>
              </div>
              <div style={{ position: 'absolute', right: '30px', display: 'flex', gap: '10px' }}>
                 <select style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}>
                    <option>16:9 (YouTube)</option>
                    <option>9:16 (TikTok)</option>
                    <option>1:1 (Instagram)</option>
                 </select>
              </div>
           </div>
        </section>
      </div>

      {/* TIMELINE AREA (MOVAVI STYLE) */}
      <footer style={{ height: '300px', background: '#0f0f0f', borderTop: '2px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        {/* TIMELINE TOOLBAR */}
        <div style={{ height: '45px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px' }}>
           <div style={{ display: 'flex', gap: '20px', borderRight: '1px solid var(--border-subtle)', paddingRight: '20px' }}>
              <svg title="Böl" style={{ cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              <svg title="Sil" style={{ cursor: 'pointer', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              <svg title="Kırp" style={{ cursor: 'pointer', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
           </div>
           <div style={{ display: 'flex', gap: '20px' }}>
              <svg title="Mıknatıs" style={{ cursor: 'pointer', color: 'var(--prism-cyan)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 6-5 5-5-5V3h10v3z"/><path d="m17 18-5-5-5 5v3h10v-3z"/></svg>
              <svg title="Geri Al" style={{ cursor: 'pointer', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-15 9 9 0 0 0-6 2.3L3 13"/></svg>
              <svg title="İleri Al" style={{ cursor: 'pointer', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-15 9 9 0 0 1 6 2.3L21 13"/></svg>
           </div>
           <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--prism-cyan)', fontWeight: 'bold', fontFamily: 'monospace' }}>
             {formatTime(currentTime)}
           </div>
        </div>

        {/* THE TRACKS */}
        <div 
          onClick={handleTimelineClick}
          style={{ flex: 1, overflowY: 'auto', position: 'relative', cursor: 'text' }}
        >
          {/* TIME RULER */}
          <div style={{ height: '25px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
             <div style={{ height: '100%', width: '5000px', background: 'repeating-linear-gradient(90deg, transparent, transparent 99px, rgba(255,255,255,0.1) 100px)', opacity: 0.5 }}></div>
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropToTimeline('visual', e.dataTransfer.getData('assetId'))}
            style={{ height: '50px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}
          >
             <div style={{ width: '50px', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
             </div>
             {timelineItems.filter(i => i.track === 'visual').map(item => (
                <div key={item.id} className="timeline-item" style={{ height: '34px', width: `${item.duration * PIXELS_PER_SECOND}px`, background: '#444', borderRadius: '3px', margin: '0 1px', fontSize: '0.6rem', padding: '0 8px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                   {assets.find(a => a.id === item.assetId)?.name}
                </div>
             ))}
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropToTimeline('video', e.dataTransfer.getData('assetId'))}
            style={{ height: '70px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}
          >
             <div style={{ width: '50px', height: '100%', background: 'rgba(64,150,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
             </div>
             {timelineItems.filter(i => i.track === 'video').map(item => (
                <div key={item.id} className="timeline-item" style={{ height: '54px', width: `${item.duration * PIXELS_PER_SECOND}px`, background: 'var(--prism-purple)', borderRadius: '4px', margin: '0 1px', fontSize: '0.65rem', padding: '0 10px', display: 'flex', alignItems: 'center', border: '1px solid var(--prism-cyan)', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)' }}>
                   {assets.find(a => a.id === item.assetId)?.name}
                </div>
             ))}
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropToTimeline('audio', e.dataTransfer.getData('assetId'))}
            style={{ height: '50px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}
          >
             <div style={{ width: '50px', height: '100%', background: 'rgba(82,196,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
             </div>
             {timelineItems.filter(i => i.track === 'audio').map(item => (
                <div key={item.id} className="timeline-item" style={{ height: '34px', width: `${item.duration * PIXELS_PER_SECOND}px`, background: '#237804', borderRadius: '3px', margin: '0 1px', fontSize: '0.65rem', padding: '0 10px', display: 'flex', alignItems: 'center', border: '1px solid #52c41a' }}>
                   {assets.find(a => a.id === item.assetId)?.name}
                </div>
             ))}
          </div>

          {/* PLAYHEAD (THE ORANGE LINE) */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            bottom: 0, 
            left: `${50 + (currentTime * PIXELS_PER_SECOND)}px`, 
            width: '2px', 
            background: '#ff9640', 
            zIndex: 100, 
            pointerEvents: 'none',
            transition: 'left 0.1s linear'
          }}>
             <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '12px', height: '12px', background: '#ff9640', borderRadius: '50%', transform: 'rotate(45deg)' }}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <FFmpegProvider>
      <Editor />
    </FFmpegProvider>
  )
}

export default App
