
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { operation } = req.body;
        
        if (!operation) {
            return res.status(400).json({ error: 'Missing operation in request body' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const updatedOperation = await ai.operations.getVideosOperation({ operation });

        res.status(200).json(updatedOperation);
    } catch (error) {
        console.error('Error in getVideoStatus handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: 'Failed to get video generation status.', details: errorMessage });
    }
}
