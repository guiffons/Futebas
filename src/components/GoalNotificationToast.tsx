/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TeamCrest } from './TeamCrest.tsx';

export interface GoalAlert {
  id: string;
  player: string;
  minute: string;
  teamName: string;
  teamLogo?: string;
  score: string;
}

interface GoalNotificationToastProps {
  alert: GoalAlert | null;
  onDismiss: () => void;
}

export const GoalNotificationToast: React.FC<GoalNotificationToastProps> = ({
  alert,
  onDismiss,
}) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-xl border border-emerald-500/70 bg-black/95 p-3.5 shadow-2xl shadow-emerald-950/60 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-emerald-500/30"
    >
      <div className="flex items-start gap-3">
        {/* Team Crest with live pulse indicator */}
        <div className="relative">
          <TeamCrest
            name={alert.teamName}
            logoUrl={alert.teamLogo}
            size="sm"
          />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff87]"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00ff87] flex items-center gap-1 font-mono">
              GOL ({alert.minute})
            </span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Fechar notificação de gol"
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-sm font-bold text-white truncate">
            {alert.player}
          </p>
          <p className="text-xs text-slate-300">
            {alert.teamName} • Novo Placar: <span className="font-mono font-bold text-emerald-400">{alert.score}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Play an audible referee stadium whistle + victory chime
 */
export function playGoalChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 1. Referee Whistle (high dual-frequency beep)
    const playWhistle = (startTime: number, duration: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2600, ctx.currentTime + startTime);
      osc2.frequency.setValueAtTime(2850, ctx.currentTime + startTime);

      // Tremolo / modulation for authentic whistle vibration
      gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime + startTime);
      osc2.start(ctx.currentTime + startTime);
      osc1.stop(ctx.currentTime + startTime + duration);
      osc2.stop(ctx.currentTime + startTime + duration);
    };

    // 2. Chime sequence (G4 -> C5 -> E5 -> G5)
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Whistle burst 1 & 2
    playWhistle(0.0, 0.12);
    playWhistle(0.16, 0.28);

    // Goal fanfare notes
    playNote(523.25, 0.45, 0.22); // C5
    playNote(659.25, 0.65, 0.22); // E5
    playNote(783.99, 0.85, 0.25); // G5
    playNote(1046.5, 1.05, 0.45); // C6
  } catch (err) {
    console.warn('Audio playback not supported or user gesture needed:', err);
  }
}
