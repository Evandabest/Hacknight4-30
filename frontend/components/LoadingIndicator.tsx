'use client';

import { FC } from 'react';

interface LoadingIndicatorProps {
  className?: string;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center my-5 ${className}`}>
      <div className="flex space-x-2">
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;