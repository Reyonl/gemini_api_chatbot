import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listModels() {
    console.log('Testing New API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
        console.log('Fetching models...');
        const response = await ai.models.list();
        console.log('Available Models:');
        if (response && response.models) {
            response.models.forEach(m => {
                console.log(`- ${m.name} (Support: ${JSON.stringify(m.supportedGenerationMethods)})`);
            });
        } else {
            console.log('No models property found in response:', response);
        }
    } catch (e) {
        console.error('List Models Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            try {
                const data = await e.response.json();
                console.error('Data:', JSON.stringify(data, null, 2));
            } catch (err) {}
        }
    }
}

listModels();
