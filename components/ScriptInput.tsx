
import React, { useState, useRef, useEffect } from 'react';

interface ScriptInputProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  creativeStyle: string;
  setCreativeStyle: (style: string) => void;
  voice: string;
  setVoice: (voice: string) => void;
  videoModel: string;
  setVideoModel: (model: string) => void;
  backgroundMusic: string;
  setBackgroundMusic: (music: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  generationsLeft: number;
}

const aspectRatios = [
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '1:1', label: 'Square' },
];

const videoModels = [
  { value: 'veo-2.0-generate-001', label: 'VEO 2.0', description: 'Balanced quality and speed.' },
  { value: 'veo-3.0-generate-001', label: 'VEO 3.0', description: 'Highest quality, slower generation.' },
  { value: 'veo-3.0-fast-generate-001', label: 'VEO 3.0 Fast', description: 'Faster generation, good quality.' },
];

const creativeStyles = ['Cinematic', 'Documentary', 'Animated', 'Vibrant', 'Minimalist'];
const voiceOptions = ['None', 'Male - Deep', 'Female - Warm', 'Narrator', 'Child', 'Robot', 'Upbeat', 'Authoritative'];

export const ScriptInput: React.FC<ScriptInputProps> = ({ 
  script, 
  setScript, 
  onSubmit, 
  isLoading, 
  aspectRatio, 
  setAspectRatio,
  creativeStyle,
  setCreativeStyle,
  voice,
  setVoice,
  videoModel,
  setVideoModel,
  backgroundMusic,
  setBackgroundMusic,
  image,
  setImage,
  generationsLeft
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
        videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const openCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access the camera. Please check permissions and ensure you are on a secure (HTTPS) connection.");
      }
    } else {
      alert("Your browser does not support camera access.");
    }
  };

  const closeCamera = () => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsCameraOpen(false);
  };

  const captureImage = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const context = canvas.getContext('2d');
          if (context) {
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              const base64Data = dataUrl.split(',')[1];
              setImage(base64Data);
              closeCamera();
          }
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File is too large. Please select an image smaller than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setImage(base64Data);
      };
      reader.onerror = () => {
        alert("There was an error reading the file. Please try again.");
        console.error("FileReader error", reader.error);
      };
      reader.readAsDataURL(file);
    }
    // Clear the value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
      <label htmlFor="script-input" className="block text-lg font-medium text-slate-300 mb-2">
        Your Script
      </label>
      <textarea
        id="script-input"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="e.g., A majestic eagle soaring through a cloudy sky during a golden sunset."
        className="w-full h-40 p-4 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500 resize-none"
        disabled={isLoading}
      />
      <p className="text-sm text-slate-500 mt-2">
        Describe the scene, action, and mood. The more detailed your script, the better the result.
      </p>

      <div className="mt-6">
        <label className="block text-lg font-medium text-slate-300 mb-3">
          Reference Image (Optional)
        </label>
        {image ? (
          <div className="relative group">
            <img src={`data:image/jpeg;base64,${image}`} alt="Captured reference" className="rounded-lg w-full max-h-60 object-contain bg-slate-900" />
            <button 
              onClick={() => { setImage(null); }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 transition-colors"
              aria-label="Remove Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              aria-hidden="true"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Upload File</span>
            </button>
            <button 
              onClick={openCamera} 
              disabled={isLoading} 
              className="w-full flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H12a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                <path d="M15 8a1 1 0 10-2 0v2a1 1 0 102 0V8z" />
                <path d="M3 10a5 5 0 1110 0 5 5 0 01-10 0z" />
                <path d="M7 10a3 3 0 116 0 3 3 0 01-6 0z" />
              </svg>
              <span>Use Camera</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-lg font-medium text-slate-300 mb-3">
          Aspect Ratio
        </label>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {aspectRatios.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAspectRatio(value)}
              disabled={isLoading}
              className={`w-full sm:w-auto flex-1 text-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50 ${
                aspectRatio === value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {label} <span className="text-slate-400">({value})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-lg font-medium text-slate-300 mb-3">
          Video Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {videoModels.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setVideoModel(value)}
              disabled={isLoading}
              title={description}
              className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50 ${
                videoModel === value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Select the AI model for video generation. Newer models may offer higher quality at the cost of generation time.
        </p>
      </div>

      <div className="mt-6">
        <label className="block text-lg font-medium text-slate-300 mb-3">
          Voiceover
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {voiceOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVoice(option)}
              disabled={isLoading}
              className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50 ${
                voice === option
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-700 pt-6">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex justify-between items-center text-left text-lg font-medium text-slate-300 hover:text-white transition-colors"
          aria-expanded={isAdvancedOpen}
        >
          <span>Advanced Settings</span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {isAdvancedOpen && (
          <div className="mt-4 space-y-6">
            <div>
              <label className="block text-base font-medium text-slate-300 mb-3">
                Creative Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {creativeStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCreativeStyle(style)}
                    disabled={isLoading}
                    className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50 ${
                      creativeStyle === style
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="background-music-prompt" className="block text-base font-medium text-slate-300 mb-2">
                Background Music Prompt
              </label>
              <input
                type="text"
                id="background-music-prompt"
                value={backgroundMusic}
                onChange={(e) => setBackgroundMusic(e.target.value)}
                placeholder="e.g., epic orchestral score, calming nature sounds"
                className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200 placeholder-slate-500"
                disabled={isLoading}
              />
              <p className="text-sm text-slate-500 mt-1">
                Describe the music you'd like to accompany your video.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onSubmit}
          disabled={isLoading || generationsLeft <= 0}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? 'Generating...' : generationsLeft > 0 ? 'Create Video' : 'Daily Limit Reached'}
        </button>
        <p className="text-sm text-slate-400 mt-3">
          You have <span className="font-bold text-slate-300">{generationsLeft}</span> generation{generationsLeft !== 1 ? 's' : ''} left today.
        </p>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-slate-800 p-4 rounded-lg shadow-2xl w-full max-w-lg mx-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-slate-900"></video>
            <div className="mt-4 flex justify-around space-x-2">
              <button onClick={captureImage} className="flex-1 px-4 py-2 rounded-md font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors">Take Picture</button>
              <button onClick={closeCamera} className="flex-1 px-4 py-2 rounded-md font-medium bg-slate-600 hover:bg-slate-500 text-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
