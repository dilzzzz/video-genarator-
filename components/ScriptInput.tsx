
import React, { useState } from 'react';

interface ScriptInputProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  videoLength: number;
  setVideoLength: (length: number) => void;
  creativeStyle: string;
  setCreativeStyle: (style: string) => void;
  voice: string;
  setVoice: (voice: string) => void;
  backgroundMusic: string;
  setBackgroundMusic: (music: string) => void;
}

const aspectRatios = [
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '1:1', label: 'Square' },
];

const creativeStyles = ['Cinematic', 'Documentary', 'Animated', 'Vibrant', 'Minimalist'];
const voiceOptions = ['None', 'Male - Deep', 'Female - Warm', 'Narrator'];

export const ScriptInput: React.FC<ScriptInputProps> = ({ 
  script, 
  setScript, 
  onSubmit, 
  isLoading, 
  aspectRatio, 
  setAspectRatio,
  videoLength,
  setVideoLength,
  creativeStyle,
  setCreativeStyle,
  voice,
  setVoice,
  backgroundMusic,
  setBackgroundMusic
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
        setVideoLength(15); 
        return;
    };
    if (value < 15) value = 15;
    if (value > 60) value = 60;
    setVideoLength(value);
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
              <label htmlFor="video-length" className="block text-base font-medium text-slate-300 mb-2">
                Video Length (seconds)
              </label>
              <input
                type="number"
                id="video-length"
                value={videoLength}
                onChange={handleLengthChange}
                min="15"
                max="60"
                className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200"
                disabled={isLoading}
              />
               <p className="text-sm text-slate-500 mt-1">
                Enter a duration between 15 and 60 seconds.
              </p>
            </div>
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

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? 'Generating...' : 'Create Video'}
      </button>
    </div>
  );
};