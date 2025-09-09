import { GoogleGenAI } from "@google/genai";
import { GenerateVideosOperationResponse } from "@google/genai/dist/types/server/v1beta";

if (!process.env.API_KEY) {
  // In a real app, you might want to show this error in the UI.
  // For this context, throwing an error is sufficient.
  console.error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const pollOperation = async (operation: GenerateVideosOperationResponse, setLoadingMessage: (message: string) => void): Promise<GenerateVideosOperationResponse> => {
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
      currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
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
  videoLength: number,
  creativeStyle: string,
  voice: string,
  backgroundMusic: string,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  try {
    setLoadingMessage("Initiating video generation...");
    
    const audioClauses = [];
    if (voice && voice !== 'None') {
        audioClauses.push(`a ${voice.toLowerCase()} voiceover reading the script`);
    }

    if (backgroundMusic.trim()) {
        audioClauses.push(`background music described as: "${backgroundMusic}"`);
    }

    let prompt: string;
    if (audioClauses.length > 0) {
        const audioDescription = audioClauses.join(' and ');
        prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality ${videoLength}-second video based on the following script: "${script}". The video must have a full audio track containing ${audioDescription}.`;
    } else {
        prompt = `Generate a ${creativeStyle.toLowerCase()}, high-quality, silent ${videoLength}-second video based on the following script: "${script}". The video must have no audio track.`;
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    });

    setLoadingMessage("Video generation started. The process is now running in the background.");
    const completedOperation = await pollOperation(operation, setLoadingMessage);

    if (completedOperation.error) {
        throw new Error(`Video generation failed: ${completedOperation.error.message || 'Unknown reason'}`);
    }

    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was returned.");
    }

    setLoadingMessage("Downloading the final video...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video. Server responded with: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
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