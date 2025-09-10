// Fix: Corrected import from 'GenerateVideosOperationResponse' to 'GenerateVideosOperation' as the former is not a valid export.
import { GenerateVideosOperation } from "@google/genai";

// =====================================================================================
// IMPORTANT!!: You MUST change this URL.
//
// Step 1: Go to your cPanel -> "Setup Node.js App".
// Step 2: Find the backend application you created.
// Step 3: Copy the "Application URL" provided there.
//         (For example: https://your-app.yourdomain.com)
// Step 4: Delete the placeholder URL below ('https://geminiaichat.org/')
//         and paste your actual Application URL in its place.
// =====================================================================================
const BACKEND_URL = 'https://geminiaichat.org/'; // <-- CHANGE THIS LINE

const pollOperationOnBackend = async (operation: GenerateVideosOperation, setLoadingMessage: (message: string) => void): Promise<GenerateVideosOperation> => {
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

    const initialOperation: GenerateVideosOperation = await response.json();

    setLoadingMessage("Video generation started. The process is now running in the background.");
    const completedOperation = await pollOperationOnBackend(initialOperation, setLoadingMessage);

    if (completedOperation.error) {
        throw new Error(`Video generation failed: ${completedOperation.error.message || 'Unknown reason'}`);
    }

    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was returned.");
    }
    
    // The link provided by Gemini is a temporary, pre-signed URL that allows direct download.
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