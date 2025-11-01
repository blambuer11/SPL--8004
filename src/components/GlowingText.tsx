import React from 'react';

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GlowingText = ({ children, className = "" }: GlowingTextProps) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="absolute blur-xl opacity-50 animate-pulse-slow">{children}</span>
      <span className="relative">{children}</span>
    </span>
  );
};