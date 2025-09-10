
import React, { useState, useRef } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full max-w-2xl mx-auto bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700 space-y-6">
      <div>
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
          required
        />
        <p className="text-sm text-slate-500 mt-2">
          Describe the scene, action, and mood. The more detailed your script, the better the result.
        </p>
      </div>

      <div>
        <span className="block text-lg font-medium text-slate-300 mb-3">
          Reference Image (Optional)
        </span>
        {image ? (
          <div className="relative group">
            <img src={`data:image/jpeg;base64,${image}`} alt="Uploaded reference" className="rounded-lg w-full max-h-60 object-contain bg-slate-900" />
            <button 
              type="button"
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
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="block text-lg font-medium text-slate-300 mb-3">Aspect Ratio</legend>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {aspectRatios.map(({ value, label }) => (
            <div key={value} className="flex-1">
              <input
                type="radio"
                id={`aspect-${value}`}
                name="aspectRatio"
                value={value}
                checked={aspectRatio === value}
                onChange={() => setAspectRatio(value)}
                disabled={isLoading}
                className="sr-only peer"
              />
              <label
                htmlFor={`aspect-${value}`}
                className="w-full block text-center cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ring-2 ring-transparent peer-focus:ring-purple-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 bg-slate-700 text-slate-300 hover:bg-slate-600 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:shadow-lg peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
              >
                {label} <span className="text-slate-400">({value})</span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-lg font-medium text-slate-300 mb-3">Video Model</legend>
        <div className="grid grid-cols-1">
          {videoModels.map(({ value, label, description }) => (
            <div key={value}>
              <input
                type="radio"
                id={`model-${value}`}
                name="videoModel"
                value={value}
                checked={videoModel === value}
                onChange={() => setVideoModel(value)}
                disabled={isLoading}
                className="sr-only peer"
              />
              <label
                htmlFor={`model-${value}`}
                title={description}
                className="w-full block text-center cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ring-2 ring-transparent peer-focus:ring-purple-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 bg-slate-700 text-slate-300 hover:bg-slate-600 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:shadow-lg peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Select the AI model for video generation.
        </p>
      </fieldset>

      <fieldset>
        <legend className="block text-lg font-medium text-slate-300 mb-3">Voiceover</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {voiceOptions.map((option) => (
             <div key={option}>
              <input
                type="radio"
                id={`voice-${option}`}
                name="voice"
                value={option}
                checked={voice === option}
                onChange={() => setVoice(option)}
                disabled={isLoading}
                className="sr-only peer"
              />
              <label
                htmlFor={`voice-${option}`}
                className="w-full block text-center cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ring-2 ring-transparent peer-focus:ring-purple-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 bg-slate-700 text-slate-300 hover:bg-slate-600 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:shadow-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-slate-700 pt-6">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex justify-between items-center text-left text-lg font-medium text-slate-300 hover:text-white transition-colors"
          aria-expanded={isAdvancedOpen}
          aria-controls="advanced-settings"
        >
          <span>Advanced Settings</span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <div id="advanced-settings" className={`mt-4 space-y-6 ${isAdvancedOpen ? 'block' : 'hidden'}`}>
          <fieldset>
            <legend className="block text-base font-medium text-slate-300 mb-3">Creative Style</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {creativeStyles.map((style) => (
                <div key={style}>
                  <input
                    type="radio"
                    id={`style-${style}`}
                    name="creativeStyle"
                    value={style}
                    checked={creativeStyle === style}
                    onChange={() => setCreativeStyle(style)}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={`style-${style}`}
                    className="w-full block text-center cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ring-2 ring-transparent peer-focus:ring-purple-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 bg-slate-700 text-slate-300 hover:bg-slate-600 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:shadow-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                  >
                    {style}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
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
      </div>

      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isLoading || generationsLeft <= 0}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? 'Generating...' : generationsLeft > 0 ? 'Create Video' : 'Daily Limit Reached'}
        </button>
        <p className="text-sm text-slate-400 mt-3" aria-live="polite">
          You have <span className="font-bold text-slate-300">{generationsLeft}</span> generation{generationsLeft !== 1 ? 's' : ''} left today.
        </p>
      </div>
    </form>
  );
};
