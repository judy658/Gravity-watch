const chatEl = document.getElementById('chat');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingEl = document.getElementById('typing');
const historyEl = document.getElementById('history');
const voiceBtn = document.getElementById('voice-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');

// Marked.js Konfigürasyonu (Render hatalarını önlemek için)
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
});

// Akıllı Markdown Süzgeci: Bitişik başlıkları ve listeleri ayırır
function fixMarkdown(text) {
    if (!text) return "";
    return text
        // Başlıkların önünde satır başı yoksa ekle (Örn: ---### -> ---\n\n###)
        .replace(/([^\n])(#{1,6}\s)/g, "$1\n\n$2")
        // Liste maddelerinin önünde satır başı yoksa ekle (Örn: metin1. -> metin\n1.)
        .replace(/([^\n])(\d+\.\s)/g, "$1\n$2")
        // Madde işaretli listeler için (Örn: metin- madde -> metin\n- madde)
        .replace(/([^\n])([*-]\s)/g, "$1\n$2")
        // Çizgi ayraçları için (Örn: metin--- -> metin\n\n---)
        .replace(/([^\n])(---)/g, "$1\n\n$2");
}

let currentImageBase64 = null;
let currentFileAttachment = null; // {name, content}
let currentSessionId = localStorage.getItem('lastSessionId') || 'active'; // localStorage'dan kurtar
let currentMode = 'normal';
let isGenerating = false;
let currentAbortController = null;

const researchHud = document.getElementById('research-hud');
const hudContent = document.getElementById('hud-content');
const debugConsole = document.getElementById('debug-console');
const consoleBody = document.getElementById('console-body');

function addLog(msg, type = 'info') {
    if (!consoleBody) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<span style="opacity:0.5">[${time}]</span> ${msg}`;
    consoleBody.appendChild(entry);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
    
    // Konsol yönetimi
    if (mode === 'coding') {
        debugConsole.style.display = 'flex';
        addLog("Kaptan, kodlama motoru hazır. Mühendislik protokolleri aktif.");
    } else {
        debugConsole.style.display = 'none';
    }

    if (mode === 'deep') {
        userInput.placeholder = "Derin Araştırma Modu: Konuyu veya soruyu girin...";
    } else if (mode === 'coding') {
        userInput.placeholder = "Kodlama Modu: Proje dosyalarını analiz et veya yeni kod yazdır...";
    } else {
        userInput.placeholder = "Bir şeyler yazın veya 'ara: konu' diyerek internette aratın...";
    }
    
    console.log(`[Jarvis Core] Mod değiştirildi: ${mode}`);
}

const hudSourceNum = document.getElementById('hud-source-num');

function resetHUD() {
    // Tüm tur çemberlerini sıfırla
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`hud-r${i}`);
        if (el) { el.classList.remove('active', 'done'); el.querySelector('.round-dot').textContent = ''; }
    }
    if (hudSourceNum) hudSourceNum.textContent = '0';
    if (consoleBody) consoleBody.innerHTML = '<div class="log-entry">Sistem hazır...</div>';
}

function setRoundActive(roundNum) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`hud-r${i}`);
        if (!el) continue;
        if (i < roundNum) { el.classList.remove('active'); el.classList.add('done'); el.querySelector('.round-dot').textContent = '✓'; }
        else if (i === roundNum) { el.classList.add('active'); el.classList.remove('done'); el.querySelector('.round-dot').textContent = ''; }
        else { el.classList.remove('active', 'done'); el.querySelector('.round-dot').textContent = ''; }
    }
}

function setRoundDone(roundNum) {
    const el = document.getElementById(`hud-r${roundNum}`);
    if (el) { el.classList.remove('active'); el.classList.add('done'); el.querySelector('.round-dot').textContent = '✓'; }
}

function updateHUD(text) {
    if (currentMode === 'coding') {
        researchHud.style.display = 'none'; // Kodlama modunda üst HUD kalabalık yapmasın
        let type = 'info';
        if (text.includes("Hata") || text.includes("HATA")) type = 'error';
        if (text.includes("Başarılı") || text.includes("TAMAM")) type = 'success';
        addLog(text, type);
        return;
    }

    researchHud.style.display = 'block';
    
    // Yapılandırılmış mesajları önce kontrol et
    if (text.startsWith('ROUND_START:')) {
        const roundNum = parseInt(text.split(':')[1]);
        setRoundActive(roundNum);
        hudContent.innerHTML = `<i class="fas fa-satellite-dish fa-spin" style="margin-right:8px"></i> Tur ${roundNum} hazırlanıyor...`;
        return;
    }
    if (text.startsWith('ROUND_DONE:')) {
        const roundNum = parseInt(text.split(':')[1]);
        setRoundDone(roundNum);
        return;
    }
    if (text.startsWith('SOURCE_UPDATE:')) {
        const count = text.split(':')[1];
        if (hudSourceNum) hudSourceNum.textContent = count;
        return;
    }
    
    // Başlığı moda göre güncelle (Sadece ilk kez veya mod değiştiğinde)
    const hudTitle = document.querySelector('.hud-header span');
    if (hudTitle) {
        if (currentMode === 'deep') {
            hudTitle.innerHTML = '<i class="fas fa-search"></i> DERİN ARAŞTIRMA BİRİMİ';
        } else {
            hudTitle.innerHTML = '<i class="fas fa-microchip"></i> AKILLI KİŞİSEL ASİSTAN';
        }
    }

    // Normal durum mesajı
    hudContent.innerHTML = `<i class="fas fa-satellite-dish fa-spin" style="margin-right:8px"></i> ${text}`;
}

async function stopResearch() {
    if (!currentSessionId) return;
    updateHUD("Durduruluyor...");
    try {
        await fetch(`/api/v3/research/stop/${currentSessionId}`, { method: 'POST' });
        console.log(`[Jarvis Core] Araştırma durdurma sinyali gönderildi: ${currentSessionId}`);
    } catch (err) {
        console.error('Stop error:', err);
    }
}

async function appendMessage(role, text) {
    // Veritabanı 'assistant' kaydeder, CSS 'ai' bekler — normalize et
    const cssRole = (role === 'assistant') ? 'ai' : role;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${cssRole}`;
    
    const tag = cssRole === 'ai' ? 
        `<div class="msg-tag ai-tag"><i class="fas fa-microchip"></i> JARVIS CORE v6.1</div>` : 
        `<div class="msg-tag user-tag"><i class="fas fa-user-shield"></i> KAPTAN</div>`;
    
    let actionsHtml = '';
    if (cssRole === 'ai') {
        actionsHtml = `
            <div class="msg-actions">
                <button onclick="copyMsg(this)" title="Kopyala"><i class="fas fa-copy"></i></button>
                <button onclick="downloadMsg(this)" title="İndir (.md)"><i class="fas fa-download"></i></button>
            </div>
        `;
    }

    const sanitizedHtml = DOMPurify.sanitize(marked.parse(fixMarkdown(text)));
    msgDiv.innerHTML = `
        ${tag}
        <div class="msg-content">${sanitizedHtml}</div>
        <textarea class="raw-markdown" style="display:none">${text}</textarea>
        ${actionsHtml}
        <div class="msg-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    // Kod bloklarına kopyala butonu ekle
    injectCopyButtons(msgDiv);
    
    chatEl.appendChild(msgDiv);
    chatEl.scrollTop = chatEl.scrollHeight;
    return msgDiv;
}

async function downloadMsg(btn) {
    const msgDiv = btn.closest('.message');
    const rawText = msgDiv.querySelector('.raw-markdown').value;
    const filename = `Jarvis_Rapor_${new Date().toISOString().slice(0,10)}.md`;
    
    const icon = btn.querySelector('i');
    const oldClass = icon.className;
    icon.className = 'fas fa-spinner fa-spin';
    
    try {
        const res = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: rawText, filename: filename })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            icon.className = 'fas fa-check';
            alert(result.message);
        } else {
            icon.className = 'fas fa-exclamation-triangle';
            alert("Hata: " + result.message);
        }
    } catch (err) {
        icon.className = 'fas fa-exclamation-triangle';
        alert("Bağlantı hatası: " + err.message);
    }
    
    setTimeout(() => { icon.className = oldClass; }, 3000);
}

function copyMsg(btn) {
    const msgDiv = btn.closest('.message');
    const rawText = msgDiv.querySelector('.raw-markdown').value;
    navigator.clipboard.writeText(rawText).catch(err => console.error("Kopyalama başarısız:", err));
    const icon = btn.querySelector('i');
    icon.className = 'fas fa-check';
    setTimeout(() => { icon.className = 'fas fa-copy'; }, 2000);
}

async function sendMessage() {
    if (isGenerating) {
        // Eğer şu an cevap üretiliyorsa, butona basmak üretimi DURDURUR
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        return;
    }

    const text = userInput.value.trim();
    if (!text && !currentImageBase64) return;

    // Arayüzü Kilitle
    isGenerating = true;
    userInput.disabled = true;
    userInput.placeholder = "Jarvis yanıtlıyor, bekleyin veya durdurun...";
    sendBtn.innerHTML = '<i class="fas fa-stop"></i>';
    sendBtn.style.color = '#ff4444'; // Kırmızı Durdur butonu
    
    currentAbortController = new AbortController();

    userInput.value = '';
    await appendMessage('user', text);
    
    typingEl.style.display = 'block';
    
    try {
        const payload = { 
            message: text,
            session_id: currentSessionId,
            mode: currentMode
        };
        if (currentImageBase64) {
            payload.image = currentImageBase64;
        }
        if (currentFileAttachment) {
            payload.file_content = currentFileAttachment.content;
            payload.file_name = currentFileAttachment.name;
        }

        // Araştırma veya Kodlama başladıysa HUD'ı göster ve sıfırla
        if (currentMode === 'deep' || currentMode === 'coding') {
            resetHUD();
            updateHUD(currentMode === 'deep' ? "Araştırma başlatılıyor..." : "Kodlama motorları ateşleniyor...");
        } else {
            researchHud.style.display = 'none';
        }

        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: currentAbortController.signal
        });

        // Eğer server yeni bir ID atadıysa (active -> timestamp), onu güncelle
        const newSessionId = response.headers.get('X-Session-Id');
        if (newSessionId && newSessionId !== currentSessionId) {
            currentSessionId = newSessionId;
            localStorage.setItem('lastSessionId', currentSessionId); // Kalıcı yap
        }

        // Gönderim başarılıysa görseli temizle
        clearImage();
        clearFileAttachment();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let aiMsgDiv = await appendMessage('ai', '');
        let fullText = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Paketleri \n\n ile ayır
            let parts = buffer.split('\n\n');
            buffer = parts.pop(); // Tamamlanmamış paketi buffer'da tut

            for (let packet of parts) {
                if (packet.startsWith('data: status: ')) {
                    const statusText = packet.replace('data: status: ', '').trim();
                    updateHUD(statusText);
                } else if (packet.startsWith('data: ')) {
                    const content = packet.replace('data: ', '').replace(/\\n/g, '\n');
                    
                    if (content.includes('[TEMİZLE]')) {
                        fullText = '';
                        const contentDiv = aiMsgDiv.querySelector('.msg-content');
                        if (contentDiv) contentDiv.innerHTML = '';
                        continue;
                    }

                    if (content.includes('[SUGGEST_DEEP_RESEARCH]')) {
                        showDeepResearchSuggestion();
                        continue;
                    }

                    fullText += content;
                    const contentDiv = aiMsgDiv.querySelector('.msg-content');
                    if (contentDiv) {
                        const sanitizedHtml = DOMPurify.sanitize(marked.parse(fixMarkdown(fullText)));
                        contentDiv.innerHTML = sanitizedHtml;
                        injectCopyButtons(contentDiv);
                    }
                    const rawArea = aiMsgDiv.querySelector('.raw-markdown');
                    if (rawArea) {
                        rawArea.value = fullText;
                    }
                    chatEl.scrollTop = chatEl.scrollHeight;
                }
            }
        }
        
        // İşlem bittiyse HUD'ı 3 saniye sonra gizle (Her modda)
        const isDeep = currentMode === 'deep';
        const finalStatus = fullText.includes("durduruldu") ? 
            (isDeep ? "Araştırma durduruldu." : "İşlem durduruldu.") : 
            (isDeep ? "Araştırma tamamlandı." : "Otonom görev tamamlandı.");
        
        updateHUD(finalStatus);
        setTimeout(() => { 
            if (!isGenerating) researchHud.style.display = 'none'; 
        }, 3000);
        
        // İlk mesajdan sonra sidebar'ı güncelle (yeni sohbet ismini çekmek için)
        loadSessions();
        
    } catch (err) {
        if (err.name === 'AbortError') {
            appendMessage('ai', '*(Yanıt Kaptan tarafından durduruldu)*');
            if (currentMode === 'deep') {
                stopResearch(); // Backend'i de durdur
                setTimeout(() => { researchHud.style.display = 'none'; }, 2000);
            }
        } else {
            appendMessage('ai', 'Bir hata oluştu Kaptan: ' + err.message);
        }
    } finally {
        isGenerating = false;
        userInput.disabled = false;
        userInput.placeholder = "Bir şeyler yazın veya 'ara: konu' diyerek internette aratın...";
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        sendBtn.style.color = '';
        currentAbortController = null;
        typingEl.style.display = 'none';
        userInput.focus();
    }
}

async function loadSessions() {
    // Cache-busting ekleyerek tarayıcıyı taze veri almaya zorla
    const res = await fetch('/api/v3/sessions?t=' + new Date().getTime());
    const sessions = await res.json();
    historyEl.innerHTML = '';
    
    // Arşivlenmiş sohbetleri ekle
    sessions.forEach(session => {
        const div = document.createElement('div');
        div.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
        div.onclick = () => switchSession(session.id);
        
        div.innerHTML = `
            <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <i class="fas fa-database" style="margin-right:8px; font-size:0.7rem; color: #00d2ff;"></i> ${session.summary}
            </div>
            <button class="delete-session-btn" onclick="deleteSingleSession('${session.id}', event)">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        historyEl.appendChild(div);
    });
}

