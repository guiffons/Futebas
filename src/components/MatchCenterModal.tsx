/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Radio,
  Tv,
  BarChart2,
  Users,
  Film,
  Bell,
  BellRing,
  MapPin,
  Clock,
  Play,
  Pause,
  ExternalLink,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  Link as LinkIcon,
  Search,
  Maximize2,
} from 'lucide-react';
import { MatchData, deriveMatchLineups } from '../utils/soccer.ts';
import { TeamCrest } from './TeamCrest.tsx';
import { TacticalPitch } from './TacticalPitch.tsx';
import { MatchStatsView } from './MatchStats.tsx';
import { LiveMatchRadar } from './LiveMatchRadar.tsx';

interface MatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchData;
  isNotified: boolean;
  onToggleNotification: (matchId: string) => void;
  onOpenVideos?: () => void;
}

type TabType = 'radar' | 'stream' | 'stats' | 'lineups';

interface RadioStation {
  id: string;
  name: string;
  city: string;
  streamUrl: string;
  directWebUrl: string;
  badge: string;
}

const BRAZILIAN_RADIOS: RadioStation[] = [
  {
    id: 'jovem-pan',
    name: 'Jovem Pan Esportes',
    city: 'São Paulo',
    streamUrl: 'https://stream.zeno.fm/f9wuvp16wzquv',
    directWebUrl: 'https://jovempan.com.br/radio-ao-vivo',
    badge: 'JP',
  },
  {
    id: 'bandeirantes',
    name: 'Rádio Bandeirantes',
    city: 'São Paulo',
    streamUrl: 'https://stream.zeno.fm/2vkgbkmw88zuv',
    directWebUrl: 'https://radios.eband.com.br/bandeirantes',
    badge: 'BAND',
  },
  {
    id: 'cbn-sp',
    name: 'CBN Grandes Jogos',
    city: 'Brasil',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CBN_SPAAC.aac',
    directWebUrl: 'https://cbn.globo.com/ao-vivo/',
    badge: 'CBN',
  },
  {
    id: 'bandnews',
    name: 'BandNews FM',
    city: 'Rede Nacional',
    streamUrl: 'https://stream.zeno.fm/k2k2h9bmdg8uv',
    directWebUrl: 'https://radios.eband.com.br/bandnewsfm',
    badge: 'BN',
  },
  {
    id: 'itatiaia',
    name: 'Rádio Itatiaia',
    city: 'Belo Horizonte',
    streamUrl: 'https://stream.zeno.fm/q1wcvb9mdg8uv',
    directWebUrl: 'https://www.itatiaia.com.br/ao-vivo',
    badge: 'ITA',
  },
  {
    id: 'grenal',
    name: 'Rádio Grenal',
    city: 'Porto Alegre',
    streamUrl: 'https://stream.zeno.fm/5475e219r8zuv',
    directWebUrl: 'https://www.radiogrenal.com.br/',
    badge: 'GRE',
  },
];

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  isOpen,
  onClose,
  match,
  isNotified,
  onToggleNotification,
  onOpenVideos,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [lineupViewMode, setLineupViewMode] = useState<'pitch' | 'list'>('pitch');

  // Streaming Hub State
  const [streamSource, setStreamSource] = useState<'caze_tv' | 'rede_canais' | 'custom' | 'radio'>('caze_tv');
  const [customStreamUrl, setCustomStreamUrl] = useState<string>('');
  const [activeCustomEmbed, setActiveCustomEmbed] = useState<string>('');

  // Audio Radio Player State
  const [activeRadio, setActiveRadio] = useState<RadioStation | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const isLive = match.status.state === 'live';
  const isFinished = match.status.state === 'finished';
  const isScheduled = match.status.state === 'scheduled';

  const lineups =
    match.lineups ||
    deriveMatchLineups(
      match.id,
      match.homeTeam.name,
      match.awayTeam.name,
      match.status.state
    );

  const hasOfficialLineups =
    !isScheduled ||
    match.hasOfficialLineups === true ||
    (lineups?.home?.starters?.length ?? 0) > 0;

  // Search queries for streaming platforms
  const matchCleanName = `${match.homeTeam.name} x ${match.awayTeam.name}`;
  const liveSearchQuery = encodeURIComponent(`${matchCleanName} ao vivo CazéTV`);
  const redeCanaisSearchQuery = encodeURIComponent(`${match.homeTeam.name} x ${match.awayTeam.name}`);
  const multicanaisSearchQuery = encodeURIComponent(`${match.homeTeam.name}`);

  // Radio toggle handler
  const handleToggleRadio = (station: RadioStation) => {
    setRadioError(null);
    if (activeRadio?.id === station.id && isRadioPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsRadioPlaying(false);
    } else {
      setActiveRadio(station);
      setIsRadioPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio playback error:', err);
            setIsRadioPlaying(false);
            setRadioError(`A política de mídia do navegador pausou o áudio direto de ${station.name}. Clique no botão abaixo para abrir o reprodutor web oficial.`);
          });
        }
      }
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStreamUrl.trim()) {
      setActiveCustomEmbed(customStreamUrl.trim());
      setStreamSource('custom');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-center-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-[#070b09] shadow-2xl text-zinc-100 overflow-hidden ring-1 ring-emerald-500/30">
        {/* Hidden Audio Element for Live Brazilian Sports Radio */}
        <audio
          ref={audioRef}
          muted={isRadioMuted}
          onEnded={() => setIsRadioPlaying(false)}
          onError={() => setIsRadioPlaying(false)}
        />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 bg-black/80">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#00ff87] bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
              {match.leagueName}
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              • Central da Partida
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => onToggleNotification(match.id)}
              title={
                isNotified
                  ? 'Notificações ativadas para este jogo (clique para desativar)'
                  : 'Receber notificação quando sair gol ou lance capital'
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                isNotified
                  ? 'bg-emerald-500/20 text-[#00ff87] border-emerald-500/50 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {isNotified ? (
                <>
                  <BellRing className="h-3.5 w-3.5 text-[#00ff87] animate-bounce" />
                  <span>NOTIFICANDO</span>
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5" />
                  <span>NOTIFICAR GOLS</span>
                </>
              )}
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                onClose();
              }}
              aria-label="Fechar"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Match Header Score Banner */}
        <div className="border-b border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 max-w-2xl mx-auto">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
              <TeamCrest
                name={match.homeTeam.name}
                shortName={match.homeTeam.shortName}
                logoUrl={match.homeTeam.logo}
                size="md"
              />
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-full">
                {match.homeTeam.name}
              </span>
            </div>

            {/* Central Score or Time */}
            <div className="flex flex-col items-center justify-center px-2">
              {!isScheduled && match.homeTeam.score !== null && match.awayTeam.score !== null ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#00ff87]">
                      {match.homeTeam.score}
                    </span>
                    <span className="text-xl font-bold text-emerald-500">:</span>
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#00ff87]">
                      {match.awayTeam.score}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono mt-0.5 font-bold">
                    {isLive ? `AO VIVO ${match.status.displayClock}` : 'ENCERRADO'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm sm:text-base font-black text-[#00ff87] font-mono bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-xl">
                    {match.status.displayClock || 'AGENDADO'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1">
                    Horário de Brasília
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
              <TeamCrest
                name={match.awayTeam.name}
                shortName={match.awayTeam.shortName}
                logoUrl={match.awayTeam.logo}
                size="md"
              />
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-full">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Venue */}
          {match.venue && (
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mt-2 font-mono">
              <MapPin className="h-3 w-3 text-zinc-500" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800/80 bg-black/60 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'radar'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>RADAR & LANCES AO VIVO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'stream'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            <span>ASSISTIR NA TELA</span>
            <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">
              AO VIVO
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>ESTATÍSTICAS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lineups')}
            className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'lineups'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>ESCALAÇÃO</span>
          </button>

          {onOpenVideos && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVideos();
              }}
              className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 font-bold transition-all ml-auto"
            >
              <Film className="h-3.5 w-3.5 text-rose-400" />
              <span>MELHORES MOMENTOS</span>
            </button>
          )}
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: RADAR & LANCES */}
          {activeTab === 'radar' && (
            <LiveMatchRadar match={match} onOpenVideos={onOpenVideos} />
          )}

          {/* TAB 2: ASSISTIR NA TELA - REDE CANAIS & MULTI-STREAMING HUB */}
          {activeTab === 'stream' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Channel Selector Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Tv className="h-4 w-4 text-[#00ff87]" />
                    SELECIONAR SINAL DE TRANSMISSÃO:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStreamSource('caze_tv')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
                      streamSource === 'caze_tv'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    CazéTV / Oficial
                  </button>

                  <button
                    type="button"
                    onClick={() => setStreamSource('rede_canais')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
                      streamSource === 'rede_canais'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                        : 'bg-zinc-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10'
                    }`}
                  >
                    ⚡ Rede Canais
                  </button>

                  <button
                    type="button"
                    onClick={() => setStreamSource('radio')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
                      streamSource === 'radio'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    🎙️ Rádio Ao Vivo
                  </button>

                  <button
                    type="button"
                    onClick={() => setStreamSource('custom')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
                      streamSource === 'custom'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    🔗 URL Própria
                  </button>
                </div>
              </div>

              {/* ACTIVE STREAM PLAYER DISPLAY */}
              {streamSource === 'caze_tv' && (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed?listType=search&list=${liveSearchQuery}`}
                      title={`Transmissão CazéTV ${matchCleanName}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      Player Oficial CazéTV e Transmissões YouTube Nativas
                    </span>
                    <a
                      href={`https://www.youtube.com/results?search_query=${liveSearchQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ff87] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Abrir no YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* REDE CANAIS INTEGRATION */}
              {streamSource === 'rede_canais' && (
                <div className="space-y-4">
                  {/* Rede Canais Banner & Direct Match Search */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-[#06140c] p-4 sm:p-5 space-y-3 shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-black bg-[#00ff87] px-2 py-0.5 rounded font-mono">
                            REDE CANAIS HD
                          </span>
                          <span className="text-xs font-bold text-white font-mono">
                            Transmissão Direta do Jogo
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 font-sans">
                          Acompanhe {matchCleanName} ao vivo através dos canais de futebol online do Rede Canais e Multicanais.
                        </p>
                      </div>

                      <a
                        href={`https://redecanais.la/?s=${redeCanaisSearchQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-2 text-xs font-mono font-black transition-all shrink-0 shadow-md"
                      >
                        <span>ABRIR NO REDE CANAIS</span>
                        <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
                      </a>
                    </div>

                    {/* Quick Channels Grid for this Match */}
                    <div className="pt-2 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      <a
                        href={`https://redecanais.la/?s=${encodeURIComponent('Premiere')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-emerald-500 text-zinc-200 transition-all text-center"
                      >
                        <span className="font-bold text-white">Canal Premiere</span>
                        <span className="text-[10px] text-emerald-400">Sinal 1 & 2 HD</span>
                      </a>

                      <a
                        href={`https://redecanais.la/?s=${encodeURIComponent('SporTV')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-emerald-500 text-zinc-200 transition-all text-center"
                      >
                        <span className="font-bold text-white">SporTV Ao Vivo</span>
                        <span className="text-[10px] text-emerald-400">Brasileirão & Copa</span>
                      </a>

                      <a
                        href={`https://redecanais.la/?s=${encodeURIComponent('ESPN')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-emerald-500 text-zinc-200 transition-all text-center"
                      >
                        <span className="font-bold text-white">ESPN / Star+</span>
                        <span className="text-[10px] text-emerald-400">Premier & LaLiga</span>
                      </a>

                      <a
                        href={`https://redecanais.la/?s=${encodeURIComponent('TNT')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-emerald-500 text-zinc-200 transition-all text-center"
                      >
                        <span className="font-bold text-white">TNT Sports</span>
                        <span className="text-[10px] text-emerald-400">Champions League</span>
                      </a>
                    </div>
                  </div>

                  {/* Sandboxed Web Player Screen */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed?listType=search&list=${liveSearchQuery}`}
                      title={`Stream Rede Canais ${matchCleanName}`}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                    <div className="absolute bottom-2 right-2 z-10 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
                      Sinal Redirecionado Anti-Lag
                    </div>
                  </div>
                </div>
              )}

              {/* RÁDIO AO VIVO (AUDIO SEM DELAY) */}
              {streamSource === 'radio' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-[#00ff87] animate-pulse" />
                        <div>
                          <h3 className="font-mono font-bold text-sm text-white">
                            RÁDIOS ESPORTIVAS BRASIL • ZERO DELAY
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans">
                            Ouça a emoção do gol em tempo real sem atraso de imagem
                          </p>
                        </div>
                      </div>

                      {activeRadio && isRadioPlaying && (
                        <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-[#00ff87]">
                          <span className="h-2 w-2 rounded-full bg-[#00ff87] animate-ping" />
                          <span>AO VIVO: {activeRadio.name}</span>
                          <span className="ml-1 text-[10px] text-zinc-400">({activeRadio.city})</span>
                        </div>
                      )}
                    </div>

                    {/* Radio Error Notification with Direct Link Fallback */}
                    {radioError && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-amber-200">{radioError}</span>
                        {activeRadio && (
                          <a
                            href={activeRadio.directWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold shrink-0 transition-colors"
                          >
                            <span>Ouvir no Site Oficial</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Radio Stations Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {BRAZILIAN_RADIOS.map((station) => {
                        const isCurrent = activeRadio?.id === station.id && isRadioPlaying;
                        return (
                          <div
                            key={station.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                                : 'bg-black border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-[#00ff87] shrink-0">
                                {station.badge}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-white text-xs block font-sans truncate">
                                  {station.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono block truncate">
                                  {station.city} • Transmissão Oficial
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {/* Direct External Web Link */}
                              <a
                                href={station.directWebUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir página oficial da rádio"
                                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>

                              {/* Play / Pause Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleRadio(station)}
                                className={`px-2.5 py-2 rounded-xl transition-all font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#00ff87] text-black shadow-lg shadow-emerald-500/20'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                }`}
                              >
                                {isCurrent ? (
                                  <>
                                    <Pause className="h-3.5 w-3.5" />
                                    <span>PAUSAR</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5" />
                                    <span>OUVIR</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM URL STREAM PLAYER */}
              {streamSource === 'custom' && (
                <div className="space-y-4">
                  <form
                    onSubmit={handleApplyCustomUrl}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                  >
                    <label className="text-xs font-mono font-bold text-zinc-200 block uppercase">
                      Colar Link de Vídeo ou Stream (M3U8 / YouTube / Embed)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="url"
                          placeholder="https://exemplo.com/stream.m3u8 ou link do player..."
                          value={customStreamUrl}
                          onChange={(e) => setCustomStreamUrl(e.target.value)}
                          className="w-full rounded-xl bg-black border border-zinc-800 pl-9 pr-3 py-2 text-xs text-emerald-400 font-mono placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition-all shadow-sm"
                      >
                        CARREGAR
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Você pode colar links diretos de streaming IPTV, URLs .m3u8 ou links de reprodutor para assistir diretamente no Futebas.
                    </p>
                  </form>

                  {activeCustomEmbed ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                      <iframe
                        src={activeCustomEmbed}
                        title="Stream Customizado"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-2">
                      <Tv className="h-7 w-7 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400 font-mono">
                        Cole uma URL de transmissão acima para carregar o reprodutor nesta tela.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Multicanais / Futemax / Plataformas Oficiais */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
                    <Globe className="h-4 w-4 text-[#00ff87]" />
                    <span>OUTRAS OPÇÕES PARA ASSISTIR:</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Acesso rápido em 1 clique
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <a
                    href={`https://ge.globo.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-emerald-500/50 text-white font-bold transition-all text-center"
                  >
                    <span>GE Globo</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </a>

                  <a
                    href="https://premiere.globo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-emerald-500/50 text-white font-bold transition-all text-center"
                  >
                    <span>Premiere Play</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </a>

                  <a
                    href="https://www.max.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-emerald-500/50 text-white font-bold transition-all text-center"
                  >
                    <span>Max / TNT</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </a>

                  <a
                    href="https://www.disneyplus.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-emerald-500/50 text-white font-bold transition-all text-center"
                  >
                    <span>Disney+ / ESPN</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATS */}
          {activeTab === 'stats' && (
            <div>
              {match.stats ? (
                <MatchStatsView
                  stats={match.stats}
                  homeName={match.homeTeam.shortName || match.homeTeam.name}
                  awayName={match.awayTeam.shortName || match.awayTeam.name}
                />
              ) : (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  Estatísticas estarão disponíveis assim que a bola rolar.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESCALAÇÕES */}
          {activeTab === 'lineups' && (
            <div className="space-y-3 font-mono text-xs">
              {hasOfficialLineups ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Escalações Confirmadas
                    </span>
                    <div className="flex items-center rounded-lg bg-black p-0.5 border border-zinc-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setLineupViewMode('pitch')}
                        className={`px-2.5 py-1 rounded font-bold transition-all ${
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
                        className={`px-2.5 py-1 rounded font-bold transition-all ${
                          lineupViewMode === 'list'
                            ? 'bg-emerald-500 text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Lista
                      </button>
                    </div>
                  </div>

                  {lineupViewMode === 'pitch' ? (
                    <TacticalPitch
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      lineups={lineups}
                      matchEvents={match.events}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-[#00ff87] tracking-wider block mb-1">
                            {match.homeTeam.name} • 11 Titulares ({lineups.home.formation || '4-3-3'})
                          </span>
                          {lineups.home.starters.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 p-1 rounded-lg bg-black/40 border border-zinc-850">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0">
                                {p.photo ? (
                                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center justify-center h-full">
                                    {p.jersey}
                                  </span>
                                )}
                              </div>
                              <span className="w-4 text-center font-bold text-zinc-500 text-[10px] font-mono">
                                {p.jersey}
                              </span>
                              <span className="text-zinc-200 font-sans truncate font-medium">{p.name}</span>
                              <span className="text-[9px] text-[#00ff87] bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30 ml-auto shrink-0 font-mono font-bold">
                                {p.position}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider block mb-1">
                            {match.awayTeam.name} • 11 Titulares ({lineups.away.formation || '4-3-3'})
                          </span>
                          {lineups.away.starters.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 p-1 rounded-lg bg-black/40 border border-zinc-850">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0">
                                {p.photo ? (
                                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center justify-center h-full">
                                    {p.jersey}
                                  </span>
                                )}
                              </div>
                              <span className="w-4 text-center font-bold text-zinc-500 text-[10px] font-mono">
                                {p.jersey}
                              </span>
                              <span className="text-zinc-200 font-sans truncate font-medium">{p.name}</span>
                              <span className="text-[9px] text-zinc-300 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 ml-auto shrink-0 font-mono font-bold">
                                {p.position}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 px-4 text-center bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <Clock className="h-6 w-6 text-zinc-500 mx-auto" />
                  <p className="text-xs font-bold text-zinc-300 font-sans">
                    Escalação oficial ainda não divulgada
                  </p>
                  <p className="text-[11px] text-zinc-500 font-sans max-w-sm mx-auto">
                    Os clubes disponibilizam os 11 titulares cerca de 1 hora antes do início da partida.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-zinc-800/90 px-4 py-2.5 bg-black/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            {isLive ? '🔴 Transmissão & Lances Sincronizados' : '⚪ Futebas Match Center'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors font-mono"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
