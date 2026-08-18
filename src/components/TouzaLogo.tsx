import React from 'react';

interface TouzaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
  showFrame?: boolean;
  animated?: boolean;
}

export const TouzaLogo: React.FC<TouzaLogoProps> = ({
  className = 'w-24 h-36',
  variant = 'dark',
  showFrame = true,
  animated = false,
}) => {
  const colorClass =
    variant === 'light'
      ? 'text-white'
      : variant === 'gold'
      ? 'text-[#c5a059]'
      : 'text-[#121212]';

  return (
    <svg
      viewBox="0 0 240 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${colorClass} ${className} transition-all duration-300`}
      aria-label="TOUZA MEN'S WEAR"
    >
      {/* Outer Rectangular Frame */}
      {showFrame && (
        <rect
          x="12"
          y="12"
          width="216"
          height="356"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          rx="1"
          className={animated ? 'animate-[pulse_2.5s_ease-in-out_infinite]' : ''}
        />
      )}

      {/* Hanger Hook */}
      <path
        d="M 120 72 L 120 54 C 120 38, 136 36, 136 24 C 136 14, 120 14, 120 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Hanger Arch */}
      <path
        d="M 52 110 C 65 72, 175 72, 188 110 C 184 116, 174 116, 168 108 C 152 86, 88 86, 72 108 C 66 116, 56 116, 52 110 Z"
        fill="currentColor"
      />

      {/* Letter T Vertical Stem */}
      <rect x="115" y="88" width="10" height="26" fill="currentColor" />

      {/* Letter O */}
      <circle
        cx="120"
        cy="148"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="9.5"
      />

      {/* Letter U */}
      <path
        d="M 96 188 L 96 214 C 96 230, 144 230, 144 214 L 144 188"
        fill="none"
        stroke="currentColor"
        strokeWidth="9.5"
        strokeLinecap="square"
      />

      {/* Letter Z */}
      <path
        d="M 96 248 L 144 248 L 96 284 L 144 284"
        fill="none"
        stroke="currentColor"
        strokeWidth="9.5"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />

      {/* Letter A */}
      <path
        d="M 95 320 L 120 286 L 145 320"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="square"
      />

      {/* A's Inner Diamond */}
      <polygon points="120,306 128,315 120,324 112,315" fill="currentColor" />

      {/* MEN'S WEAR Bottom Typography */}
      <text
        x="120"
        y="350"
        textAnchor="middle"
        fill="currentColor"
        fontSize="13"
        fontWeight="800"
        letterSpacing="3.5"
        fontFamily="'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      >
        MEN'S WEAR
      </text>
    </svg>
  );
};
