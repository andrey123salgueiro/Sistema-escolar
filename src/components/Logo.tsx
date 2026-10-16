import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  className = '',
}) => {
  // Dimensions
  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG */}
      <div className={`relative shrink-0 ${emblemSizes[size]} transition-transform duration-200`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="bookPage" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* Shield / Outer Badge */}
          <path
            d="M24 3L40 9V22C40 32.5 33.2 41.8 24 45C14.8 41.8 8 32.5 8 22V9L24 3Z"
            fill="url(#shieldGrad)"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Shield Rim */}
          <path
            d="M24 6.5L37 11.5V22C37 30.6 31.4 38.3 24 41C16.6 38.3 11 30.6 11 22V11.5L24 6.5Z"
            fill="#0F172A"
            opacity="0.6"
          />

          {/* Star / Torch Top Accent */}
          <polygon
            points="24,11 25.5,14.5 29,15 26.5,17.5 27.2,21 24,19.2 20.8,21 21.5,17.5 19,15 22.5,14.5"
            fill="url(#goldGrad)"
          />

          {/* Open Book Wings */}
          {/* Left Page */}
          <path
            d="M23.5 32C19.5 30 15 30.5 14 31V23C15 22.5 19.5 22 23.5 24V32Z"
            fill="url(#bookPage)"
            opacity="0.95"
          />
          {/* Right Page */}
          <path
            d="M24.5 32C28.5 30 33 30.5 34 31V23C33 22.5 28.5 22 24.5 24V32Z"
            fill="url(#bookPage)"
            opacity="0.95"
          />

          {/* Book Spine / Rib */}
          <path
            d="M24 23.5V33"
            stroke="url(#goldGrad)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Page Lines (Subtle Knowledge Texture) */}
          <line x1="16.5" y1="25.5" x2="21" y2="26.5" stroke="#94A3B8" strokeWidth="0.8" />
          <line x1="16.5" y1="28" x2="21" y2="29" stroke="#94A3B8" strokeWidth="0.8" />
          <line x1="27" y1="26.5" x2="31.5" y2="25.5" stroke="#94A3B8" strokeWidth="0.8" />
          <line x1="27" y1="29" x2="31.5" y2="28" stroke="#94A3B8" strokeWidth="0.8" />

          {/* Base Foundation Arc */}
          <path
            d="M17 37C21 38.2 27 38.2 31 37"
            stroke="url(#goldGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black uppercase tracking-wider font-sans ${titleSizes[size]} ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
            style={{ letterSpacing: '0.04em' }}
          >
            Pré-Conselho
          </span>
          <span
            className={`font-semibold uppercase tracking-widest text-[10px] px-1.5 py-0.5 rounded ${
              isLight
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-amber-100 text-amber-900 border border-amber-300/80 font-bold'
            }`}
          >
            Digital
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`font-medium tracking-wider uppercase mt-1 ${subtitleSizes[size]} ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Sistema Integrado de Gestão Pedagógica
          </span>
        )}
      </div>
    </div>
  );
};
