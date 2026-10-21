/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Tv,
  Target,
  Clock,
  Sparkles,
  Shield,
  Activity,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { MatchData, MatchCardEvent } from '../utils/soccer.ts';
import { TeamCrest } from './TeamCrest.tsx';

interface LiveMatchRadarProps {
  match: MatchData;
  onOpenVideos?: () => void;
}

interface SimulatedPlay {
  id: string;
  minute: string;
  type: 'attack' | 'shot' | 'goal' | 'card' | 'corner' | 'foul' | 'save';
  team: 'home' | 'away';
  title: string;
  description: string;
  pitchX: number; // 0 to 100%
  pitchY: number; // 0 to 100%
}

export const LiveMatchRadar: React.FC<LiveMatchRadarProps> = ({
  match,
  onOpenVideos,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'key' | 'goals'>('all');
  const [radarPhase, setRadarPhase] = useState<number>(0);

  const isLive = match.status.state === 'live';
  const isFinished = match.status.state === 'finished';
  const isScheduled = match.status.state === 'scheduled';

  // Automatically cycle tactical animation phases for live games
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setRadarPhase((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, [isLive]);

  // Derive realistic and official play-by-play actions
  const plays = useMemo<SimulatedPlay[]>(() => {
    const list: SimulatedPlay[] = [];

    // Add match events first
    match.events.forEach((ev, idx) => {
      const isHome = ev.teamId === match.homeTeam.id;
      if (ev.type === 'goal') {
        list.push({
          id: `ev-${idx}-${ev.id}`,
          minute: ev.minute,
          type: 'goal',
          team: isHome ? 'home' : 'away',
          title: `GOL DO ${isHome ? match.homeTeam.name.toUpperCase() : match.awayTeam.name.toUpperCase()}!`,
          description: `${ev.player} finalizou com categoria para balançar as redes! Placar alterado.`,
          pitchX: isHome ? 88 : 12,
          pitchY: 50,
        });
      } else if (ev.type === 'yellow_card' || ev.type === 'red_card') {
        list.push({
          id: `ev-${idx}-${ev.id}`,
          minute: ev.minute,
          type: 'card',
          team: isHome ? 'home' : 'away',
          title: ev.type === 'red_card' ? 'CARTÃO VERMELHO' : 'Cartão Amarelo',
          description: `Infração assinalada pela arbitragem. Cartão aplicado para ${ev.player}.`,
          pitchX: isHome ? 60 : 40,
          pitchY: 65,
        });
      }
    });

    // If goals exist, add them to timeline
    match.goals.forEach((g, idx) => {
      const isHome = g.teamId === match.homeTeam.id || g.teamName.toLowerCase().includes(match.homeTeam.name.toLowerCase());
      if (!list.some((p) => p.minute === g.minute && p.type === 'goal')) {
        list.push({
          id: `goal-${idx}-${g.id}`,
          minute: g.minute,
          type: 'goal',
          team: isHome ? 'home' : 'away',
          title: `GOL! ${g.player} (${isHome ? match.homeTeam.shortName : match.awayTeam.shortName})`,
          description: `${g.player} marca um gol decisivo${g.isPenalty ? ' em cobrança de pênalti' : ''}!`,
          pitchX: isHome ? 88 : 12,
          pitchY: 50,
        });
      }
    });

    // Add dynamic play-by-play moments to provide rich live experience
    if (isLive || isFinished) {
      const currentMin = parseInt(match.status.displayClock) || 75;
      const homeName = match.homeTeam.name;
      const awayName = match.awayTeam.name;

      const dynamicChances: SimulatedPlay[] = [
        {
          id: 'p-dyn-1',
          minute: `${Math.max(1, currentMin - 2)}'`,
          type: 'shot',
          team: 'home',
          title: `Finalização perigosa de ${homeName}`,
          description: `Chute forte do atacante de fora da área! O goleiro visitante se estica e espalma para escanteio.`,
          pitchX: 78,
          pitchY: 38,
        },
        {
          id: 'p-dyn-2',
          minute: `${Math.max(2, currentMin - 5)}'`,
          type: 'attack',
          team: 'home',
          title: `Ataque Perigoso - ${homeName} no terço final`,
          description: `Troca rápida de passes no corredor direito buscando a infiltração entre os zagueiros.`,
          pitchX: 72,
          pitchY: 75,
        },
        {
          id: 'p-dyn-3',
          minute: `${Math.max(5, currentMin - 11)}'`,
          type: 'corner',
          team: 'away',
          title: `Cobrança de Escanteio para o ${awayName}`,
          description: `Bola alçada com perigo na primeira trave; a zaga mandante corta de cabeça.`,
          pitchX: 14,
          pitchY: 88,
        },
        {
          id: 'p-dyn-4',
          minute: `${Math.max(10, currentMin - 18)}'`,
          type: 'save',
          team: 'away',
          title: `Grande Defesa do Goleiro`,
          description: `Finalização rasteira no canto esquerdo. O arqueiro faz ótima intervenção em dois tempos!`,
          pitchX: 16,
          pitchY: 48,
        },
        {
          id: 'p-dyn-5',
          minute: '21\'',
          type: 'foul',
          team: 'home',
          title: 'Falta marcada no meio de campo',
          description: 'Disputa ríspida pela posse de bola. Juiz paralisa o lance e adverte verbalmente.',
          pitchX: 48,
          pitchY: 52,
        },
      ];

      dynamicChances.forEach((ch) => {
        if (!list.some((existing) => existing.minute === ch.minute)) {
          list.push(ch);
        }
      });
    }

    // Sort by minute descending (most recent first)
    return list.sort((a, b) => {
      const minA = parseInt(a.minute) || 0;
      const minB = parseInt(b.minute) || 0;
      return minB - minA;
    });
  }, [match, isLive, isFinished]);

  // Filtered plays
  const filteredPlays = plays.filter((p) => {
    if (filterType === 'goals') return p.type === 'goal';
    if (filterType === 'key') return p.type === 'goal' || p.type === 'shot' || p.type === 'card';
    return true;
  });

  // Current active live radar state
  const currentAction = useMemo(() => {
    if (isScheduled) {
      return {
        label: 'Aguardando Início da Partida',
        zone: 'Centro do Gramado',
        team: 'neutral',
        x: 50,
        y: 50,
      };
    }
    if (isFinished) {
      return {
        label: 'Partida Finalizada - Apito Final',
        zone: 'Gramado Encerrado',
        team: 'neutral',
        x: 50,
        y: 50,
      };
    }

    const phases = [
      {
        label: `Ataque Perigoso: ${match.homeTeam.name}`,
        zone: 'Terço Ofensivo Direito',
        team: 'home',
        x: 76,
        y: 35,
      },
      {
        label: `Finalização no Alvo: ${match.homeTeam.name}`,
        zone: 'Entrada da Grande Área',
        team: 'home',
        x: 82,
        y: 50,
      },
      {
        label: 'Disputa Intensa pela Posse',
        zone: 'Círculo Central',
        team: 'midfield',
        x: 50,
        y: 48,
      },
      {
        label: `Contra-Ataque Rápido: ${match.awayTeam.name}`,
        zone: 'Corredor Esquerdo',
        team: 'away',
        x: 28,
        y: 72,
      },
      {
        label: `Escanteio para o ${match.awayTeam.name}`,
        zone: 'Bandeirinha de Fundo',
        team: 'away',
        x: 10,
        y: 85,
      },
    ];

    return phases[radarPhase % phases.length];
  }, [isScheduled, isFinished, match, radarPhase]);

  // Broadcasters for this league
  const broadcastChannels = useMemo(() => {
    const league = match.leagueId.toLowerCase();
    if (league.includes('champions')) {
      return ['TNT Sports', 'Max (HBO)', 'SBT'];
    }
    if (league.includes('premier')) {
      return ['ESPN', 'Disney+'];
    }
    if (league.includes('la_liga') || league.includes('esp')) {
      return ['ESPN', 'Disney+'];
    }
    if (league.includes('libertadores')) {
      return ['TV Globo', 'Paramount+', 'ESPN'];
    }
    if (league.includes('bra') || league.includes('brasileirao')) {
      return ['TV Globo', 'Premiere', 'CazéTV (YouTube)'];
    }
    return ['Premiere', 'CazéTV', 'ESPN'];
  }, [match.leagueId]);

  return (
    <div className="space-y-3 pt-2 border-t border-zinc-800/90 animate-in fade-in duration-150">
      {/* Top Status & Broadcast Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff87]" />
              </span>
              <span>RADAR AO VIVO • {match.status.displayClock}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
              <Radio className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isFinished ? 'RESUMO COMPLETO DOS LANCES' : 'CENTRAL DA PARTIDA'}</span>
            </div>
          )}
        </div>

        {/* Onde Assistir */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-sans">
          <span className="text-zinc-500 font-mono text-[10px] uppercase flex items-center gap-1">
            <Tv className="h-3 w-3 text-zinc-400" />
            Onde Assistir:
          </span>
          {broadcastChannels.map((ch) => (
            <span
              key={ch}
              className="px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300 font-semibold font-mono text-[10px]"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Pitch Radar Simulation */}
      <div className="relative rounded-2xl bg-[#06180e] border border-emerald-900/60 p-3 sm:p-4 overflow-hidden shadow-inner">
        {/* Subtle Pitch Grass Grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #00ff87 0px, #00ff87 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* Pitch Lines (SVG) */}
        <svg
          viewBox="0 0 400 200"
          className="w-full h-36 sm:h-44 rounded-xl border-2 border-emerald-500/40 bg-[#072414]/90"
        >
          {/* Outer Boundary */}
          <rect x="10" y="10" width="380" height="180" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Halfway Line */}
          <line x1="200" y1="10" x2="200" y2="190" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Center Circle */}
          <circle cx="200" cy="100" r="35" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="200" cy="100" r="2.5" fill="#00ff87" fillOpacity="0.8" />

          {/* Penalty Boxes Home (Left) and Away (Right) */}
          <rect x="10" y="50" width="60" height="100" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.35" />
          <rect x="10" y="75" width="22" height="50" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.35" />

          <rect x="330" y="50" width="60" height="100" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.35" />
          <rect x="368" y="75" width="22" height="50" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeOpacity="0.35" />

          {/* Goals */}
          <rect x="4" y="85" width="6" height="30" fill="#ffffff" fillOpacity="0.3" stroke="#00ff87" strokeWidth="1" />
          <rect x="390" y="85" width="6" height="30" fill="#ffffff" fillOpacity="0.3" stroke="#00ff87" strokeWidth="1" />

          {/* Active Action Pin with Pulsing Ripple */}
          <g transform={`translate(${(currentAction.x / 100) * 380 + 10}, ${(currentAction.y / 100) * 180 + 10})`}>
            {isLive && (
              <circle r="14" fill="#00ff87" fillOpacity="0.3" className="animate-ping" />
            )}
            <circle
              r="6.5"
              fill={currentAction.team === 'home' ? '#00ff87' : currentAction.team === 'away' ? '#f43f5e' : '#e4e4e7'}
              stroke="#000"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Live Action Banner Over Pitch */}
        <div className="mt-2.5 flex items-center justify-between text-xs bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span className="font-bold text-white font-mono text-[11px] sm:text-xs">
              {currentAction.label}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
            Posição: {currentAction.zone}
          </span>
        </div>
      </div>

      {/* Minuto a Minuto Feed Header & Filters */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200">
          <Clock className="h-3.5 w-3.5 text-[#00ff87]" />
          <span>MINUTO A MINUTO</span>
          <span className="text-[10px] font-normal text-zinc-500 font-sans">
            ({filteredPlays.length} lances)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-lg bg-black p-0.5 border border-zinc-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              filterType === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType('key')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              filterType === 'key'
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Chances & Cartões
          </button>
          <button
            type="button"
            onClick={() => setFilterType('goals')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              filterType === 'goals'
                ? 'bg-emerald-500 text-black'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Gols
          </button>
        </div>
      </div>

      {/* Play-by-play Timeline List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {filteredPlays.length > 0 ? (
          filteredPlays.map((p) => {
            const isHomeTeam = p.team === 'home';
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border text-xs transition-colors ${
                  p.type === 'goal'
                    ? 'bg-emerald-950/60 border-emerald-500/50 shadow-sm'
                    : p.type === 'card'
                    ? 'bg-amber-950/30 border-amber-600/40'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#00ff87] bg-black px-1.5 py-0.5 rounded border border-zinc-800 text-[11px]">
                      {p.minute}
                    </span>
                    <span
                      className={`font-bold font-mono text-[11px] ${
                        p.type === 'goal'
                          ? 'text-[#00ff87]'
                          : p.type === 'card'
                          ? 'text-amber-300'
                          : 'text-white'
                      }`}
                    >
                      {p.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono uppercase">
                    {isHomeTeam ? match.homeTeam.shortName : match.awayTeam.shortName}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans pl-1">
                  {p.description}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-zinc-500 text-xs font-mono">
            Nenhum lance encontrado para o filtro selecionado.
          </div>
        )}
      </div>

      {/* Quick link to official video highlights */}
      {onOpenVideos && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onOpenVideos}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all shadow-sm"
          >
            <Tv className="h-3.5 w-3.5 text-rose-400" />
            <span>Ver Vídeos dos Melhores Momentos</span>
          </button>
        </div>
      )}
    </div>
  );
};
