'use client';

import { FC } from 'react';
import { subwayLinesData } from '@/utils/subway-data';

interface SubwayLinesProps {
  onSelectLine: (line: string) => void;
}

const SubwayLines: FC<SubwayLinesProps> = ({ onSelectLine }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      {subwayLinesData.map((line) => (
        <button
          key={line.id}
          onClick={() => onSelectLine(line.id)}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: line.color,
            color: line.textColor,
          }}
          aria-label={`Check status of ${line.id} train`}
        >
          {line.id}
        </button>
      ))}
    </div>
  );
};

export default SubwayLines;