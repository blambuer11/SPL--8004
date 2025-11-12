import React from 'react';

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBorder = ({ children, className = "" }: GradientBorderProps) => {
  return (
    <div className={`p-[1px] rounded-xl bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50 ${className}`}>
      <div className="bg-[#0B101B] rounded-xl h-full">
        {children}
      </div>
    </div>
  );
};