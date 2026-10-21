/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Settings,
  Code2,
  Volume2,
  VolumeX,
  Trophy,
} from 'lucide-react';
import { playGoalChime } from './GoalNotificationToast.tsx';
import { SportsShieldLogo } from './SportsShieldLogo.tsx';

interface HeaderProps {
  isPolling: boolean;
  secondsLeft: number;
  isLoading: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenStandaloneHtml: () => void;
  onOpenStandings: () => void;
  liveMatchCount: number;
  lastUpdated?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  isPolling,
  secondsLeft,
  isLoading,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenStandaloneHtml,
  onOpenStandings,
  liveMatchCount,
  lastUpdated,
}) => {
  const handleTestSound = () => {
    playGoalChime();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand FUTEBAS with Minimalist Soccer Ball Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <SportsShieldLogo size="md" />
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
              FUTE<span className="text-[#00ff87]">BAS</span>
            </span>
            {liveMatchCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#00ff87] border border-emerald-500/40 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-ping" />
                {liveMatchCount} AO VIVO
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-800 font-mono">
                Tempo Real
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Clean, Non-crowded */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botão Tabela do Torneio */}
          <button
            type="button"
            onClick={onOpenStandings}
            aria-label="Ver Tabela de Classificação"
            title="Ver Tabela do Brasileirão e Champions League"
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-zinc-200 transition-all font-mono shadow-sm cursor-pointer hover:border-emerald-500/50"
          >
            <Trophy className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden xs:inline">TABELA</span>
          </button>

          {/* Som & Teste */}
          <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 p-0.5">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar som de gols' : 'Ativar som de gols'}
              title={soundEnabled ? 'Som de gol ativado' : 'Som de gol mudo'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-[#00ff87]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleTestSound}
              title="Testar som de gol"
              className="px-2 py-1 text-[10px] font-medium text-zinc-400 hover:text-white transition-colors hidden sm:inline cursor-pointer font-mono"
            >
              Som
            </button>
          </div>

          {/* Standalone HTML Button */}
          <button
            id="btn-header-standalone-html"
            data-testid="header-standalone-button"
            type="button"
            onClick={onOpenStandaloneHtml}
            aria-label="Ver e Baixar código index.html único"
            title="Ver e Baixar arquivo index.html único"
            className="hidden md:inline-flex items-center gap-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-zinc-300 transition-all font-mono cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>.html</span>
          </button>

          {/* API Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Configurações de API"
            title="Configurar chave de API"
            className="rounded-xl bg-zinc-950 p-2 text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
