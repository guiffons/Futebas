/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MatchData,
  GoalScorer,
  MatchStats,
  StandingEntry,
  MatchLineups,
  normalizeMatchStatus,
  extractGoalsFromEspnDetails,
  extractEventsFromEspnDetails,
  extractMatchStats,
  deriveMatchStats,
  extractLineupsFromEspnSummary,
  deriveMatchLineups,
} from '../utils/soccer.ts';
import { getOfficialLogoUrl } from '../utils/teamBadges.ts';

export interface ApiConfig {
  provider: 'espn' | 'rapidapi' | 'demo';
  rapidApiKey?: string;
  autoPolling: boolean;
  pollIntervalSec: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'espn',
  rapidApiKey: '',
  autoPolling: true,
  pollIntervalSec: 15,
};

// Fallback high-fidelity sample matches when leagues are in off-season, between rounds, or in simulation mode
export const SIMULATED_MATCHES: MatchData[] = [
  {
    id: 'sim-ucl-1',
    leagueId: 'champions',
    leagueName: 'UEFA Champions League',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    homeTeam: {
      id: '86',
      name: 'Real Madrid',
      shortName: 'RMA',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
      score: 2,
    },
    awayTeam: {
      id: '382',
      name: 'Manchester City',
      shortName: 'MCI',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
      score: 1,
    },
    status: {
      state: 'live',
      rawState: 'in',
      displayClock: "68' 2T",
      detail: '68º Minuto',
      startTime: new Date().toISOString(),
    },
    venue: 'Santiago Bernabéu, Madrid',
    goals: [
      {
        id: 'g-sim-1',
        player: 'Vinícius Júnior',
        minute: "24'",
        teamId: '86',
        teamName: 'Real Madrid',
        isPenalty: false,
      },
      {
        id: 'g-sim-2',
        player: 'Erling Haaland',
        minute: "41'",
        teamId: '382',
        teamName: 'Manchester City',
        isPenalty: false,
      },
      {
        id: 'g-sim-3',
        player: 'Jude Bellingham',
        minute: "63'",
        teamId: '86',
        teamName: 'Real Madrid',
        isPenalty: false,
      },
    ],
    events: [
      {
        id: 'ev-sim-1',
        type: 'goal',
        player: 'Vinícius Júnior',
        minute: "24'",
        teamId: '86',
        detail: 'Gol',
      },
      {
        id: 'ev-sim-2',
        type: 'yellow_card',
        player: 'Rodri',
        minute: "35'",
        teamId: '382',
        detail: 'Cartão Amarelo',
      },
      {
        id: 'ev-sim-3',
        type: 'goal',
        player: 'Erling Haaland',
        minute: "41'",
        teamId: '382',
        detail: 'Gol',
      },
      {
        id: 'ev-sim-4',
        type: 'goal',
        player: 'Jude Bellingham',
        minute: "63'",
        teamId: '86',
        detail: 'Gol',
      },
    ],
    stats: {
      possession: { home: 48, away: 52 },
      shotsOnTarget: { home: 7, away: 5 },
      totalShots: { home: 15, away: 14 },
      corners: { home: 6, away: 7 },
      fouls: { home: 11, away: 9 },
    },
  },
  {
    id: 'sim-bra-1',
    leagueId: 'brasileirao',
    leagueName: 'Brasileirão Série A',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png',
    homeTeam: {
      id: '819',
      name: 'Flamengo',
      shortName: 'FLA',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/819.png',
      score: 2,
    },
    awayTeam: {
      id: '2029',
      name: 'Palmeiras',
      shortName: 'PAL',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2029.png',
      score: 2,
    },
    status: {
      state: 'live',
      rawState: 'in',
      displayClock: "82' 2T",
      detail: '82º Minuto',
      startTime: new Date().toISOString(),
    },
    venue: 'Maracanã, Rio de Janeiro',
    goals: [
      {
        id: 'g-sim-4',
        player: 'Giorgian de Arrascaeta',
        minute: "15'",
        teamId: '819',
        teamName: 'Flamengo',
        isPenalty: false,
      },
      {
        id: 'g-sim-5',
        player: 'Raphael Veiga',
        minute: "38'",
        teamId: '2029',
        teamName: 'Palmeiras',
        isPenalty: true,
      },
      {
        id: 'g-sim-6',
        player: 'Pedro',
        minute: "54'",
        teamId: '819',
        teamName: 'Flamengo',
        isPenalty: false,
      },
      {
        id: 'g-sim-7',
        player: 'Estêvão',
        minute: "79'",
        teamId: '2029',
        teamName: 'Palmeiras',
        isPenalty: false,
      },
    ],
    events: [
      {
        id: 'ev-sim-5',
        type: 'goal',
        player: 'Giorgian de Arrascaeta',
        minute: "15'",
        teamId: '819',
        detail: 'Gol',
      },
      {
        id: 'ev-sim-6',
        type: 'yellow_card',
        player: 'Gustavo Gómez',
        minute: "30'",
        teamId: '2029',
        detail: 'Cartão Amarelo',
      },
      {
        id: 'ev-sim-7',
        type: 'goal',
        player: 'Raphael Veiga (P)',
        minute: "38'",
        teamId: '2029',
        detail: 'Gol de Pênalti',
      },
      {
        id: 'ev-sim-8',
        type: 'goal',
        player: 'Pedro',
        minute: "54'",
        teamId: '819',
        detail: 'Gol',
      },
      {
        id: 'ev-sim-9',
        type: 'yellow_card',
        player: 'Gerson',
        minute: "66'",
        teamId: '819',
        detail: 'Cartão Amarelo',
      },
      {
        id: 'ev-sim-10',
        type: 'goal',
        player: 'Estêvão',
        minute: "79'",
        teamId: '2029',
        detail: 'Gol',
      },
    ],
    stats: {
      possession: { home: 57, away: 43 },
      shotsOnTarget: { home: 8, away: 6 },
      totalShots: { home: 18, away: 11 },
      corners: { home: 7, away: 4 },
      fouls: { home: 15, away: 17 },
    },
  },
  {
    id: 'sim-ucl-2',
    leagueId: 'champions',
    leagueName: 'UEFA Champions League',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    homeTeam: {
      id: '83',
      name: 'Barcelona',
      shortName: 'BAR',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
      score: 4,
    },
    awayTeam: {
      id: '132',
      name: 'Bayern München',
      shortName: 'BAY',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
      score: 1,
    },
    status: {
      state: 'finished',
      rawState: 'post',
      displayClock: 'Fim de Jogo',
      detail: 'Encerrado',
      startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    venue: 'Estadi Olímpic Lluís Companys, Barcelona',
    goals: [
      {
        id: 'g-sim-8',
        player: 'Raphinha',
        minute: "1'",
        teamId: '83',
        teamName: 'Barcelona',
        isPenalty: false,
      },
      {
        id: 'g-sim-9',
        player: 'Harry Kane',
        minute: "18'",
        teamId: '132',
        teamName: 'Bayern München',
        isPenalty: false,
      },
      {
        id: 'g-sim-10',
        player: 'Robert Lewandowski',
        minute: "36'",
        teamId: '83',
        teamName: 'Barcelona',
        isPenalty: false,
      },
      {
        id: 'g-sim-11',
        player: 'Raphinha',
        minute: "45'",
        teamId: '83',
        teamName: 'Barcelona',
        isPenalty: false,
      },
      {
        id: 'g-sim-12',
        player: 'Raphinha',
        minute: "56'",
        teamId: '83',
        teamName: 'Barcelona',
        isPenalty: false,
      },
    ],
    events: [],
    stats: {
      possession: { home: 44, away: 56 },
      shotsOnTarget: { home: 8, away: 4 },
      totalShots: { home: 12, away: 14 },
      corners: { home: 5, away: 6 },
      fouls: { home: 11, away: 10 },
    },
  },
  {
    id: 'sim-bra-2',
    leagueId: 'brasileirao',
    leagueName: 'Brasileirão Série A',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png',
    homeTeam: {
      id: '2026',
      name: 'São Paulo',
      shortName: 'SAO',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2026.png',
      score: 2,
    },
    awayTeam: {
      id: '874',
      name: 'Corinthians',
      shortName: 'COR',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/874.png',
      score: 1,
    },
    status: {
      state: 'finished',
      rawState: 'post',
      displayClock: 'Fim de Jogo',
      detail: 'Encerrado',
      startTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    venue: 'MorumBIS, São Paulo',
    goals: [
      {
        id: 'g-sim-13',
        player: 'Lucas Moura',
        minute: "28'",
        teamId: '2026',
        teamName: 'São Paulo',
        isPenalty: true,
      },
      {
        id: 'g-sim-14',
        player: 'Jonathan Calleri',
        minute: "64'",
        teamId: '2026',
        teamName: 'São Paulo',
        isPenalty: false,
      },
      {
        id: 'g-sim-15',
        player: 'Yuri Alberto',
        minute: "83'",
        teamId: '874',
        teamName: 'Corinthians',
        isPenalty: false,
      },
    ],
    events: [],
    stats: {
      possession: { home: 53, away: 47 },
      shotsOnTarget: { home: 6, away: 4 },
      totalShots: { home: 14, away: 9 },
      corners: { home: 7, away: 3 },
      fouls: { home: 17, away: 14 },
    },
  },
  {
    id: 'sim-ucl-3',
    leagueId: 'champions',
    leagueName: 'UEFA Champions League',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    homeTeam: {
      id: '359',
      name: 'Arsenal',
      shortName: 'ARS',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
      score: null,
    },
    awayTeam: {
      id: '103',
      name: 'AC Milan',
      shortName: 'MIL',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
      score: null,
    },
    status: {
      state: 'scheduled',
      rawState: 'pre',
      displayClock: '16:00',
      detail: 'Hoje às 16:00 (Brasília)',
      startTime: new Date(Date.now() + 3600000 * 3).toISOString(),
    },
    venue: 'Emirates Stadium, Londres',
    goals: [],
    events: [],
  },
  {
    id: 'sim-bra-3',
    leagueId: 'brasileirao',
    leagueName: 'Brasileirão Série A',
    leagueLogo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png',
    homeTeam: {
      id: '7632',
      name: 'Atlético-MG',
      shortName: 'CAM',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/7632.png',
      score: null,
    },
    awayTeam: {
      id: '6273',
      name: 'Grêmio',
      shortName: 'GRE',
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png',
      score: null,
    },
    status: {
      state: 'scheduled',
      rawState: 'pre',
      displayClock: '19:00',
      detail: 'Hoje às 19:00 (Brasília)',
      startTime: new Date(Date.now() + 3600000 * 6).toISOString(),
    },
    venue: 'Arena MRV, Belo Horizonte',
    goals: [],
    events: [],
  },
];

/**
 * Fetch matches from ESPN public scoreboard
 */
export async function fetchEspnScores(
  league: 'champions' | 'brasileirao',
  dateParam?: string
): Promise<MatchData[]> {
  const slug = league === 'champions' ? 'uefa.champions' : 'bra.1';
  const isBrowser = typeof window !== 'undefined';
  const endpoint = isBrowser
    ? `/api/espn/apis/site/v2/sports/soccer/${slug}/scoreboard`
    : `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;

  let url = new URL(endpoint, isBrowser ? window.location.origin : undefined);
  if (dateParam) {
    url.searchParams.set('dates', dateParam);
  }

  let response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`ESPN API HTTP ${response.status}`);
  }

  let data = await response.json();
  let events = data.events || [];

  // If dateParam returned 0 events for Brasileirão (e.g. today is mid-week between rounds),
  // automatically fetch the current round scoreboard so users always see current real matches!
  if (events.length === 0 && dateParam && league === 'brasileirao') {
    try {
      const fallbackUrl = new URL(endpoint, isBrowser ? window.location.origin : undefined);
      const fallbackRes = await fetch(fallbackUrl.toString(), {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.events && fallbackData.events.length > 0) {
          data = fallbackData;
          events = fallbackData.events;
        }
      }
    } catch {
      // Keep existing data
    }
  }

  const leagueName = data.leagues?.[0]?.name || (league === 'champions' ? 'UEFA Champions League' : 'Brasileirão Série A');
  const leagueLogo = data.leagues?.[0]?.logos?.[0]?.href;

  return events.map((ev: any): MatchData => {
    const comp = ev.competitions?.[0] || {};
    const home = comp.competitors?.find((c: any) => c.homeAway === 'home') || comp.competitors?.[0] || {};
    const away = comp.competitors?.find((c: any) => c.homeAway === 'away') || comp.competitors?.[1] || {};

    const homeScore = home.score !== undefined && home.score !== null ? parseInt(home.score, 10) : null;
    const awayScore = away.score !== undefined && away.score !== null ? parseInt(away.score, 10) : null;

    const normalized = normalizeMatchStatus(ev.status?.type || comp.status?.type, ev.status?.displayClock);

    const homeTeamName = home.team?.displayName || home.team?.name || 'Mandante';
    const awayTeamName = away.team?.displayName || away.team?.name || 'Visitante';
    const homeTeamId = String(home.team?.id || 'home');
    const awayTeamId = String(away.team?.id || 'away');

    const goals = extractGoalsFromEspnDetails(
      comp.details || [],
      homeTeamId,
      awayTeamId,
      homeTeamName,
      awayTeamName
    );

    const matchEvents = extractEventsFromEspnDetails(comp.details || []);

    const homeLogo =
      (home.team?.logo && !home.team.logo.includes('default-team-logo') ? home.team.logo : null) ||
      getOfficialLogoUrl(homeTeamName) ||
      'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png';

    const awayLogo =
      (away.team?.logo && !away.team.logo.includes('default-team-logo') ? away.team.logo : null) ||
      getOfficialLogoUrl(awayTeamName) ||
      'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png';

    const lineups = deriveMatchLineups(
      ev.id || `${homeTeamName}-${awayTeamName}`,
      homeTeamName,
      awayTeamName,
      normalized.state
    );

    return {
      id: ev.id || `${league}-${homeTeamName}-${awayTeamName}`,
      leagueId: league,
      leagueName,
      leagueLogo,
      homeTeam: {
        id: homeTeamId,
        name: homeTeamName,
        shortName: home.team?.abbreviation || homeTeamName.substring(0, 3).toUpperCase(),
        logo: homeLogo,
        score: isNaN(homeScore as number) ? null : homeScore,
      },
      awayTeam: {
        id: awayTeamId,
        name: awayTeamName,
        shortName: away.team?.abbreviation || awayTeamName.substring(0, 3).toUpperCase(),
        logo: awayLogo,
        score: isNaN(awayScore as number) ? null : awayScore,
      },
      status: {
        state: normalized.state,
        rawState: ev.status?.type?.state || 'pre',
        displayClock: normalized.displayClock,
        detail: ev.status?.type?.detail || ev.status?.type?.shortDetail || normalized.label,
        startTime: ev.date || comp.date || new Date().toISOString(),
      },
      venue: comp.venue?.fullName ? `${comp.venue.fullName}${comp.venue.address?.city ? `, ${comp.venue.address.city}` : ''}` : undefined,
      goals,
      events: matchEvents,
      lineups,
      stats:
        extractMatchStats(home.statistics, away.statistics) ||
        (normalized.state !== 'scheduled'
          ? deriveMatchStats(
              ev.id || `${homeTeamName}-${awayTeamName}`,
              isNaN(homeScore as number) ? null : homeScore,
              isNaN(awayScore as number) ? null : awayScore
            )
          : undefined),
    };
  });
}

/**
 * Fetches match details (official lineups and substitutions) from ESPN summary if available
 */
export async function fetchMatchDetails(
  matchId: string,
  league: 'champions' | 'brasileirao',
  homeTeamName: string,
  awayTeamName: string,
  matchState?: 'live' | 'finished' | 'scheduled'
): Promise<MatchLineups> {
  const slug = league === 'champions' ? 'uefa.champions' : 'bra.1';
  const isBrowser = typeof window !== 'undefined';
  const endpoint = isBrowser
    ? `/api/espn/apis/site/v2/sports/soccer/${slug}/summary?event=${matchId}`
    : `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/summary?event=${matchId}`;

  try {
    const res = await fetch(endpoint, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const extracted = extractLineupsFromEspnSummary(data);
      if (extracted && extracted.home.starters.length > 0) {
        return extracted;
      }
    }
  } catch {
    // Fallback to derive
  }

  return deriveMatchLineups(matchId, homeTeamName, awayTeamName, matchState);
}

/**
 * Fetches tournament standings table for Brasileirão or Champions League
 */
export async function fetchTournamentStandings(
  league: 'champions' | 'brasileirao'
): Promise<StandingEntry[]> {
  const slug = league === 'champions' ? 'uefa.champions' : 'bra.1';
  const isBrowser = typeof window !== 'undefined';
  const endpoint = isBrowser
    ? `/api/espn/apis/v2/sports/soccer/${slug}/standings`
    : `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`;

  try {
    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const children = data.children || [];
      const entries: any[] = children[0]?.standings?.entries || data.standings?.entries || [];

      if (entries.length > 0) {
        return entries.map((entry: any, index: number): StandingEntry => {
          const stats: any[] = entry.stats || [];
          const getVal = (name: string, fallback = 0): number => {
            const s = stats.find((st) => st.name?.toLowerCase() === name.toLowerCase());
            if (!s) return fallback;
            const num = typeof s.value === 'number' ? s.value : parseFloat(s.displayValue || '0');
            return isNaN(num) ? fallback : num;
          };

          const teamName = entry.team?.displayName || entry.team?.name || `Time ${index + 1}`;
          const rank = getVal('rank', index + 1);
          const points = getVal('points', 0);
          const gamesPlayed = getVal('gamesPlayed', 0);
          const wins = getVal('wins', 0);
          const ties = getVal('ties', 0);
          const losses = getVal('losses', 0);
          const goalsFor = getVal('pointsFor', 0);
          const goalsAgainst = getVal('pointsAgainst', 0);
          const goalDifference = getVal('pointDifferential', goalsFor - goalsAgainst);

          const logo =
            entry.team?.logos?.[0]?.href ||
            getOfficialLogoUrl(teamName) ||
            '';

          return {
            rank,
            team: {
              id: String(entry.team?.id || index + 1),
              name: teamName,
              shortName: entry.team?.abbreviation || teamName.substring(0, 3).toUpperCase(),
              logo,
            },
            points,
            gamesPlayed,
            wins,
            ties,
            losses,
            goalsFor,
            goalsAgainst,
            goalDifference,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch remote standings, using fallback table', err);
  }

  // High-fidelity fallback standings if network fails
  return league === 'brasileirao'
    ? FALLBACK_BRASILEIRAO_STANDINGS
    : FALLBACK_UCL_STANDINGS;
}

const FALLBACK_BRASILEIRAO_STANDINGS: StandingEntry[] = [
  { rank: 1, team: { id: '819', name: 'Flamengo', shortName: 'FLA', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/819.png' }, points: 67, gamesPlayed: 31, wins: 20, ties: 7, losses: 4, goalsFor: 61, goalsAgainst: 25, goalDifference: 36 },
  { rank: 2, team: { id: '2029', name: 'Palmeiras', shortName: 'PAL', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2029.png' }, points: 64, gamesPlayed: 31, wins: 19, ties: 7, losses: 5, goalsFor: 57, goalsAgainst: 27, goalDifference: 30 },
  { rank: 3, team: { id: '6076', name: 'Botafogo', shortName: 'BOT', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6076.png' }, points: 62, gamesPlayed: 31, wins: 18, ties: 8, losses: 5, goalsFor: 54, goalsAgainst: 28, goalDifference: 26 },
  { rank: 4, team: { id: '3421', name: 'Fortaleza', shortName: 'FOR', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3421.png' }, points: 58, gamesPlayed: 31, wins: 16, ties: 10, losses: 5, goalsFor: 44, goalsAgainst: 31, goalDifference: 13 },
  { rank: 5, team: { id: '1936', name: 'Internacional', shortName: 'INT', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1936.png' }, points: 55, gamesPlayed: 31, wins: 15, ties: 10, losses: 6, goalsFor: 46, goalsAgainst: 29, goalDifference: 17 },
  { rank: 6, team: { id: '2026', name: 'São Paulo', shortName: 'SAO', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2026.png' }, points: 54, gamesPlayed: 31, wins: 16, ties: 6, losses: 9, goalsFor: 45, goalsAgainst: 33, goalDifference: 12 },
  { rank: 7, team: { id: '3406', name: 'Bahia', shortName: 'BAH', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3406.png' }, points: 47, gamesPlayed: 31, wins: 13, ties: 8, losses: 10, goalsFor: 43, goalsAgainst: 38, goalDifference: 5 },
  { rank: 8, team: { id: '6272', name: 'Cruzeiro', shortName: 'CRU', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6272.png' }, points: 46, gamesPlayed: 31, wins: 12, ties: 10, losses: 9, goalsFor: 39, goalsAgainst: 34, goalDifference: 5 },
  { rank: 9, team: { id: '2022', name: 'Atlético-MG', shortName: 'CAM', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png' }, points: 43, gamesPlayed: 30, wins: 10, ties: 13, losses: 7, goalsFor: 42, goalsAgainst: 45, goalDifference: -3 },
  { rank: 10, team: { id: '3454', name: 'Vasco', shortName: 'VAS', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3454.png' }, points: 43, gamesPlayed: 31, wins: 12, ties: 7, losses: 12, goalsFor: 36, goalsAgainst: 43, goalDifference: -7 },
  { rank: 11, team: { id: '6273', name: 'Grêmio', shortName: 'GRE', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png' }, points: 39, gamesPlayed: 31, wins: 11, ties: 6, losses: 14, goalsFor: 37, goalsAgainst: 42, goalDifference: -5 },
  { rank: 12, team: { id: '3416', name: 'Criciúma', shortName: 'CRI', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3416.png' }, points: 38, gamesPlayed: 31, wins: 9, ties: 11, losses: 11, goalsFor: 38, goalsAgainst: 44, goalDifference: -6 },
  { rank: 13, team: { id: '3445', name: 'Fluminense', shortName: 'FLU', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3445.png' }, points: 37, gamesPlayed: 31, wins: 10, ties: 7, losses: 14, goalsFor: 28, goalsAgainst: 34, goalDifference: -6 },
  { rank: 14, team: { id: '3455', name: 'Vitória', shortName: 'VIT', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3455.png' }, points: 36, gamesPlayed: 31, wins: 10, ties: 6, losses: 15, goalsFor: 35, goalsAgainst: 46, goalDifference: -11 },
  { rank: 15, team: { id: '874', name: 'Corinthians', shortName: 'COR', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/874.png' }, points: 35, gamesPlayed: 31, wins: 8, ties: 11, losses: 12, goalsFor: 35, goalsAgainst: 40, goalDifference: -5 },
  { rank: 16, team: { id: '6074', name: 'Athletico-PR', shortName: 'CAP', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6074.png' }, points: 34, gamesPlayed: 30, wins: 9, ties: 7, losses: 14, goalsFor: 32, goalsAgainst: 38, goalDifference: -6 },
  { rank: 17, team: { id: '1999', name: 'RB Bragantino', shortName: 'RBB', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1999.png' }, points: 34, gamesPlayed: 31, wins: 8, ties: 10, losses: 13, goalsFor: 34, goalsAgainst: 41, goalDifference: -7 },
  { rank: 18, team: { id: '3432', name: 'Juventude', shortName: 'JUV', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3432.png' }, points: 34, gamesPlayed: 31, wins: 8, ties: 10, losses: 13, goalsFor: 38, goalsAgainst: 50, goalDifference: -12 },
  { rank: 19, team: { id: '10499', name: 'Cuiabá', shortName: 'CUI', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/10499.png' }, points: 28, gamesPlayed: 31, wins: 6, ties: 10, losses: 15, goalsFor: 25, goalsAgainst: 41, goalDifference: -16 },
  { rank: 20, team: { id: '7516', name: 'Atlético-GO', shortName: 'ACG', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/7516.png' }, points: 22, gamesPlayed: 31, wins: 5, ties: 7, losses: 19, goalsFor: 24, goalsAgainst: 51, goalDifference: -27 },
];

const FALLBACK_UCL_STANDINGS: StandingEntry[] = [
  { rank: 1, team: { id: '160', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png' }, points: 9, gamesPlayed: 3, wins: 3, ties: 0, losses: 0, goalsFor: 14, goalsAgainst: 5, goalDifference: 9 },
  { rank: 2, team: { id: '86', name: 'Real Madrid', shortName: 'RMA', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' }, points: 9, gamesPlayed: 3, wins: 3, ties: 0, losses: 0, goalsFor: 11, goalsAgainst: 3, goalDifference: 8 },
  { rank: 3, team: { id: '382', name: 'Manchester City', shortName: 'MCI', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png' }, points: 7, gamesPlayed: 3, wins: 2, ties: 1, losses: 0, goalsFor: 9, goalsAgainst: 1, goalDifference: 8 },
  { rank: 4, team: { id: '364', name: 'Liverpool', shortName: 'LIV', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png' }, points: 7, gamesPlayed: 3, wins: 2, ties: 1, losses: 0, goalsFor: 7, goalsAgainst: 2, goalDifference: 5 },
  { rank: 5, team: { id: '132', name: 'Bayern München', shortName: 'BAY', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png' }, points: 6, gamesPlayed: 3, wins: 2, ties: 0, losses: 1, goalsFor: 12, goalsAgainst: 6, goalDifference: 6 },
  { rank: 6, team: { id: '359', name: 'Arsenal', shortName: 'ARS', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png' }, points: 6, gamesPlayed: 3, wins: 2, ties: 0, losses: 1, goalsFor: 8, goalsAgainst: 3, goalDifference: 5 },
  { rank: 7, team: { id: '83', name: 'Barcelona', shortName: 'BAR', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' }, points: 6, gamesPlayed: 3, wins: 2, ties: 0, losses: 1, goalsFor: 10, goalsAgainst: 4, goalDifference: 6 },
  { rank: 8, team: { id: '110', name: 'Internazionale', shortName: 'INT', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png' }, points: 6, gamesPlayed: 3, wins: 2, ties: 0, losses: 1, goalsFor: 5, goalsAgainst: 2, goalDifference: 3 },
  { rank: 9, team: { id: '131', name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png' }, points: 5, gamesPlayed: 3, wins: 1, ties: 2, losses: 0, goalsFor: 5, goalsAgainst: 3, goalDifference: 2 },
  { rank: 10, team: { id: '124', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png' }, points: 5, gamesPlayed: 3, wins: 1, ties: 2, losses: 0, goalsFor: 9, goalsAgainst: 6, goalDifference: 3 },
  { rank: 11, team: { id: '1068', name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' }, points: 4, gamesPlayed: 3, wins: 1, ties: 1, losses: 1, goalsFor: 5, goalsAgainst: 6, goalDifference: -1 },
  { rank: 12, team: { id: '340', name: 'Sporting CP', shortName: 'SCP', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/340.png' }, points: 4, gamesPlayed: 3, wins: 1, ties: 1, losses: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1 },
  { rank: 13, team: { id: '103', name: 'AC Milan', shortName: 'ACM', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' }, points: 4, gamesPlayed: 3, wins: 1, ties: 1, losses: 1, goalsFor: 4, goalsAgainst: 5, goalDifference: -1 },
  { rank: 14, team: { id: '111', name: 'Juventus', shortName: 'JUV', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png' }, points: 4, gamesPlayed: 3, wins: 1, ties: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0 },
  { rank: 15, team: { id: '362', name: 'Aston Villa', shortName: 'AVL', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png' }, points: 3, gamesPlayed: 3, wins: 1, ties: 0, losses: 2, goalsFor: 3, goalsAgainst: 4, goalDifference: -1 },
  { rank: 16, team: { id: '11420', name: 'RB Leipzig', shortName: 'RBL', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png' }, points: 3, gamesPlayed: 3, wins: 1, ties: 0, losses: 2, goalsFor: 4, goalsAgainst: 6, goalDifference: -2 },
];

/**
 * Fetch matches via RapidAPI (API-Football) if key configured
 */
export async function fetchRapidApiScores(
  league: 'champions' | 'brasileirao',
  apiKey: string
): Promise<MatchData[]> {
  const leagueId = league === 'champions' ? 2 : 71; // 2 = Champions League, 71 = Brasileirão Série A
  const season = new Date().getFullYear();
  const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&live=all`;

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`RapidAPI Error ${response.status}`);
  }

  const data = await response.json();
  const fixtures = data.response || [];

  return fixtures.map((item: any): MatchData => {
    const f = item.fixture;
    const l = item.league;
    const teams = item.teams;
    const goalsScore = item.goals;
    const eventsList = item.events || [];

    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.status?.short);
    const isFinished = ['FT', 'AET', 'PEN'].includes(f.status?.short);

    const goals: GoalScorer[] = eventsList
      .filter((ev: any) => ev.type === 'Goal')
      .map((ev: any, idx: number) => ({
        id: `rapid-g-${idx}`,
        player: ev.player?.name || 'Gol',
        minute: `${ev.time?.elapsed}'`,
        teamId: String(ev.team?.id),
        teamName: ev.team?.name,
        isPenalty: ev.detail === 'Penalty',
        isOwnGoal: ev.detail === 'Own Goal',
      }));

    return {
      id: String(f.id),
      leagueId: league,
      leagueName: l.name,
      leagueLogo: l.logo,
      homeTeam: {
        id: String(teams.home.id),
        name: teams.home.name,
        shortName: teams.home.name.substring(0, 3).toUpperCase(),
        logo: teams.home.logo,
        score: goalsScore.home,
      },
      awayTeam: {
        id: String(teams.away.id),
        name: teams.away.name,
        shortName: teams.away.name.substring(0, 3).toUpperCase(),
        logo: teams.away.logo,
        score: goalsScore.away,
      },
      status: {
        state: isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
        rawState: f.status?.short,
        displayClock: f.status?.elapsed ? `${f.status.elapsed}'` : f.status?.long,
        detail: f.status?.long,
        startTime: f.date,
      },
      venue: f.venue?.name,
      goals,
      events: [],
    };
  });
}

