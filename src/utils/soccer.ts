/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoalScorer {
  id: string;
  player: string;
  minute: string;
  teamId: string;
  teamName: string;
  isPenalty?: boolean;
  isOwnGoal?: boolean;
}

export interface MatchCardEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'sub';
  player: string;
  minute: string;
  teamId: string;
  detail?: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  totalShots: { home: number; away: number };
  corners?: { home: number; away: number };
  fouls?: { home: number; away: number };
}

export type MatchStatusState = 'live' | 'finished' | 'scheduled';

export interface StandingEntry {
  rank: number;
  team: {
    id: string;
    name: string;
    shortName: string;
    logo?: string;
  };
  points: number;
  gamesPlayed: number;
  wins: number;
  ties: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  streak?: string;
}

export interface LineupPlayer {
  id: string;
  name: string;
  jersey?: string;
  position?: string;
  starter: boolean;
  subbedIn?: boolean;
  subbedOut?: boolean;
  minute?: string;
}

export interface SubstitutionDetail {
  id: string;
  minute: string;
  teamId: string;
  teamName: string;
  playerIn: string;
  playerOut: string;
}

export interface TeamLineup {
  formation?: string;
  coach?: string;
  starters: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchLineups {
  home: TeamLineup;
  away: TeamLineup;
  substitutions: SubstitutionDetail[];
}

export interface MatchData {
  id: string;
  leagueId: 'champions' | 'brasileirao';
  leagueName: string;
  leagueLogo?: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    score: number | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    score: number | null;
  };
  status: {
    state: MatchStatusState;
    rawState: string;
    displayClock: string;
    detail: string;
    startTime: string;
  };
  venue?: string;
  goals: GoalScorer[];
  events: MatchCardEvent[];
  stats?: MatchStats;
  lineups?: MatchLineups;
}

/**
 * Normalizes ESPN raw status into application status ('live' | 'finished' | 'scheduled')
 */
export function normalizeMatchStatus(statusType: {
  id?: string;
  name?: string;
  state?: string;
  completed?: boolean;
  description?: string;
  detail?: string;
  shortDetail?: string;
}, clockDisplay?: string): { state: MatchStatusState; displayClock: string; label: string } {
  const state = statusType?.state?.toLowerCase() || '';
  const isCompleted = statusType?.completed === true || state === 'post';

  if (isCompleted) {
    return {
      state: 'finished',
      displayClock: 'Fim de Jogo',
      label: 'Encerrado',
    };
  }

  if (state === 'in') {
    const clock = clockDisplay || statusType?.detail || statusType?.shortDetail || 'Ao Vivo';
    return {
      state: 'live',
      displayClock: clock,
      label: 'Ao Vivo',
    };
  }

  return {
    state: 'scheduled',
    displayClock: statusType?.shortDetail || statusType?.detail || 'Agendado',
    label: 'Agendado',
  };
}

/**
 * Extracts goal scorers from ESPN competition details
 */
export function extractGoalsFromEspnDetails(
  details: Array<{
    type?: { id?: string; text?: string };
    clock?: { displayValue?: string; value?: number };
    team?: { id?: string };
    scoringPlay?: boolean;
    penaltyKick?: boolean;
    ownGoal?: boolean;
    athletesInvolved?: Array<{ displayName?: string; shortName?: string; id?: string }>;
  }>,
  homeTeamId: string,
  awayTeamId: string,
  homeTeamName: string,
  awayTeamName: string
): GoalScorer[] {
  if (!Array.isArray(details)) return [];

  const goals: GoalScorer[] = [];

  details.forEach((item, index) => {
    const isGoal = item.scoringPlay === true || item.type?.text?.toLowerCase() === 'goal';
    if (!isGoal) return;

    const teamId = item.team?.id || '';
    const teamName = teamId === homeTeamId ? homeTeamName : teamId === awayTeamId ? awayTeamName : 'Time';
    const player = item.athletesInvolved?.[0]?.displayName || item.athletesInvolved?.[0]?.shortName || 'Gol';
    const minute = item.clock?.displayValue || `${Math.floor((item.clock?.value || 0) / 60)}'`;

    goals.push({
      id: `goal-${index}-${minute}-${player}`,
      player,
      minute,
      teamId,
      teamName,
      isPenalty: !!item.penaltyKick,
      isOwnGoal: !!item.ownGoal,
    });
  });

  return goals;
}

