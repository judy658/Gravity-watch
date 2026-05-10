// --- GRAVITY WATCH MOBILE ENGINE ---
const GRAVITY_URL = "https://nxpmocnezqsxhhsuwiiq.supabase.co";
const GRAVITY_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cG1vY25lenFzeGhoc3V3aWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTExMTUsImV4cCI6MjA5MzEyNzExNX0.52g_5VsgMdGaTJzghA3D__Ho58lnTBP8-prm8LReIdQ";
const gravityClient = supabase.createClient(GRAVITY_URL, GRAVITY_ANON);

const DEVSTORE_URL = "https://jnuckqaiutmkiquptvzu.supabase.co";
const DEVSTORE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWNrcWFpdXRta2lxdXB0dnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDgzMTAsImV4cCI6MjA4ODk4NDMxMH0.sP_FoTrYOFWiIS7PdaFYtR1JbP5vGf_KLgc_jh7zhZY";
const devstoreClient = supabase.createClient(DEVSTORE_URL, DEVSTORE_ANON);

// API BASE: Cloud-First Architecture
const RENDER_URL = "https://gravity-watch-1.onrender.com";
const LOCAL_URL = "http://192.168.1.127:5000";

const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') 
    ? LOCAL_URL 
    : RENDER_URL;

document.addEventListener('DOMContentLoaded', async () => {
    const mainApp = document.getElementById('main-app');
    const authView = document.getElementById('auth-view');
    const loginSubmit = document.getElementById('login-submit-btn');
    const videoGrid = document.getElementById('video-grid');
    const playerView = document.getElementById('player-view');
    const mainPlayer = document.getElementById('main-player');
    const bottomNavItems = document.querySelectorAll('.nav-item');
    const searchToggle = document.getElementById('search-toggle-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search-btn');
    const videoSearch = document.getElementById('video-search');
    
    // State
    let currentUser = null;
    let isFetching = false;
    let currentPage = 1;
    let currentFeed = 'home';
    let seenIds = [];
let currentVideo = null;
    let subscribedChannels = new Set();
    let isSubscribedCurrent = false;
    let currentVideoLiked = false;
    let isInteracting = false;
    const GRAVITY_HISTORY_KEY = "gravity_history_v1";
    const GRAVITY_LIKES_KEY = "gravity_likes_v1";

    // --- NAVIGATION ---
    function switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) targetView.style.display = 'block';
        
        bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        if (viewId !== 'player') {
            // If player was active, we might want to keep it playing in a mini-mode later
            // For now, just stop it if moving away
            // playerView.style.display = 'none';
        }
    }

    bottomNavItems.forEach(item => {
        item.onclick = () => {
            const view = item.dataset.view;
            if (view === currentFeed && view !== 'player') return;
            currentFeed = view;
            playerView.style.display = 'none';
            switchView(view);
            if (view === 'home') loadHomeFeed(true);
            else if (view === 'subs') loadSubsFeed(true);
            else if (view === 'liked') loadLikedFeed(true);
        };
    });

    // --- AUTH ---
    async function checkUser() {
        const { data: { session } } = await devstoreClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            showApp();
        } else {
            authView.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    }

    async function showApp() {
        authView.style.display = 'none';
        mainApp.style.display = 'block';
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${currentUser.email}&background=00f2ff&color=050a0f`;
        
        // Fetch subscriptions on load
        await fetchSubscriptions();
        loadHomeFeed(true);
    }

    async function fetchSubscriptions(retryCount = 0) {
        if (!currentUser) return;
        try {
            const response = await fetch(`${API_BASE}/api/subscriptions?t=${Date.now()}`, {
                headers: { 'X-User-Email': currentUser.email }
            });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                subscribedChannels = new Set();
                data.forEach(s => {
                    if (!s) return;
                    let cid = typeof s === 'string' ? s : (s.channel_id || s.id);
                    let cname = typeof s === 'object' ? (s.channel_name || s.name) : null;
                    
                    if (cid) subscribedChannels.add(cid.toString().trim());
                    if (cname) subscribedChannels.add(`name:${cname.toString().trim().toLowerCase()}`);
                });
                
                if (currentVideo && playerView.style.display === 'block') {
                    checkSubscriptionUI(currentVideo.channel_id, currentVideo.uploader);
                }
            } else if (retryCount < 3) {
                setTimeout(() => fetchSubscriptions(retryCount + 1), 3000);
            }
        } catch(e) { 
            console.error("Sub Fetch Error:", e);
            if (retryCount < 3) setTimeout(() => fetchSubscriptions(retryCount + 1), 3000);
        }
    }

    loginSubmit.onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        if(!email || !password) return alert("Lütfen bilgilerinizi girin.");
        
        document.getElementById('loading-overlay').style.display = 'flex';
        const { data, error } = await devstoreClient.auth.signInWithPassword({ email, password });
        document.getElementById('loading-overlay').style.display = 'none';
        
        if (error) alert(error.message);
        else window.location.reload();
    };

    // --- FEED LOGIC ---
    async function loadHomeFeed(reset = false) {
        if (isFetching) return;
        isFetching = true;
        
        if (reset) {
            currentPage = 1;
            seenIds = [];
            videoGrid.innerHTML = '';
            renderSkeletons(videoGrid);
            
            // Try to load from cache for instant display
            const cached = localStorage.getItem('gravity_home_cache');
            if (cached) {
                videoGrid.innerHTML = '';
                renderVideos(JSON.parse(cached), videoGrid);
            }
        }

        try {
            const response = await fetch(`${API_BASE}/api/home`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUser.email },
                body: JSON.stringify({ page: currentPage, seen_ids: seenIds })
            });
            const data = await response.json();
            
            if (reset) {
                videoGrid.innerHTML = '';
                // Store first page in cache
                localStorage.setItem('gravity_home_cache', JSON.stringify(data));
            }
            renderVideos(data, videoGrid);
            currentPage++;
        } catch (e) {
            console.error("Feed error", e);
        } finally {
            isFetching = false;
        }
    }

    function renderSkeletons(container) {
        for (let i = 0; i < 6; i++) {
            const skel = document.createElement('div');
            skel.className = 'video-card skeleton';
            skel.innerHTML = `<div class="thumbnail-wrapper" style="background:#1a1a1a"></div><div class="video-card-info"><div style="height:15px; background:#1a1a1a; width:80%; margin-bottom:10px;"></div><div style="height:10px; background:#1a1a1a; width:40%;"></div></div>`;
            container.appendChild(skel);
        }
    }

    function renderVideos(videos, container) {
        videos.forEach(v => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="thumbnail-wrapper">
                    <img src="${v.thumbnail}" loading="lazy">
                </div>
                <div class="video-card-info">
                    <h3>${v.title}</h3>
                    <div class="video-card-meta">
                        <span>${v.uploader}</span>
                        <span>•</span>
                        <span>${v.label || 'Video'}</span>
                    </div>
                </div>
            `;
            card.onclick = () => playVideo(v);
            container.appendChild(card);
            seenIds.push(v.id);
        });
    }

    async function loadSubsFeed(reset = false) {
        if (isFetching) return;
        isFetching = true;
        const grid = document.getElementById('subs-grid');
        if (reset) grid.innerHTML = '';
        renderSkeletons(grid);

        try {
            const response = await fetch(`${API_BASE}/api/home`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUser.email },
                body: JSON.stringify({ page: 1, subscriptions_only: true })
            });
            const data = await response.json();
            grid.innerHTML = '';
            renderVideos(data, grid);
        } catch (e) { console.error(e); }
        finally { isFetching = false; }
    }

    async function loadLikedFeed(reset = false) {
        if (isFetching) return;
        isFetching = true;
        const grid = document.getElementById('liked-grid');
        if (reset) grid.innerHTML = '';
        
        let liked = [];
        try {
            const stored = localStorage.getItem(GRAVITY_LIKES_KEY);
            if (stored) liked = JSON.parse(stored);
        } catch(e) { liked = []; }

        // Initial sync: if local is empty, fetch from cloud once
        if (liked.length === 0) {
            try {
                const response = await fetch(`${API_BASE}/api/liked_videos?page=1`, {
                    headers: { 'X-User-Email': currentUser.email }
                });
                const cloudLikes = await response.json();
                if (Array.isArray(cloudLikes) && cloudLikes.length > 0) {
                    liked = cloudLikes.map(v => ({...v, label: 'BEĞENİLEN'}));
                    localStorage.setItem(GRAVITY_LIKES_KEY, JSON.stringify(liked));
                }
            } catch (e) { console.error("Cloud likes sync failed", e); }
        }

        if (liked.length === 0) {
            grid.innerHTML = '<div style="padding:40px; text-align:center; color:#888; width:100%;">Henüz beğenilen video yok.</div>';
            isFetching = false;
            return;
        }

        renderVideos(liked, grid);
        isFetching = false;
    }

    // --- INTERACTION LOGIC ---
    function updateSubButtonUI(isSubscribed) {
        const subBtn = document.getElementById('sub-btn');
        if (isSubscribed) {
            subBtn.innerHTML = '<i class="fas fa-check"></i> Abone Olundu';
            subBtn.classList.add('subscribed');
        } else {
            subBtn.innerHTML = '<i class="fas fa-plus"></i> Abone Ol';
            subBtn.classList.remove('subscribed');
        }
    }

    function updateLikeButtonUI(isLiked) {
        const likeBtn = document.getElementById('like-btn');
        if (isLiked) {
            likeBtn.style.color = '#ff4b2b';
            likeBtn.querySelector('i').className = 'fas fa-heart';
        } else {
            likeBtn.style.color = '';
            likeBtn.querySelector('i').className = 'far fa-heart';
        }
    }

    function checkSubscriptionUI(channelId, channelName) {
        if (!currentUser) return;
        
        const realId = channelId ? channelId.toString().trim() : null;
        const nameId = channelName ? `name:${channelName.toString().trim().toLowerCase()}` : null;
        
        const isSubbed = (realId && subscribedChannels.has(realId)) || (nameId && subscribedChannels.has(nameId));
        isSubscribedCurrent = isSubbed;
        updateSubButtonUI(isSubscribedCurrent);
    }

    async function handleSubscribe(channelName, channelId) {
        if (!currentUser || isInteracting) return;
        isInteracting = true;
        
        const oldState = isSubscribedCurrent;
        isSubscribedCurrent = !isSubscribedCurrent;
        updateSubButtonUI(isSubscribedCurrent);

        try {
            await fetch(`${API_BASE}/api/subscriptions`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUser.email }, 
                body: JSON.stringify({ 
                    channel_name: channelName, 
                    channel_id: channelId,
                    subscribe: isSubscribedCurrent
                }) 
            });
            
            if (isSubscribedCurrent) {
                if (channelId) subscribedChannels.add(channelId.toString().trim());
                if (channelName) subscribedChannels.add(`name:${channelName.trim().toLowerCase()}`);
            } else {
                if (channelId) subscribedChannels.delete(channelId.toString().trim());
                if (channelName) subscribedChannels.delete(`name:${channelName.trim().toLowerCase()}`);
            }
        } catch (err) { 
            console.error(err);
            isSubscribedCurrent = oldState;
            updateSubButtonUI(isSubscribedCurrent);
        } finally {
            setTimeout(() => { isInteracting = false; }, 500);
        }
    }

    async function handleLike(video) {
        if (!currentUser || isInteracting) return;
        isInteracting = true;
        
        const oldState = currentVideoLiked;
        currentVideoLiked = !currentVideoLiked;
        updateLikeButtonUI(currentVideoLiked);

        try {
            await fetch(`${API_BASE}/api/like`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUser.email }, 
                body: JSON.stringify({ 
                    video_id: video.id, 
                    action_type: currentVideoLiked ? 'like' : 'unlike',
                    video_obj: video
                }) 
            });

            // Update local likes
            let liked = [];
            try {
                const stored = localStorage.getItem(GRAVITY_LIKES_KEY);
                if (stored) liked = JSON.parse(stored);
            } catch(e) {}

            if (currentVideoLiked) {
                if (!liked.find(v => v.id === video.id)) {
                    liked.unshift({
                        id: video.id,
                        title: video.title,
                        thumbnail: video.thumbnail,
                        uploader: video.uploader,
                        label: 'BEĞENİLEN'
                    });
                }
            } else {
                liked = liked.filter(v => v.id !== video.id);
            }
            localStorage.setItem(GRAVITY_LIKES_KEY, JSON.stringify(liked));

        } catch (err) { 
            console.error(err);
            currentVideoLiked = oldState;
            updateLikeButtonUI(currentVideoLiked);
        } finally {
            setTimeout(() => { isInteracting = false; }, 500);
        }
    }

    // --- LOCAL HISTORY ---
    function addToLocalHistory(video) {
        if (!video || !video.id) return;
        
        let history = [];
        try {
            const stored = localStorage.getItem(GRAVITY_HISTORY_KEY);
            if (stored) history = JSON.parse(stored);
        } catch(e) { history = []; }

        // Remove if exists to move to top
        history = history.filter(v => v.id !== video.id);
        
        // Add to start (newest first)
        const historyItem = {
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            uploader: video.uploader || 'YouTube',
            channel_id: video.channel_id,
            label: 'GEÇMİŞ'
        };
        
        history.unshift(historyItem);
        
        // Cap at 100
        if (history.length > 100) history = history.slice(0, 100);
        
        localStorage.setItem(GRAVITY_HISTORY_KEY, JSON.stringify(history));
    }

    // --- PLAYER LOGIC ---
    async function playVideo(video) {
    currentVideo = video;
    playerView.style.display = 'block';
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Setup hidden audio player for dual-stream
        if (!window.audioPlayer) {
            window.audioPlayer = document.createElement('audio');
            window.audioPlayer.setAttribute('preload', 'auto');
            document.body.appendChild(window.audioPlayer);
            
            // Sync audio with video (Improved for Mobile)
            mainPlayer.onplay = () => { 
                if(window.audioPlayer.src) window.audioPlayer.play().catch(e=>{}); 
            };
            mainPlayer.onpause = () => {
                if(window.audioPlayer.src) window.audioPlayer.pause();
            };
            
            mainPlayer.onwaiting = () => {
                if (window.audioPlayer.src) window.audioPlayer.pause();
            };
            mainPlayer.onplaying = () => {
                if (window.audioPlayer.src && !mainPlayer.paused) window.audioPlayer.play().catch(e=>{});
            };

            mainPlayer.onseeking = () => { if(window.audioPlayer.src) window.audioPlayer.pause(); };
            mainPlayer.onseeked = () => {
                if(window.audioPlayer.src) {
                    window.audioPlayer.currentTime = mainPlayer.currentTime;
                    if (!mainPlayer.paused) window.audioPlayer.play().catch(e=>{});
                }
            };
            
            // Flexible Sync Check for Mobile (0.8s threshold)
            mainPlayer.ontimeupdate = () => {
                if (!window.audioPlayer.src || mainPlayer.paused || mainPlayer.seeking) return;
                if (window.audioPlayer.readyState >= 2) {
                    let diff = Math.abs(window.audioPlayer.currentTime - mainPlayer.currentTime);
                    if (diff > 0.8) {
                        window.audioPlayer.currentTime = mainPlayer.currentTime;
                    }
                }
            };

            mainPlayer.onratechange = () => {
                if (window.audioPlayer.src) window.audioPlayer.playbackRate = mainPlayer.playbackRate;
            };
        }
        window.audioPlayer.src = "";
        mainPlayer.src = "";

        try {
            const resp = await fetch(`${API_BASE}/api/resolve?url=${video.id}`);
            const data = await resp.json();
            
            if (data.error) throw new Error(data.error);

            // Dynamic Source Selection
            if (data.hq_video_url && data.hq_audio_url) {
                console.log("Dual Stream Mode Active (1080p)");
                window.audioPlayer.src = data.hq_audio_url;
                mainPlayer.src = data.hq_video_url;
            } else {
                mainPlayer.src = data.best_url;
            }

                mainPlayer.play();
                if (window.audioPlayer.src) {
                    window.audioPlayer.play().catch(() => {});
                }
            // Reset status
            currentVideoLiked = false;
            updateLikeButtonUI(false);

            // Check Like Status
            if (currentUser) {
                fetch(`${API_BASE}/api/check_like?video_id=${video.id}`, {
                    headers: { 'X-User-Email': currentUser.email }
                }).then(r => r.json()).then(d => {
                    currentVideoLiked = d.liked;
                    updateLikeButtonUI(currentVideoLiked);
                }).catch(e => console.error("Like check failed", e));
            }

            // Check Subscription Status
            checkSubscriptionUI(data.channel_id, data.uploader);

            // Button Listeners
            document.getElementById('like-btn').onclick = () => handleLike(video);
            document.getElementById('sub-btn').onclick = () => handleSubscribe(data.uploader, data.channel_id);

            document.getElementById('video-desc').textContent = data.description;
            
            // Record to local history
            addToLocalHistory(video);
            
            // Channel Link logic
            const channelLink = document.getElementById('channel-link');
            channelLink.onclick = () => {
                playerView.style.display = 'none';
                if (window.audioPlayer) window.audioPlayer.pause();
                mainPlayer.pause();
                loadChannelPage(data.channel_id, data.uploader);
            };
            
            // Quality Options
            const qualitySelector = document.getElementById('quality-selector');
            qualitySelector.innerHTML = '<option value="auto">Otomatik</option>';
            if (data.qualities) {
                Object.keys(data.qualities).forEach(q => {
                    const opt = document.createElement('option');
                    opt.value = data.qualities[q];
                    opt.textContent = q;
                    qualitySelector.appendChild(opt);
                });
            }

            qualitySelector.onchange = () => {
                const time = mainPlayer.currentTime;
                const selectedUrl = qualitySelector.value;
                const isAuto = selectedUrl === 'auto';
                
                if (!isAuto && data.hq_audio_url) {
                    // Manual quality selected, ensure audio is playing
                    if (window.audioPlayer.src !== data.hq_audio_url) {
                        window.audioPlayer.src = data.hq_audio_url;
                    }
                    mainPlayer.src = selectedUrl;
                } else {
                    // Auto mode usually has internal audio
                    window.audioPlayer.src = "";
                    mainPlayer.src = isAuto ? data.best_url : selectedUrl;
                }
                
                mainPlayer.currentTime = time;
                mainPlayer.play();
                if (window.audioPlayer.src && !mainPlayer.paused) window.audioPlayer.play().catch(e=>{});
            };

            // Download Logic (Mobile Optimized Streaming)
            document.getElementById('download-btn').onclick = () => {
                const downloadUrl = `${API_BASE}/api/stream_download?video_id=${video.id}`;
                window.open(downloadUrl, '_blank');
                alert("İndirme arka planda hazırlandı. Dosya kaydedilecek.");
            };

        } catch (e) {
            alert("Video yüklenemedi: " + e.message);
            playerView.style.display = 'none';
        } finally {
            document.getElementById('loading-overlay').style.display = 'none';
        }

        // Fetch comments preview
        fetchComments(video.id);
    }

    // --- COMMENTS ---
    const commentsSheet = document.getElementById('comments-sheet');
    const openCommentsBtn = document.getElementById('open-comments-btn');
    const closeCommentsBtn = document.getElementById('close-comments-btn');
    const sendCommentBtn = document.getElementById('send-comment-btn');
    const commentInput = document.getElementById('comment-input');

    openCommentsBtn.onclick = () => commentsSheet.classList.add('active');
    closeCommentsBtn.onclick = () => commentsSheet.classList.remove('active');

    async function fetchComments(videoId) {
        const list = document.getElementById('comments-list');
        const topComment = document.getElementById('top-comment');
        
        try {
            const resp = await fetch(`${API_BASE}/api/comments?video_id=${videoId}`);
            const data = await resp.json();
            
            document.getElementById('comment-count').textContent = data.length;
            if (data.length > 0) {
                topComment.textContent = data[0].comment_text;
                renderComments(data);
            } else {
                topComment.textContent = "İlk yorumu sen yaz...";
                list.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">Henüz yorum yok.</div>';
            }
        } catch (e) { console.error(e); }
    }

    function renderComments(comments) {
        const list = document.getElementById('comments-list');
        list.innerHTML = '';
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-user">${c.user_name || c.user_email.split('@')[0]}</div>
                <div class="comment-text">${c.comment_text}</div>
            `;
            list.appendChild(item);
        });
    }

    sendCommentBtn.onclick = async () => {
        const text = commentInput.value.trim();
        if (!text || !currentVideo) return;
        
        sendCommentBtn.disabled = true;
        try {
            const resp = await fetch(`${API_BASE}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Email': currentUser.email },
                body: JSON.stringify({ video_id: currentVideo.id, text: text })
            });
            if (resp.ok) {
                commentInput.value = '';
                fetchComments(currentVideo.id);
            }
        } catch (e) { console.error(e); }
        finally { sendCommentBtn.disabled = false; }
    };

    async function loadChannelPage(channelId, channelName) {
        document.getElementById('loading-overlay').style.display = 'flex';
        const grid = document.getElementById('channel-grid');
        grid.innerHTML = '';
        renderSkeletons(grid);
        switchView('channel');

        try {
            const resp = await fetch(`${API_BASE}/api/channel_info?channel_id=${encodeURIComponent(channelId)}`);
            const data = await resp.json();
            
            document.getElementById('channel-view-name').textContent = data.title;
            document.getElementById('channel-view-avatar').src = data.thumbnail;
            document.getElementById('channel-view-desc').textContent = data.description;
            document.getElementById('channel-view-subs').textContent = `${(data.subscriber_count || 0).toLocaleString()} Abone`;
            
            grid.innerHTML = '';
            renderVideos(data.videos, grid);
        } catch (e) { console.error(e); }
        finally { document.getElementById('loading-overlay').style.display = 'none'; }
    }

    async function loadHistoryFeed() {
        const grid = document.getElementById('video-grid'); 
        grid.innerHTML = '';
        switchView('home'); 
        
        let history = [];
        try {
            const stored = localStorage.getItem(GRAVITY_HISTORY_KEY);
            if (stored) history = JSON.parse(stored);
        } catch(e) { history = []; }

        if (history.length === 0) {
            grid.innerHTML = '<div style="padding:40px; text-align:center; color:#888; width:100%;">Henüz izleme geçmişi yok.</div>';
            return;
        }

        renderVideos(history, grid);
    }

    document.getElementById('nav-history').onclick = () => {
        loadHistoryFeed();
    };

    // --- SEARCH ---
    searchToggle.onclick = () => searchOverlay.classList.add('active');
    closeSearch.onclick = () => searchOverlay.classList.remove('active');

    videoSearch.onkeypress = async (e) => {
        if (e.key === 'Enter') {
            const query = videoSearch.value.trim();
            if (!query) return;
            searchOverlay.classList.remove('active');
            videoGrid.innerHTML = '';
            renderSkeletons(videoGrid);
            
            try {
                const resp = await fetch(`${API_BASE}/api/search?q=${query}`);
                const data = await resp.json();
                videoGrid.innerHTML = '';
                renderVideos(data, videoGrid);
            } catch (e) { console.error(e); }
        }
    };

    // --- INITIALIZE ---
    document.getElementById('logout-btn').onclick = async () => {
        await devstoreClient.auth.signOut();
        window.location.reload();
    };

    checkUser();
});
