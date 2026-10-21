/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  Star,
  BarChart2,
  Users,
  ArrowLeftRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Play,
  Film,
  LayoutGrid,
} from 'lucide-react';
import { MatchData, deriveMatchLineups } from '../utils/soccer.ts';
import { MatchStatsView } from './MatchStats.tsx';
import { TeamCrest } from './TeamCrest.tsx';
import { TacticalPitch } from './TacticalPitch.tsx';
import { VideoHighlightsModal } from './VideoHighlightsModal.tsx';

interface MatchCardProps {
  match: MatchData;
  isFavorite: boolean;
  onToggleFavorite: (matchId: string) => void;
}

type DetailTab = 'stats' | 'lineups' | 'subs' | 'events' | null;

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isFavorite,
  onToggleFavorite,
}) => {
  // If match has stats, show by default for live matches or null
  const [activeTab, setActiveTab] = useState<DetailTab>(
    match.status.state === 'live' ? 'stats' : null
  );
  const [lineupViewMode, setLineupViewMode] = useState<'pitch' | 'list'>('pitch');
  const [showBench, setShowBench] = useState<boolean>(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState<boolean>(false);

  const isLive = match.status.state === 'live';
  const isFinished = match.status.state === 'finished';
  const isScheduled = match.status.state === 'scheduled';

  const homeGoals = match.goals.filter(
    (g) => g.teamId === match.homeTeam.id || g.teamName.toLowerCase().includes(match.homeTeam.name.toLowerCase())
  );
  const awayGoals = match.goals.filter(
    (g) => g.teamId === match.awayTeam.id || g.teamName.toLowerCase().includes(match.awayTeam.name.toLowerCase())
  );

  const lineups =
    match.lineups ||
    deriveMatchLineups(
      match.id,
      match.homeTeam.name,
      match.awayTeam.name,
      match.status.state
    );

  const toggleTab = (tab: DetailTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <>
      <article
        className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
          isLive
            ? 'border-emerald-500/60 bg-[#070b09] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
            : 'border-zinc-800/90 bg-[#090d0b] hover:border-zinc-700'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2 text-xs bg-black/70">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#00ff87] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
              {match.leagueId === 'champions' ? 'UCL' : 'BRA-1'}
            </span>
            <span className="font-semibold text-zinc-300 truncate text-[11px] sm:text-xs">
              {match.leagueName}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Badge */}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00ff87] border border-emerald-500/50 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-ping" />
                AO VIVO {match.status.displayClock}
              </span>
            )}

            {isFinished && (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-800 font-mono">
                ENCERRADO
              </span>
            )}

            {isScheduled && (
              <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/30 font-mono">
                {match.status.displayClock || 'AGENDADO'}
              </span>
            )}

            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(match.id)}
              aria-label={isFavorite ? 'Remover favorito' : 'Favoritar jogo'}
              className="p-1 rounded text-zinc-500 hover:text-emerald-400 transition-colors"
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
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {/* Mandante */}
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

            {/* Placar Central */}
            <div className="flex flex-col items-center justify-center px-2">
              {!isScheduled && match.homeTeam.score !== null && match.awayTeam.score !== null ? (
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
              ) : (
                <span className="text-base sm:text-lg font-black text-zinc-500 tracking-wider font-mono">
                  VS
                </span>
              )}
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 font-semibold">
                {isLive ? match.status.displayClock : isFinished ? 'Final' : 'Aguardando'}
              </span>
            </div>

            {/* Visitante */}
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

          {/* Autores dos Gols */}
          {match.goals.length > 0 ? (
            <div className="pt-2.5 border-t border-zinc-800/80 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                {/* Gols Mandante */}
                <div className="space-y-1">
                  {homeGoals.map((g) => (
                    <div key={g.id} className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="text-[9px] font-bold text-[#00ff87] bg-emerald-950/90 px-1 py-0.2 rounded border border-emerald-500/40">
                        GOL
                      </span>
                      <span className="text-zinc-300 font-sans truncate">{g.player}</span>
                      <span className="text-[#00ff87] font-bold ml-auto text-[10px] shrink-0">
                        {g.minute}
                        {g.isPenalty ? ' (P)' : ''}
                        {g.isOwnGoal ? ' (GC)' : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Gols Visitante */}
                <div className="space-y-1">
                  {awayGoals.map((g) => (
                    <div key={g.id} className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="text-[9px] font-bold text-[#00ff87] bg-emerald-950/90 px-1 py-0.2 rounded border border-emerald-500/40">
                        GOL
                      </span>
                      <span className="text-zinc-300 font-sans truncate">{g.player}</span>
                      <span className="text-[#00ff87] font-bold ml-auto text-[10px] shrink-0">
                        {g.minute}
                        {g.isPenalty ? ' (P)' : ''}
                        {g.isOwnGoal ? ' (GC)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            !isScheduled && (
              <div className="text-center text-[11px] text-zinc-500 font-mono py-0.5">
                0 x 0 - Nenhum gol registrado
              </div>
            )
          )}

          {/* Dynamic Detail Panel: Stats, Lineups, Substitutions, Events */}
          {activeTab === 'stats' && match.stats && (
            <div className="pt-2 border-t border-zinc-800/80 transition-all">
              <MatchStatsView
                stats={match.stats}
                homeName={match.homeTeam.shortName || match.homeTeam.name}
                awayName={match.awayTeam.shortName || match.awayTeam.name}
              />
            </div>
          )}

          {/* ESCALAÇÕES (Campinho Tático & Lista) */}
          {activeTab === 'lineups' && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-3 font-mono text-xs">
              {/* Toggle Campinho vs Lista */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Escalações Oficiais
                </span>
                <div className="flex items-center rounded-lg bg-black p-0.5 border border-zinc-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setLineupViewMode('pitch')}
                    className={`px-2 py-1 rounded font-bold transition-all ${
                      lineupViewMode === 'pitch'
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Campinho Tático
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineupViewMode('list')}
                    className={`px-2 py-1 rounded font-bold transition-all ${
                      lineupViewMode === 'list'
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>

              {/* View 1: Tactical Pitch (Campinho de futebol) */}
              {lineupViewMode === 'pitch' ? (
                <TacticalPitch
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  lineups={lineups}
                  matchEvents={match.events}
                />
              ) : (
                /* View 2: Traditional List */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400 bg-black/60 p-1.5 rounded-lg border border-zinc-800">
                    <span className="text-[#00ff87] font-bold">
                      {match.homeTeam.shortName}: {lineups.home.formation || '4-3-3'}
                      {lineups.home.coach ? ` (${lineups.home.coach})` : ''}
                    </span>
                    <span className="text-zinc-300 font-bold">
                      {match.awayTeam.shortName}: {lineups.away.formation || '4-3-3'}
                      {lineups.away.coach ? ` (${lineups.away.coach})` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {/* Titulares Mandante */}
                    <div className="space-y-1 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-[10px] uppercase font-bold text-[#00ff87] tracking-wider block mb-1">
                        11 Titulares
                      </span>
                      {lineups.home.starters.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5 truncate">
                          <span className="w-5 text-right font-bold text-zinc-500 text-[10px]">
                            {p.jersey}
                          </span>
                          <span className="text-zinc-200 font-sans truncate text-[11px]">{p.name}</span>
                          <span className="text-[9px] text-zinc-500 ml-auto shrink-0">{p.position}</span>
                        </div>
                      ))}
                    </div>

                    {/* Titulares Visitante */}
                    <div className="space-y-1 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80">
                      <span className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider block mb-1">
                        11 Titulares
                      </span>
                      {lineups.away.starters.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5 truncate">
                          <span className="w-5 text-right font-bold text-zinc-500 text-[10px]">
                            {p.jersey}
                          </span>
                          <span className="text-zinc-200 font-sans truncate text-[11px]">{p.name}</span>
                          <span className="text-[9px] text-zinc-500 ml-auto shrink-0">{p.position}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Banco de Reservas Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBench(!showBench)}
                      className="w-full text-center text-[10px] font-bold text-zinc-400 hover:text-[#00ff87] p-1 rounded bg-zinc-950 border border-zinc-800/80 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>{showBench ? 'Ocultar Banco de Reservas' : 'Ver Banco de Reservas'}</span>
                      {showBench ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {showBench && (
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px]">
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60 space-y-1">
                          <span className="text-zinc-500 font-bold block mb-1">Reservas Mandante</span>
                          {lineups.home.substitutes.map((s) => (
                            <div key={s.id} className="truncate text-zinc-400 font-sans">
                              <span className="font-mono text-zinc-600 mr-1">{s.jersey}</span>
                              {s.name}
                            </div>
                          ))}
                        </div>

                        <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60 space-y-1">
                          <span className="text-zinc-500 font-bold block mb-1">Reservas Visitante</span>
                          {lineups.away.substitutes.map((s) => (
                            <div key={s.id} className="truncate text-zinc-400 font-sans">
                              <span className="font-mono text-zinc-600 mr-1">{s.jersey}</span>
                              {s.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBSTITUIÇÕES */}
          {activeTab === 'subs' && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 font-mono text-xs">
              {lineups.substitutions.length > 0 ? (
                lineups.substitutions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-zinc-950 border border-zinc-800/90"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#00ff87] px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px]">
                        {sub.minute}
                      </span>
                      <span className="text-zinc-400 font-sans text-[11px]">
                        {sub.teamName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-sans text-[11px]">
                      <span className="text-emerald-400 font-medium">⬆ {sub.playerIn}</span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-rose-400 font-medium">⬇ {sub.playerOut}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-3 text-[11px]">
                  Nenhuma substituição realizada até o momento.
                </div>
              )}
            </div>
          )}

          {/* EVENTOS / CARTÕES */}
          {activeTab === 'events' && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 font-mono text-[11px]">
              {match.events.length > 0 ? (
                match.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-1.5 rounded bg-zinc-950 border border-zinc-800/90"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-bold">{ev.minute}</span>
                      {ev.type === 'goal' && (
                        <span className="text-[9px] font-bold text-[#00ff87] bg-emerald-950/90 px-1 py-0.2 rounded border border-emerald-500/40">
                          GOL
                        </span>
                      )}
                      {ev.type === 'yellow_card' && (
                        <span className="inline-block w-2.5 h-3.5 rounded-xs bg-amber-400" />
                      )}
                      {ev.type === 'red_card' && (
                        <span className="inline-block w-2.5 h-3.5 rounded-xs bg-red-600 shadow-sm shadow-red-500/50" />
                      )}
                      <span className="font-sans text-zinc-200">{ev.player}</span>
                    </div>
                    <span className="text-zinc-400 text-[10px]">{ev.detail}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-3 text-[11px]">
                  Sem cartões ou advertências registradas.
                </div>
              )}
            </div>
          )}

          {/* Bottom Interactive Bar: Venue & Navigation Tabs */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              {/* VIDEO HIGHLIGHTS BUTTON */}
              <button
                type="button"
                onClick={() => setIsHighlightsOpen(true)}
                title="Assistir aos vídeos de melhores momentos e gols da partida"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-300 transition-all font-mono shadow-sm group"
              >
                <Film className="h-3 w-3 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>VÍDEOS</span>
              </button>

              {match.venue && (
                <span className="hidden sm:inline-flex items-center gap-1 truncate text-zinc-400 text-[10px]">
                  <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{match.venue}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-[11px]">
              {/* Estatísticas Toggle */}
              <button
                type="button"
                onClick={() => toggleTab('stats')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-emerald-500/20 text-[#00ff87] font-bold border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <BarChart2 className="h-3 w-3" />
                <span>Stats</span>
              </button>

              {/* Escalações Toggle */}
              <button
                type="button"
                onClick={() => toggleTab('lineups')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  activeTab === 'lineups'
                    ? 'bg-emerald-500/20 text-[#00ff87] font-bold border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Users className="h-3 w-3" />
                <span>Escalação</span>
              </button>

              {/* Substituições Toggle */}
              <button
                type="button"
                onClick={() => toggleTab('subs')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  activeTab === 'subs'
                    ? 'bg-emerald-500/20 text-[#00ff87] font-bold border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <ArrowLeftRight className="h-3 w-3" />
                <span className="hidden xs:inline">Subs</span>
              </button>

              {/* Eventos / Linha do Tempo Toggle */}
              <button
                type="button"
                onClick={() => toggleTab('events')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  activeTab === 'events'
                    ? 'bg-emerald-500/20 text-[#00ff87] font-bold border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Lances</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Video Highlights Overlay Modal */}
      <VideoHighlightsModal
        isOpen={isHighlightsOpen}
        onClose={() => setIsHighlightsOpen(false)}
        match={match}
      />
    </>
  );
};
