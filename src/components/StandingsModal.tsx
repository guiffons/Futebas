/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Trophy,
  Shield,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StandingEntry } from '../utils/soccer.ts';
import { fetchTournamentStandings } from '../services/soccerApi.ts';
import { TeamCrest } from './TeamCrest.tsx';

interface StandingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLeague?: 'brasileirao' | 'champions';
}

export const StandingsModal: React.FC<StandingsModalProps> = ({
  isOpen,
  onClose,
  defaultLeague = 'brasileirao',
}) => {
  const [selectedLeague, setSelectedLeague] = useState<'brasileirao' | 'champions'>(defaultLeague);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedLeague(defaultLeague);
  }, [defaultLeague]);

  const loadStandings = useCallback(async (league: 'brasileirao' | 'champions') => {
    setIsLoading(true);
    try {
      const data = await fetchTournamentStandings(league);
      setStandings(data);
      setLastUpdated(new Date());
    } catch {
      // soccerApi fallback handles it
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStandings(selectedLeague);
    }
  }, [isOpen, selectedLeague, loadStandings]);

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const query = searchQuery.toLowerCase().trim();
    return standings.filter(
      (entry) =>
        entry.team.name.toLowerCase().includes(query) ||
        entry.team.shortName.toLowerCase().includes(query)
    );
  }, [standings, searchQuery]);

  if (!isOpen) return null;

  const isBrasileirao = selectedLeague === 'brasileirao';

  // Zone border / background styling based on rank
  const getZoneStyle = (rank: number) => {
    if (isBrasileirao) {
      if (rank <= 4) return 'border-l-4 border-l-emerald-500 bg-emerald-950/20';
      if (rank <= 6) return 'border-l-4 border-l-sky-500 bg-sky-950/15';
      if (rank <= 12) return 'border-l-4 border-l-amber-500/80 bg-amber-950/10';
      if (rank >= 17) return 'border-l-4 border-l-rose-500 bg-rose-950/20';
      return 'border-l-4 border-l-transparent';
    } else {
      // UCL
      if (rank <= 8) return 'border-l-4 border-l-emerald-500 bg-emerald-950/20';
      if (rank <= 24) return 'border-l-4 border-l-sky-500 bg-sky-950/15';
      return 'border-l-4 border-l-rose-500 bg-rose-950/20';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="standings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-[#090d0b] shadow-2xl text-zinc-100 overflow-hidden ring-1 ring-emerald-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 sm:px-6 bg-black/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#00ff87]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="standings-modal-title"
                className="text-base sm:text-lg font-black tracking-tight text-white font-mono flex items-center gap-2"
              >
                TABELA DE CLASSIFICAÇÃO
                <span className="text-xs font-bold text-[#00ff87] bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40">
                  TEMPO REAL
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Pontos, vitórias, saldo de gols e zonas de classificação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadStandings(selectedLeague)}
              disabled={isLoading}
              title="Recarregar tabela"
              aria-label="Recarregar tabela"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#00ff87] hover:border-emerald-500/40 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#00ff87]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar tabela"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls: League Switch & Search */}
        <div className="flex flex-col gap-3 border-b border-zinc-800/80 px-4 py-3 sm:px-6 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/60 font-mono text-xs">
          {/* League Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-black p-1 border border-zinc-800 w-fit">
            <button
              type="button"
              onClick={() => setSelectedLeague('brasileirao')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-bold transition-all ${
                isBrasileirao
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>BRASILEIRÃO SÉRIE A</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLeague('champions')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-bold transition-all ${
                !isBrasileirao
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>CHAMPIONS LEAGUE</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar clube na tabela..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 scrollbar-thin scrollbar-thumb-zinc-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-[#00ff87]" />
              <p className="text-xs font-mono text-zinc-400">Carregando classificação oficial...</p>
            </div>
          ) : filteredStandings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
              <AlertCircle className="h-6 w-6" />
              <p className="text-xs font-mono">Nenhum clube encontrado para "{searchQuery}"</p>
            </div>
          ) : (
            <div className="min-w-[620px]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider bg-black/40">
                    <th scope="col" className="py-2.5 pl-3 pr-2 w-10 text-center">#</th>
                    <th scope="col" className="py-2.5 px-3 min-w-[200px]">Clube</th>
                    <th scope="col" className="py-2.5 px-2.5 text-center font-bold text-[#00ff87]">PTS</th>
                    <th scope="col" className="py-2.5 px-2 text-center">J</th>
                    <th scope="col" className="py-2.5 px-2 text-center">V</th>
                    <th scope="col" className="py-2.5 px-2 text-center">E</th>
                    <th scope="col" className="py-2.5 px-2 text-center">D</th>
                    <th scope="col" className="py-2.5 px-2 text-center hidden sm:table-cell">GP</th>
                    <th scope="col" className="py-2.5 px-2 text-center hidden sm:table-cell">GC</th>
                    <th scope="col" className="py-2.5 px-2.5 text-center font-bold">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/80">
                  {filteredStandings.map((entry) => {
                    const zoneClass = getZoneStyle(entry.rank);
                    const diffPositive = entry.goalDifference > 0;
                    const diffZero = entry.goalDifference === 0;

                    return (
                      <tr
                        key={entry.team.id}
                        className={`transition-colors hover:bg-zinc-900/60 ${zoneClass}`}
                      >
                        {/* Rank */}
                        <td className="py-2 pl-3 pr-2 text-center font-bold text-zinc-300">
                          {entry.rank}
                        </td>

                        {/* Team Info */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            <TeamCrest
                              name={entry.team.name}
                              shortName={entry.team.shortName}
                              logoUrl={entry.team.logo}
                              size="sm"
                              className="shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-zinc-100 font-sans truncate text-xs sm:text-sm">
                                {entry.team.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {entry.team.shortName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Pontos */}
                        <td className="py-2 px-2.5 text-center font-black text-sm text-[#00ff87] bg-emerald-950/30">
                          {entry.points}
                        </td>

                        {/* Jogos */}
                        <td className="py-2 px-2 text-center text-zinc-300">
                          {entry.gamesPlayed}
                        </td>

                        {/* Vitórias */}
                        <td className="py-2 px-2 text-center text-zinc-300">
                          {entry.wins}
                        </td>

                        {/* Empates */}
                        <td className="py-2 px-2 text-center text-zinc-400">
                          {entry.ties}
                        </td>

                        {/* Derrotas */}
                        <td className="py-2 px-2 text-center text-zinc-400">
                          {entry.losses}
                        </td>

                        {/* GP */}
                        <td className="py-2 px-2 text-center text-zinc-400 hidden sm:table-cell">
                          {entry.goalsFor}
                        </td>

                        {/* GC */}
                        <td className="py-2 px-2 text-center text-zinc-400 hidden sm:table-cell">
                          {entry.goalsAgainst}
                        </td>

                        {/* SG */}
                        <td
                          className={`py-2 px-2.5 text-center font-bold ${
                            diffPositive
                              ? 'text-emerald-400'
                              : diffZero
                              ? 'text-zinc-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {diffPositive ? `+${entry.goalDifference}` : entry.goalDifference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="border-t border-zinc-800 bg-black/80 px-4 py-2.5 sm:px-6 font-mono text-[11px] text-zinc-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isBrasileirao ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span>1º-4º Libertadores (Fase Grupos)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                  <span>5º-6º Pré-Libertadores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  <span>7º-12º Sul-Americana</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>17º-20º Rebaixamento (Z-4)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span>1º-8º Oitavas Diretas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                  <span>9º-24º Play-offs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>25º-36º Eliminados</span>
                </div>
              </>
            )}
          </div>

          {lastUpdated && (
            <div className="text-[10px] text-zinc-500">
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
