
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { script, aspectRatio, creativeStyle, voice, backgroundMusic, videoModel, image } = req.body;
        
        if (!script || !videoModel || !aspectRatio || !creativeStyle) {
            return res.status(400).json({ error: 'Missing required parameters in request body' });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const audioClauses = [];
        if (voice && voice !== 'None') {
            audioClauses.push(`a ${voice.toLowerCase()} voiceover reading the script`);
        }
        if (backgroundMusic && backgroundMusic.trim()) {
            audioClauses.push(`background music described as: "${backgroundMusic}"`);
        }

        let prompt;
        if (audioClauses.length > 0) {
            const audioDescription = audioClauses.join(' and ');
            prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality video based on the following script: "${script}". The video must have a full audio track containing ${audioDescription}.`;
        } else {
            prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality, silent video based on the following script: "${script}". The video must have no audio track.`;
        }
        
        const generateVideosParams: {
            model: string;
            prompt: string;
            image?: { imageBytes: string; mimeType: string; };
            config: { numberOfVideos: number; aspectRatio: string; };
        } = {
            model: videoModel,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
            }
        };

        if (image) {
            generateVideosParams.image = {
                imageBytes: image,
                mimeType: 'image/jpeg',
            };
        }
        
        const initialOperation = await ai.models.generateVideos(generateVideosParams);
        
        res.status(200).json(initialOperation);

    } catch (error) {
        console.error('Error in generateVideo handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: 'An internal server error occurred during video generation initiation.', details: errorMessage });
    }
}
