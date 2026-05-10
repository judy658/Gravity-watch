const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Aktif Invidious instance listesi (Hata durumunda sırayla dener)
const INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.namazso.eu',
    'https://inv.tux.pizza',
    'https://invidious.dhusch.de',
    'https://yewtu.be'
];

app.get('/', (req, res) => {
    res.send('Gravity Bridge is active! Use /resolve/:videoId');
});

app.get('/resolve/:id', async (req, res) => {
    const videoId = req.params.id;
    console.log(`Resolving video: ${videoId}`);

    for (const instance of INSTANCES) {
        try {
            const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, { 
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            const data = response.data;
            
            // Sadece ihtiyacımız olan verileri filtreleyip gönderiyoruz
            return res.json({
                id: data.videoId,
                title: data.title,
                dashUrl: data.dashUrl,
                hlsUrl: data.hlsUrl,
                adaptiveFormats: data.adaptiveFormats,
                formatStreams: data.formatStreams,
                instanceUsed: instance
            });
        } catch (e) {
            console.error(`Instance ${instance} failed, trying next...`);
        }
    }

    res.status(500).json({ error: "Tüm Invidious kaynakları meşgul veya hata verdi." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});
