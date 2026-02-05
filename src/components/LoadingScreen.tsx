import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-1000 ease-in-out
        ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="text-4xl font-black tracking-wider animate-pulse">
        <span className="text-text-secondary">&lt;/</span>
        <span className="text-accent">Joseph</span>
        <span className="text-text-secondary">&gt;</span>
      </div>
    </div>
  );
};

export default LoadingScreen;