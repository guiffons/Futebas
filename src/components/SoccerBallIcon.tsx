/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SoccerBallIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SoccerBallIcon: React.FC<SoccerBallIconProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${dimensions[size]} ${className}`}
      title="Futebas"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(0,255,135,0.25)]"
      >
        {/* Ball Base Sphere - Deep Black */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#060907"
          stroke="#00ff87"
          strokeWidth="3.5"
        />

        {/* Central Pentagon - Minimalist Matte Carbon */}
        <polygon
          points="50,33 66,45 60,63 40,63 34,45"
          fill="#111814"
          stroke="#00ff87"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Radiating Seams to Outer Facets */}
        <line x1="50" y1="33" x2="50" y2="10" stroke="#00ff87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="66" y1="45" x2="88" y2="35" stroke="#00ff87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="63" x2="78" y2="84" stroke="#00ff87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="63" x2="22" y2="84" stroke="#00ff87" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="34" y1="45" x2="12" y2="35" stroke="#00ff87" strokeWidth="2.5" strokeLinecap="round" />

        {/* Subtle Outer Edge Pentagon Edges */}
        <path
          d="M32 15 L50 10 L68 15"
          stroke="#00ff87"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 24 L88 35 L93 52"
          stroke="#00ff87"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 73 L78 84 L65 91"
          stroke="#00ff87"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M35 91 L22 84 L15 73"
          stroke="#00ff87"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 52 L12 35 L15 24"
          stroke="#00ff87"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center Glowing Accent Dot */}
        <circle
          cx="50"
          cy="49"
          r="3"
          fill="#00ff87"
        />
      </svg>
    </div>
  );
};
