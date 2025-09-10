import React from 'react';

interface VideoResultProps {
  videoUrl: string;
  script: string;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, script }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Your Video is Ready!</h2>
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
      <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-200 mb-3">Original Script</h3>
        <p className="text-slate-300 italic whitespace-pre-wrap">{script}</p>
      </div>
       <div className="text-center pt-4">
          <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300"
          >
              Create Another Video
          </button>
      </div>
    </div>
  );
};