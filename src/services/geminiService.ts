
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

// Initialize the Google GenAI client, assuming API_KEY is in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        // Poll for the operation status directly using the SDK
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
  creativeStyle: string,
  voice: string,
  backgroundMusic: string,
  videoModel: string,
  image: string | null,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  try {
    setLoadingMessage("Sending script to the AI director...");

    // Construct the prompt with all user-defined parameters
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

    // Call the Gemini API to generate the video
    const initialOperation = await ai.models.generateVideos(generateVideosParams);

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

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

    if (!videoResponse.ok) {
        const errorText = await videoResponse.text().catch(() => videoResponse.statusText);
        throw new Error(`Failed to download video: ${errorText}`);
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