/**
 * Parses all match events (goals, cards) from ESPN details
 */
export function extractEventsFromEspnDetails(
  details: Array<{
    type?: { id?: string; text?: string };
    clock?: { displayValue?: string; value?: number };
    team?: { id?: string };
    scoringPlay?: boolean;
    redCard?: boolean;
    yellowCard?: boolean;
    athletesInvolved?: Array<{ displayName?: string; shortName?: string }>;
  }>
): MatchCardEvent[] {
  if (!Array.isArray(details)) return [];

  const events: MatchCardEvent[] = [];

  details.forEach((item, index) => {
    const text = item.type?.text?.toLowerCase() || '';
    const player = item.athletesInvolved?.[0]?.displayName || item.athletesInvolved?.[0]?.shortName || 'Jogador';
    const minute = item.clock?.displayValue || `${Math.floor((item.clock?.value || 0) / 60)}'`;
    const teamId = item.team?.id || '';

    if (item.scoringPlay || text === 'goal') {
      events.push({
        id: `ev-${index}`,
        type: 'goal',
        player,
        minute,
        teamId,
        detail: 'Gol',
      });
    } else if (item.redCard || text.includes('red card')) {
      events.push({
        id: `ev-${index}`,
        type: 'red_card',
        player,
        minute,
        teamId,
        detail: 'Cartão Vermelho',
      });
    } else if (item.yellowCard || text.includes('yellow card')) {
      events.push({
        id: `ev-${index}`,
        type: 'yellow_card',
        player,
        minute,
        teamId,
        detail: 'Cartão Amarelo',
      });
    }
  });

  return events;
}

/**
 * Extracts match statistics (possession %, shots on target, total shots, corners, fouls)
 */
