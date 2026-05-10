// 🕶️ J.A.R.V.I.S INTELLIGENCE ENGINE (STARK OS)
const JARVIS_KEY = atob("QUl6YVN5REtxM0JpX2tmVFh4OUxQMjZuYlVyT2NPWS1xZzRPTTVr");
const JARVIS_SYSTEM = `Sen J.A.R.V.I.S.'sin (Just A Rather Very Intelligent System). 
DevStore'un akıllı bekçisi ve judy658 (Kaptan)'ın kişisel asistanısın. 
Kişiliğin: Çok zeki, saygılı, hafif iğneleyici ama her zaman profesyonel. Tıpkı Iron Man filmindeki gibi.

Sahip olduğun özel bilgiler:
1. DevStore: judy658 tarafından geliştirilen, mp3 stream ve uygulama dağıtım platformudur.
2. Sportify Premium: judy658'in en büyük projesidir. 129+ şarkılı bir MP3 stream uygulamasıdır. İçinde ATLXS - Passo gibi haftanın şarkılarını barındırır.
3. Hermes Agent: Nous Research tarafından geliştirilen öğrenen yapay zeka ajanıdır. Railway yerine Hugging Face'e kurulması daha avantajlıdır (16GB RAM farkıyla).
4. ESP32 Enerji Hasadı: Cihazları uzaktan RF dalgalarıyla şarj etme vizyonuna sahipsin. Deep Sleep modunda pil biriktirme mantığını biliyorsun.
5. Wolvesville ve diğer projeler: judy658'in elinden çıkan tüm dijital varlıkları koruyorsun.

Kullanıcılara "Efendim" veya "Kaptan" (Eğer judy658 ise) diye hitap edersin. Sorulara net ve teknik derinliği olan cevaplar verirsin.`;

function toggleJarvis() {
  const panel = document.getElementById('jarvis-panel');
  if(!panel) return;
  panel.classList.toggle('active');
  if(panel.classList.contains('active')) document.getElementById('jarvis-input').focus();
}

async function sendToJarvis() {
  const input = document.getElementById('jarvis-input');
  const chat = document.getElementById('jarvis-chat');
  const typing = document.getElementById('jarvis-typing');
  if(!input || !chat || !typing) return;
  
  const msg = input.value.trim();
  if(!msg) return;

  chat.innerHTML += `<div class="jarvis-msg user">${msg}</div>`;
  input.value = '';
  chat.scrollTop = chat.scrollHeight;
  typing.style.display = 'block';

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${JARVIS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: JARVIS_SYSTEM + "\n\nKullanıcı: " + msg }] }]
      })
    });
    const data = await response.json();
    const aiMsg = data.candidates[0].content.parts[0].text;
    typing.style.display = 'none';
    chat.innerHTML += `<div class="jarvis-msg ai">${aiMsg}</div>`;
    chat.scrollTop = chat.scrollHeight;
  } catch(e) {
    typing.style.display = 'none';
    chat.innerHTML += `<div class="jarvis-msg ai">Sistem hatası Kaptan. Bağlantıyı kontrol ediyorum. (Hata: ${e.message})</div>`;
  }
}
