/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header.tsx';
import {
  CompetitionTabs,
  FilterStatus,
} from './components/CompetitionTabs.tsx';
import { MatchCard } from './components/MatchCard.tsx';
import { ApiSettingsModal } from './components/ApiSettingsModal.tsx';
import { StandaloneHtmlModal } from './components/StandaloneHtmlModal.tsx';
import { StandingsModal } from './components/StandingsModal.tsx';
import {
  MatchCalendarModal,
  DateFilterMode,
} from './components/MatchCalendarModal.tsx';
import {
  GoalNotificationToast,
  GoalAlert,
  playGoalChime,
} from './components/GoalNotificationToast.tsx';
import {
  MatchData,
  isMatchFavorite,
  toggleItemInList,
} from './utils/soccer.ts';
import {
  ApiConfig,
  DEFAULT_API_CONFIG,
  SIMULATED_MATCHES,
  SUPPORTED_LEAGUES,
  fetchEspnScores,
  fetchEspnScoresForDateMode,
  fetchRapidApiScores,
} from './services/soccerApi.ts';
import {
  NotificationSettings,
  getNotificationSettings,
  toggleMatchNotification,
  isMatchNotificationEnabled,
  sendBrowserNotification,
} from './utils/notifications.ts';
import {
  Search,
  Star,
  Loader2,
  Calendar,
} from 'lucide-react';

const POPULAR_TEAMS = [
  'Flamengo',
  'Palmeiras',
  'Real Madrid',
  'Manchester City',
  'Barcelona',
  'São Paulo',
  'Corinthians',
  'Liverpool',
  'Arsenal',
];

