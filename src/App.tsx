import React, { useState, useCallback } from 'react';
import { ScriptInput } from './components/ScriptInput';
import { LoadingDisplay } from './components/LoadingDisplay';
import { VideoResult } from './components/VideoResult';
import { generateVideoFromScript } from './services/geminiService';

const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [videoLength, setVideoLength] = useState<number>(45);
  const [creativeStyle, setCreativeStyle] = useState<string>('Cinematic');
  const [voice, setVoice] = useState<string>('None');
  const [backgroundMusic, setBackgroundMusic] = useState<string>('');
  const [originalScript, setOriginalScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateVideo = useCallback(async () => {
    if (!script.trim()) {
      setError('Please enter a script to generate a video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setOriginalScript(script);

    try {
      const url = await generateVideoFromScript(script, aspectRatio, videoLength, creativeStyle, voice, backgroundMusic, setLoadingMessage);
      setVideoUrl(url);
    } catch (e) {
      const err = e as Error;
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [script, aspectRatio, videoLength, creativeStyle, voice, backgroundMusic]);

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
              videoLength={videoLength}
              setVideoLength={setVideoLength}
              creativeStyle={creativeStyle}
              setCreativeStyle={setCreativeStyle}
              voice={voice}
              setVoice={setVoice}
              backgroundMusic={backgroundMusic}
              setBackgroundMusic={setBackgroundMusic}
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