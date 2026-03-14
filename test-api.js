import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log('Testing API Key:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
        console.log('Sending request...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: 'Say "Hello World"' }] }]
        });
        console.log('Response:', response.text);
    } catch (e) {
        console.error('Test Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(await e.response.json(), null, 2));
        }
    }
}

test();