export default function App() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    return getNotificationSettings();
  });

  const [config, setConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem('soccer_api_config');
      return saved ? JSON.parse(saved) : DEFAULT_API_CONFIG;
    } catch {
      return DEFAULT_API_CONFIG;
    }
  });

  const [favoriteMatchIds, setFavoriteMatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('soccer_favorite_matches');
      return saved ? JSON.parse(saved) : ['sim-bra-1', 'sim-ucl-1'];
    } catch {
      return ['sim-bra-1', 'sim-ucl-1'];
    }
  });

  const [favoriteTeamNames, setFavoriteTeamNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('soccer_favorite_teams');
      return saved ? JSON.parse(saved) : ['Flamengo', 'Real Madrid'];
    } catch {
      return ['Flamengo', 'Real Madrid'];
    }
  });

  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateOption, setDateOption] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('today');
  const [customDateParam, setCustomDateParam] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(config.pollIntervalSec);
  const [goalAlert, setGoalAlert] = useState<GoalAlert | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState<boolean>(false);
  const [isStandingsOpen, setIsStandingsOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [standingsLeague, setStandingsLeague] = useState<string>('brasileirao');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  const prevScoresRef = useRef<Map<string, { home: number | null; away: number | null }>>(new Map());

  const handleToggleFavoriteMatch = (matchId: string) => {
    setFavoriteMatchIds((prev) => {
      const updated = toggleItemInList(prev, matchId);
      try {
        localStorage.setItem('soccer_favorite_matches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleFavoriteTeam = (teamName: string) => {
    setFavoriteTeamNames((prev) => {
      const updated = toggleItemInList(prev, teamName);
      try {
        localStorage.setItem('soccer_favorite_teams', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleNotification = (matchId: string) => {
    const isNowSubscribed = toggleMatchNotification(matchId);
    setNotificationSettings(getNotificationSettings());
    if (isNowSubscribed && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const loadMatches = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      if (isSimulated) {
        setTimeout(() => {
          setMatches((prevMatches) => {
            if (prevMatches.length === 0) return SIMULATED_MATCHES;
            return prevMatches.map((m) => {
              if (m.status.state === 'live') {
                const currentMin = parseInt(m.status.displayClock) || 70;
                const nextMin = currentMin >= 90 ? 90 : currentMin + 1;
                return {
                  ...m,
                  status: {
                    ...m.status,
                    displayClock: `${nextMin}' 2T`,
                  },
                };
              }
              return m;
            });
          });
          setIsLoading(false);
          setIsRefreshing(false);
        }, 120);
        return;
      }

      try {
        // Determine leagues to query - query all supported leagues
        const allLeaguesList = [
          'brasileirao',
          'champions',
          'premier',
          'la_liga',
          'libertadores',
          'copa_brasil',
          'serie_b',
          'serie_a_it',
          'bundesliga',
        ];
        const leaguesToQuery =
          activeTab !== 'all' && activeTab !== 'favorites'
            ? [activeTab, ...allLeaguesList.filter((l) => l !== activeTab)]
            : allLeaguesList;

        let combined: MatchData[] = [];

        if (config.provider === 'rapidapi' && config.rapidApiKey) {
          const results = await Promise.all(
            leaguesToQuery.map((lg) =>
              fetchRapidApiScores(lg as any, config.rapidApiKey!).catch(() => [])
            )
          );
          combined = results.flat();
        } else {
          const results = await Promise.all(
            leaguesToQuery.map((lg) =>
              fetchEspnScoresForDateMode(lg, dateFilterMode, customDateParam).catch(() => [])
            )
          );
          combined = results.flat();
        }

        // Deduplicate
        const seenIds = new Set<string>();
        const unique = combined.filter((m) => {
          if (seenIds.has(m.id)) return false;
          seenIds.add(m.id);
          return true;
        });

        // Track real goals silently for instant sound chime & alert
        unique.forEach((match) => {
          if (match.status.state === 'live' && match.homeTeam.score !== null && match.awayTeam.score !== null) {
            const prev = prevScoresRef.current.get(match.id);
            if (
              prev &&
              (match.homeTeam.score > (prev.home ?? 0) || match.awayTeam.score > (prev.away ?? 0))
            ) {
              const latestGoal = match.goals[match.goals.length - 1];
              const scorerName = latestGoal ? latestGoal.player : 'GOL';
              const minute = latestGoal ? latestGoal.minute : match.status.displayClock;
              const isHomeScorer = match.homeTeam.score > (prev.home ?? 0);
              const scoringTeam = isHomeScorer ? match.homeTeam.name : match.awayTeam.name;
              const teamLogo = isHomeScorer ? match.homeTeam.logo : match.awayTeam.logo;

              // Strictly notify ONLY if the user explicitly subscribed to this match or team
              const isSubscribedToMatch = notificationSettings.subscribedMatchIds.includes(match.id);
              const isSubscribedToTeam = notificationSettings.subscribedTeamNames.some((t) => {
                const norm = t.toLowerCase();
                return (
                  match.homeTeam.name.toLowerCase().includes(norm) ||
                  match.awayTeam.name.toLowerCase().includes(norm)
                );
              });
              const shouldNotify =
                notificationSettings.enabled && (isSubscribedToMatch || isSubscribedToTeam);

              if (shouldNotify) {
                setGoalAlert({
                  id: `goal-${match.id}-${Date.now()}`,
                  player: scorerName,
                  minute,
                  teamName: scoringTeam,
                  teamLogo,
                  score: `${match.homeTeam.score} x ${match.awayTeam.score}`,
                });

                if (soundEnabled) {
                  playGoalChime();
                }

                sendBrowserNotification(
                  `⚽ GOL! ${scoringTeam}`,
                  `${scorerName} aos ${minute}! Placar: ${match.homeTeam.score} x ${match.awayTeam.score}`,
                  teamLogo
                );
              }
            }
            prevScoresRef.current.set(match.id, {
              home: match.homeTeam.score,
              away: match.awayTeam.score,
            });
          }
        });

        if (unique.length === 0) {
          // Fallback to active rounds or simulated
          const fallbackResults = await Promise.all([
            fetchEspnScores('brasileirao').catch(() => []),
            fetchEspnScores('champions').catch(() => []),
            fetchEspnScores('premier').catch(() => []),
          ]);
          const roundMatches = fallbackResults.flat();
          if (roundMatches.length > 0) {
            setMatches(roundMatches);
          } else {
            setMatches(SIMULATED_MATCHES);
          }
        } else {
          setMatches(unique);
        }
        setLastUpdated(new Date());
      } catch {
        setMatches(SIMULATED_MATCHES);
        setLastUpdated(new Date());
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isSimulated, config, dateFilterMode, customDateParam, soundEnabled, activeTab]
  );

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Fast auto-refresh timer (silently in background without popups)
  useEffect(() => {
    if (!config.autoPolling) return;
    setSecondsLeft(config.pollIntervalSec);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          loadMatches(true);
          return config.pollIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.autoPolling, config.pollIntervalSec, loadMatches]);

  const handleSaveConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('soccer_api_config', JSON.stringify(newConfig));
    } catch {}
    loadMatches();
  };

  const handleDateOptionChange = (opt: 'yesterday' | 'today' | 'tomorrow') => {
    setDateOption(opt);
    setDateFilterMode(opt);
  };

  const handleSelectCalendarDate = (mode: DateFilterMode, dateParam?: string) => {
    setDateFilterMode(mode);
    if (dateParam) {
      setCustomDateParam(dateParam);
    }
    if (mode === 'yesterday') setDateOption('yesterday');
    else if (mode === 'tomorrow') setDateOption('tomorrow');
    else if (mode === 'today') setDateOption('today');
  };

  // Ensure every league selected displays games even when off-season or outside live broadcast hours
  const effectiveMatches = React.useMemo(() => {
    const list = [...matches];
    const presentLeagues = new Set(list.map((m) => m.leagueId));

    if (activeTab !== 'all' && activeTab !== 'favorites' && !presentLeagues.has(activeTab)) {
      const fallback = SIMULATED_MATCHES.filter((m) => m.leagueId === activeTab);
      return [...list, ...fallback];
    }
    return list;
  }, [matches, activeTab]);

  const filteredMatches = effectiveMatches.filter((match) => {
    if (activeTab === 'favorites') {
      const isFav = isMatchFavorite(match, favoriteMatchIds, favoriteTeamNames);
      if (!isFav) return false;
    } else if (activeTab !== 'all') {
      if (match.leagueId !== activeTab) {
        return false;
      }
    }

    if (statusFilter !== 'all' && match.status.state !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchHome = match.homeTeam.name.toLowerCase().includes(q);
      const matchAway = match.awayTeam.name.toLowerCase().includes(q);
      const matchLeague = match.leagueName.toLowerCase().includes(q);
      const matchScorer = match.goals.some((g) => g.player.toLowerCase().includes(q));
      if (!matchHome && !matchAway && !matchLeague && !matchScorer) {
        return false;
      }
    }

    return true;
  });

  const byLeagueCount: Record<string, number> = {};
  effectiveMatches.forEach((m) => {
    byLeagueCount[m.leagueId] = (byLeagueCount[m.leagueId] || 0) + 1;
  });

  const counts = {
    total: effectiveMatches.length,
    favorites: effectiveMatches.filter((m) => isMatchFavorite(m, favoriteMatchIds, favoriteTeamNames)).length,
    live: effectiveMatches.filter((m) => m.status.state === 'live').length,
    finished: effectiveMatches.filter((m) => m.status.state === 'finished').length,
    scheduled: effectiveMatches.filter((m) => m.status.state === 'scheduled').length,
    byLeague: byLeagueCount,
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-[#00ff87] selection:text-black">
      {/* Top Header */}
      <Header
        isPolling={config.autoPolling}
        secondsLeft={secondsLeft}
        isLoading={isLoading || isRefreshing}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStandaloneHtml={() => setIsStandaloneModalOpen(true)}
        onOpenStandings={() => {
          setStandingsLeague(activeTab !== 'all' && activeTab !== 'favorites' ? activeTab : 'brasileirao');
          setIsStandingsOpen(true);
        }}
        liveMatchCount={counts.live}
        lastUpdated={lastUpdated}
      />

      {/* Main Container - Generous padding on mobile for perfectly centered interface without overflowing borders */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 md:px-8 py-3.5 space-y-4 overflow-x-hidden min-w-0 box-border">
        {/* Navigation, Date Selector, Calendar & Integrated Responsive Search */}
        <CompetitionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          counts={counts}
          currentDateOption={dateOption}
          dateFilterMode={dateFilterMode}
          customDateParam={customDateParam}
          onDateChange={handleDateOptionChange}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenStandings={(league) => {
            setStandingsLeague(league || (activeTab !== 'all' && activeTab !== 'favorites' ? activeTab : 'brasileirao'));
            setIsStandingsOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Date Filter Status Strip */}
        {dateFilterMode !== 'today' && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00ff87]" />
              <span className="text-zinc-300">
                Visualizando jogos de:{' '}
                <strong className="text-[#00ff87]">
                  {dateFilterMode === 'yesterday'
                    ? 'Ontem'
                    : dateFilterMode === 'tomorrow'
                    ? 'Amanhã'
                    : dateFilterMode === 'last_week'
                    ? 'Últimos 7 dias'
                    : dateFilterMode === 'last_30_days'
                    ? 'Últimos 30 dias'
                    : dateFilterMode === 'next_week'
                    ? 'Próximos 7 dias'
                    : `Data selecionada: ${customDateParam.slice(6, 8)}/${customDateParam.slice(
                        4,
                        6
                      )}/${customDateParam.slice(0, 4)}`}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectCalendarDate('today')}
              className="text-emerald-400 hover:text-white font-bold underline text-[11px]"
            >
              Voltar para Hoje
            </button>
          </div>
        )}

        {/* Favorites Quick Chips */}
        {activeTab === 'favorites' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-zinc-400 font-semibold mr-1 flex items-center gap-1">
                <Star className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                Seguir Times:
              </span>
              {POPULAR_TEAMS.map((team) => {
                const isSelected = favoriteTeamNames.includes(team);
                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => handleToggleFavoriteTeam(team)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-black text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{team}</span>
                    <Star className={`h-2.5 w-2.5 ${isSelected ? 'fill-black text-black' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Sincronizando placares ao vivo...
            </p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isFavorite={isMatchFavorite(match, favoriteMatchIds, favoriteTeamNames)}
                onToggleFavorite={handleToggleFavoriteMatch}
                isNotified={notificationSettings.subscribedMatchIds.includes(match.id)}
                onToggleNotification={handleToggleNotification}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-2">
            <Star className="h-7 w-7 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-zinc-200 font-mono">
              {activeTab === 'favorites'
                ? 'Nenhum jogo favorito encontrado'
                : 'Nenhum jogo encontrado com os filtros atuais'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
              {activeTab === 'favorites'
                ? 'Clique na estrela de qualquer partida ou selecione um time acima para adicioná-lo aos favoritos.'
                : 'Tente alterar a data ou clicar em Calendário para selecionar os últimos 30 dias.'}
            </p>
          </div>
        )}
      </main>

      {/* Goal Notification Toast */}
      <GoalNotificationToast alert={goalAlert} onDismiss={() => setGoalAlert(null)} />

      {/* Match Calendar Modal */}
      <MatchCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentMode={dateFilterMode}
        customDate={customDateParam}
        onSelectDate={handleSelectCalendarDate}
      />

      {/* API Configuration Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Standings Modal */}
      <StandingsModal
        isOpen={isStandingsOpen}
        onClose={() => setIsStandingsOpen(false)}
        defaultLeague={standingsLeague as any}
      />

      {/* Standalone HTML Code Modal */}
      <StandaloneHtmlModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
      />

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-zinc-800/80 bg-black py-3 text-center text-[11px] text-zinc-500 font-mono">
        <span>FUTEBAS • PLACARES AO VIVO • TABELAS • ESCALAÇÕES • VÍDEOS • ATUALIZAÇÃO CONTÍNUA</span>
      </footer>
    </div>
  );
}
