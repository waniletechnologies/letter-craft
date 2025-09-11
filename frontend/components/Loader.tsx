import React from 'react';

const sizeMap = {
  sm: 'w-1 h-1',
  md: 'w-4 h-4',
  lg: 'w-8 h-8',
};
const spacingMap = {
  sm: 'space-x-1',
  md: 'space-x-2',
  lg: 'space-x-4',
};

const Loader = ({ 
  size = 'md', 
  color = '#415FFF' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) => {
  const dotSize = sizeMap[size] || sizeMap.md;
  const spacing = spacingMap[size] || spacingMap.md;
  
  return (
    <div className="flex justify-center items-center h-screen w-full" role="status" aria-live="polite">
      <div className={`flex ${spacing}`} aria-label="Loading">
        <style>
          {`
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-20px);
              }
            }
            .bounce-dot-${color.replace('#', '')} {
              background-color: ${color};
              border-radius: 50%;
              animation: bounce 1.4s infinite ease-in-out both;
            }
            .bounce-dot-${color.replace('#', '')}:nth-child(1) {
              animation-delay: -0.32s;
            }
            .bounce-dot-${color.replace('#', '')}:nth-child(2) {
              animation-delay: -0.16s;
            }
          `}
        </style>
        <div className={`bounce-dot-${color.replace('#', '')} ${dotSize}`}></div>
        <div className={`bounce-dot-${color.replace('#', '')} ${dotSize}`}></div>
        <div className={`bounce-dot-${color.replace('#', '')} ${dotSize}`}></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;