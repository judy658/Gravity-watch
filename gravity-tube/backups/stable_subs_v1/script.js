// --- SUPABASE CONFIGURATION ---
const GRAVITY_URL = "https://nxpmocnezqsxhhsuwiiq.supabase.co";
const GRAVITY_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cG1vY25lenFzeGhoc3V3aWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTExMTUsImV4cCI6MjA5MzEyNzExNX0.52g_5VsgMdGaTJzghA3D__Ho58lnTBP8-prm8LReIdQ";
const gravityClient = supabase.createClient(GRAVITY_URL, GRAVITY_ANON);

const DEVSTORE_URL = "https://jnuckqaiutmkiquptvzu.supabase.co";
const DEVSTORE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWNrcWFpdXRta2lxdXB0dnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDgzMTAsImV4cCI6MjA4ODk4NDMxMH0.sP_FoTrYOFWiIS7PdaFYtR1JbP5vGf_KLgc_jh7zhZY";
const devstoreClient = supabase.createClient(DEVSTORE_URL, DEVSTORE_ANON);

const API_BASE = "http://127.0.0.1:5000";

document.addEventListener('DOMContentLoaded', async () => {
    const authView = document.getElementById('auth-view');
    const mainApp = document.getElementById('main-app');
    const loginSubmit = document.getElementById('login-submit-btn');
    const registerSubmit = document.getElementById('register-submit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userAvatar = document.getElementById('user-avatar');
    const searchResults = document.getElementById('search-results');
    const playerView = document.getElementById('player-view');
    const channelView = document.getElementById('channel-view');
    const homeView = document.getElementById('home-view');
    const loading = document.getElementById('loading');
    const playerLikeBtn = document.getElementById('player-like-btn');
    const playerDislikeBtn = document.getElementById('player-dislike-btn');
    const playerSubBtn = document.getElementById('player-sub-btn');
    const playerBackBtn = document.getElementById('player-back-btn');
    const qualitySelector = document.getElementById('quality-selector');
    const mainPlayer = document.getElementById('main-player');
    
    // View Elements
    const views = {
        home: document.getElementById('home-view'),
        player: document.getElementById('player-view'),
        channel: document.getElementById('channel-view'),
        profile: document.getElementById('profile-view'),
        auth: document.getElementById('auth-view')
    };

    function switchView(viewName) {
        const miniPlayer = document.getElementById('mini-player-container');
        const miniPlayerContent = document.getElementById('mini-player-content');
        const mainPlayerContainer = document.querySelector('.player-container');

        // If moving AWAY from player/channel
        if (viewName !== 'player' && viewName !== 'channel') {
            // If video was playing, move to mini player
            if (!mainPlayer.paused && mainPlayer.src) {
                miniPlayerContent.appendChild(mainPlayer);
                miniPlayer.classList.remove('mini-player-hidden');
                if (currentVideo) document.getElementById('mini-player-title').textContent = currentVideo.title;
            } else {
                miniPlayer.classList.add('mini-player-hidden');
            }
        } 
        // If moving TO player
        else if (viewName === 'player') {
            const infoBox = document.querySelector('.video-info-box');
            if (mainPlayer.parentElement !== mainPlayerContainer) {
                mainPlayerContainer.insertBefore(mainPlayer, infoBox);
            }
            miniPlayer.classList.add('mini-player-hidden');
        }

        // Hide all
        Object.values(views).forEach(v => { if(v) v.style.display = 'none'; });
        
        // Show target
        if (views[viewName]) {
            views[viewName].style.display = 'block';
            if (viewName === 'home') searchResults.style.display = 'grid';
        }
        
        // Reset scroll
        window.scrollTo(0, 0);
    }

    function renderSkeletons(container, count = 8) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skel = document.createElement('div');
            skel.className = 'skeleton-card';
            skel.innerHTML = `
                <div class="skeleton skeleton-thumb"></div>
                <div class="skeleton-meta">
                    <div class="skeleton skeleton-avatar"></div>
                    <div class="skeleton-info">
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text short"></div>
                    </div>
                </div>
            `;
            container.appendChild(skel);
        }
    }

    let currentUserEmail = null;
    let isFetching = false;
    let currentVideo = null;
    let isInteracting = false;
    let currentVideoLiked = false;
    let impressionTimeout = null;
    let currentPage = 1;
    let canLoadMore = true;
    let subscribedChannels = new Set();
    let isSubscribedCurrent = false; // Aktif video icin abone durumu
    
    // Channel page state
    let channelPage = 1;
    let channelCanLoadMore = true;
    let channelIsFetching = false;
    let currentChannelId = null;
    let currentChannelName = null;
    
    // Uygulama Modu: 'discover' veya 'liked'
    let feedMode = 'discover';
    
    // DASH player instance (Init only when needed)
    // DASH player kaldirildi, yerine Dual-Stream (Browser Sync) mantigi eklendi

    async function updateDynamicTheme(imgUrl) {
        if (!imgUrl) return;
        const img = new Image();
        img.crossOrigin = "Anonymous"; // CORS engelini aşmak için
        img.src = imgUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 10; // Küçük boyut hız için yeterli
            canvas.height = 10;
            ctx.drawImage(img, 0, 0, 10, 10);
            const data = ctx.getImageData(0, 0, 10, 10).data;
            
            let r=0, g=0, b=0;
            for (let i=0; i<data.length; i+=4) {
                r += data[i]; g += data[i+1]; b += data[i+2];
            }
            r = Math.floor(r / (data.length/4));
            g = Math.floor(g / (data.length/4));
            b = Math.floor(b / (data.length/4));
            
            // Parlaklığı artır (Renklerin çok sönük kalmaması için)
            const color = `rgb(${Math.min(r+20, 255)}, ${Math.min(g+20, 255)}, ${Math.min(b+20, 255)})`;
            document.documentElement.style.setProperty('--dynamic-color', color);
        };
    }

    async function checkUser() {
        const { data: { session } } = await devstoreClient.auth.getSession();
        if (session) {
            currentUserEmail = session.user.email;
            await fetchSubscriptions();
            showApp(session.user);
            
            // Presence Sync Start
            startPresenceSync(session.user);
        } else {
            authView.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    }

    let presenceInterval = null;
    async function startPresenceSync(user) {
        if (!user) return;
        
        const updateStatus = async (isOnline = true) => {
            try {
                // Güvenlik ve Cihaz Kontrolü
                const { data: presenceData } = await devstoreClient
                    .from('user_presence')
                    .select('is_banned, first_device')
                    .eq('email', user.email)
                    .maybeSingle();

                if (presenceData && presenceData.is_banned) {
                    alert("Hesabınız yasaklanmıştır! 🚫");
                    await devstoreClient.auth.signOut();
                    window.location.reload();
                    return;
                }

                const deviceName = 'Desktop PC'; // Masaüstü uygulaması olduğu için sabit
                const upsertData = {
                    user_id: user.id,
                    email: user.email,
                    last_seen: new Date().toISOString(),
                    is_online: isOnline,
                    is_dead: false,
                    current_app: 'gravity-watch',
                    last_device: deviceName
                };

                // İlk cihaz kaydı yoksa ekle
                if (!presenceData || !presenceData.first_device) {
                    upsertData.first_device = deviceName;
                }

                await devstoreClient.from('user_presence').upsert(upsertData, { 
                    onConflict: 'email' 
                });
            } catch (e) { console.error("Presence update failed", e); }
        };

        // İlk ping
        updateStatus(true);

        // 30 saniyede bir heartbeat
        if (presenceInterval) clearInterval(presenceInterval);
        presenceInterval = setInterval(() => updateStatus(true), 30000);

        // Görünürlük takibi (Sekme gizlendiğinde offline yap)
        document.addEventListener('visibilitychange', () => {
            updateStatus(document.visibilityState === 'visible');
        });
    }

    async function fetchSubscriptions(retryCount = 0) {
        if (!currentUserEmail) return;
        try {
            const response = await fetch(`${API_BASE}/api/subscriptions?t=${Date.now()}`, {
                headers: { 'X-User-Email': currentUserEmail }
            });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                subscribedChannels = new Set();
                data.forEach(s => {
                    if (!s) return;
                    
                    // HIBRIT KONTROL: Veri nesne mi yoksa duz metin mi?
                    let cid = null;
                    let cname = null;

                    if (typeof s === 'string') {
                        cid = s;
                    } else {
                        cid = s.channel_id || s.id;
                        cname = s.channel_name || s.name;
                    }
                    
                    if (cid) {
                        subscribedChannels.add(cid.toString().trim());
                    }
                    
                    if (cname) {
                        subscribedChannels.add(`name:${cname.toString().trim().toLowerCase()}`);
                    }
                });

                if (currentVideo && playerView.style.display === 'block') {
                    checkSubscriptionUI(currentVideo.channel_id, currentVideo.uploader, false);
                }
            } else if (retryCount < 3) {
                setTimeout(() => fetchSubscriptions(retryCount + 1), 3000);
            }
        } catch(e) { 
            console.error("Sub Fetch Error:", e);
            if (retryCount < 3) setTimeout(() => fetchSubscriptions(retryCount + 1), 3000);
        }
    }

    function showApp(user) {
        authView.style.display = 'none';
        mainApp.style.display = 'block';
        userAvatar.src = `https://ui-avatars.com/api/?name=${user.email}&background=00f2ff&color=050a0f`;
        loadHomeFeed(true);
    }

    loginSubmit.onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        if(!email || !password) return alert("Lütfen mail ve şifre girin.");
        loading.style.display = 'flex';
        const { error } = await devstoreClient.auth.signInWithPassword({ email, password });
        loading.style.display = 'none';
        if (error) alert("Giriş Hatası: " + error.message); else window.location.reload();
    };

    registerSubmit.onclick = async () => {
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        if(!email || !password) return alert("Lütfen mail ve şifre girin.");
        loading.style.display = 'flex';
        const { error } = await devstoreClient.auth.signUp({ email, password });
        loading.style.display = 'none';
        if (error) alert("Kayıt Hatası: " + error.message); else alert("Kayıt Başarılı!");
    };

    logoutBtn.onclick = async () => { await devstoreClient.auth.signOut(); window.location.reload(); };

    async function loadHomeFeed(reset = false) {
        if (playerView.style.display === 'block' || (feedMode !== 'discover' && feedMode !== 'subscriptions')) return;
        if (!reset && (isFetching || !canLoadMore)) return;
        
        isFetching = true;
        
        if (reset) { 
            currentPage = 1; 
            canLoadMore = true; 
            seenVideoIds = [];
            renderSkeletons(searchResults, 12);
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/home`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail },
                body: JSON.stringify({ 
                    page: currentPage, 
                    seen_ids: seenVideoIds, 
                    refresh: reset,
                    subscriptions_only: feedMode === 'subscriptions'
                })
            });
            const data = await response.json();
            
            if (data && data.length > 0) {
                if (reset) searchResults.innerHTML = ''; // Clear only when we have new data
                renderVideos(data, !reset);
                startImpressionTracker(data);
                data.forEach(v => seenVideoIds.push(v.id));
                currentPage++;
            } else { 
                canLoadMore = false; 
                if (reset) {
                    searchResults.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim); padding: 50px;">Henüz içerik bulunamadı.</div>';
                }
            }
        } catch (err) { 
            console.error(err); 
            if (reset) searchResults.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim); padding: 50px;">Bağlantı hatası oluştu.</div>';
        }
        finally { 
            loading.style.display = 'none'; 
            isFetching = false; 
        }
    }

    async function loadLikedFeed(reset = false) {
        if (playerView.style.display === 'block' || feedMode !== 'liked') return;
        if (!currentUserEmail) return;
        if (!reset && (isFetching || !canLoadMore)) return;
        
        isFetching = true;
        if (reset) {
            currentPage = 1;
            canLoadMore = true;
            renderSkeletons(searchResults, 12);
        }
        try {
            const response = await fetch(`${API_BASE}/api/liked_videos?page=${currentPage}`, {
                headers: { 'X-User-Email': currentUserEmail }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                renderVideos(data, !reset);
                currentPage++;
            } else {
                canLoadMore = false;
                if (reset && data.length === 0) {
                    searchResults.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim); padding: 50px;">Henüz hiç video beğenmedin.</div>';
                }
            }
        } catch (err) { console.error(err); }
        finally { loading.style.display = 'none'; isFetching = false; }
    }

    async function loadHistoryFeed(reset = false) {
        if (playerView.style.display === 'block' || feedMode !== 'history') return;
        
        isFetching = true;
        if (reset) renderSkeletons(searchResults, 12);
        
        try {
            const response = await fetch(`${API_BASE}/api/history`);
            const history = await response.json();
            if (history && history.length > 0) {
                renderVideos(history, false);
            } else {
                if (reset) searchResults.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim); padding: 50px;">Geçmişin henüz boş. Videoları izledikçe burada görünecekler!</div>';
            }
        } catch (err) { console.error(err); }
        finally { loading.style.display = 'none'; isFetching = false; }
    }

    function addToLocalHistory(video) {
        // Redundant - Handled by backend resolve
        console.log("History managed by backend");
    }

    function renderVideos(videos, append = false, targetEl = null) {
        const container = targetEl || searchResults;
        if (!append) container.innerHTML = '';
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            const channelIdAttr = video.channel_id ? `data-channel-id="${video.channel_id}"` : '';
            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="video-actions">
                        <button class="action-btn like-btn"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
                <div class="video-card-info">
                    <h3>${video.title}</h3>
                    <div class="channel"><i class="fas fa-check-circle"></i> <span class="video-author-link" ${channelIdAttr} data-channel-name="${video.uploader || 'Bilinmeyen Kanal'}">${video.uploader || 'Bilinmeyen Kanal'}</span></div>
                    <div class="stats">${video.label || 'Video'}</div>
                </div>
            `;
            card.onclick = () => { lastScrollPos = window.scrollY; if (impressionTimeout) clearTimeout(impressionTimeout); playVideo(video.id, video); };
            // Author name click -> channel page
            const authorLink = card.querySelector('.video-author-link');
            if (authorLink) {
                authorLink.onclick = (e) => {
                    e.stopPropagation();
                    const chId = authorLink.getAttribute('data-channel-id');
                    const chName = authorLink.getAttribute('data-channel-name');
                    loadChannelPage(chId, chName);
                };
            }
            const likeBtn = card.querySelector('.like-btn');
            likeBtn.onclick = (e) => { e.stopPropagation(); if (isInteracting) return; likeBtn.style.color = '#ff4b2b'; handleInteraction(video, 'like'); };
            container.appendChild(card);
        });
    }

    window.onscroll = () => {
        // Debounce: Eğer zaten yükleniyorsa veya sona gelindiyse dur
        if (isFetching || channelIsFetching || !canLoadMore) return;
        
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1200) {
            // Channel view infinite scroll
            if (channelView.style.display === 'block') {
                loadMoreChannelVideos();
            }
            // Feed infinite scroll
            else if (playerView.style.display !== 'block') {
                if (feedMode === 'discover') {
                    loadHomeFeed(false);
                } else if (feedMode === 'liked') {
                    loadLikedFeed(false);
                } else if (feedMode === 'subscriptions') {
                    loadHomeFeed(false);
                }
            }
        }
    };

    function startImpressionTracker(videos) {
        if (impressionTimeout) clearTimeout(impressionTimeout);
        impressionTimeout = setTimeout(() => {
            const tags = videos.slice(0, 5).map(v => (v.uploader || 'general').toLowerCase().trim());
            fetch(`${API_BASE}/api/impression`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail }, body: JSON.stringify({ tags }) });
        }, 10000);
    }

    async function handleInteraction(video, action) {
        if (!currentUserEmail || isInteracting) return;
        isInteracting = true;
        const tag = (video.uploader || 'general').toLowerCase().trim();
        try {
            await fetch(`${API_BASE}/api/like`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail }, 
                body: JSON.stringify({ 
                    video_id: video.id, 
                    tag: tag, 
                    action_type: action,
                    video_obj: video // Metadata to be cached locally
                }) 
            });
        } catch (err) { console.error(err); }
        finally { setTimeout(() => { isInteracting = false; }, 500); }
    }

    async function handleSubscribe(channelName, channelId) {
        if (!currentUserEmail || isInteracting) return;
        isInteracting = true;
        
        const realId = channelId;
        const nameId = channelName ? `name:${channelName.trim().toLowerCase()}` : null;
        const targetId = realId || nameId;
        
        const oldState = isSubscribedCurrent;
        isSubscribedCurrent = !isSubscribedCurrent;
        updateSubButtonUI(isSubscribedCurrent);

        try {
            // Sunucuya gönder
            await fetch(`${API_BASE}/api/subscriptions`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail }, 
                body: JSON.stringify({ 
                    channel_name: channelName, 
                    channel_id: targetId,
                    subscribe: isSubscribedCurrent
                }) 
            });
            
            // Yerel Set'i güncelle (Kesin sonuç)
            if (isSubscribedCurrent) {
                if (realId) subscribedChannels.add(realId);
                if (nameId) subscribedChannels.add(nameId);
            } else {
                if (realId) subscribedChannels.delete(realId);
                if (nameId) subscribedChannels.delete(nameId);
            }
            
            // Buradaki fetchSubscriptions'ı siliyoruz çünkü yerel set zaten güncel.
            // 2 saniye sonra gelip durumu bozmasını istemiyoruz.
            
        } catch (err) { 
            console.error(err);
            isSubscribedCurrent = oldState;
            updateSubButtonUI(isSubscribedCurrent);
        }
        finally { setTimeout(() => { isInteracting = false; }, 500); }
    }

    function updateSubButtonUI(isSubscribed) {
        if (isSubscribed) {
            playerSubBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed';
            playerSubBtn.classList.add('subscribed');
        } else {
            playerSubBtn.innerHTML = '<i class="fas fa-plus"></i> Subscribe';
            playerSubBtn.classList.remove('subscribed');
        }
    }

    function checkSubscriptionUI(channelId, channelName, triggerFetch = true) {
        if (!currentUserEmail) {
            setTimeout(() => checkSubscriptionUI(channelId, channelName, triggerFetch), 1000);
            return;
        }
        
        const realId = channelId ? channelId.toString().trim() : null;
        // İsim bazlı eşleşmeyi sadece prefix ile yapıyoruz (Unified System)
        const nameId = channelName ? `name:${channelName.toString().trim().toLowerCase()}` : null;
        
        const doCheck = () => {
            // 1. Direkt ID ile kontrol (En güvenli)
            if (realId && subscribedChannels.has(realId)) return true;
            // 2. İsim bazlı fallback
            if (nameId && subscribedChannels.has(nameId)) return true;
            
            // 3. Ekstra Güvenlik: Set içindeki her şeyi kontrol et (Büyük/Küçük harf vs)
            for (let sub of subscribedChannels) {
                if (realId && sub === realId) return true;
                if (nameId && sub === nameId) return true;
            }
            return false;
        };

        isSubscribedCurrent = doCheck();
        updateSubButtonUI(isSubscribedCurrent);

        if (!isSubscribedCurrent && triggerFetch && subscribedChannels.size === 0) {
            fetchSubscriptions();
        }
    }

    async function playVideo(videoId, videoObj) {
        if (impressionTimeout) clearTimeout(impressionTimeout);
        loading.style.display = 'flex';
        currentVideo = videoObj || { id: videoId };
        
        // Dinamik Tema Güncellemesi (Kozmik Arayüz)
        if (currentVideo.thumbnail) updateDynamicTheme(currentVideo.thumbnail);
        
        // Yeni bir video açıldığında önceki videonun Like/Dislike renklerini sıfırla
        playerLikeBtn.style.color = 'rgba(255, 255, 255, 0.7)';
        playerDislikeBtn.classList.remove('active-dislike');
        currentVideoLiked = false;
        
        // Eğer kullanıcı giriş yaptıysa, bu videoyu önceden beğenip beğenmediğini kontrol et
        if (currentUserEmail) {
            fetch(`${API_BASE}/api/check_like?video_id=${videoId}`, {
                headers: { 'X-User-Email': currentUserEmail }
            }).then(r => r.json()).then(d => {
                currentVideoLiked = d.liked;
                if (currentVideoLiked) {
                    playerLikeBtn.style.color = '#ff4b2b';
                }
            }).catch(e => console.error("Like check failed", e));
        }
        
        // Setup hidden audio player for dual-stream 1080p
        if (!window.audioPlayer) {
            window.audioPlayer = document.createElement('audio');
            document.body.appendChild(window.audioPlayer);
            
            // Sync audio with video (Sıkı Kilit v2 - Anti-Freeze)
            let isSyncing = false;
            
            mainPlayer.onplay = () => { 
                if(window.audioPlayer.src) {
                    window.audioPlayer.currentTime = mainPlayer.currentTime;
                    window.audioPlayer.play().catch(e=>{}); 
                }
            };
            mainPlayer.onpause = () => window.audioPlayer.pause();
            
            mainPlayer.onseeking = () => { if(window.audioPlayer.src) window.audioPlayer.pause(); };
            mainPlayer.onseeked = () => {
                if(window.audioPlayer.src) {
                    // Sesin hazir olmasini bekle ve senkronla
                    isSyncing = true;
                    window.audioPlayer.currentTime = mainPlayer.currentTime;
                    if (!mainPlayer.paused) {
                        window.audioPlayer.play().then(() => {
                            setTimeout(() => { isSyncing = false; }, 500);
                        }).catch(e => { isSyncing = false; });
                    } else {
                        isSyncing = false;
                    }
                }
            };
            
            // Buffer Booster (Ön yüklemeyi zorla)
            mainPlayer.setAttribute('preload', 'auto');
            if (window.audioPlayer) window.audioPlayer.setAttribute('preload', 'auto');
            
            // Otomatik Kalite İyileştirme: Donma olursa hızı düşürme değil, tamponu bekleme
            mainPlayer.onwaiting = () => {
                loading.style.display = 'flex';
                if (window.audioPlayer) window.audioPlayer.pause();
            };
            mainPlayer.onplaying = () => {
                loading.style.display = 'none';
                if (window.audioPlayer && !mainPlayer.paused) window.audioPlayer.play().catch(e=>{});
            };
            
            // Ekstra güvenlik: Oynatma sırasında periyodik kontrol
            mainPlayer.ontimeupdate = () => {
                if (!window.audioPlayer.src || mainPlayer.paused || mainPlayer.seeking || isSyncing) return;
                
                if (window.audioPlayer.readyState >= 2) {
                    let diff = Math.abs(window.audioPlayer.currentTime - mainPlayer.currentTime);
                    if (diff > 0.8) { // Biraz daha esnek (0.4 -> 0.8)
                        isSyncing = true;
                        window.audioPlayer.currentTime = mainPlayer.currentTime;
                        setTimeout(() => { isSyncing = false; }, 800);
                    }
                }
            };
            
            // Oynatma hızı değişirse sesi de uydur
            mainPlayer.onratechange = () => {
                window.audioPlayer.playbackRate = mainPlayer.playbackRate;
            };
        }
        window.audioPlayer.src = "";
        mainPlayer.src = "";

        try {
            const response = await fetch(`${API_BASE}/api/resolve?url=${videoId}`);
            const data = await response.json();
            
            if (data.error || (!data.best_url && !data.hq_video_url)) {
                alert("Playback Error: " + (data.error || "Video linki çözülemedi."));
                loading.style.display = 'none';
                return;
            }

            // Record local history
            addToLocalHistory({
                id: videoId,
                title: data.title || (currentVideo ? currentVideo.title : ""),
                thumbnail: data.thumbnail || (currentVideo ? currentVideo.thumbnail : ""),
                uploader: data.uploader || (currentVideo ? currentVideo.uploader : "")
            });

            updateQualityOptions(data.qualities, data.dual_qualities, data.best_url, data.hq_audio_url);
            currentVideo.uploader = data.uploader;
            currentVideo.channel_id = data.channel_id || currentVideo.channel_id;
            
            switchView('player');
            searchResults.style.display = 'none';

            if (data.hq_video_url && data.hq_audio_url) {
                console.log("Initializing 1080p Dual Stream...");
                window.audioPlayer.src = data.hq_audio_url;
                mainPlayer.src = data.hq_video_url;
                mainPlayer.play();
            } else {
                mainPlayer.src = data.best_url;
                mainPlayer.play();
            }

            document.getElementById('video-title').textContent = data.title;
            const authorEl = document.getElementById('video-author');
            const resolvedChannelId = data.channel_id || currentVideo.channel_id || '';
            authorEl.innerHTML = `<i class="fas fa-user-astronaut"></i> <span class="video-author-link" data-channel-id="${resolvedChannelId}" data-channel-name="${data.uploader}">${data.uploader}</span>`;
            
            // Abonelik butonunu guncelle
            checkSubscriptionUI(resolvedChannelId, data.uploader);
            // Make player author name clickable
            const playerAuthorLink = authorEl.querySelector('.video-author-link');
            if (playerAuthorLink) {
                playerAuthorLink.onclick = (e) => {
                    e.stopPropagation();
                    const chId = playerAuthorLink.getAttribute('data-channel-id');
                    const chName = playerAuthorLink.getAttribute('data-channel-name');
                    loadChannelPage(chId, chName);
                };
            }
            document.getElementById('video-views').innerHTML = `<i class="fas fa-eye"></i> ${data.view_count.toLocaleString()} views`;
            document.getElementById('video-desc').textContent = data.description;
            
            // Local Comments logic
            fetchComments(videoId);
            document.getElementById('submit-comment-btn').onclick = () => submitComment(videoId);

            // Subscribe Button Listener
            playerSubBtn.onclick = async () => {
                if (isInteracting) return;
                await handleSubscribe(data.uploader, resolvedChannelId);
            };
            
            window.scrollTo(0,0);
        } catch (err) { alert("Sistem hatası: " + err.message); }
        finally { loading.style.display = 'none'; }
    }

    async function fetchComments(videoId) {
        const commentsList = document.getElementById('comments-list');
        const commentCount = document.getElementById('comment-count');
        if (!commentsList) return;
        
        commentsList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Yorumlar yükleniyor...</div>';
        
        try {
            const response = await fetch(`${API_BASE}/api/comments?video_id=${videoId}`);
            const data = await response.json();
            renderComments(data);
            if (commentCount) commentCount.textContent = `${data.length} yorum`;
        } catch (err) {
            console.error("Comments fetch error", err);
            if (commentsList) commentsList.innerHTML = '';
        }
    }

    function renderComments(comments) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Henüz yerel yorum yok. İlk yorumu sen yap!</div>';
            return;
        }

        comments.forEach(c => {
            const date = new Date(c.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' });
            const isOwner = c.user_email === currentUserEmail;
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.style.display = "flex";
            item.style.gap = "15px";
            item.style.marginBottom = "20px";
            item.style.position = "relative";
            item.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=${c.user_name}&background=random&color=fff" class="comment-user-avatar" style="width:40px; height:40px; border-radius:50%; flex-shrink:0;">
                <div class="comment-content" style="flex:1;">
                    <div class="comment-user-meta" style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                        <span class="comment-username" style="font-weight:600; color:var(--primary);">${c.user_name}</span>
                        <span class="comment-date" style="font-size:0.75rem; color:var(--text-dim);">${date}</span>
                    </div>
                    <p class="comment-text" style="font-size:0.9rem; line-height:1.5;">${c.comment_text}</p>
                </div>
                ${isOwner ? `<button class="delete-comment-btn" data-id="${c.id}" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; opacity:0.6; transition:0.3s;"><i class="fas fa-trash"></i></button>` : ''}
            `;
            
            if (isOwner) {
                const delBtn = item.querySelector('.delete-comment-btn');
                delBtn.onmouseover = () => delBtn.style.color = '#ff4b2b';
                delBtn.onmouseout = () => delBtn.style.color = 'var(--text-dim)';
                delBtn.onclick = () => deleteComment(c.id, c.video_id);
            }
            
            commentsList.appendChild(item);
        });
    }

    async function deleteComment(commentId, videoId) {
        if (!confirm("Bu yorumu silmek istediğine emin misin?")) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/comments?id=${commentId}`, {
                method: 'DELETE',
                headers: { 'X-User-Email': currentUserEmail }
            });
            
            if (response.ok) {
                fetchComments(videoId);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function submitComment(videoId) {
        const input = document.getElementById('comment-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const btn = document.getElementById('submit-comment-btn');
        if (!btn) return;
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = '...';

        try {
            const response = await fetch(`${API_BASE}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail },
                body: JSON.stringify({ video_id: videoId, text: text })
            });
            
            if (response.ok) {
                input.value = '';
                fetchComments(videoId);
            } else {
                alert("Yorum gönderilemedi.");
            }
        } catch (err) {
            console.error(err);
            alert("Bağlantı hatası.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    function updateQualityOptions(qualities, dualQualities, currentUrl, hqAudioUrl) {
        qualitySelector.innerHTML = '';
        
        if (dualQualities && hqAudioUrl) {
            Object.keys(dualQualities).sort((a,b) => parseInt(b) - parseInt(a)).forEach(q => {
                const opt = document.createElement('option');
                opt.value = "HQ:" + dualQualities[q] + "|" + hqAudioUrl;
                opt.textContent = q + ' (Premium)';
                qualitySelector.appendChild(opt);
            });
        }
        
        const autoOpt = document.createElement('option');
        autoOpt.value = currentUrl;
        autoOpt.textContent = 'Auto (360p/720p)';
        qualitySelector.appendChild(autoOpt);
        
        if (qualities) {
            Object.keys(qualities).sort((a,b) => parseInt(b) - parseInt(a)).forEach(q => {
                const opt = document.createElement('option');
                opt.value = qualities[q];
                opt.textContent = q + ' (Klasik)';
                qualitySelector.appendChild(opt);
            });
        }
    }

    qualitySelector.onchange = () => {
        const selectedVal = qualitySelector.value;
        const currentTime = mainPlayer.currentTime;
        const isPaused = mainPlayer.paused;

        if (selectedVal.startsWith("HQ:")) {
            const urls = selectedVal.replace("HQ:", "").split("|");
            window.audioPlayer.src = urls[1];
            mainPlayer.src = urls[0];
            window.audioPlayer.currentTime = currentTime;
        } else {
            if (window.audioPlayer) window.audioPlayer.src = "";
            mainPlayer.src = selectedVal;
        }

        mainPlayer.currentTime = currentTime;
        if(!isPaused) mainPlayer.play();
    };

    playerLikeBtn.onclick = () => { 
        if(currentVideo && !isInteracting) { 
            if (currentVideoLiked) {
                // Beğeniyi Geri Al (Unlike)
                handleInteraction(currentVideo, 'unlike'); 
                playerLikeBtn.style.color = 'rgba(255, 255, 255, 0.7)'; 
                currentVideoLiked = false;
            } else {
                // Beğen (Like)
                handleInteraction(currentVideo, 'like'); 
                playerLikeBtn.style.color = '#ff4b2b'; 
                currentVideoLiked = true;
            }
        } 
    };
    
    playerDislikeBtn.onclick = () => { 
        if(currentVideo && !isInteracting) { 
            handleInteraction(currentVideo, 'dislike'); 
            playerDislikeBtn.classList.add('active-dislike'); 
        } 
    };
    
    playerBackBtn.onclick = () => {
        if (window.audioPlayer) { window.audioPlayer.pause(); window.audioPlayer.src = ""; }
        mainPlayer.pause();
        playerView.style.display = 'none';
        channelView.style.display = 'none'; // Ensure channel is hidden
        document.getElementById('home-view').style.display = 'block';
        searchResults.style.display = 'grid';
        window.scrollTo(0, lastScrollPos);
    };

    const downloadBtn = document.getElementById('player-download-btn');
    const downloadStatus = document.getElementById('download-status');
    const downloadMsg = document.getElementById('download-msg');

    downloadBtn.onclick = async () => {
        if (!currentVideo) return;
        downloadStatus.style.display = 'block';
        downloadMsg.textContent = "İndirme arka planda başlatıldı...";
        
        try {
            const res = await fetch(`${API_BASE}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_id: currentVideo.id, title: currentVideo.title })
            });
            const data = await res.json();
            if (data.status === 'success') {
                downloadMsg.textContent = data.message;
                setTimeout(() => { downloadStatus.style.display = 'none'; }, 5000);
            } else {
                downloadMsg.textContent = "Hata: " + data.error;
            }
        } catch (err) {
            downloadMsg.textContent = "İndirme başlatılamadı!";
        }
    };

    document.getElementById('search-btn').onclick = async () => {
        const q = document.getElementById('video-search').value.trim();
        if(!q) return;
        loading.style.display = 'flex';
        const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        renderVideos(data, false);
        loading.style.display = 'none';
    };

    document.querySelector('.logo').onclick = () => {
        playerView.style.display = 'none';
        channelView.style.display = 'none';
        document.getElementById('home-view').style.display = 'block';
        searchResults.style.display = 'grid';
        feedMode = 'discover';
        document.querySelector('.hero h1').textContent = 'FOR YOU';
        document.getElementById('nav-discover').classList.add('active');
        document.getElementById('nav-liked').classList.remove('active');
        loadHomeFeed(true);
    };

    // --- Sidebar Menu Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    }

    menuBtn.onclick = toggleMenu;
    closeMenuBtn.onclick = toggleMenu;
    sidebarOverlay.onclick = toggleMenu;

    document.getElementById('nav-discover').onclick = () => {
        toggleMenu();
        switchView('home');
        if (feedMode === 'discover') return;
        feedMode = 'discover';
        document.querySelector('.hero h1').textContent = 'FOR YOU';
        updateNavStates('nav-discover');
        loadHomeFeed(true);
    };

    document.getElementById('nav-subscriptions').onclick = () => {
        toggleMenu();
        switchView('home');
        if (feedMode === 'subscriptions') return;
        feedMode = 'subscriptions';
        document.querySelector('.hero h1').textContent = 'SUBSCRIPTIONS';
        updateNavStates('nav-subscriptions');
        loadHomeFeed(true);
    };

    document.getElementById('nav-liked').onclick = () => {
        toggleMenu();
        switchView('home');
        if (feedMode === 'liked') return;
        feedMode = 'liked';
        document.querySelector('.hero h1').textContent = 'LIKED VIDEOS';
        updateNavStates('nav-liked');
        loadLikedFeed(true);
    };

    document.getElementById('nav-history').onclick = () => {
        toggleMenu();
        switchView('home');
        if (feedMode === 'history') return;
        feedMode = 'history';
        document.querySelector('.hero h1').textContent = 'WATCH HISTORY';
        updateNavStates('nav-history');
        loadHistoryFeed(true);
    };

    function updateNavStates(activeId) {
        ['nav-discover', 'nav-subscriptions', 'nav-liked', 'nav-profile', 'nav-history'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', id === activeId);
        });
    }

    // ====== CHANNEL PAGE LOGIC ======
    async function loadChannelPage(channelId, channelName) {
        if (!channelId && !channelName) return;
        loading.style.display = 'flex';

        // Remember where we came from
        if (playerView.style.display === 'block') {
            previousView = 'player';
        } else {
            previousView = 'feed';
            lastScrollPos = window.scrollY;
        }

        // Pause current playback
        if (window.audioPlayer) { window.audioPlayer.pause(); }
        mainPlayer.pause();

        currentChannelId = channelId || `https://www.youtube.com/@${encodeURIComponent(channelName)}`;
        currentChannelName = channelName;
        
        // Reset channel state for new load
        channelPage = 1;
        channelCanLoadMore = true;
        channelIsFetching = false;

        try {
            const channelVideosEl = document.getElementById('channel-videos');
            renderSkeletons(channelVideosEl, 4);

            const response = await fetch(`${API_BASE}/api/channel_info?channel_id=${encodeURIComponent(currentChannelId)}&page=${channelPage}`);
            const data = await response.json();
            
            // Set next page and more flag from response
            channelPage = 2;
            channelCanLoadMore = data.has_more !== false;

            if (data.error) {
                alert('Kanal bilgisi alınamadı: ' + data.error);
                loading.style.display = 'none';
                return;
            }

            // Populate channel header
            document.getElementById('channel-name').textContent = data.title || channelName;
            document.getElementById('channel-avatar').src = data.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=00f2ff&color=050a0f&size=120`;
            document.getElementById('channel-desc').textContent = data.description || 'Bu kanal hakkında açıklama yok.';
            
            const subsCount = data.subscriber_count || 0;
            const subsText = subsCount > 0 ? subsCount.toLocaleString() : '—';
            document.getElementById('channel-subs').innerHTML = `<i class="fas fa-users"></i> ${subsText} subscribers`;

            // Subscribe button logic removed from channel page

            // Render videos
            channelVideosEl.innerHTML = '';
            const chName = data.title || channelName;
            if (data.videos && data.videos.length > 0) {
                const videosWithUploader = data.videos.map(v => ({
                    ...v,
                    uploader: chName,
                    channel_id: currentChannelId,
                    label: 'KANAL VİDEOSU'
                }));
                renderVideos(videosWithUploader, false, channelVideosEl);
            } else {
                channelVideosEl.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim); padding: 40px;">Bu kanalda video bulunamadı.</div>';
            }

            // Show channel view, hide others
            switchView('channel');
            searchResults.style.display = 'none';
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('Channel load error:', err);
            alert('Kanal y\u00fcklenirken hata olu\u015ftu: ' + err.message);
        } finally {
            loading.style.display = 'none';
            document.getElementById('mini-player-container').classList.add('mini-player-hidden');
        }
    }

    // ====== MINI PLAYER LOGIC ======
    document.getElementById('mini-player-close').onclick = (e) => {
        e.stopPropagation();
        mainPlayer.pause();
        if (window.audioPlayer) window.audioPlayer.pause();
        document.getElementById('mini-player-container').classList.add('mini-player-hidden');
    };

    document.getElementById('mini-player-container').onclick = () => {
        switchView('player');
    };

    // Load more channel videos on scroll
    async function loadMoreChannelVideos() {
        if (channelIsFetching || !channelCanLoadMore || !currentChannelId) return;
        channelIsFetching = true;

        try {
            const response = await fetch(`${API_BASE}/api/channel_info?channel_id=${encodeURIComponent(currentChannelId)}&page=${channelPage}`);
            const data = await response.json();

            if (data.videos && data.videos.length > 0) {
                const channelVideosEl = document.getElementById('channel-videos');
                const videosWithUploader = data.videos.map(v => ({
                    ...v,
                    uploader: currentChannelName,
                    channel_id: currentChannelId,
                    label: 'KANAL V\u0130DEOSU'
                }));
                renderVideos(videosWithUploader, true, channelVideosEl);
                channelPage++;
                channelCanLoadMore = data.has_more !== false;
            } else {
                channelCanLoadMore = false;
            }
        } catch (err) {
            console.error('Load more channel videos error:', err);
        } finally {
            channelIsFetching = false;
        }
    }

    // Channel back button
    document.getElementById('channel-back-btn').onclick = () => {
        if (previousView === 'player') {
            switchView('player');
            mainPlayer.play().catch(e => {});
            if (window.audioPlayer && window.audioPlayer.src) window.audioPlayer.play().catch(e => {});
        } else {
            switchView('home');
            window.scrollTo(0, lastScrollPos);
        }
    };

    // ====== PROFILE LOGIC ======
    document.getElementById('nav-profile').onclick = () => {
        toggleMenu();
        switchView('profile');
        updateNavStates('nav-profile');
        loadProfile();
    };

    async function loadProfile() {
        try {
            const response = await fetch(`${API_BASE}/api/profile`, {
                headers: { 'X-User-Email': currentUserEmail }
            });
            const data = await response.json();
            if (data.nickname) {
                document.getElementById('profile-nickname').value = data.nickname;
            }
        } catch (err) { console.error(err); }
    }

    document.getElementById('save-profile-btn').onclick = async () => {
        const nickname = document.getElementById('profile-nickname').value.trim();
        const btn = document.getElementById('save-profile-btn');
        btn.disabled = true;
        btn.textContent = 'Kaydediliyor...';
        
        try {
            const response = await fetch(`${API_BASE}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUserEmail },
                body: JSON.stringify({ nickname: nickname })
            });
            const resData = await response.json();
            if (response.ok) {
                alert("Profil güncellendi! Artık yorumlarda bu ismi kullanacaksın.");
            } else {
                alert(resData.error || "Profil güncellenemedi.");
            }
        } catch (err) { console.error(err); }
        finally {
            btn.disabled = false;
            btn.textContent = 'Değişiklikleri Kaydet';
        }
    };

    checkUser();

    // ====== KEYBOARD SHORTCUTS ======
    window.onkeydown = (e) => {
        // Arama kutusunda veya yorumlardayken kısayolları devre dışı bırak
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (playerView.style.display === 'block') {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (mainPlayer.paused) {
                        mainPlayer.play();
                    } else {
                        mainPlayer.pause();
                    }
                    break;
                case 'ArrowRight':
                    mainPlayer.currentTime += 5;
                    break;
                case 'ArrowLeft':
                    mainPlayer.currentTime -= 5;
                    break;
                case 'KeyF':
                    if (!document.fullscreenElement) {
                        mainPlayer.requestFullscreen().catch(err => {});
                    } else {
                        document.exitFullscreen();
                    }
                    break;
                case 'KeyM':
                    mainPlayer.muted = !mainPlayer.muted;
                    if (window.audioPlayer) window.audioPlayer.muted = mainPlayer.muted;
                    break;
            }
        }
    };
});
