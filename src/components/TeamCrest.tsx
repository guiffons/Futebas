/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getOfficialLogoUrl } from '../utils/teamBadges.ts';

interface TeamCrestProps {
  name: string;
  shortName?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ClubDesign {
  bg: string;
  border: string;
  textColor: string;
  accentColor?: string;
  initials: string;
  renderCustom?: () => React.ReactNode;
}

export const CLUB_DESIGNS: Record<string, ClubDesign> = {
  // BRASILEIRÃO SÉRIE A
  flamengo: {
    bg: '#ba0c14',
    border: '#111111',
    textColor: '#ffffff',
    accentColor: '#111111',
    initials: 'CRF',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C20 4 28 4 40 6 C40 24 30 38 24 44 C18 38 8 24 8 6 Z" fill="#b91c1c" stroke="#18181b" strokeWidth="2.5" />
        <path d="M8 14 H40 V20 H8 Z" fill="#18181b" />
        <path d="M8 26 H40 V32 H8 Z" fill="#18181b" />
        <polygon points="24,6 26,11 31,11 27,14 29,19 24,16 19,19 21,14 17,11 22,11" fill="#facc15" />
        <text x="24" y="27" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">CRF</text>
      </svg>
    ),
  },
  palmeiras: {
    bg: '#006437',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'SEP',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#006437" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" />
        <polygon points="24,10 25.5,13 29,13 26,15.5 27,19 24,17 21,19 22,15.5 19,13 22.5,13" fill="#ffffff" />
        <text x="24" y="30" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="monospace">SEP</text>
      </svg>
    ),
  },
  'são paulo': {
    bg: '#ffffff',
    border: '#b91c1c',
    textColor: '#18181b',
    initials: 'SPFC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M6 8 H42 V16 L24 42 L6 16 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
        <polygon points="6,16 24,42 24,16" fill="#b91c1c" />
        <polygon points="24,16 24,42 42,16" fill="#18181b" />
        <rect x="6" y="8" width="36" height="8" fill="#ffffff" />
        <text x="24" y="15" fill="#18181b" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SPFC</text>
      </svg>
    ),
  },
  corinthians: {
    bg: '#18181b',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'SCCP',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="20" fill="#18181b" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="15" fill="#ffffff" stroke="#b91c1c" strokeWidth="1.5" />
        <line x1="14" y1="14" x2="34" y2="34" stroke="#b91c1c" strokeWidth="2" />
        <line x1="34" y1="14" x2="14" y2="34" stroke="#b91c1c" strokeWidth="2" />
        <circle cx="24" cy="24" r="10" fill="#18181b" />
        <text x="24" y="27" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">SCCP</text>
      </svg>
    ),
  },
  'atlético-mg': {
    bg: '#18181b',
    border: '#f59e0b',
    textColor: '#ffffff',
    initials: 'CAM',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 8 C16 6 32 6 40 8 C40 26 30 38 24 44 C18 38 8 26 8 8 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
        <path d="M14 7 V40" stroke="#18181b" strokeWidth="4" />
        <path d="M24 6 V44" stroke="#18181b" strokeWidth="4" />
        <path d="M34 7 V40" stroke="#18181b" strokeWidth="4" />
        <polygon points="24,6 25.5,9.5 29,9.5 26.5,11.5 27.5,15 24,13 20.5,15 21.5,11.5 19,9.5 22.5,9.5" fill="#f59e0b" />
        <circle cx="24" cy="26" r="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
        <text x="24" y="29" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">CAM</text>
      </svg>
    ),
  },
  grêmio: {
    bg: '#0d80bf',
    border: '#18181b',
    textColor: '#ffffff',
    initials: 'GRE',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#0d80bf" stroke="#18181b" strokeWidth="2.5" />
        <path d="M4 20 H44 V28 H4 Z" fill="#18181b" stroke="#ffffff" strokeWidth="1" />
        <text x="24" y="26" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">GREMIO</text>
        <text x="24" y="38" fill="#ffffff" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="monospace">1903</text>
      </svg>
    ),
  },
  botafogo: {
    bg: '#000000',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'BFR',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#000000" stroke="#ffffff" strokeWidth="3" />
        <polygon points="24,12 27.5,21 37,21 29.5,27 32.5,36 24,30.5 15.5,36 18.5,27 11,21 20.5,21" fill="#ffffff" />
      </svg>
    ),
  },
  cruzeiro: {
    bg: '#003399',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'CRU',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#003399" stroke="#ffffff" strokeWidth="2.5" />
        <polygon points="24,10 25,12 27,12 25.5,13.5 26,15.5 24,14 22,15.5 22.5,13.5 21,12 23,12" fill="#ffffff" />
        <polygon points="24,32 25,34 27,34 25.5,35.5 26,37.5 24,36 22,37.5 22.5,35.5 21,34 23,34" fill="#ffffff" />
        <polygon points="14,22 15,24 17,24 15.5,25.5 16,27.5 14,26 12,27.5 12.5,25.5 11,24 13,24" fill="#ffffff" />
        <polygon points="34,22 35,24 37,24 35.5,25.5 36,27.5 34,26 32,27.5 32.5,25.5 31,24 33,24" fill="#ffffff" />
        <polygon points="28,26 28.5,27 30,27 29,28 29.5,29.5 28,28.5 26.5,29.5 27,28 26,27 27.5,27" fill="#ffffff" />
      </svg>
    ),
  },
  fluminense: {
    bg: '#831d1d',
    border: '#006437',
    textColor: '#ffffff',
    initials: 'FFC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#831d1d" stroke="#006437" strokeWidth="2.5" />
        <path d="M18 6 C18 20 20 30 24 43" stroke="#ffffff" strokeWidth="2" fill="none" />
        <path d="M30 6 C30 20 28 30 24 43" stroke="#ffffff" strokeWidth="2" fill="none" />
        <text x="24" y="27" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="serif">FFC</text>
      </svg>
    ),
  },
  vasco: {
    bg: '#000000',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'CRVG',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#000000" stroke="#ffffff" strokeWidth="2.5" />
        <polygon points="38,6 40,8 10,42 8,40" fill="#ffffff" />
        <polygon points="24,17 26,21 31,19 29,24 33,26 29,28 31,33 26,31 24,35 22,31 17,33 19,28 15,26 19,24 17,19 22,21" fill="#dc2626" />
      </svg>
    ),
  },
  internacional: {
    bg: '#dc2626',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'SCI',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <text x="24" y="28" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SCI</text>
      </svg>
    ),
  },
  santos: {
    bg: '#ffffff',
    border: '#18181b',
    textColor: '#18181b',
    initials: 'SFC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
        <path d="M14 6 V41 M24 6 V44 M34 6 V41" stroke="#18181b" strokeWidth="3" />
        <polygon points="24,6 25,9 28,9 25.5,11 26.5,14 24,12 21.5,14 22.5,11 20,9 23,9" fill="#facc15" />
        <circle cx="24" cy="26" r="8" fill="#ffffff" stroke="#18181b" strokeWidth="1" />
        <text x="24" y="29" fill="#18181b" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">SFC</text>
      </svg>
    ),
  },
  bahia: {
    bg: '#0047ab',
    border: '#dc2626',
    textColor: '#ffffff',
    initials: 'ECB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#0047ab" stroke="#dc2626" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="15" fill="#ffffff" stroke="#0047ab" strokeWidth="1.5" />
        <rect x="15" y="16" width="18" height="12" fill="#0047ab" />
        <polygon points="15,16 24,22 15,28" fill="#dc2626" />
        <text x="24" y="36" fill="#0047ab" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">ECB</text>
      </svg>
    ),
  },
  fortaleza: {
    bg: '#003399',
    border: '#dc2626',
    textColor: '#ffffff',
    initials: 'FEC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#003399" stroke="#dc2626" strokeWidth="2.5" />
        <path d="M8 18 H40 V28 H8 Z" fill="#ffffff" />
        <path d="M8 28 H40 V38 H8 Z" fill="#dc2626" />
        <text x="24" y="25" fill="#003399" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">FEC</text>
      </svg>
    ),
  },
  'athletico-pr': {
    bg: '#dc2626',
    border: '#000000',
    textColor: '#ffffff',
    initials: 'CAP',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#dc2626" stroke="#000000" strokeWidth="2.5" />
        <line x1="12" y1="36" x2="36" y2="12" stroke="#000000" strokeWidth="4" />
        <line x1="18" y1="40" x2="38" y2="20" stroke="#ffffff" strokeWidth="3" />
        <text x="24" y="20" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">CAP</text>
      </svg>
    ),
  },
  vitória: {
    bg: '#b91c1c',
    border: '#000000',
    textColor: '#ffffff',
    initials: 'ECV',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#b91c1c" stroke="#000000" strokeWidth="2.5" />
        <path d="M8 14 H40 V20 H8 Z" fill="#000000" />
        <path d="M8 26 H40 V32 H8 Z" fill="#000000" />
        <text x="24" y="26" fill="#facc15" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">ECV</text>
      </svg>
    ),
  },
  juventude: {
    bg: '#006437',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'ECJ',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#006437" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M14 6 V42 M24 6 V42 M34 6 V42" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="10" fill="#006437" stroke="#ffffff" strokeWidth="1.5" />
        <text x="24" y="27" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">ECJ</text>
      </svg>
    ),
  },
  criciúma: {
    bg: '#facc15',
    border: '#000000',
    textColor: '#000000',
    initials: 'CRI',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#facc15" stroke="#000000" strokeWidth="2.5" />
        <path d="M8 16 H40 V26 H8 Z" fill="#000000" />
        <path d="M8 26 H40 V36 H8 Z" fill="#ffffff" />
        <text x="24" y="23" fill="#facc15" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">CEC</text>
      </svg>
    ),
  },
  bragantino: {
    bg: '#ffffff',
    border: '#dc2626',
    textColor: '#18181b',
    initials: 'RBB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#ffffff" stroke="#dc2626" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="14" fill="#facc15" stroke="#dc2626" strokeWidth="1.5" />
        <polygon points="17,20 22,24 17,28" fill="#dc2626" />
        <polygon points="31,20 26,24 31,28" fill="#dc2626" />
        <text x="24" y="27" fill="#18181b" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">RBB</text>
      </svg>
    ),
  },
  cuiabá: {
    bg: '#006437',
    border: '#facc15',
    textColor: '#ffffff',
    initials: 'CUI',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#006437" stroke="#facc15" strokeWidth="2.5" />
        <rect x="8" y="16" width="32" height="12" fill="#facc15" />
        <text x="24" y="25" fill="#006437" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CUIABÁ</text>
      </svg>
    ),
  },
  'atlético-go': {
    bg: '#000000',
    border: '#dc2626',
    textColor: '#ffffff',
    initials: 'ACG',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#000000" stroke="#dc2626" strokeWidth="2.5" />
        <line x1="8" y1="20" x2="40" y2="20" stroke="#dc2626" strokeWidth="3" />
        <line x1="8" y1="28" x2="40" y2="28" stroke="#ffffff" strokeWidth="3" />
        <text x="24" y="26" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">ACG</text>
      </svg>
    ),
  },

  // CHAMPIONS LEAGUE
  'real madrid': {
    bg: '#ffffff',
    border: '#f59e0b',
    textColor: '#1e3a8a',
    initials: 'RMA',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M14 13 L17 7 L24 11 L31 7 L34 13 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <circle cx="24" cy="28" r="15" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
        <line x1="13" y1="18" x2="35" y2="38" stroke="#6366f1" strokeWidth="4" />
        <text x="24" y="32" fill="#1e3a8a" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">RMA</text>
      </svg>
    ),
  },
  'manchester city': {
    bg: '#6cabdd',
    border: '#1c2c5b',
    textColor: '#ffffff',
    initials: 'MCI',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#6cabdd" stroke="#1c2c5b" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="16" fill="#ffffff" stroke="#1c2c5b" strokeWidth="1.5" />
        <path d="M18 20 C22 24 26 24 30 20 L28 24 H20 Z" fill="#f59e0b" />
        <text x="24" y="33" fill="#1c2c5b" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">MCI</text>
      </svg>
    ),
  },
  barcelona: {
    bg: '#a50044',
    border: '#004d98',
    textColor: '#edbb00',
    initials: 'FCB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 8 C16 4 32 4 40 8 C40 28 30 40 24 44 C18 40 8 28 8 8 Z" fill="#a50044" stroke="#edbb00" strokeWidth="2" />
        <path d="M14 20 V42" stroke="#004d98" strokeWidth="4" />
        <path d="M22 20 V44" stroke="#004d98" strokeWidth="4" />
        <path d="M30 20 V43" stroke="#004d98" strokeWidth="4" />
        <rect x="8" y="8" width="32" height="12" fill="#ffffff" />
        <line x1="16" y1="8" x2="16" y2="20" stroke="#dc2626" strokeWidth="2.5" />
        <line x1="8" y1="14" x2="24" y2="14" stroke="#dc2626" strokeWidth="2.5" />
        <rect x="24" y="8" width="16" height="12" fill="#facc15" />
        <line x1="28" y1="8" x2="28" y2="20" stroke="#dc2626" strokeWidth="2" />
        <line x1="33" y1="8" x2="33" y2="20" stroke="#dc2626" strokeWidth="2" />
        <text x="24" y="27" fill="#facc15" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FCB</text>
      </svg>
    ),
  },
  'bayern münchen': {
    bg: '#dc052d',
    border: '#0066b2',
    textColor: '#ffffff',
    initials: 'FCB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#dc052d" stroke="#0066b2" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="14" fill="#0066b2" stroke="#ffffff" strokeWidth="1.5" />
        <path d="M16 16 L32 32 M32 16 L16 32" stroke="#ffffff" strokeWidth="2" />
        <text x="24" y="27" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FCB</text>
      </svg>
    ),
  },
  arsenal: {
    bg: '#db0007',
    border: '#023474',
    textColor: '#ffffff',
    initials: 'ARS',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#db0007" stroke="#023474" strokeWidth="2.5" />
        <rect x="14" y="22" width="16" height="5" rx="1.5" fill="#f59e0b" />
        <circle cx="22" cy="29" r="4.5" fill="#f59e0b" stroke="#023474" strokeWidth="1" />
        <text x="24" y="16" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">ARSENAL</text>
      </svg>
    ),
  },
  'ac milan': {
    bg: '#fb090b',
    border: '#000000',
    textColor: '#ffffff',
    initials: 'ACM',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <ellipse cx="24" cy="24" rx="18" ry="22" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="6" y="10" width="18" height="28" fill="#fb090b" />
        <rect x="10" y="10" width="5" height="28" fill="#000000" />
        <rect x="18" y="10" width="5" height="28" fill="#000000" />
        <rect x="24" y="10" width="18" height="28" fill="#ffffff" />
        <line x1="33" y1="10" x2="33" y2="38" stroke="#fb090b" strokeWidth="3" />
        <line x1="24" y1="24" x2="42" y2="24" stroke="#fb090b" strokeWidth="3" />
        <text x="24" y="12" fill="#000000" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">ACM</text>
      </svg>
    ),
  },
  liverpool: {
    bg: '#c8102e',
    border: '#f6eb61',
    textColor: '#ffffff',
    initials: 'LFC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 8 C16 6 32 6 40 8 C40 26 30 38 24 44 C18 38 8 26 8 8 Z" fill="#c8102e" stroke="#00b2a9" strokeWidth="2" />
        <polygon points="24,14 26,19 31,19 27,22 29,27 24,24 19,27 21,22 17,19 22,19" fill="#f6eb61" />
        <text x="24" y="34" fill="#f6eb61" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="serif">LFC</text>
      </svg>
    ),
  },
  'paris saint-germain': {
    bg: '#004170',
    border: '#da291c',
    textColor: '#ffffff',
    initials: 'PSG',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#004170" stroke="#da291c" strokeWidth="2.5" />
        <polygon points="24,10 22,28 26,28" fill="#da291c" />
        <line x1="20" y1="28" x2="28" y2="28" stroke="#ffffff" strokeWidth="2" />
        <text x="24" y="37" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">PSG</text>
      </svg>
    ),
  },
  juventus: {
    bg: '#000000',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'JUVE',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#000000" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M17 12 V30 C17 34 20 36 23 36 C26 36 29 34 29 30 V12" stroke="#ffffff" strokeWidth="4" fill="none" />
        <text x="24" y="10" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">JUVE</text>
      </svg>
    ),
  },
  inter: {
    bg: '#010e80',
    border: '#f59e0b',
    textColor: '#ffffff',
    initials: 'INT',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#010e80" stroke="#000000" strokeWidth="3" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="24" y="28" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">IM</text>
      </svg>
    ),
  },
  'borussia dortmund': {
    bg: '#fde100',
    border: '#000000',
    textColor: '#000000',
    initials: 'BVB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#fde100" stroke="#000000" strokeWidth="3" />
        <text x="24" y="27" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">BVB</text>
        <text x="24" y="36" fill="#000000" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">09</text>
      </svg>
    ),
  },
  chelsea: {
    bg: '#034694',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'CFC',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#034694" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="24" y="28" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">CFC</text>
      </svg>
    ),
  },
  'sporting cp': {
    bg: '#006437',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'SCP',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z" fill="#006437" stroke="#f59e0b" strokeWidth="2.5" />
        <line x1="8" y1="16" x2="40" y2="16" stroke="#ffffff" strokeWidth="3" />
        <line x1="8" y1="26" x2="40" y2="26" stroke="#ffffff" strokeWidth="3" />
        <polygon points="24,18 27,24 21,24" fill="#f59e0b" />
        <text x="24" y="36" fill="#f59e0b" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SCP</text>
      </svg>
    ),
  },
  benfica: {
    bg: '#dc2626',
    border: '#ffffff',
    textColor: '#ffffff',
    initials: 'SLB',
    renderCustom: () => (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="21" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
        <polygon points="16,10 24,14 32,10 28,18 20,18" fill="#f59e0b" />
        <path d="M12 24 H36" stroke="#006437" strokeWidth="3" />
        <text x="24" y="34" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SLB</text>
      </svg>
    ),
  },
};