async function switchSession(sessionId) {
    currentSessionId = sessionId;
    localStorage.setItem('lastSessionId', sessionId); // Her değişimde kaydet
    console.log(`[Jarvis Core] Veri tabanından ${sessionId} nolu kayıt çekiliyor...`);
    typingEl.style.display = 'block';
    try {
        const res = await fetch(`/api/v3/session/load/${sessionId}`);
        const data = await res.json();
        
        if (data.status === 'success' && data.messages) {
            chatEl.innerHTML = '';
            for (const msg of data.messages) {
                await appendMessage(msg.role, msg.content);
            }
            loadSessions();
            console.log(`[Jarvis Core] Kayıt başarıyla yüklendi.`);
        } else {
            console.error('Kayıt yüklenemedi:', data.detail || 'Bilinmeyen hata');
            alert('Kayıt yüklenirken bir hata oluştu Kaptan.');
        }
    } catch (err) {
        console.error('Core Load Error:', err);
        alert('Bağlantı hatası: ' + err.message);
    } finally {
        typingEl.style.display = 'none';
        chatEl.scrollTop = chatEl.scrollHeight;
    }
}

async function deleteSingleSession(sessionId, event) {
    event.stopPropagation();
    if (confirm('Bu sohbet kaydını veri tabanından kalıcı olarak silmek istediğinize emin misiniz Kaptan?')) {
        try {
            const res = await fetch(`/api/v3/session/${sessionId}`, { method: 'DELETE' });
            if (res.ok) {
                loadSessions();
            }
        } catch (err) {
            console.error('Silme hatası:', err);
        }
    }
}

