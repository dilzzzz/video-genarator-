
import React from 'react';

interface VideoResultProps {
  videoUrl: string;
  script: string;
  onCreateAnother: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, script, onCreateAnother }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Your Video is Ready!</h2>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-200 mb-3">Original Script</h3>
        <p className="text-slate-300 italic whitespace-pre-wrap">{script}</p>
      </div>
      
      <div>
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full aspect-video rounded-lg shadow-2xl shadow-purple-900/20 border border-slate-700"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
       <div className="text-center pt-4 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
              onClick={onCreateAnother}
              className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300"
          >
              Create Another Video
          </button>
           <a
            href={videoUrl}
            download="ai-generated-video.mp4"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download Video</span>