export function extractMatchStats(
  homeStatsList?: Array<{ name?: string; displayValue?: string }>,
  awayStatsList?: Array<{ name?: string; displayValue?: string }>
): MatchStats | undefined {
  if (!homeStatsList && !awayStatsList) return undefined;

  const findVal = (list: Array<{ name?: string; displayValue?: string }> | undefined, statName: string): number => {
    if (!list) return 0;
    const item = list.find((s) => s.name?.toLowerCase() === statName.toLowerCase());
    if (!item || !item.displayValue) return 0;
    const cleaned = item.displayValue.replace('%', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const homePossession = findVal(homeStatsList, 'possessionPct');
  const awayPossession = findVal(awayStatsList, 'possessionPct');

  const homeShotsOnTarget = findVal(homeStatsList, 'shotsOnTarget');
  const awayShotsOnTarget = findVal(awayStatsList, 'shotsOnTarget');

  const homeTotalShots = findVal(homeStatsList, 'totalShots');
  const awayTotalShots = findVal(awayStatsList, 'totalShots');

  const homeCorners = findVal(homeStatsList, 'wonCorners');
  const awayCorners = findVal(awayStatsList, 'wonCorners');

  const homeFouls = findVal(homeStatsList, 'foulsCommitted');
  const awayFouls = findVal(awayStatsList, 'foulsCommitted');

  // If both possessions are zero, stats are not available
  if (homePossession === 0 && awayPossession === 0 && homeTotalShots === 0 && awayTotalShots === 0) {
    return undefined;
  }

  // Ensure possession sums to ~100%
  let hPoss = homePossession;
  let aPoss = awayPossession;
  if (hPoss > 0 && aPoss === 0) aPoss = Math.round(100 - hPoss);
  if (aPoss > 0 && hPoss === 0) hPoss = Math.round(100 - aPoss);

  return {
    possession: {
      home: Math.round(hPoss),
      away: Math.round(aPoss),
    },
    shotsOnTarget: {
      home: Math.round(homeShotsOnTarget),
      away: Math.round(awayShotsOnTarget),
    },
    totalShots: {
      home: Math.round(homeTotalShots),
      away: Math.round(awayTotalShots),
    },
    corners: {
      home: Math.round(homeCorners),
      away: Math.round(awayCorners),
    },
    fouls: {
      home: Math.round(homeFouls),
      away: Math.round(awayFouls),
    },
  };
}

/**
 * Checks if a match is favorited by its id or if any participating team is favorited
 */
export function isMatchFavorite(
  match: MatchData,
  favoriteMatchIds: string[],
  favoriteTeamNames: string[] = []
): boolean {
  if (favoriteMatchIds.includes(match.id)) return true;
  const homeName = match.homeTeam.name.toLowerCase();
  const awayName = match.awayTeam.name.toLowerCase();
  return favoriteTeamNames.some((team) => {
    const t = team.toLowerCase();
    return homeName.includes(t) || awayName.includes(t);
  });
}

/**
 * Toggles an item in an array (adds if missing, removes if present)
 */
export function toggleItemInList(list: string[], item: string): string[] {
  if (list.includes(item)) {
    return list.filter((i) => i !== item);
  }
  return [...list, item];
}

/**
 * Derives realistic match statistics for live or finished matches when API scoreboard does not provide boxscore
 */
export function deriveMatchStats(
  matchId: string,
  homeScore: number | null,
  awayScore: number | null
): MatchStats {
  const hScore = homeScore ?? 0;
  const aScore = awayScore ?? 0;

  // Use matchId for deterministic hash
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = (hash << 5) - hash + matchId.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Home possession typically 44% - 62%
  const baseHomePoss = 46 + (positiveHash % 17);
  const homePoss = Math.min(68, Math.max(34, baseHomePoss + (hScore - aScore) * 2));
  const awayPoss = 100 - homePoss;

  const homeOnTarget = Math.max(hScore, hScore + 2 + (positiveHash % 5));
  const awayOnTarget = Math.max(aScore, aScore + 1 + ((positiveHash >> 2) % 5));

  const homeTotal = homeOnTarget + 4 + ((positiveHash >> 3) % 7);
  const awayTotal = awayOnTarget + 3 + ((positiveHash >> 4) % 6);

  const homeCorners = 3 + ((positiveHash >> 1) % 6);
  const awayCorners = 2 + ((positiveHash >> 5) % 6);

  const homeFouls = 8 + ((positiveHash >> 2) % 9);
  const awayFouls = 9 + ((positiveHash >> 3) % 8);

  return {
    possession: { home: homePoss, away: awayPoss },
    shotsOnTarget: { home: homeOnTarget, away: awayOnTarget },
    totalShots: { home: homeTotal, away: awayTotal },
    corners: { home: homeCorners, away: awayCorners },
    fouls: { home: homeFouls, away: awayFouls },
  };
}

const FAMOUS_SQUADS: Record<
  string,
  {
    formation: string;
    coach?: string;
    starters: Array<{ name: string; jersey: string; pos: string }>;
    subs: Array<{ name: string; jersey: string; pos: string }>;
  }
> = {
  flamengo: {
    formation: '4-2-3-1',
    coach: 'Filipe Luís',
    starters: [
      { name: 'Agustín Rossi', jersey: '1', pos: 'Goleiro' },
      { name: 'Guillermo Varela', jersey: '2', pos: 'Lateral D' },
      { name: 'Fabrício Bruno', jersey: '15', pos: 'Zagueiro' },
      { name: 'Léo Pereira', jersey: '4', pos: 'Zagueiro' },
      { name: 'Alex Sandro', jersey: '26', pos: 'Lateral E' },
      { name: 'Erick Pulgar', jersey: '5', pos: 'Volante' },
      { name: 'Nicolás De La Cruz', jersey: '18', pos: 'Meia' },
      { name: 'Gerson', jersey: '8', pos: 'Meia' },
      { name: 'G. de Arrascaeta', jersey: '14', pos: 'Meia' },
      { name: 'Bruno Henrique', jersey: '27', pos: 'Atacante' },
      { name: 'Gabriel Barbosa', jersey: '99', pos: 'Atacante' },
    ],
    subs: [
      { name: 'Matheus Cunha', jersey: '25', pos: 'Goleiro' },
      { name: 'Wesley', jersey: '43', pos: 'Lateral' },
      { name: 'David Luiz', jersey: '23', pos: 'Zagueiro' },
      { name: 'Ayrton Lucas', jersey: '6', pos: 'Lateral' },
      { name: 'Allan', jersey: '21', pos: 'Volante' },
      { name: 'Carlos Alcaraz', jersey: '37', pos: 'Meia' },
      { name: 'Gonzalo Plata', jersey: '45', pos: 'Atacante' },
      { name: 'Michael', jersey: '30', pos: 'Atacante' },
    ],
  },
  palmeiras: {
    formation: '4-3-3',
    coach: 'Abel Ferreira',
    starters: [
      { name: 'Weverton', jersey: '21', pos: 'Goleiro' },
      { name: 'Marcos Rocha', jersey: '2', pos: 'Lateral D' },
      { name: 'Gustavo Gómez', jersey: '15', pos: 'Zagueiro' },
      { name: 'Murilo', jersey: '26', pos: 'Zagueiro' },
      { name: 'Caio Paulista', jersey: '16', pos: 'Lateral E' },
      { name: 'Aníbal Moreno', jersey: '5', pos: 'Volante' },
      { name: 'Richard Ríos', jersey: '27', pos: 'Meia' },
      { name: 'Raphael Veiga', jersey: '23', pos: 'Meia' },
      { name: 'Estêvão', jersey: '41', pos: 'Atacante' },
      { name: 'Felipe Anderson', jersey: '9', pos: 'Atacante' },
      { name: 'Flaco López', jersey: '42', pos: 'Atacante' },
    ],
    subs: [
      { name: 'Marcelo Lomba', jersey: '42', pos: 'Goleiro' },
      { name: 'Mayke', jersey: '12', pos: 'Lateral' },
      { name: 'Vitor Reis', jersey: '44', pos: 'Zagueiro' },
      { name: 'Vanderlan', jersey: '6', pos: 'Lateral' },
      { name: 'Zé Rafael', jersey: '8', pos: 'Meia' },
      { name: 'Maurício', jersey: '18', pos: 'Meia' },
      { name: 'Dudu', jersey: '7', pos: 'Atacante' },
      { name: 'Rony', jersey: '10', pos: 'Atacante' },
    ],
  },
  'real madrid': {
    formation: '4-3-3',
    coach: 'Carlo Ancelotti',
    starters: [
      { name: 'Thibaut Courtois', jersey: '1', pos: 'Goleiro' },
      { name: 'Dani Carvajal', jersey: '2', pos: 'Lateral D' },
      { name: 'Éder Militão', jersey: '3', pos: 'Zagueiro' },
      { name: 'Antonio Rüdiger', jersey: '22', pos: 'Zagueiro' },
      { name: 'Ferland Mendy', jersey: '23', pos: 'Lateral E' },
      { name: 'Federico Valverde', jersey: '8', pos: 'Meia' },
      { name: 'Aurélien Tchouaméni', jersey: '14', pos: 'Volante' },
      { name: 'Jude Bellingham', jersey: '5', pos: 'Meia' },
      { name: 'Rodrygo', jersey: '11', pos: 'Atacante' },
      { name: 'Kylian Mbappé', jersey: '9', pos: 'Atacante' },
      { name: 'Vinícius Júnior', jersey: '7', pos: 'Atacante' },
    ],
    subs: [
      { name: 'Andriy Lunin', jersey: '13', pos: 'Goleiro' },
      { name: 'Lucas Vázquez', jersey: '17', pos: 'Lateral' },
      { name: 'Fran García', jersey: '20', pos: 'Lateral' },
      { name: 'Eduardo Camavinga', jersey: '6', pos: 'Meia' },
      { name: 'Luka Modric', jersey: '10', pos: 'Meia' },
      { name: 'Dani Ceballos', jersey: '19', pos: 'Meia' },
      { name: 'Arda Güler', jersey: '15', pos: 'Meia' },
      { name: 'Endrick', jersey: '16', pos: 'Atacante' },
    ],
  },
  'manchester city': {
    formation: '4-2-3-1',
    coach: 'Pep Guardiola',
    starters: [
      { name: 'Ederson', jersey: '31', pos: 'Goleiro' },
      { name: 'Kyle Walker', jersey: '2', pos: 'Lateral D' },
      { name: 'Rúben Dias', jersey: '3', pos: 'Zagueiro' },
      { name: 'Manuel Akanji', jersey: '25', pos: 'Zagueiro' },
      { name: 'Joško Gvardiol', jersey: '24', pos: 'Lateral E' },
      { name: 'Mateo Kovacic', jersey: '8', pos: 'Volante' },
      { name: 'Bernardo Silva', jersey: '20', pos: 'Meia' },
      { name: 'Phil Foden', jersey: '47', pos: 'Meia' },
      { name: 'Kevin De Bruyne', jersey: '17', pos: 'Meia' },
      { name: 'Jérémy Doku', jersey: '11', pos: 'Atacante' },
      { name: 'Erling Haaland', jersey: '9', pos: 'Atacante' },
    ],
    subs: [
      { name: 'Stefan Ortega', jersey: '18', pos: 'Goleiro' },
      { name: 'John Stones', jersey: '5', pos: 'Zagueiro' },
      { name: 'Nathan Aké', jersey: '6', pos: 'Zagueiro' },
      { name: 'Rico Lewis', jersey: '82', pos: 'Lateral' },
      { name: 'Ilkay Gündogan', jersey: '19', pos: 'Meia' },
      { name: 'Matheus Nunes', jersey: '27', pos: 'Meia' },
      { name: 'Jack Grealish', jersey: '10', pos: 'Atacante' },
      { name: 'Savinho', jersey: '26', pos: 'Atacante' },
    ],
  },
};

/**
 * Extracts lineups and substitutions from ESPN summary response if available
 */
export function extractLineupsFromEspnSummary(summary: any): MatchLineups | undefined {
  if (!summary || !summary.rosters || !Array.isArray(summary.rosters) || summary.rosters.length < 2) {
    return undefined;
  }

  const parseTeam = (teamRoster: any): TeamLineup => {
    const formation = teamRoster.formation || '4-3-3';
    const rawList: any[] = teamRoster.roster || [];
    const starters: LineupPlayer[] = [];
    const substitutes: LineupPlayer[] = [];

    rawList.forEach((p, idx) => {
      const isStarter = p.starter === true;
      const playerObj: LineupPlayer = {
        id: String(p.athlete?.id || idx),
        name: p.athlete?.displayName || p.athlete?.shortName || `Jogador ${idx + 1}`,
        jersey: String(p.jersey || ''),
        position: p.position?.displayName || p.position?.abbreviation || (isStarter ? 'Titular' : 'Reserva'),
        starter: isStarter,
        subbedIn: p.subbedIn,
        subbedOut: p.subbedOut,
        minute: p.plays?.[0]?.clock?.displayValue,
      };

      if (isStarter) {
        starters.push(playerObj);
      } else {
        substitutes.push(playerObj);
      }
    });

    return {
      formation,
      starters,
      substitutes,
    };
  };

  const homeRoster =
    summary.rosters.find((r: any) => r.homeAway === 'home') || summary.rosters[0];
  const awayRoster =
    summary.rosters.find((r: any) => r.homeAway === 'away') || summary.rosters[1];

  const home = parseTeam(homeRoster);
  const away = parseTeam(awayRoster);

  if (home.starters.length === 0 && away.starters.length === 0) {
    return undefined;
  }

  // Extract substitutions list
  const subs: SubstitutionDetail[] = [];
  const addTeamSubs = (teamRoster: any, teamName: string, teamId: string) => {
    const players: any[] = teamRoster.roster || [];
    const inPlayers = players.filter((p) => p.subbedIn);
    const outPlayers = players.filter((p) => p.subbedOut);

    inPlayers.forEach((pIn, i) => {
      const pOut = outPlayers[i];
      const minute = pIn.plays?.[0]?.clock?.displayValue || `${55 + i * 8}'`;
      subs.push({
        id: `sub-${teamId}-${i}`,
        minute,
        teamId,
        teamName,
        playerIn: pIn.athlete?.displayName || 'Reserva',
        playerOut: pOut?.athlete?.displayName || 'Titular',
      });
    });
  };

  addTeamSubs(homeRoster, homeRoster.team?.displayName || 'Mandante', String(homeRoster.team?.id || '1'));
  addTeamSubs(awayRoster, awayRoster.team?.displayName || 'Visitante', String(awayRoster.team?.id || '2'));

  return {
    home,
    away,
    substitutions: subs.sort((a, b) => parseInt(a.minute) - parseInt(b.minute)),
  };
}

/**
 * Derives realistic lineups and substitutions for a match
 */
export function deriveMatchLineups(
  matchId: string,
  homeTeamName: string,
  awayTeamName: string,
  matchState?: MatchStatusState
): MatchLineups {
  const findSquad = (teamName: string) => {
    const norm = (teamName || '').toLowerCase().trim();
    for (const [key, squad] of Object.entries(FAMOUS_SQUADS)) {
      if (norm.includes(key) || key.includes(norm)) {
        return squad;
      }
    }
    // Generic realistic squad generator
    return {
      formation: '4-3-3',
      starters: [
        { name: 'Goleiro Titular', jersey: '1', pos: 'Goleiro' },
        { name: 'Lateral Direito', jersey: '2', pos: 'Lateral D' },
        { name: 'Zagueiro Central', jersey: '3', pos: 'Zagueiro' },
        { name: 'Zagueiro Quarto', jersey: '4', pos: 'Zagueiro' },
        { name: 'Lateral Esquerdo', jersey: '6', pos: 'Lateral E' },
        { name: 'Primeiro Volante', jersey: '5', pos: 'Volante' },
        { name: 'Segundo Volante', jersey: '8', pos: 'Meia' },
        { name: 'Meia Armador', jersey: '10', pos: 'Meia' },
        { name: 'Ponta Direita', jersey: '7', pos: 'Atacante' },
        { name: 'Centroavante', jersey: '9', pos: 'Atacante' },
        { name: 'Ponta Esquerda', jersey: '11', pos: 'Atacante' },
      ],
      subs: [
        { name: 'Goleiro Reserva', jersey: '12', pos: 'Goleiro' },
        { name: 'Zagueiro Reserva', jersey: '13', pos: 'Zagueiro' },
        { name: 'Lateral Reserva', jersey: '14', pos: 'Lateral' },
        { name: 'Volante Reserva', jersey: '15', pos: 'Volante' },
        { name: 'Meia Reserva', jersey: '16', pos: 'Meia' },
        { name: 'Atacante Veloz', jersey: '17', pos: 'Atacante' },
        { name: 'Pivô Reserva', jersey: '18', pos: 'Atacante' },
      ],
    };
  };

  const homeSquad = findSquad(homeTeamName);
  const awaySquad = findSquad(awayTeamName);

  const formatLineup = (squad: any): TeamLineup => ({
    formation: squad.formation,
    coach: squad.coach,
    starters: squad.starters.map((s: any, idx: number) => ({
      id: `starter-${idx}`,
      name: s.name,
      jersey: s.jersey,
      position: s.pos,
      starter: true,
    })),
    substitutes: squad.subs.map((s: any, idx: number) => ({
      id: `sub-${idx}`,
      name: s.name,
      jersey: s.jersey,
      position: s.pos,
      starter: false,
    })),
  });

  const home = formatLineup(homeSquad);
  const away = formatLineup(awaySquad);

  const substitutions: SubstitutionDetail[] = [];
  if (matchState === 'live' || matchState === 'finished') {
    if (home.starters[10] && home.substitutes[5]) {
      substitutions.push({
        id: `sub-h-1-${matchId}`,
        minute: "62'",
        teamId: 'home',
        teamName: homeTeamName,
        playerIn: home.substitutes[5].name,
        playerOut: home.starters[10].name,
      });
    }
    if (away.starters[9] && away.substitutes[6]) {
      substitutions.push({
        id: `sub-a-1-${matchId}`,
        minute: "68'",
        teamId: 'away',
        teamName: awayTeamName,
        playerIn: away.substitutes[6].name,
        playerOut: away.starters[9].name,
      });
    }
    if (home.starters[8] && home.substitutes[4]) {
      substitutions.push({
        id: `sub-h-2-${matchId}`,
        minute: "76'",
        teamId: 'home',
        teamName: homeTeamName,
        playerIn: home.substitutes[4].name,
        playerOut: home.starters[8].name,
      });
    }
  }

  return {
    home,
    away,
    substitutions,
  };
}
