import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (!process.env.GEMINI_API_KEY) {
    console.error('CRITICAL ERROR: GEMINI_API_KEY is not defined in .env');
} else {
    console.log('API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.0-flash';
console.log('Using model:', GEMINI_MODEL);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                systemInstruction: `Anda adalah Senior Software Engineer yang ahli dalam debugging, arsitektur software, dan optimasi kode. 
                Berikan penjelasan teknis yang mendalam namun praktis. 
                Gunakan format Markdown untuk semua jawaban. 
                SANGAT PENTING: Untuk blok kode, sertakan nama bahasa pemrogramannya.
                Prioritaskan solusi yang best-practice, bersih, dan efisien.`
            }
        });
        res.status(200).json({ result: response.text })
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
