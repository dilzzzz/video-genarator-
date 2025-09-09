
import React from 'react';

interface LoadingDisplayProps {
  message: string;
}

const Spinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
);

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
      <Spinner />
      <h2 className="text-2xl font-semibold text-white mt-6">Generating Your Video</h2>
      <p className="text-slate-400 mt-2 max-w-sm">
        {message || "Please wait, this may take several minutes. Feel free to grab a coffee!"}
      </p>
    </div>
  );
};