async function loadActiveChat() {
    try {
        // Eğer localStorage'da bir session varsa direkt onu yükle
        const savedId = localStorage.getItem('lastSessionId');
        if (savedId && savedId !== 'active') {
            await switchSession(savedId);
            return;
        }

        const res = await fetch('/api/v3/history');
        const messages = await res.json();
        chatEl.innerHTML = ''; 
        if (!messages || messages.length === 0) {
            appendMessage('ai', 'Sistem aktif edildi. Merhaba Kaptan, size nasıl yardımcı olabilirim?');
        } else {
            for (const msg of messages) {
                await appendMessage(msg.role, msg.content);
            }
        }
    } catch (err) {
        console.error('Aktif sohbet yüklenemedi:', err);
    }
}

async function newSession() {
    currentSessionId = 'active';
    localStorage.removeItem('lastSessionId'); // Yeni sohbet için sıfırla
    typingEl.style.display = 'block';
    await fetch('/api/v3/session/new', { method: 'POST' });
    typingEl.style.display = 'none';
    chatEl.innerHTML = '<div class="message ai">Yeni sohbet veri tabanına işlendi. Buyrun Kaptan.</div>';
    clearImage();
    loadSessions();
}

async function clearHistory() {
    if (confirm('Tüm veri tabanı geçmişini kalıcı olarak temizlemek istediğinize emin misiniz?')) {
        await fetch('/api/v3/clear', { method: 'POST' });
        chatEl.innerHTML = '<div class="message ai">Reaktör temizlendi. Sistem yeni görev için hazır.</div>';
        loadSessions();
    }
}

