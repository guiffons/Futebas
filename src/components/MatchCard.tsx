/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Star,
  Film,
  Radio,
  Bell,
  BellRing,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  MatchData,
  formatMatchKickoff,
} from '../utils/soccer.ts';
import { TeamCrest } from './TeamCrest.tsx';
import { VideoHighlightsModal } from './VideoHighlightsModal.tsx';
import { MatchCenterModal } from './MatchCenterModal.tsx';
import { SUPPORTED_LEAGUES } from '../services/soccerApi.ts';

interface MatchCardProps {
  match: MatchData;
  isFavorite: boolean;
  onToggleFavorite: (matchId: string) => void;
  isNotified: boolean;
  onToggleNotification: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isFavorite,
  onToggleFavorite,
  isNotified,
  onToggleNotification,
}) => {
  const [isCenterOpen, setIsCenterOpen] = useState<boolean>(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState<boolean>(false);

  const [showAllGoals, setShowAllGoals] = useState<boolean>(false);

  const isLive = match.status.state === 'live';
  const isFinished = match.status.state === 'finished';
  const isScheduled = match.status.state === 'scheduled';

  const homeGoals = match.goals.filter(
    (g) => g.teamId === match.homeTeam.id || g.teamName.toLowerCase().includes(match.homeTeam.name.toLowerCase())
  );
  const awayGoals = match.goals.filter(
    (g) => g.teamId === match.awayTeam.id || g.teamName.toLowerCase().includes(match.awayTeam.name.toLowerCase())
  );

  const kickoffTime = formatMatchKickoff(
    match.status.startTime,
    match.status.state,
    match.status.displayClock
  );

  const leagueBadge =
    SUPPORTED_LEAGUES[match.leagueId]?.shortCode ||
    match.leagueId.toUpperCase().slice(0, 5);

  return (
    <>
      <article
        className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
          isLive
            ? 'border-emerald-500/60 bg-[#070b09] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
            : 'border-zinc-800/90 bg-[#090d0b] hover:border-zinc-700'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2 text-xs bg-black/70">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#00ff87] bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
              {leagueBadge}
            </span>
            <span className="font-semibold text-zinc-300 truncate text-[11px] sm:text-xs">
              {match.leagueName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status / Clock */}
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00ff87] border border-emerald-500/50 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-ping" />
                AO VIVO {match.status.displayClock}
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-800 font-mono">
                ENCERRADO
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/30 font-mono">
                {kickoffTime}
              </span>
            )}

            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => onToggleNotification(match.id)}
              aria-label={isNotified ? 'Desativar notificação deste jogo' : 'Ativar notificação deste jogo'}
              title={isNotified ? 'Notificações de gol ativadas para este jogo' : 'Receber notificação quando sair gol neste jogo'}
              className={`p-1 rounded-md transition-colors ${
                isNotified
                  ? 'text-[#00ff87] bg-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {isNotified ? (
                <BellRing className="h-3.5 w-3.5 text-[#00ff87] animate-pulse" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(match.id)}
              aria-label={isFavorite ? 'Remover favorito' : 'Favoritar jogo'}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="p-1 rounded-md text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite
                    ? 'fill-[#00ff87] text-[#00ff87]'
                    : 'text-zinc-600 hover:text-[#00ff87]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Main Scoreboard Section */}
        <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 my-auto">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
              <TeamCrest
                name={match.homeTeam.name}
                shortName={match.homeTeam.shortName}
                logoUrl={match.homeTeam.logo}
                size="md"
              />
              <p className="font-bold text-xs sm:text-sm text-zinc-100 leading-tight truncate w-full px-1">
                {match.homeTeam.name}
              </p>
            </div>

            {/* Central Score / Kickoff Time */}
            <div className="flex flex-col items-center justify-center px-2">
              {!isScheduled && match.homeTeam.score !== null && match.awayTeam.score !== null ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isLive ? 'text-[#00ff87]' : 'text-zinc-100'
                      }`}
                    >
                      {match.homeTeam.score}
                    </span>
                    <span className="text-lg font-bold text-emerald-500">:</span>
                    <span
                      className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isLive ? 'text-[#00ff87]' : 'text-zinc-100'
                      }`}
                    >
                      {match.awayTeam.score}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 font-semibold">
                    {isLive ? match.status.displayClock : 'Final'}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    {kickoffTime}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-1">
                    Horário de Brasília
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
              <TeamCrest
                name={match.awayTeam.name}
                shortName={match.awayTeam.shortName}
                logoUrl={match.awayTeam.logo}
                size="md"
              />
              <p className="font-bold text-xs sm:text-sm text-zinc-100 leading-tight truncate w-full px-1">
                {match.awayTeam.name}
              </p>
            </div>
          </div>

          {/* Autores dos Gols (Interativo com botão para ver todos) */}
          {match.goals.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  {(showAllGoals ? homeGoals : homeGoals.slice(0, 2)).map((g) => (
                    <div key={g.id} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                      <span className="text-[8px] font-bold text-[#00ff87] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/40 shrink-0">GOL</span>
                      <span className="truncate">{g.player}</span>
                      <span className="text-emerald-400 font-bold ml-auto shrink-0">{g.minute}</span>
                    </div>
                  ))}
                  {!showAllGoals && homeGoals.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllGoals(true);
                      }}
                      className="text-[9px] text-[#00ff87] hover:underline font-bold cursor-pointer text-left block"
                    >
                      +{homeGoals.length - 2} gols (ver quem fez)
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {(showAllGoals ? awayGoals : awayGoals.slice(0, 2)).map((g) => (
                    <div key={g.id} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                      <span className="text-[8px] font-bold text-[#00ff87] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/40 shrink-0">GOL</span>
                      <span className="truncate">{g.player}</span>
                      <span className="text-emerald-400 font-bold ml-auto shrink-0">{g.minute}</span>
                    </div>
                  ))}
                  {!showAllGoals && awayGoals.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllGoals(true);
                      }}
                      className="text-[9px] text-[#00ff87] hover:underline font-bold cursor-pointer text-left block"
                    >
                      +{awayGoals.length - 2} gols (ver quem fez)
                    </button>
                  )}
                </div>
              </div>

              {/* Botão Interativo Dedicado para Expandir/Recolher quando houver gols */}
              {(match.goals.length > 2 || homeGoals.length > 2 || awayGoals.length > 2) && (
                <div className="mt-1.5 pt-1 border-t border-zinc-900/90 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllGoals(!showAllGoals);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-[#00ff87] transition-colors cursor-pointer"
                  >
                    <span>{showAllGoals ? '▲ Recolher autores dos gols' : `▼ Ver todos os autores dos gols (${match.goals.length})`}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SINGLE ACTION BUTTON ROW: Clean, non-polluted, perfectly balanced */}
          <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            {/* Highlights Button */}
            <button
              type="button"
              onClick={() => setIsHighlightsOpen(true)}
              title="Ver vídeos de melhores momentos e gols"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-rose-300 transition-all font-mono"
            >
              <Film className="h-3.5 w-3.5 text-rose-400" />
              <span>VÍDEOS</span>
            </button>

            {/* Main Action Button (ACOMPANHAR AO VIVO / DETALHES DO JOGO) */}
            <button
              type="button"
              onClick={() => setIsCenterOpen(true)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all font-mono shadow-sm ${
                isLive
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-950/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              {isLive ? (
                <>
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  <span>ACOMPANHAR AO VIVO</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>VER DETALHES</span>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Full Match Center Modal (Radar Tático, Assistir na Tela, Minuto a Minuto, Stats, Escalação) */}
      <MatchCenterModal
        isOpen={isCenterOpen}
        onClose={() => setIsCenterOpen(false)}
        match={match}
        isNotified={isNotified}
        onToggleNotification={onToggleNotification}
        onOpenVideos={() => setIsHighlightsOpen(true)}
      />

      {/* Video Highlights Modal */}
      <VideoHighlightsModal
        isOpen={isHighlightsOpen}
        onClose={() => setIsHighlightsOpen(false)}
        match={match}
      />
    </>
  );
};
