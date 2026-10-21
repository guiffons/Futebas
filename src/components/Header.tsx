/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  RefreshCw,
  Settings,
  Code2,
  Volume2,
  VolumeX,
  Radio,
  Trophy,
} from 'lucide-react';
import { playGoalChime } from './GoalNotificationToast.tsx';
import { SoccerBallIcon } from './SoccerBallIcon.tsx';

interface HeaderProps {
  isPolling: boolean;
  secondsLeft: number;
  isLoading: boolean;
  onRefresh: () => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
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
  onRefresh,
  isSimulated,
  onToggleSimulated,
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6">
        {/* Brand FUTEBAS */}
        <div className="flex items-center gap-2.5">
          <SoccerBallIcon size="md" />
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-white sm:text-xl font-mono">
              FUTE<span className="text-[#00ff87]">BAS</span>
            </span>
            {liveMatchCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00ff87] border border-emerald-500/40 font-mono">
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

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botão Tabela do Torneio */}
          <button
            type="button"
            onClick={onOpenStandings}
            aria-label="Ver Tabela de Classificação"
            title="Ver Tabela do Brasileirão e Champions League"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 text-xs font-bold text-[#00ff87] transition-all font-mono shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">TABELA</span>
          </button>

          {/* Polling Timer */}
          {isPolling && (
            <div
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-400 border border-zinc-800"
              title="Sincronização automática a cada 30 segundos"
            >
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">{secondsLeft}s</span>
            </div>
          )}

          {/* Som & Teste */}
          <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar som de gols' : 'Ativar som de gols'}
              title={soundEnabled ? 'Som de gol ativado' : 'Som de gol mudo'}
              className={`p-1.5 rounded-md transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleTestSound}
              title="Testar som de gol (apito + sino)"
              className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors hidden sm:inline"
            >
              Som
            </button>
          </div>

          {/* Simulation Toggle */}
          <button
            type="button"
            onClick={onToggleSimulated}
            title={isSimulated ? 'Voltar para API Real ESPN' : 'Ativar modo com gols ao vivo para demonstração'}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border ${
              isSimulated
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span className="font-mono text-[11px]">{isSimulated ? 'DEMO' : 'DEMO'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Atualizar placares agora"
            title={
              lastUpdated
                ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR')}. Clique para atualizar agora.`
                : 'Atualizar placares agora'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50 font-mono"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#00ff87]' : ''}`} />
            <span className="hidden sm:inline">ATUALIZAR</span>
          </button>

          {/* Standalone HTML Button */}
          <button
            id="btn-header-standalone-html"
            data-testid="header-standalone-button"
            type="button"
            onClick={onOpenStandaloneHtml}
            aria-label="Ver e Baixar código index.html único"
            title="Ver / Copiar código index.html único"
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white transition-all font-mono"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">index.html</span>
          </button>

          {/* API Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Configurações de API"
            title="Configurar chave de API"
            className="rounded-lg bg-zinc-950 p-2 text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