export const TeamCrest: React.FC<TeamCrestProps> = ({
  name,
  shortName,
  logoUrl,
  className = '',
  size = 'md',
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cleanName = (name || '').toLowerCase().trim();
  const matchedKey = Object.keys(CLUB_DESIGNS).find(
    (k) => cleanName === k || cleanName.includes(k) || k.includes(cleanName)
  );
  const clubDesign = matchedKey ? CLUB_DESIGNS[matchedKey] : null;

  const initials =
    shortName?.slice(0, 3).toUpperCase() ||
    cleanName.slice(0, 3).toUpperCase() ||
    'FC';

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-14 w-14 sm:h-16 sm:w-16',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
  }[size];

  // Resolve official URL
  const resolvedUrl =
    logoUrl && !logoUrl.includes('default-team-logo')
      ? logoUrl
      : getOfficialLogoUrl(name) || logoUrl;

  // Whenever resolvedUrl or name changes, reset states and load image
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    if (resolvedUrl && !resolvedUrl.includes('default-team-logo')) {
      setImgSrc(resolvedUrl);
    } else {
      setImgSrc(null);
    }
  }, [resolvedUrl, name]);

  const handleImageError = () => {
    // If direct image URL failed and it wasn't already proxied, try our server image-proxy
    if (imgSrc && !imgSrc.startsWith('/api/image-proxy') && imgSrc.startsWith('http')) {
      setImgSrc(`/api/image-proxy?url=${encodeURIComponent(imgSrc)}`);
    } else {
      // Both direct and proxy failed -> switch to vector fallback
      setHasError(true);
      setIsLoaded(false);
    }
  };

  const shouldShowImage = imgSrc && !hasError;

  return (
    <div
      className={`relative ${sizeClasses} rounded-xl bg-zinc-900/95 p-1.5 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner group overflow-hidden ${className}`}
    >
      {/* Subtle radial stadium backlight */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      {shouldShowImage ? (
        <>
          <img
            src={imgSrc}
            alt={name}
            referrerPolicy="no-referrer"
            decoding="async"
            className="max-h-full max-w-full object-contain transition-all duration-150 drop-shadow-md z-10"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
          />
          {/* While image loads, show crisp vector shield behind it */}
          {!isLoaded && (
            <div className="absolute inset-0 p-1 flex items-center justify-center z-0">
              {clubDesign?.renderCustom ? (
                clubDesign.renderCustom()
              ) : (
                <GenericShield initials={initials} />
              )}
            </div>
          )}
        </>
      ) : clubDesign?.renderCustom ? (
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          {clubDesign.renderCustom()}
        </div>
      ) : (
        <GenericShield initials={initials} />
      )}
    </div>
  );
};

const GenericShield: React.FC<{ initials: string }> = ({ initials }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <defs>
      <linearGradient id={`grad_${initials}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#18221d" />
        <stop offset="100%" stopColor="#0a0f0d" />
      </linearGradient>
    </defs>
    <path
      d="M8 6 C16 4 32 4 40 6 C40 26 30 38 24 44 C18 38 8 26 8 6 Z"
      fill={`url(#grad_${initials})`}
      stroke="#10b981"
      strokeWidth="2"
    />
    <circle cx="24" cy="20" r="10" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />
    <text
      x="24"
      y="24"
      fill="#00ff87"
      fontSize="9"
      fontWeight="900"
      textAnchor="middle"
      fontFamily="monospace"
      letterSpacing="0.5"
    >
      {initials}
    </text>
  </svg>
);
