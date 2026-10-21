/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchStats } from '../utils/soccer.ts';
import { Target, Activity } from 'lucide-react';

interface MatchStatsProps {
  stats: MatchStats;
  homeName: string;
  awayName: string;
}

export const MatchStatsView: React.FC<MatchStatsProps> = ({
  stats,
  homeName,
  awayName,
}) => {
  const homePoss = stats.possession.home || 50;
  const awayPoss = stats.possession.away || (100 - homePoss);

  const totalShotsCombined = (stats.totalShots.home + stats.totalShots.away) || 1;
  const homeTotalShotsPct = Math.round((stats.totalShots.home / totalShotsCombined) * 100);

  const targetShotsCombined = (stats.shotsOnTarget.home + stats.shotsOnTarget.away) || 1;
  const homeTargetPct = Math.round((stats.shotsOnTarget.home / targetShotsCombined) * 100);

  return (
    <div className="rounded-lg bg-black/80 p-3 border border-emerald-950/70 space-y-2.5 text-xs font-mono shadow-inner">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-400 font-sans border-b border-zinc-800/80 pb-1.5 font-bold">
        <span className="text-[#00ff87] truncate max-w-[120px]">{homeName}</span>
        <span className="text-zinc-500 font-mono text-[10px] tracking-widest flex items-center gap-1">
          <Activity className="h-3 w-3 text-emerald-500" />
          ESTATÍSTICAS DA PARTIDA
        </span>
        <span className="text-zinc-200 truncate max-w-[120px] text-right">{awayName}</span>
      </div>

      {/* Posse de Bola */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#00ff87]">{homePoss}%</span>
          <span className="text-[11px] font-sans text-zinc-400">Posse de Bola</span>
          <span className="font-bold text-zinc-200">{awayPoss}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="bg-[#00ff87] h-full transition-all duration-500"
            style={{ width: `${homePoss}%` }}
          />
          <div
            className="bg-zinc-600 h-full transition-all duration-500"
            style={{ width: `${awayPoss}%` }}
          />
        </div>
      </div>

      {/* Finalizações no Gol (Chutes a gol) */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#00ff87]">{stats.shotsOnTarget.home}</span>
          <span className="text-[11px] font-sans text-zinc-400 flex items-center justify-center gap-1">
            <Target className="h-3 w-3 text-emerald-400" />
            Chutes no Alvo
          </span>
          <span className="font-bold text-zinc-200">{stats.shotsOnTarget.away}</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="bg-[#00ff87] h-full transition-all duration-500"
            style={{ width: `${homeTargetPct}%` }}
          />
          <div
            className="bg-zinc-600 h-full transition-all duration-500"
            style={{ width: `${100 - homeTargetPct}%` }}
          />
        </div>
      </div>

      {/* Total de Chutes */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#00ff87]">{stats.totalShots.home}</span>
          <span className="text-[11px] font-sans text-zinc-400">Total de Chutes</span>
          <span className="font-bold text-zinc-200">{stats.totalShots.away}</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500/80 h-full transition-all duration-500"
            style={{ width: `${homeTotalShotsPct}%` }}
          />
          <div
            className="bg-zinc-600 h-full transition-all duration-500"
            style={{ width: `${100 - homeTotalShotsPct}%` }}
          />
        </div>
      </div>

      {/* Escanteios e Faltas (se disponíveis) */}
      {(stats.corners || stats.fouls) && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60 text-[11px]">
          {stats.corners && (
            <div className="flex justify-between text-zinc-400">
              <span className="text-[#00ff87] font-bold">{stats.corners.home}</span>
              <span className="font-sans text-[10px]">Escanteios</span>
              <span className="text-zinc-200 font-bold">{stats.corners.away}</span>
            </div>
          )}
          {stats.fouls && (
            <div className="flex justify-between text-zinc-400">
              <span className="text-[#00ff87] font-bold">{stats.fouls.home}</span>
              <span className="font-sans text-[10px]">Faltas</span>
              <span className="text-zinc-200 font-bold">{stats.fouls.away}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
