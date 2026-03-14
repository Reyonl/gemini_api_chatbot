import 'dotenv/config';

async function listModels() {
    try {
        const key = process.env.GEMINI_API_KEY;
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
        const data = await resp.json();
        
        if (data.models) {
            console.log('--- MODELS ---');
            data.models.forEach(m => {
                console.log(`Name: ${m.name}`);
                console.log(`Methods: ${m.supportedGenerationMethods.join(', ')}`);
                console.log('---');
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (e) {
        console.error('Check failed:', e);
    }
}

listModels();
