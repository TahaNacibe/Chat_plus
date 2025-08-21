import React from 'react';
import { CircleDashed, CircleDot } from 'lucide-react';

export const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center p-4 text-black">
      <CircleDashed className="w-6 h-6 text-blue-500 animate-spin text-black" />
    </div>
  );
};