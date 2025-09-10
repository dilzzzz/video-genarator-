
import React, { useState, useCallback, useEffect } from 'react';
import { ScriptInput } from './components/ScriptInput';
import { LoadingDisplay } from './components/LoadingDisplay';
import { VideoResult } from './components/VideoResult';
import { generateVideoFromScript } from './services/geminiService';

const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [creativeStyle, setCreativeStyle] = useState<string>('Cinematic');
  const [voice, setVoice] = useState<string>('None');
  const [videoModel, setVideoModel] = useState<string>('veo-2.0-generate-001');
  const [backgroundMusic, setBackgroundMusic] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [originalScript, setOriginalScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationsLeft, setGenerationsLeft] = useState(5);

  const DAILY_LIMIT = 5;

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const today = getTodayDateString();
    try {
      const storedData = localStorage.getItem('videoGenerationTracker');
      if (storedData) {
        const { date, count } = JSON.parse(storedData);
        if (date === today) {
          setGenerationsLeft(Math.max(0, DAILY_LIMIT - count));
        } else {
          localStorage.setItem('videoGenerationTracker', JSON.stringify({ date: today, count: 0 }));
          setGenerationsLeft(DAILY_LIMIT);
        }
      } else {
        localStorage.setItem('videoGenerationTracker', JSON.stringify({ date: today, count: 0 }));
        setGenerationsLeft(DAILY_LIMIT);
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
      setGenerationsLeft(DAILY_LIMIT);
    }
  }, []);

  const handleGenerateVideo = useCallback(async () => {
    if (generationsLeft <= 0) {
      setError("You have reached your daily limit of 5 videos. Please try again tomorrow.");
      return;
    }
    if (!script.trim()) {
      setError('Please enter a script to generate a video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setOriginalScript(script);

    try {
      const url = await generateVideoFromScript(script, aspectRatio, creativeStyle, voice, backgroundMusic, videoModel, image, setLoadingMessage);
      setVideoUrl(url);

      const today = getTodayDateString();
      try {
        const storedData = localStorage.getItem('videoGenerationTracker');
        if (storedData) {
            const { date, count } = JSON.parse(storedData);
            const newCount = date === today ? count + 1 : 1;
            localStorage.setItem('videoGenerationTracker', JSON.stringify({ date: today, count: newCount }));
            setGenerationsLeft(Math.max(0, DAILY_LIMIT - newCount));
        }
      } catch(e) {
        console.error("Failed to update localStorage:", e);
      }

    } catch (e) {
      const err = e as Error;
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [script, aspectRatio, creativeStyle, voice, backgroundMusic, videoModel, image, generationsLeft]);

  const Header = () => (
    <div className="text-center mb-8 md:mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
        AI Script to Video Generator
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
        Bring your stories to life. Write a script, and our AI director will create a unique visual masterpiece for you.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Header />
        <main>
          {!isLoading && !videoUrl && (
            <ScriptInput 
              script={script}
              setScript={setScript}
              onSubmit={handleGenerateVideo}
              isLoading={isLoading}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              creativeStyle={creativeStyle}
              setCreativeStyle={setCreativeStyle}
              voice={voice}
              setVoice={setVoice}
              videoModel={videoModel}
              setVideoModel={setVideoModel}
              backgroundMusic={backgroundMusic}
              setBackgroundMusic={setBackgroundMusic}
              image={image}
              setImage={setImage}
              generationsLeft={generationsLeft}
            />
          )}
          {isLoading && <LoadingDisplay message={loadingMessage} />}
          {error && (
             <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mt-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {videoUrl && (
            <VideoResult videoUrl={videoUrl} script={originalScript} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
