import { GenerateVideosOperationResponse } from "@google/genai/dist/types/server/v1beta";

// The backend URL will be provided by cPanel's Node.js App setup.
// You MUST replace this with the actual URL for your deployed backend.
// It will look something like 'https://yourdomain.com:12345'
const BACKEND_URL = 'https://your-backend-app-url.com'; // <-- IMPORTANT: CHANGE THIS

const pollOperationOnBackend = async (operation: GenerateVideosOperationResponse, setLoadingMessage: (message: string) => void): Promise<GenerateVideosOperationResponse> => {
  let currentOperation = operation;
  let pollCount = 0;
  const messages = [
      "The AI director is reviewing your script...",
      "Setting up the virtual production studio...",
      "This can take a few minutes, please be patient...",
      "Rendering initial frames...",
      "Adding special effects and details...",
      "Finalizing the video composition...",
      "Almost there, preparing for final output..."
  ];

  while (!currentOperation.done) {
    const messageIndex = pollCount % messages.length;
    setLoadingMessage(`${messages[messageIndex]} (Status check ${pollCount + 1})`);
    pollCount++;
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    try {
        const response = await fetch(`${BACKEND_URL}/api/poll-operation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operation: currentOperation }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Polling failed');
        }
        currentOperation = await response.json();
    } catch (error) {
        console.error("Error polling operation from backend:", error);
        throw new Error("Failed to get video generation status from the server. Please try again later.");
    }
  }
  return currentOperation;
};

export const generateVideoFromScript = async (
  script: string,
  aspectRatio: string,
  videoLength: number,
  creativeStyle: string,
  voice: string,
  backgroundMusic: string,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  try {
    setLoadingMessage("Sending script to the AI director...");

    const response = await fetch(`${BACKEND_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            script,
            aspectRatio,
            videoLength,
            creativeStyle,
            voice,
            backgroundMusic
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start video generation.');
    }

    const initialOperation: GenerateVideosOperationResponse = await response.json();

    setLoadingMessage("Video generation started. The process is now running in the background.");
    const completedOperation = await pollOperationOnBackend(initialOperation, setLoadingMessage);

    if (completedOperation.error) {
        throw new Error(`Video generation failed: ${completedOperation.error.message || 'Unknown reason'}`);
    }

    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was returned.");
    }
    
    // The download link from Gemini already works, we can use it directly
    // The API key is not needed here as the link is temporary and signed
    setLoadingMessage("Downloading the final video...");
    const videoResponse = await fetch(downloadLink);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video. Server responded with: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    setLoadingMessage("Video ready!");
    return videoUrl;

  } catch (error) {
    console.error("Error in generateVideoFromScript:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred during video generation.");
  }
};
