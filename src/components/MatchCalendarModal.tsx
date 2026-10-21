/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

export type DateFilterMode =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'last_week'
  | 'last_30_days'
  | 'next_week'
  | 'custom';

interface MatchCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: DateFilterMode;
  customDate: string; // YYYYMMDD
  onSelectDate: (mode: DateFilterMode, dateParam?: string) => void;
}

export const MatchCalendarModal: React.FC<MatchCalendarModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  customDate,
  onSelectDate,
}) => {
  // Parse initial calendar month view based on customDate or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (customDate && customDate.length === 8) {
      const y = parseInt(customDate.slice(0, 4), 10);
      const m = parseInt(customDate.slice(4, 6), 10) - 1;
      const d = parseInt(customDate.slice(6, 8), 10);
      return new Date(y, m, d);
    }
    return new Date();
  });

  const [selectedDayString, setSelectedDayString] = useState<string>(() => {
    if (customDate && customDate.length === 8) return customDate;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  });

  if (!isOpen) return null;

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    const param = `${y}${m}${d}`;
    setSelectedDayString(param);
    onSelectDate('custom', param);
    onClose();
  };

  const handlePresetSelect = (mode: DateFilterMode) => {
    onSelectDate(mode);
    onClose();
  };

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(
      t.getDate()
    ).padStart(2, '0')}`;
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-800 bg-[#090d0b] shadow-2xl text-zinc-100 overflow-hidden ring-1 ring-emerald-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 sm:px-6 bg-black/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#00ff87]">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="calendar-modal-title"
                className="text-base sm:text-lg font-black tracking-tight text-white font-mono flex items-center gap-2"
              >
                CALENDÁRIO DE JOGOS
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Últimos 30 dias, última semana, hoje, amanhã ou data específica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar calendário"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Range Filter Presets */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/70 space-y-2">
          <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider block">
            Filtros Rápidos
          </span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => handlePresetSelect('today')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'today'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('yesterday')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'yesterday'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('tomorrow')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'tomorrow'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('last_week')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'last_week'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Última Semana
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('last_30_days')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'last_30_days'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Últimos 30 Dias
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('next_week')}
              className={`p-2 rounded-lg font-bold text-center border transition-all ${
                currentMode === 'next_week'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              Próximos 7 Dias
            </button>
          </div>
        </div>

        {/* Interactive Month Calendar Grid */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between font-mono">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-zinc-500">
            {weekDays.map((w, idx) => (
              <div key={idx} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 font-mono text-xs">
            {/* Empty slots before first day */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Days of month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const y = currentYear;
              const m = String(currentMonth + 1).padStart(2, '0');
              const d = String(day).padStart(2, '0');
              const dateStr = `${y}${m}${d}`;
              const isToday = dateStr === todayStr;
              const isSelected = currentMode === 'custom' && selectedDayString === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`p-2 rounded-lg font-bold transition-all relative flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#00ff87] text-black shadow-md ring-2 ring-white scale-105'
                      : isToday
                      ? 'bg-emerald-950 text-[#00ff87] border border-emerald-500/50 hover:bg-emerald-900'
                      : 'bg-zinc-950 text-zinc-300 border border-zinc-850 hover:border-emerald-500/40 hover:bg-zinc-900'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-[#00ff87] mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-4 py-3 bg-black/60 text-xs font-mono">
          <span className="text-zinc-400">
            Filtro ativo:{' '}
            <strong className="text-[#00ff87]">
              {currentMode === 'today'
                ? 'Hoje'
                : currentMode === 'yesterday'
                ? 'Ontem'
                : currentMode === 'tomorrow'
                ? 'Amanhã'
                : currentMode === 'last_week'
                ? 'Última Semana (7 dias)'
                : currentMode === 'last_30_days'
                ? 'Últimos 30 dias'
                : currentMode === 'next_week'
                ? 'Próximos 7 dias'
                : `Data: ${selectedDayString.slice(6, 8)}/${selectedDayString.slice(
                    4,
                    6
                  )}/${selectedDayString.slice(0, 4)}`}
            </strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
