/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MatchLineups,
  LineupPlayer,
  SubstitutionEvent,
  MatchEvent,
} from '../utils/soccer.ts';
import { TeamCrest } from './TeamCrest.tsx';
import {
  Users,
  Shield,
  ArrowDownRight,
  ArrowUpRight,
  UserCheck,
  Info,
} from 'lucide-react';

interface TacticalPitchProps {
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo?: string;
  };
  lineups: MatchLineups;
  matchEvents?: MatchEvent[];
}

interface PlayerWithCoords extends LineupPlayer {
  x: number; // percentage 0-100 across field width
  y: number; // percentage 0-100 from goal line up to midfield/attack
  goalsCount: number;
  yellowCard: boolean;
  redCard: boolean;
  isSubbedOut: boolean;
  subMinute?: string;
}

/**
 * Calculates (x, y) coordinates on a soccer pitch for 11 starters based on formation string.
 * Y coordinates: 90% is Goalkeeper (near bottom goal), 15% is Striker (near top goal).
 */
function layoutPlayersOnPitch(
  starters: LineupPlayer[],
  formationStr: string = '4-3-3',
  matchEvents: MatchEvent[] = [],
  substitutions: SubstitutionEvent[] = [],
  teamName: string
): PlayerWithCoords[] {
  if (!starters || starters.length === 0) return [];

  // Parse formation lines, e.g. "4-3-3" -> [4, 3, 3] or "4-2-3-1" -> [4, 2, 3, 1]
  const cleanFormation = formationStr.replace(/[^0-9-]/g, '').trim();
  let parts = cleanFormation.split('-').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0);

  // Validate or fallback to default 4-3-3
  const sumField = parts.reduce((a, b) => a + b, 0);
  if (parts.length === 0 || sumField !== 10) {
    if (starters.length === 11) {
      parts = [4, 3, 3];
    } else {
      parts = [4, 4, 2];
    }
  }

  // Row vertical positions from bottom (GK) to top (Attackers)
  // Goalkeeper is at y = 88%
  // Field players distributed between y = 72% down to y = 14%
  const numRows = parts.length;
  const rowYPositions: number[] = [];

  for (let r = 0; r < numRows; r++) {
    // r = 0 is Defenders (closest to GK, ~72%), r = numRows - 1 is Forwards (~16%)
    const fraction = numRows > 1 ? r / (numRows - 1) : 0.5;
    const y = 72 - fraction * 56;
    rowYPositions.push(y);
  }

  const result: PlayerWithCoords[] = [];

  // 1. Goalkeeper (1st player)
  const gk = starters[0];
  if (gk) {
    const goalsCount = matchEvents.filter(
      (e) => e.type === 'goal' && e.player.toLowerCase().includes(gk.name.toLowerCase())
    ).length;
    const yellowCard = matchEvents.some(
      (e) => e.type === 'yellow_card' && e.player.toLowerCase().includes(gk.name.toLowerCase())
    );
    const redCard = matchEvents.some(
      (e) => e.type === 'red_card' && e.player.toLowerCase().includes(gk.name.toLowerCase())
    );
    const subEvent = substitutions.find(
      (s) => s.playerOut.toLowerCase().includes(gk.name.toLowerCase())
    );

    result.push({
      ...gk,
      x: 50,
      y: 88,
      goalsCount,
      yellowCard,
      redCard,
      isSubbedOut: !!subEvent,
      subMinute: subEvent?.minute,
    });
  }

  // 2. Field players according to row parts
  let playerIdx = 1;

  parts.forEach((countInRow, rowIdx) => {
    const y = rowYPositions[rowIdx];
    // Distribute X evenly across field (margins at 14% and 86%)
    for (let c = 0; c < countInRow; c++) {
      const p = starters[playerIdx];
      if (!p) break;

      const x =
        countInRow === 1
          ? 50
          : 15 + (c / (countInRow - 1)) * 70;

      const goalsCount = matchEvents.filter(
        (e) => e.type === 'goal' && e.player.toLowerCase().includes(p.name.toLowerCase())
      ).length;
      const yellowCard = matchEvents.some(
        (e) => e.type === 'yellow_card' && e.player.toLowerCase().includes(p.name.toLowerCase())
      );
      const redCard = matchEvents.some(
        (e) => e.type === 'red_card' && e.player.toLowerCase().includes(p.name.toLowerCase())
      );
      const subEvent = substitutions.find(
        (s) => s.playerOut.toLowerCase().includes(p.name.toLowerCase())
      );

      result.push({
        ...p,
        x,
        y,
        goalsCount,
        yellowCard,
        redCard,
        isSubbedOut: !!subEvent,
        subMinute: subEvent?.minute,
      });

      playerIdx++;
    }
  });

  return result;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  homeTeam,
  awayTeam,
  lineups,
  matchEvents = [],
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [activePlayer, setActivePlayer] = useState<PlayerWithCoords | null>(null);

  const currentTeamInfo = selectedTeam === 'home' ? homeTeam : awayTeam;
  const currentLineup = selectedTeam === 'home' ? lineups.home : lineups.away;
  const currentTeamName = selectedTeam === 'home' ? homeTeam.name : awayTeam.name;

  const pitchPlayers = useMemo(() => {
    return layoutPlayersOnPitch(
      currentLineup.starters,
      currentLineup.formation,
      matchEvents,
      lineups.substitutions,
      currentTeamName
    );
  }, [currentLineup, matchEvents, lineups.substitutions, currentTeamName]);

  const teamSubs = useMemo(() => {
    return lineups.substitutions.filter((s) =>
      s.teamName.toLowerCase().includes(currentTeamName.toLowerCase()) ||
      currentTeamName.toLowerCase().includes(s.teamName.toLowerCase())
    );
  }, [lineups.substitutions, currentTeamName]);

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Team Selection Header */}
      <div className="flex items-center justify-between bg-black/80 p-1.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setSelectedTeam('home');
              setActivePlayer(null);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedTeam === 'home'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TeamCrest name={homeTeam.name} shortName={homeTeam.shortName} logoUrl={homeTeam.logo} size="sm" />
            <span>{homeTeam.shortName}</span>
            <span className="text-[10px] opacity-80">({lineups.home.formation || '4-3-3'})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTeam('away');
              setActivePlayer(null);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedTeam === 'away'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TeamCrest name={awayTeam.name} shortName={awayTeam.shortName} logoUrl={awayTeam.logo} size="sm" />
            <span>{awayTeam.shortName}</span>
            <span className="text-[10px] opacity-80">({lineups.away.formation || '4-3-3'})</span>
          </button>
        </div>

        {/* Coach badge */}
        {currentLineup.coach && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800 text-[11px]">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-500">Técnico:</span>
            <span className="font-sans font-bold text-white">{currentLineup.coach}</span>
          </div>
        )}
      </div>

      {/* Visual Soccer Pitch (Campinho) */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl select-none bg-gradient-to-b from-[#0a381f] via-[#0b4224] to-[#072c18]">
        {/* Grass Stripes Pattern */}
        <div className="absolute inset-0 opacity-25 pointer-events-none flex flex-col">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 2 === 0 ? 'bg-black/20' : 'bg-emerald-400/10'}`}
            />
          ))}
        </div>

        {/* Outer Boundary White Lines */}
        <div className="absolute inset-3 sm:inset-4 border-2 border-white/60 rounded-sm pointer-events-none">
          {/* Halfway Line (Midfield) */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 -translate-y-1/2" />

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-2 border-white/60 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/70 rounded-full" />

          {/* Top Goal Area (Attack Zone) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-16 sm:h-20 border-b-2 border-x-2 border-white/60">
            {/* Penalty Arc */}
            <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-20 h-8 border-b-2 border-white/60 rounded-b-full" />
            {/* Penalty Spot */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/70 rounded-full" />
            {/* Small Goal Box */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-7 sm:h-9 border-b-2 border-x-2 border-white/60" />
          </div>

          {/* Bottom Goal Area (Defending / GK Zone) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-16 sm:h-20 border-t-2 border-x-2 border-white/60">
            {/* Penalty Arc */}
            <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-20 h-8 border-t-2 border-white/60 rounded-t-full" />
            {/* Penalty Spot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/70 rounded-full" />
            {/* Small Goal Box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-7 sm:h-9 border-t-2 border-x-2 border-white/60" />
          </div>

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br-full" />
          <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl-full" />
        </div>

        {/* Tactical Attack Direction Arrow */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] font-bold text-white/50 tracking-wider">
          <span>ATAQUE</span>
          <span>▲</span>
        </div>

        {/* Players Node Positioned on the Field */}
        {pitchPlayers.map((player) => {
          const isSelected = activePlayer?.id === player.id;
          return (
            <div
              key={player.id}
              onClick={() => setActivePlayer(player)}
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group transition-transform duration-200 hover:scale-110 z-20"
            >
              {/* Circular Player Jersey / Disc */}
              <div
                className={`relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-lg transition-all ${
                  isSelected
                    ? 'ring-4 ring-[#00ff87] bg-white text-black scale-110'
                    : player.position === 'GOL'
                    ? 'bg-amber-500 text-black border-2 border-white font-black'
                    : 'bg-black text-white border-2 border-[#00ff87] font-black'
                }`}
              >
                <span className="text-[10px] sm:text-xs font-mono font-black">
                  {player.jersey || '•'}
                </span>

                {/* Goal indicator pill */}
                {player.goalsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-black font-black text-[9px] shadow-md border border-white">
                    ⚽{player.goalsCount > 1 ? player.goalsCount : ''}
                  </span>
                )}

                {/* Yellow / Red Card indicator */}
                {player.redCard && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-3.5 bg-rose-600 rounded-xs border border-white shadow-sm" />
                )}
                {!player.redCard && player.yellowCard && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-3.5 bg-amber-400 rounded-xs border border-black shadow-sm" />
                )}

                {/* Substituted out indicator */}
                {player.isSubbedOut && (
                  <span
                    title={`Substituído aos ${player.subMinute || ''}`}
                    className="absolute -top-1 -left-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] shadow"
                  >
                    ⬇
                  </span>
                )}
              </div>

              {/* Player Name Tag */}
              <div
                className={`mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-sans font-bold leading-none truncate max-w-[70px] sm:max-w-[85px] text-center drop-shadow-md transition-all ${
                  isSelected
                    ? 'bg-[#00ff87] text-black font-black ring-1 ring-white'
                    : 'bg-black/85 text-zinc-100 border border-zinc-700/80'
                }`}
              >
                {player.name.split(' ').slice(-1)[0] || player.name}
              </div>

              {/* Position badge */}
              <span className="text-[8px] font-mono text-emerald-300 font-bold opacity-80">
                {player.position}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Player Details Spotlight Box */}
      {activePlayer && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/40 text-xs shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00ff87] text-black font-black font-mono text-sm">
              {activePlayer.jersey}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm font-sans">{activePlayer.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[#00ff87] text-[10px] font-bold">
                  {activePlayer.position}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {currentTeamName} • Titular
                {activePlayer.isSubbedOut ? ` (Substituído aos ${activePlayer.subMinute})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            {activePlayer.goalsCount > 0 && (
              <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-[#00ff87] font-bold text-[11px]">
                ⚽ {activePlayer.goalsCount} {activePlayer.goalsCount > 1 ? 'Gols' : 'Gol'}
              </span>
            )}
            {activePlayer.yellowCard && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                🟨 Cartão Amarelo
              </span>
            )}
            {activePlayer.redCard && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                🟥 Cartão Vermelho
              </span>
            )}
          </div>
        </div>
      )}

      {/* Substituições Realizadas na Partida */}
      {teamSubs.length > 0 && (
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
            Substituições do {currentTeamName}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {teamSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-black/60 border border-zinc-800 text-[11px]"
              >
                <span className="font-bold text-[#00ff87] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/40 text-[10px]">
                  {sub.minute}
                </span>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" /> {sub.playerIn}
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <ArrowDownRight className="h-3 w-3" /> {sub.playerOut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banco de Reservas */}
      {currentLineup.substitutes && currentLineup.substitutes.length > 0 && (
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Banco de Reservas ({currentLineup.substitutes.length} Jogadores)
            </span>
            <span className="text-[10px] text-zinc-500">Opções para o técnico</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {currentLineup.substitutes.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-1.5 p-1 rounded bg-black/50 border border-zinc-850 truncate"
              >
                <span className="w-5 text-right font-mono font-bold text-zinc-500 text-[10px]">
                  {sub.jersey}
                </span>
                <span className="font-sans text-zinc-300 truncate text-[11px]">
                  {sub.name}
                </span>
                <span className="ml-auto text-[9px] font-mono text-zinc-500 shrink-0">
                  {sub.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