function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageBase64 = e.target.result.split(',')[1];
        imagePreview.src = e.target.result;
        imagePreviewContainer.style.display = 'block';
        userInput.focus();
    };
    reader.readAsDataURL(file);
}

async function uploadImage(input) {
    handleImageFile(input.files[0]);
    // Aynı dosyayı tekrar seçebilmek için inputu sıfırla
    input.value = '';
}

function clearImage() {
    currentImageBase64 = null;
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '';
}

function uploadCodeFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        currentFileAttachment = { name: file.name, content: content };
        
        // Önizleme göster
        document.getElementById('file-preview-name').textContent = file.name;
        document.getElementById('file-preview-size').textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
        document.getElementById('file-preview-content').textContent = content.substring(0, 300) + (content.length > 300 ? '\n...' : '');
        document.getElementById('file-preview-container').style.display = 'block';
        userInput.focus();
    };
    reader.readAsText(file, 'utf-8');
    input.value = '';
}

function clearFileAttachment() {
    currentFileAttachment = null;
    const container = document.getElementById('file-preview-container');
    if (container) container.style.display = 'none';
}

// Voice Recognition
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    
    recognition.onstart = () => {
        voiceBtn.style.color = '#ff0000';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };
    
    recognition.onend = () => {
        voiceBtn.style.color = '';
    };
    
    voiceBtn.onclick = () => recognition.start();
} else {
    voiceBtn.style.display = 'none';
}

