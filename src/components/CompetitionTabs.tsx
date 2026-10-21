/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Trophy,
  Globe,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { MatchStatusState } from '../utils/soccer.ts';
import { DateFilterMode } from './MatchCalendarModal.tsx';

export type LeagueTab = string;
export type FilterStatus = 'all' | MatchStatusState;

interface CompetitionTabsProps {
  activeTab: LeagueTab;
  onTabChange: (tab: LeagueTab) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  counts: {
    total: number;
    favorites: number;
    live: number;
    finished: number;
    scheduled: number;
    byLeague: Record<string, number>;
  };
  currentDateOption: 'yesterday' | 'today' | 'tomorrow';
  dateFilterMode?: DateFilterMode;
  customDateParam?: string;
  onDateChange: (date: 'yesterday' | 'today' | 'tomorrow') => void;
  onOpenStandings?: (league?: string) => void;
  onOpenCalendar?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CompetitionTabs: React.FC<CompetitionTabsProps> = ({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  counts,
  currentDateOption,
  dateFilterMode = 'today',
  customDateParam = '',
  onDateChange,
  onOpenStandings,
  onOpenCalendar,
  searchQuery,
  onSearchChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollLeagues = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 250);
    }
  };

  const getCalendarButtonLabel = () => {
    if (dateFilterMode === 'last_week') return '7 Dias';
    if (dateFilterMode === 'last_30_days') return '30 Dias';
    if (dateFilterMode === 'next_week') return '+7 Dias';
    if (dateFilterMode === 'custom' && customDateParam.length === 8) {
      return `${customDateParam.slice(6, 8)}/${customDateParam.slice(4, 6)}`;
    }
    return 'Calendário';
  };

  const isCalendarActive =
    dateFilterMode === 'last_week' ||
    dateFilterMode === 'last_30_days' ||
    dateFilterMode === 'next_week' ||
    dateFilterMode === 'custom';

  const ALL_LEAGUES = [
    { id: 'brasileirao', label: 'Brasileirão A', icon: Shield, country: 'BRA' },
    { id: 'serie_b', label: 'Série B', icon: Shield, country: 'BRA' },
    { id: 'copa_brasil', label: 'Copa do Brasil', icon: Trophy, country: 'BRA' },
    { id: 'libertadores', label: 'Libertadores', icon: Trophy, country: 'CON' },
    { id: 'champions', label: 'Champions League', icon: Trophy, country: 'UEFA' },
    { id: 'premier', label: 'Premier League', icon: Trophy, country: 'ING' },
    { id: 'la_liga', label: 'La Liga', icon: Trophy, country: 'ESP' },
    { id: 'serie_a_it', label: 'Serie A (Itália)', icon: Trophy, country: 'ITA' },
    { id: 'bundesliga', label: 'Bundesliga', icon: Trophy, country: 'ALE' },
  ];

  return (
    <div className="w-full space-y-2.5">
      {/* 1. TOP CAROUSEL: LIGAS & CAMPEONATOS COM SETAS DEDICADAS (NUNCA SOBREPÕEM OS NOMES) */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollLeagues('left')}
          disabled={!canScrollLeft}
          aria-label="Rolar ligas para a esquerda"
          title="Rolar ligas para a esquerda"
          className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
            canScrollLeft
              ? 'bg-zinc-900 text-[#00ff87] border-zinc-700 hover:bg-emerald-500 hover:text-black cursor-pointer shadow-md'
              : 'bg-zinc-950 text-zinc-700 border-zinc-900/60 cursor-not-allowed opacity-30'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Leagues Container */}
        <nav
          ref={scrollContainerRef}
          onScroll={checkScroll}
          aria-label="Menu de Campeonatos de Futebol"
          className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto rounded-xl bg-zinc-950 p-1.5 border border-zinc-800 font-mono text-xs scrollbar-none transition-colors px-2"
        >
          {/* FAVORITOS */}
          <button
            type="button"
            onClick={() => onTabChange('favorites')}
            title="Ver jogos dos meus times e partidas favoritas"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-950/40'
                : 'text-emerald-400 bg-black border-zinc-800/80 hover:bg-zinc-900 hover:border-emerald-500/40 hover:text-emerald-300'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                activeTab === 'favorites' ? 'fill-black' : 'fill-emerald-400 text-emerald-400'
              }`}
            />
            <span>FAVORITOS</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'favorites'
                  ? 'bg-black/20 text-black'
                  : 'bg-zinc-900 text-emerald-400 border border-zinc-800'
              }`}
            >
              {counts.favorites}
            </span>
          </button>

          {/* TODOS OS JOGOS */}
          <button
            type="button"
            onClick={() => onTabChange('all')}
            title="Ver todas as partidas de todas as ligas"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-md'
                : 'text-zinc-400 bg-black border-zinc-800/80 hover:bg-zinc-900 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>TODOS</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'all'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {counts.total}
            </span>
          </button>

          {/* CADA LIGA */}
          {ALL_LEAGUES.map((lg) => {
            const count = counts.byLeague[lg.id] || 0;
            const isSel = activeTab === lg.id;
            const Icon = lg.icon;
            return (
              <button
                key={lg.id}
                type="button"
                onClick={() => onTabChange(lg.id)}
                title={`Ver jogos da ${lg.label}`}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
                  isSel
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/50'
                    : 'bg-black text-zinc-400 border-zinc-800/80 hover:bg-zinc-900 hover:text-[#00ff87] hover:border-emerald-500/50 hover:shadow-sm'
                }`}
              >
                <Icon className={`h-3 w-3 ${isSel ? 'text-white' : 'text-emerald-400'}`} />
                <span className="whitespace-nowrap">{lg.label.toUpperCase()}</span>
                {count > 0 && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      isSel
                        ? 'bg-black/20 text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollLeagues('right')}
          disabled={!canScrollRight}
          aria-label="Rolar ligas para a direita"
          title="Rolar ligas para a direita"
          className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
            canScrollRight
              ? 'bg-zinc-900 text-[#00ff87] border-zinc-700 hover:bg-emerald-500 hover:text-black cursor-pointer shadow-md'
              : 'bg-zinc-950 text-zinc-700 border-zinc-900/60 cursor-not-allowed opacity-30'
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 2. SUB-ROW RESPONSIVA: FILTROS DE STATUS + DATAS + BUSCA (TOTALMENTE INTEGRADA NA TELA) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 w-full max-w-full min-w-0">
        {/* Status Filter Chips & Dates Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono w-full md:w-auto min-w-0">
          {/* Status Chips */}
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`rounded-lg px-2.5 py-1.5 transition-all border ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white font-bold border-zinc-600 shadow-sm'
                : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            TODOS ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('live')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all border ${
              statusFilter === 'live'
                ? 'bg-emerald-500/20 text-[#00ff87] font-bold border-emerald-500 shadow-sm'
                : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-emerald-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff87]" />
            </span>
            <span>AO VIVO ({counts.live})</span>
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('finished')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all border ${
              statusFilter === 'finished'
                ? 'bg-zinc-800 text-zinc-100 font-bold border-zinc-600'
                : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>ENCERRADOS ({counts.finished})</span>
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('scheduled')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all border ${
              statusFilter === 'scheduled'
                ? 'bg-zinc-800 text-zinc-100 font-bold border-zinc-600'
                : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Clock className="h-3 w-3 text-zinc-400" />
            <span>AGENDADOS ({counts.scheduled})</span>
          </button>

          {/* Separator */}
          <span className="hidden lg:inline text-zinc-700">|</span>

          {/* Quick Dates: Ontem, Hoje, Amanhã */}
          <div className="flex items-center gap-0.5 rounded-xl bg-black p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => onDateChange('yesterday')}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                !isCalendarActive && currentDateOption === 'yesterday'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => onDateChange('today')}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                !isCalendarActive && currentDateOption === 'today'
                  ? 'bg-emerald-500/20 text-[#00ff87] font-bold border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => onDateChange('tomorrow')}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                !isCalendarActive && currentDateOption === 'tomorrow'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Amanhã
            </button>

            {/* Calendário Button */}
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                title="Acessar calendário de jogos"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all border ${
                  isCalendarActive
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                    : 'bg-zinc-900 text-[#00ff87] border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <CalendarIcon className="h-3 w-3" />
                <span>{getCalendarButtonLabel()}</span>
              </button>
            )}
          </div>

          {/* Tabela Button */}
          {onOpenStandings && (
            <button
              type="button"
              onClick={() => onOpenStandings(activeTab)}
              title="Abrir tabela de classificação da competição"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-[#00ff87] hover:bg-emerald-500/20 transition-all shadow-sm"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>TABELA</span>
            </button>
          )}
        </div>

        {/* CAMPO DE BUSCA RESPONSIVO (NUNCA SAI DA TELA / 100% RESPONSIVO) */}
        <div className="relative w-full md:w-64 lg:w-72 max-w-full min-w-0 font-mono">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar time, gol, liga..."
            className="w-full box-border rounded-xl bg-black border border-zinc-800 pl-8 pr-7 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white p-0.5"
              title="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
