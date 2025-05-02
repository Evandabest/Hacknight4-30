'use client';

import { FC } from 'react';

interface StatusIndicatorProps {
  hasDelay: boolean;
  className?: string;
}

const StatusIndicator: FC<StatusIndicatorProps> = ({ hasDelay, className = '' }) => {
  return (
    <span 
      className={`inline-block w-3 h-3 rounded-full mr-1 ${className}`}
      style={{ 
        backgroundColor: hasDelay ? '#FF0000' : '#00CC00'
      }}
      aria-label={hasDelay ? 'Delayed' : 'Good service'}
    />
  );
};

export default StatusIndicator;