// Input Auto-Resize & Event Listeners
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

sendBtn.onclick = sendMessage;
userInput.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        userInput.style.height = 'auto'; // Gönderimden sonra kutuyu sıfırla
    }
};

// --- DRAG & DROP DESTEĞİ ---
const dragOverlay = document.getElementById('drag-overlay');

window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.style.display = 'flex';
});

window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
        if (dragOverlay) dragOverlay.style.display = 'none';
    }
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.style.display = 'none';
    
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
});

// --- PASTE (YAPIŞTIRMA) DESTEĞİ ---
document.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            handleImageFile(blob);
        }
    }
});

function showDeepResearchSuggestion() {
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-card';
    suggestionDiv.innerHTML = `
        <div style="font-size: 0.9rem; color: var(--primary); font-weight: 600;">
            <i class="fas fa-brain"></i> Jarvis'in Önerisi
        </div>
        <div style="font-size: 0.8rem; color: var(--text-dim);">
            Efendim, bu konu oldukça derin görünüyor. İsterseniz "Derin Araştırma Birimi"ni aktif ederek daha kapsamlı bir rapor sunabilirim.
        </div>
        <button class="suggestion-btn" onclick="switchToDeepAndSearch()">
            <i class="fas fa-search-plus"></i> Derin Araştırmayı Başlat
        </button>
    `;
    chatEl.appendChild(suggestionDiv);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function switchToDeepAndSearch() {
    const lastUserMsg = [...document.querySelectorAll('.message.user')].pop();
    if (lastUserMsg) {
        setMode('deep');
        userInput.value = lastUserMsg.innerText;
        sendMessage();
    }
}

function injectCopyButtons(container) {
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
        // Eğer zaten actions div'i varsa geç
        if (pre.querySelector('.code-actions')) return;

        const langClass = pre.querySelector('code').className || '';
        const isPython = langClass.includes('language-python') || !langClass;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'code-actions';
        actionsDiv.style.position = 'absolute';
        actionsDiv.style.top = '8px';
        actionsDiv.style.right = '8px';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '8px';
        actionsDiv.style.zIndex = '10';

        // 1. Python'da Çalıştır Butonu (Eğer Pythonsa)
        if (isPython) {
            const runBtn = document.createElement('button');
            runBtn.className = 'code-copy-btn';
            runBtn.style.position = 'relative'; // Override absolute
            runBtn.style.top = '0'; runBtn.style.right = '0';
            runBtn.style.borderColor = '#ff00ff';
            runBtn.style.color = '#ff00ff';
            runBtn.innerHTML = '<i class="fas fa-play"></i> Başlat';
            runBtn.onclick = async () => {
                const code = pre.querySelector('code').innerText;
                try {
                    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Başlatılıyor...';
                    const res = await fetch('/api/v3/run', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({code})
                    });
                    const result = await res.json();
                    if(result.status === 'success') {
                        runBtn.innerHTML = '<i class="fas fa-check"></i> Çalışıyor!';
                        runBtn.style.background = '#ff00ff';
                        runBtn.style.color = '#fff';
                    } else {
                        alert("Hata: " + result.message);
                    }
                } catch(e) {
                    alert("Bağlantı hatası: " + e.message);
                }
                setTimeout(() => {
                    runBtn.innerHTML = '<i class="fas fa-play"></i> Başlat';
                    runBtn.style.background = 'rgba(255, 0, 255, 0.1)';
                    runBtn.style.color = '#ff00ff';
                }, 3000);
            };
            actionsDiv.appendChild(runBtn);
        }

        // 2. Kopyala Butonu
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.style.position = 'relative'; // Override absolute
        copyBtn.style.top = '0'; copyBtn.style.right = '0';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Kopyala';
        copyBtn.onclick = () => {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
                copyBtn.style.borderColor = '#00ffcc';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Kopyala';
                    copyBtn.style.borderColor = '';
                }, 2000);
            });
        };
        actionsDiv.appendChild(copyBtn);

        pre.appendChild(actionsDiv);
    });
}