/**
 * Fetch matches for advanced date modes: last week, last 30 days, today, yesterday, tomorrow, next week, or custom date.
 */
export async function fetchEspnScoresForDateMode(
  league: 'champions' | 'brasileirao',
  mode: 'today' | 'yesterday' | 'tomorrow' | 'last_week' | 'last_30_days' | 'next_week' | 'custom',
  customDate?: string
): Promise<MatchData[]> {
  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const today = new Date();

  if (mode === 'today') {
    return fetchEspnScores(league, formatDate(today));
  }

  if (mode === 'yesterday') {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    return fetchEspnScores(league, formatDate(yest));
  }

  if (mode === 'tomorrow') {
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    return fetchEspnScores(league, formatDate(tom));
  }

  if (mode === 'custom' && customDate) {
    return fetchEspnScores(league, customDate);
  }

  if (mode === 'last_week') {
    // Collect past 7 days
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }

    const results = await Promise.all(
      dates.map((dt) => fetchEspnScores(league, dt).catch(() => []))
    );

    const merged = results.flat();
    const seen = new Set<string>();
    const unique = merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    if (unique.length > 0) return unique;
    return fetchEspnScores(league);
  }

  if (mode === 'last_30_days') {
    // Sample key match days (Saturdays, Sundays, Tuesdays, Wednesdays) over past 30 days + today
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      // 0 = Sun, 2 = Tue, 3 = Wed, 6 = Sat, or last 5 days
      if (i < 5 || dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 6) {
        dates.push(formatDate(d));
      }
    }

    // Limit to 12 concurrent requests for speed
    const selectedDates = dates.slice(0, 12);
    const results = await Promise.all([
      fetchEspnScores(league).catch(() => []),
      ...selectedDates.map((dt) => fetchEspnScores(league, dt).catch(() => [])),
    ]);

    const merged = results.flat();
    const seen = new Set<string>();
    const unique = merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    return unique.length > 0 ? unique : fetchEspnScores(league);
  }

  if (mode === 'next_week') {
    // Next 7 days
    const dates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(formatDate(d));
    }

    const results = await Promise.all(
      dates.map((dt) => fetchEspnScores(league, dt).catch(() => []))
    );

    const merged = results.flat();
    const seen = new Set<string>();
    const unique = merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    return unique.length > 0 ? unique : fetchEspnScores(league);
  }

  return fetchEspnScores(league);
}

