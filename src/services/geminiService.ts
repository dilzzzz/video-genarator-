
import type { GenerateVideosOperation } from "@google/genai";

const pollOperation = async (operation: GenerateVideosOperation, setLoadingMessage: (message: string) => void): Promise<GenerateVideosOperation> => {
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
        const response = await fetch('/api/getVideoStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: currentOperation }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            throw new Error(errorData.error || `Polling failed with status: ${response.status}`);
        }

        currentOperation = await response.json();
    } catch (error) {
        console.error("Error polling operation:", error);
        throw new Error("Failed to get video generation status. Please try again later.");
    }
  }
  return currentOperation;
};

export const generateVideoFromScript = async (
  script: string,
  aspectRatio: string,
  creativeStyle: string,
  voice: string,
  backgroundMusic: string,
  videoModel: string,
  image: string | null,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  try {
    setLoadingMessage("Sending script to the AI director...");

    const generateResponse = await fetch('/api/generateVideo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script, aspectRatio, creativeStyle, voice, backgroundMusic, videoModel, image }),
    });

    if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Failed to start video generation: ${generateResponse.statusText}`);
    }

    const initialOperation: GenerateVideosOperation = await generateResponse.json();

    setLoadingMessage("Video generation started. The process is now running...");
    const completedOperation = await pollOperation(initialOperation, setLoadingMessage);

    if (completedOperation.error) {
        throw new Error(`Video generation failed: ${completedOperation.error.message || 'Unknown reason'}`);
    }

    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was returned.");
    }
    
    setLoadingMessage("Downloading the final video...");

    const videoResponse = await fetch('/api/downloadVideo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadLink }),
    });

    if (!videoResponse.ok) {
        const errorData = await videoResponse.json().catch(() => ({ error: videoResponse.statusText }));
        throw new Error(`Failed to download video via proxy: ${errorData.error || 'Unknown error'}`);
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
