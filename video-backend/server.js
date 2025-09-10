// server.js
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';

const app = express();
// The PORT is automatically assigned by the cPanel Node.js environment.
const port = process.env.PORT || 3001;

// --- CRITICAL CHECK: Read API Key at startup ---
// The API key is securely read from the server's environment variables.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  // If the key is not found, log a clear error and stop the server.
  // This message will appear in your cPanel Node.js App logs.
  console.error("FATAL ERROR: The API_KEY environment variable is not set on the server.");
  console.error("Please add the API_KEY in your cPanel -> Setup Node.js App -> Environment Variables section.");
  process.exit(1); // Exit the process with an error code.
}

const ai = new GoogleGenAI({ apiKey });

// Middlewares to handle JSON data and allow cross-origin requests from your frontend.
app.use(express.json());
app.use(cors());

// API endpoint to start the video generation process.
app.post('/api/generate-video', async (req, res) => {
  try {
    const { script, aspectRatio, videoLength, creativeStyle, voice, backgroundMusic } = req.body;

    if (!script) {
        return res.status(400).json({ error: "Script cannot be empty." });
    }

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
        prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality ${videoLength}-second video based on the following script: "${script}". The video must have a full audio track containing ${audioDescription}.`;
    } else {
        prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality, silent ${videoLength}-second video based on the following script: "${script}". The video must have no audio track.`;
    }

    console.log("Starting video generation with prompt:", prompt);
    const operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    });

    res.status(200).json(operation);

  } catch (error) {
    console.error('Error in /api/generate-video:', error);
    res.status(500).json({ error: error.message || "An unexpected error occurred while starting video generation." });
  }
});

// API endpoint for the frontend to periodically check the status of the video generation.
app.post('/api/poll-operation', async (req, res) => {        
    try {
        const { operation } = req.body;
        if (!operation) {
            return res.status(400).json({ error: "Operation data is missing in the polling request." });
        }
        const currentOperation = await ai.operations.getVideosOperation({ operation });
        res.status(200).json(currentOperation);
    } catch (error) {
        console.error('Error in /api/poll-operation:', error);
        res.status(500).json({ error: "Failed to get video generation status." });
    }
});

app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
  console.log('Successfully started with a valid API_KEY.');
});
