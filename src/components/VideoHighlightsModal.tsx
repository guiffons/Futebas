/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  recommendedVideos: Array<{
    title: string;
    channel: string;
    url: string;
    duration?: string;
  }>;
  goalsTimeline: Array<{
    minute: string;
    player: string;
    team: string;
    description: string;
  }>;
  keyHighlights: string[];
  playerOfTheMatch?: {
    name: string;
    team: string;
    reason: string;
  };
}

export const VideoHighlightsModal: React.FC<VideoHighlightsModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [data, setData] = useState<HighlightResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = useCallback(async () => {
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
      setData(result);
    } catch (err: any) {
      console.error('Failed to load highlights:', err);
      setError('Não foi possível carregar os vídeos automaticamente.');
    } finally {
      setIsLoading(false);
    }
  }, [match]);

  useEffect(() => {
    if (isOpen) {
      fetchHighlights();
    } else {
      setData(null);
    }
  }, [isOpen, fetchHighlights]);

  if (!isOpen) return null;

  const searchQuery = encodeURIComponent(
    `${match.homeTeam.name} ${match.awayTeam.name} melhores momentos gols`
  );
  const fallbackYoutubeUrl =
    data?.youtubeSearchUrl || `https://www.youtube.com/results?search_query=${searchQuery}`;
  const geSearchUrl = `https://ge.globo.com/busca/?q=${encodeURIComponent(
    `${match.homeTeam.name} ${match.awayTeam.name}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlights-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
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
                  <Sparkles className="h-3 w-3" /> GEMINI AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Vídeos, gols e análise em vídeo de {match.homeTeam.name} x {match.awayTeam.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHighlights}
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
            {/* Home Team */}
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

            {/* Score */}
            <div className="flex flex-col items-center px-3 font-mono">
              <span className="text-xl sm:text-2xl font-black text-[#00ff87]">
                {match.homeTeam.score !== null ? match.homeTeam.score : 0} :{' '}
                {match.awayTeam.score !== null ? match.awayTeam.score : 0}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {match.status.detail || match.status.displayClock}
              </span>
            </div>

            {/* Away Team */}
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

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4 py-8 text-center animate-pulse">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-[#00ff87]">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white font-mono">
                  Buscando vídeos e compilando melhores momentos com Gemini...
                </p>
                <p className="text-xs text-zinc-400">
                  Localizando transmissões oficiais no YouTube, GE, CazéTV e TNT Sports
                </p>
              </div>
            </div>
          )}

          {/* Highlights Content */}
          {!isLoading && data && (
            <div className="space-y-4">
              {/* Video Player / Embed or Official Link Showcase */}
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
                  {/* Subtle stadium lights backdrop */}
                  <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

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
                        Clique para abrir a cobertura em vídeo com todos os gols e lances em alta definição
                      </p>
                    </div>
                  </a>
                </div>
              )}

              {/* Headline & Gemini Match Story */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ff87] font-mono">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>RESUMO DOS LANCES • IA GEMINI</span>
                </div>
                {data.headline && (
                  <h3 className="text-base font-bold text-white leading-snug">
                    {data.headline}
                  </h3>
                )}
                {data.summary && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {data.summary}
                  </p>
                )}
              </div>

              {/* Goals Timeline Breakdown */}
              {data.goalsTimeline && data.goalsTimeline.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      Minuto a Minuto dos Gols
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Lances Decisivos</span>
                  </div>

                  <div className="space-y-2">
                    {data.goalsTimeline.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-black/60 border border-zinc-800/80 text-xs"
                      >
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[#00ff87] font-mono font-bold text-xs shrink-0">
                          {g.minute}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-white font-sans">
                            {g.player}{' '}
                            <span className="text-zinc-400 font-normal">({g.team})</span>
                          </p>
                          <p className="text-zinc-400 text-[11px] font-sans">{g.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Player of the Match Spotlight */}
              {data.playerOfTheMatch && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-950 border border-emerald-500/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ff87]/20 text-[#00ff87] shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono block">
                      Craque da Partida
                    </span>
                    <p className="font-bold text-white text-sm">
                      {data.playerOfTheMatch.name}{' '}
                      <span className="text-zinc-400 font-normal">
                        ({data.playerOfTheMatch.team})
                      </span>
                    </p>
                    <p className="text-xs text-zinc-400 font-sans">
                      {data.playerOfTheMatch.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommended Video Links */}
              {data.recommendedVideos && data.recommendedVideos.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider block">
                    Canais e Vídeos Recomendados
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.recommendedVideos.map((vid, idx) => (
                      <a
                        key={idx}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-black/60 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Youtube className="h-4 w-4 text-rose-500 shrink-0" />
                          <div className="truncate text-left">
                            <p className="text-xs font-bold text-white group-hover:text-[#00ff87] truncate">
                              {vid.title}
                            </p>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {vid.channel} {vid.duration ? `• ${vid.duration}` : ''}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Hub Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={fallbackYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 px-3.5 py-2 text-xs font-bold text-rose-300 font-mono transition-all"
                >
                  <Youtube className="h-4 w-4 text-rose-400" />
                  <span>Ver no YouTube</span>
                </a>

                <a
                  href={geSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-[#00ff87] font-mono transition-all"
                >
                  <Tv className="h-4 w-4 text-emerald-400" />
                  <span>Ver no GE (Globo Esporte)</span>
                </a>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="p-6 text-center space-y-3 bg-zinc-950 rounded-xl border border-rose-500/30">
              <p className="text-sm text-rose-300 font-mono">{error}</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={fetchHighlights}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-black font-bold text-xs font-mono"
                >
                  Tentar Novamente
                </button>
                <a
                  href={fallbackYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-bold text-xs font-mono inline-flex items-center gap-1"
                >
                  <Youtube className="h-3.5 w-3.5 text-rose-400" />
                  Buscar no YouTube
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
