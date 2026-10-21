/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Film,
  Sparkles,
  ExternalLink,
  Award,
  RefreshCw,
  Clock,
  Youtube,
  Tv,
} from 'lucide-react';
import { MatchData } from '../utils/soccer.ts';
import { TeamCrest } from './TeamCrest.tsx';

interface VideoHighlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchData;
}

interface HighlightResponse {
  title: string;
  headline: string;
  summary: string;
  youtubeEmbedUrl?: string | null;
  youtubeSearchUrl?: string;
  recommendedVideos?: Array<{
    title: string;
    channel: string;
    url: string;
    duration?: string;
  }>;
  goalsTimeline?: Array<{
    minute: string;
    player: string;
    team: string;
    description: string;
  }>;
  keyHighlights?: string[];
  playerOfTheMatch?: {
    name: string;
    team: string;
    reason: string;
  };
}

// In-memory stable cache to prevent repeated re-fetching when match updates in background
const highlightsCache = new Map<string, HighlightResponse>();

export const VideoHighlightsModal: React.FC<VideoHighlightsModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [data, setData] = useState<HighlightResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const matchKey = `${match.id}-${match.homeTeam.score ?? 0}-${match.awayTeam.score ?? 0}`;
  const isFetchingRef = useRef<boolean>(false);

  const fetchHighlights = async (forceRefresh = false) => {
    if (!forceRefresh && highlightsCache.has(matchKey)) {
      setData(highlightsCache.get(matchKey)!);
      setIsLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    const scoreString =
      match.homeTeam.score !== null && match.awayTeam.score !== null
        ? `${match.homeTeam.score} x ${match.awayTeam.score}`
        : 'Aguardando início';

    try {
      const response = await fetch('/api/gemini/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          score: scoreString,
          competition: match.leagueName,
          date: match.status.startTime,
          goals: match.goals,
          events: match.events,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      highlightsCache.set(matchKey, result);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load highlights:', err);
      // Construct fallback so modal never breaks
      const fallbackData: HighlightResponse = {
        title: `${match.homeTeam.name} x ${match.awayTeam.name}`,
        headline: `Cobertura dos lances e melhores momentos de ${match.homeTeam.shortName} x ${match.awayTeam.shortName}`,
        summary: `Acompanhe os melhores momentos oficiais e gols desta partida disputada pelo ${match.leagueName}. Assista aos vídeos oficiais nos canais autorizados.`,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${match.homeTeam.name} ${match.awayTeam.name} melhores momentos gols`
        )}`,
        recommendedVideos: [
          {
            title: `Gols e Melhores Momentos - ${match.homeTeam.name} x ${match.awayTeam.name}`,
            channel: 'CazéTV / GE Globo',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              `${match.homeTeam.name} ${match.awayTeam.name} melhores momentos`
            )}`,
          },
        ],
        keyHighlights: match.goals.map((g) => `${g.minute} - Gol marcado por ${g.player} (${g.teamName})`),
      };
      highlightsCache.set(matchKey, fallbackData);
      setData(fallbackData);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (highlightsCache.has(matchKey)) {
        setData(highlightsCache.get(matchKey)!);
        setIsLoading(false);
      } else {
        fetchHighlights();
      }
    }
  }, [isOpen, matchKey]);

  if (!isOpen) return null;

  const searchQuery = encodeURIComponent(
    `${match.homeTeam.name} ${match.awayTeam.name} melhores momentos gols`
  );
  const fallbackYoutubeUrl =
    data?.youtubeSearchUrl || `https://www.youtube.com/results?search_query=${searchQuery}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlights-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-800 bg-[#090d0b] shadow-2xl text-zinc-100 overflow-hidden ring-1 ring-emerald-500/20">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 sm:px-6 bg-black/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="highlights-modal-title"
                  className="text-base sm:text-lg font-black tracking-tight text-white font-mono"
                >
                  MELHORES MOMENTOS
                </h2>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-[#00ff87] border border-emerald-500/40 font-mono">
                  <Sparkles className="h-3 w-3" /> OFICIAL
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                {match.homeTeam.name} vs {match.awayTeam.name} • {match.leagueName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchHighlights(true)}
              disabled={isLoading}
              title="Recarregar melhores momentos"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#00ff87] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#00ff87]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Match Score Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <TeamCrest
                name={match.homeTeam.name}
                shortName={match.homeTeam.shortName}
                logoUrl={match.homeTeam.logo}
                size="sm"
              />
              <span className="font-bold text-sm text-white truncate">
                {match.homeTeam.name}
              </span>
            </div>

            <div className="flex flex-col items-center px-3 font-mono">
              <span className="text-xl sm:text-2xl font-black text-[#00ff87]">
                {match.homeTeam.score !== null ? match.homeTeam.score : 0} :{' '}
                {match.awayTeam.score !== null ? match.awayTeam.score : 0}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {match.status.detail || match.status.displayClock}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0 justify-end">
              <span className="font-bold text-sm text-white truncate text-right">
                {match.awayTeam.name}
              </span>
              <TeamCrest
                name={match.awayTeam.name}
                shortName={match.awayTeam.shortName}
                logoUrl={match.awayTeam.logo}
                size="sm"
              />
            </div>
          </div>

          {/* Loading State without layout flash */}
          {isLoading && !data && (
            <div className="space-y-4 py-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-[#00ff87]">
                <Sparkles className="h-7 w-7 animate-spin" />
              </div>
              <p className="text-sm font-bold text-white font-mono">
                Carregando melhores momentos e vídeos oficiais...
              </p>
            </div>
          )}

          {/* Highlights Content */}
          {data && (
            <div className="space-y-4">
              {/* Video Player Box */}
              {data.youtubeEmbedUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-lg">
                  <iframe
                    src={data.youtubeEmbedUrl}
                    title={data.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-tr from-black via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-6 text-center group">
                  <a
                    href={fallbackYoutubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 transition-transform duration-200 group-hover:scale-105"
                  >
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/30 group-hover:bg-rose-500 transition-colors ring-4 ring-rose-500/30">
                      <Play className="h-8 w-8 fill-white ml-1" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <span className="text-base sm:text-lg font-bold text-white font-sans block">
                        Assistir aos Melhores Momentos no YouTube
                      </span>
                      <p className="text-xs text-zinc-400">
                        Clique para assistir aos gols, defesas e lances capitais oficiais
                      </p>
                    </div>
                  </a>
                </div>
              )}

              {/* Direct Official Broadcast & Highlights Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `CazéTV ${match.homeTeam.name} ${match.awayTeam.name} melhores momentos`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold transition-all"
                >
                  <Youtube className="h-3.5 w-3.5 text-rose-500" />
                  <span>CazéTV</span>
                </a>
                <a
                  href={`https://ge.globo.com/busca/?q=${encodeURIComponent(
                    `${match.homeTeam.name} ${match.awayTeam.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold transition-all"
                >
                  <Tv className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Globo Esporte</span>
                </a>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `TNT Sports ${match.homeTeam.name} ${match.awayTeam.name} gols`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold transition-all col-span-2 sm:col-span-1"
                >
                  <Tv className="h-3.5 w-3.5 text-sky-400" />
                  <span>TNT Sports / ESPN</span>
                </a>
              </div>

              {/* Summary Story */}
              {data.summary && (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ff87] font-mono">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>RESUMO DO JOGO</span>
                  </div>
                  {data.headline && (
                    <h3 className="text-base font-bold text-white leading-snug">
                      {data.headline}
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {data.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-zinc-800/90 px-4 py-2.5 bg-black/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors font-mono"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
