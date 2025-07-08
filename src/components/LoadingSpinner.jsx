import React from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 flex items-center justify-center">
        <svg className="animate-spin" width="64" height="64" viewBox="0 0 64 64">
          <path
            d="M32 8
              a24 24 0 0 1 0 48"
            fill="none"
            stroke="#22c55e"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default LoadingSpinner; 