async function exportSession() {
    console.log(`[Jarvis Core] Sohbet dışarı aktarma başlatıldı (Desktop Mode). ID: ${currentSessionId}`);
    const btn = document.querySelector('button[onclick="exportSession()"]');
    const oldHtml = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Masaüstüne Hazırlanıyor...';
    btn.disabled = true;

    try {
        let exportText = `J.A.R.V.I.S. SİSTEM RAPORU - ${new Date().toLocaleString()}\n`;
        exportText += `Oturum Kimliği: ${currentSessionId}\n`;
        exportText += `==========================================\n\n`;

        let messages = [];

        // 1. Yol: API'den temiz veriyi çekmeyi dene
        try {
            const endpoint = (currentSessionId === 'active') ? '/api/v3/history' : `/api/v3/session/load/${currentSessionId}`;
            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                // /api/v3/history direkt liste döner, /session/load ise {messages: []} döner
                messages = Array.isArray(data) ? data : (data.messages || []);
            }
        } catch (apiErr) {
            console.warn("[Jarvis Core] API veri çekme başarısız, DOM fallback kullanılıyor.");
        }

        // 2. Yol: Fallback - DOM'dan oku
        if (messages.length === 0) {
            const chatMessages = document.querySelectorAll('.message');
            chatMessages.forEach(msg => {
                const role = msg.classList.contains('user') ? 'user' : 'assistant';
                const content = msg.querySelector('.msg-content').innerText;
                messages.push({ role, content });
            });
        }

        if (messages.length === 0) {
            alert("Dışarı aktarılacak bir mesaj bulunamadı Kaptan.");
            btn.innerHTML = oldHtml;
            btn.disabled = false;
            return;
        }

        messages.forEach(msg => {
            const roleName = msg.role === 'user' ? 'KAPTAN' : 'JARVIS';
            exportText += `[${roleName}]:\n${msg.content}\n`;
            exportText += `------------------------------------------\n`;
        });

        // SUNUCUYA GÖNDER - Masaüstüne Kaydetmesi İçin
        const filename = `Jarvis_Sohbet_Export_${currentSessionId}.txt`;
        const resDownload = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: exportText, filename: filename })
        });
        
        const result = await resDownload.json();
        if (result.status === 'success') {
            btn.innerHTML = '<i class="fas fa-check"></i> Masaüstüne Kaydedildi!';
        } else {
            throw new Error(result.message);
        }

    } catch (err) {
        console.error('Export error:', err);
        alert('Dışarı aktarma başarısız efendim: ' + err.message);
        btn.innerHTML = oldHtml;
    } finally {
        setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
        }, 3000);
    }
}

// Initial Load
loadActiveChat();
loadSessions();

// Linkleri Varsayılan Tarayıcıda Açma (pywebview bridge)
document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.href && a.href.startsWith('http')) {
        e.preventDefault();
        // pywebview API hazırsa onu kullan, yoksa normal target blank sekmeye düş
        if (window.pywebview && window.pywebview.api && window.pywebview.api.open_browser) {
            window.pywebview.api.open_browser(a.href);
        } else {
            window.open(a.href, '_blank');
        }
    }
});
