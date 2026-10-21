/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SoccerBallIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SoccerBallIcon: React.FC<SoccerBallIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size];

  return (
    <div
      className={`relative ${sizeClasses} shrink-0 flex items-center justify-center rounded-full bg-black shadow-md shadow-emerald-500/20 group cursor-pointer transition-transform duration-300 hover:rotate-12 ${className}`}
      title="Futebas - Futebol Ao Vivo"
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-sm pointer-events-none group-hover:bg-emerald-400/40 transition-colors" />

      {/* SVG Soccer Ball (Verde & Preta) */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial gradient for realistic spherical lighting */}
          <radialGradient id="ballShading" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1dfc8d" />
            <stop offset="45%" stopColor="#0aa355" />
            <stop offset="85%" stopColor="#04381c" />
            <stop offset="100%" stopColor="#011409" />
          </radialGradient>

          {/* Deep Black / Carbon gradient for patches */}
          <linearGradient id="blackPatch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e2420" />
            <stop offset="60%" stopColor="#0e120f" />
            <stop offset="100%" stopColor="#050806" />
          </linearGradient>

          {/* Neon green seam glow */}
          <linearGradient id="neonSeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff87" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Base Sphere */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#ballShading)"
          stroke="#00ff87"
          strokeWidth="3"
        />

        {/* Central Pentagon (Black) */}
        <polygon
          points="50,33 66,45 60,64 40,64 34,45"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Outer Black Patches connected to edges */}
        {/* Top patch */}
        <polygon
          points="50,4 62,14 50,33 38,14"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Top-Right patch */}
        <polygon
          points="90,26 95,42 78,48 66,45 74,27"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Bottom-Right patch */}
        <polygon
          points="84,78 69,89 60,64 78,65 89,68"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Bottom-Left patch */}
        <polygon
          points="16,78 31,89 40,64 22,65 11,68"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Top-Left patch */}
        <polygon
          points="10,26 5,42 22,48 34,45 26,27"
          fill="url(#blackPatch)"
          stroke="#00ff87"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Seams connecting outer patches */}
        <line x1="62" y1="14" x2="74" y2="27" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="38" y1="14" x2="26" y2="27" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="78" y1="48" x2="78" y2="65" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="22" y1="48" x2="22" y2="65" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="40" y1="64" x2="50" y2="78" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="60" y1="64" x2="50" y2="78" stroke="#00ff87" strokeWidth="2.2" />
        <line x1="50" y1="78" x2="50" y2="96" stroke="#00ff87" strokeWidth="2.2" />

        {/* Gloss highlight on top left */}
        <path
          d="M 22 18 C 30 10, 44 8, 56 10"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="28" cy="22" r="3" fill="#ffffff" opacity="0.6" />
      </svg>
    </div>
  );
};
