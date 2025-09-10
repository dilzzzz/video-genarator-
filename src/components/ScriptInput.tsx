
import React from 'react';

interface ScriptInputProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  generationsLeft: number;
}

const aspectRatios = [
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '1:1', label: 'Square' },
];

export const ScriptInput: React.FC<ScriptInputProps> = ({ 
  script, 
  setScript, 
  onSubmit, 
  isLoading, 
  aspectRatio, 
  setAspectRatio,
  generationsLeft
}) => {
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
