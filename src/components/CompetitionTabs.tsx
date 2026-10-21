/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Columns,
  Trophy,
  Globe,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { MatchStatusState } from '../utils/soccer.ts';
import { DateFilterMode } from './MatchCalendarModal.tsx';

export type LeagueTab = 'all' | 'favorites' | 'champions' | 'brasileirao' | 'split';
export type FilterStatus = 'all' | MatchStatusState;

interface CompetitionTabsProps {
  activeTab: LeagueTab;
  onTabChange: (tab: LeagueTab) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  counts: {
    total: number;
    favorites: number;
    champions: number;
    brasileirao: number;
    live: number;
    finished: number;
    scheduled: number;
  };
  currentDateOption: 'yesterday' | 'today' | 'tomorrow';
  dateFilterMode?: DateFilterMode;
  customDateParam?: string;
  onDateChange: (date: 'yesterday' | 'today' | 'tomorrow') => void;
  onOpenStandings?: (league?: 'brasileirao' | 'champions') => void;
  onOpenCalendar?: () => void;
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
}) => {
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

  return (
    <div className="space-y-3">
      {/* Top Level: Leagues & Split View */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Campeonatos"
          className="flex items-center gap-1 overflow-x-auto rounded-xl bg-black p-1 border border-zinc-800 scrollbar-none font-mono text-xs"
        >
          {/* Favoritos */}
          <button
            type="button"
            onClick={() => onTabChange('favorites')}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400 hover:bg-zinc-900'
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

          {/* Todos */}
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
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

          {/* Champions League */}
          <button
            type="button"
            onClick={() => onTabChange('champions')}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'champions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-emerald-300" />
            <span>CHAMPIONS</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'champions'
                  ? 'bg-black/20 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {counts.champions}
            </span>
          </button>

          {/* Brasileirão Série A */}
          <button
            type="button"
            onClick={() => onTabChange('brasileirao')}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'brasileirao'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>BRASILEIRÃO</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'brasileirao'
                  ? 'bg-black/20 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {counts.brasileirao}
            </span>
          </button>

          {/* Split View */}
          <button
            type="button"
            onClick={() => onTabChange('split')}
            title="Exibir Champions e Brasileirão lado a lado"
            className={`hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all md:inline-flex ${
              activeTab === 'split'
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>LADO A LADO</span>
          </button>
        </nav>

        {/* Date Selector, Calendário & Tabela Button */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs flex-wrap">
          {onOpenStandings && (
            <button
              type="button"
              onClick={() => onOpenStandings(activeTab === 'champions' ? 'champions' : 'brasileirao')}
              title="Abrir tabela de classificação completa com pontos, vitórias e saldo de gols"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-[#00ff87] hover:bg-emerald-500/20 transition-all shadow-sm"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>TABELA</span>
            </button>
          )}

          {/* Quick Dates: Ontem, Hoje, Amanhã */}
          <div className="flex items-center gap-1 rounded-xl bg-black p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => onDateChange('yesterday')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
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
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                !isCalendarActive && currentDateOption === 'today'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => onDateChange('tomorrow')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                !isCalendarActive && currentDateOption === 'tomorrow'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Amanhã
            </button>

            {/* Calendário 30 Dias Button */}
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                title="Acessar calendário com últimos 30 dias, última semana e próximos dias"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                  isCalendarActive
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                    : 'bg-zinc-900/80 text-[#00ff87] border-zinc-800 hover:bg-zinc-800 hover:border-emerald-500/40'
                }`}
              >
                <CalendarIcon className="h-3 w-3" />
                <span>{getCalendarButtonLabel()}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`rounded-lg px-2.5 py-1 transition-colors ${
            statusFilter === 'all'
              ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          TODOS ({counts.total})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('live')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
            statusFilter === 'live'
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-emerald-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AO VIVO ({counts.live})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('finished')}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
            statusFilter === 'finished'
              ? 'bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          ENCERRADOS ({counts.finished})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('scheduled')}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
            statusFilter === 'scheduled'
              ? 'bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          <Clock className="h-3 w-3 text-zinc-400" />
          AGENDADOS ({counts.scheduled})
        </button>
      </div>
    </div>
  );
};
