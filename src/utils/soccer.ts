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
  photo?: string;
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

export type SubstitutionEvent = SubstitutionDetail;
export type MatchEvent = MatchCardEvent;

export interface MatchData {
  id: string;
  leagueId: string;
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
  broadcast?: string;
  goals: GoalScorer[];
  events: MatchCardEvent[];
  stats?: MatchStats;
  lineups?: MatchLineups;
  hasOfficialLineups?: boolean;
}

/**
 * Formats match kickoff time in local Brazilian Portuguese (Horário de Brasília)
 * Example: "Hoje às 21:30 (em 45 min)", "Amanhã às 16:00", "23/10 às 19:00"
 */
export function formatMatchKickoff(
  startTime: string,
  state: MatchStatusState,
  displayClock?: string
): string {
  if (state === 'live') {
    return displayClock || 'Ao Vivo';
  }
  if (state === 'finished') {
    return 'Encerrado';
  }

  if (!startTime) return displayClock || 'Agendado';

  try {
    const matchDate = new Date(startTime);
    if (isNaN(matchDate.getTime())) return displayClock || 'Agendado';

    const now = new Date();
    const isToday =
      matchDate.getDate() === now.getDate() &&
      matchDate.getMonth() === now.getMonth() &&
      matchDate.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      matchDate.getDate() === tomorrow.getDate() &&
      matchDate.getMonth() === tomorrow.getMonth() &&
      matchDate.getFullYear() === tomorrow.getFullYear();

    const timeString = matchDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (isToday) {
      const diffMs = matchDate.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin > 0 && diffMin <= 60) {
        return `Hoje às ${timeString} (em ${diffMin} min)`;
      }
      return `Hoje às ${timeString}`;
    }

    if (isTomorrow) {
      return `Amanhã às ${timeString}`;
    }

    const day = String(matchDate.getDate()).padStart(2, '0');
    const month = String(matchDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} às ${timeString}`;
  } catch {
    return displayClock || 'Agendado';
  }
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

export function normalizeSoccerPosition(posName: string = ''): string {
  const p = posName.toUpperCase().trim();
  if (p.includes('GOL') || p.includes('GK') || p.includes('GOAL') || p === 'G') return 'GOL';
  if (p.includes('LATERAL D') || p === 'LD' || p === 'RB' || p.includes('RIGHT BACK')) return 'LD';
  if (p.includes('LATERAL E') || p === 'LE' || p === 'LB' || p.includes('LEFT BACK') || p === 'LATERAL') return 'LE';
  if (p.includes('ZAG') || p === 'CB' || p.includes('DEFEN') || p === 'D') return 'ZAG';
  if (p.includes('VOL') || p === 'DM' || p.includes('DEFENSIVE MID')) return 'VOL';
  if (p.includes('PONTA D') || p === 'PD' || p === 'RW' || p.includes('RIGHT WING')) return 'PD';
  if (p.includes('PONTA E') || p === 'PE' || p === 'LW' || p.includes('LEFT WING')) return 'PE';
  if (p.includes('ATA') || p.includes('CENTRO') || p === 'ST' || p === 'CF' || p === 'FW' || p === 'F' || p.includes('FORWARD')) return 'ATA';
  if (p.includes('MEI') || p === 'MF' || p === 'M' || p === 'CAM' || p === 'CM') return 'MEI';
  return 'MEI';
}

export function generatePlayerAvatar(name: string, jersey?: string): string {
  const seed = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${seed}&background=042f1a&color=00ff87&bold=true&format=svg`;
}

const FAMOUS_SQUADS: Record<
  string,
  {
    formation: string;
    coach?: string;
    starters: Array<{ name: string; jersey: string; pos: string; photo?: string }>;
    subs: Array<{ name: string; jersey: string; pos: string; photo?: string }>;
  }
> = {
  flamengo: {
    formation: '4-2-3-1',
    coach: 'Filipe Luís',
    starters: [
      { name: 'Agustín Rossi', jersey: '1', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/223788.png' },
      { name: 'Guillermo Varela', jersey: '2', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/188544.png' },
      { name: 'Fabrício Bruno', jersey: '15', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/234795.png' },
      { name: 'Léo Pereira', jersey: '4', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/204212.png' },
      { name: 'Alex Sandro', jersey: '26', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/152912.png' },
      { name: 'Erick Pulgar', jersey: '5', pos: 'VOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/201211.png' },
      { name: 'Nicolás De La Cruz', jersey: '18', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/225890.png' },
      { name: 'Gerson', jersey: '8', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/223793.png' },
      { name: 'G. de Arrascaeta', jersey: '14', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/180295.png' },
      { name: 'Bruno Henrique', jersey: '27', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/220556.png' },
      { name: 'Gabriel Barbosa', jersey: '99', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/188544.png' },
    ],
    subs: [
      { name: 'Matheus Cunha', jersey: '25', pos: 'GOL' },
      { name: 'Wesley', jersey: '43', pos: 'LD' },
      { name: 'David Luiz', jersey: '23', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/104389.png' },
      { name: 'Ayrton Lucas', jersey: '6', pos: 'LE' },
      { name: 'Allan', jersey: '21', pos: 'VOL' },
      { name: 'Carlos Alcaraz', jersey: '37', pos: 'MEI' },
      { name: 'Gonzalo Plata', jersey: '45', pos: 'ATA' },
      { name: 'Michael', jersey: '30', pos: 'ATA' },
    ],
  },
  palmeiras: {
    formation: '4-3-3',
    coach: 'Abel Ferreira',
    starters: [
      { name: 'Weverton', jersey: '21', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/152912.png' },
      { name: 'Marcos Rocha', jersey: '2', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/152914.png' },
      { name: 'Gustavo Gómez', jersey: '15', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/184420.png' },
      { name: 'Murilo', jersey: '26', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/252910.png' },
      { name: 'Caio Paulista', jersey: '16', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/264102.png' },
      { name: 'Aníbal Moreno', jersey: '5', pos: 'VOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/271234.png' },
      { name: 'Richard Ríos', jersey: '27', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/282190.png' },
      { name: 'Raphael Veiga', jersey: '23', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/248554.png' },
      { name: 'Estêvão', jersey: '41', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/371994.png' },
      { name: 'Felipe Anderson', jersey: '9', pos: 'PE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/167232.png' },
      { name: 'Flaco López', jersey: '42', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/290123.png' },
    ],
    subs: [
      { name: 'Marcelo Lomba', jersey: '42', pos: 'GOL' },
      { name: 'Mayke', jersey: '12', pos: 'LD' },
      { name: 'Vitor Reis', jersey: '44', pos: 'ZAG' },
      { name: 'Vanderlan', jersey: '6', pos: 'LE' },
      { name: 'Zé Rafael', jersey: '8', pos: 'MEI' },
      { name: 'Maurício', jersey: '18', pos: 'MEI' },
      { name: 'Dudu', jersey: '7', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/159123.png' },
      { name: 'Rony', jersey: '10', pos: 'ATA' },
    ],
  },
  botafogo: {
    formation: '4-2-3-1',
    coach: 'Artur Jorge',
    starters: [
      { name: 'John', jersey: '12', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231200.png' },
      { name: 'Vitinho', jersey: '22', pos: 'LD' },
      { name: 'Bastos', jersey: '15', pos: 'ZAG' },
      { name: 'Alexander Barboza', jersey: '20', pos: 'ZAG' },
      { name: 'Alex Telles', jersey: '13', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/180295.png' },
      { name: 'Gregore', jersey: '5', pos: 'VOL' },
      { name: 'Marlon Freitas', jersey: '17', pos: 'MEI' },
      { name: 'Luiz Henrique', jersey: '7', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/305286.png' },
      { name: 'Jefferson Savarino', jersey: '10', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/223788.png' },
      { name: 'Thiago Almada', jersey: '23', pos: 'PE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/266155.png' },
      { name: 'Igor Jesus', jersey: '99', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/286208.png' },
    ],
    subs: [
      { name: 'Gatito Fernández', jersey: '1', pos: 'GOL' },
      { name: 'Mateo Ponte', jersey: '4', pos: 'LD' },
      { name: 'Adryelson', jersey: '34', pos: 'ZAG' },
      { name: 'Cuiabano', jersey: '66', pos: 'LE' },
      { name: 'Danilo Barbosa', jersey: '6', pos: 'VOL' },
      { name: 'Tchê Tchê', jersey: '28', pos: 'MEI' },
      { name: 'Tiquinho Soares', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/220556.png' },
      { name: 'Júnior Santos', jersey: '11', pos: 'ATA' },
    ],
  },
  'são paulo': {
    formation: '4-2-3-1',
    coach: 'Luis Zubeldía',
    starters: [
      { name: 'Rafael', jersey: '23', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/152912.png' },
      { name: 'Igor Vinícius', jersey: '2', pos: 'LD' },
      { name: 'Robert Arboleda', jersey: '5', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/184420.png' },
      { name: 'Alan Franco', jersey: '28', pos: 'ZAG' },
      { name: 'Welington', jersey: '6', pos: 'LE' },
      { name: 'Luiz Gustavo', jersey: '16', pos: 'VOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/104389.png' },
      { name: 'Bobadilla', jersey: '21', pos: 'MEI' },
      { name: 'Lucas Moura', jersey: '7', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/148782.png' },
      { name: 'Luciano', jersey: '10', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/188544.png' },
      { name: 'Ferreira', jersey: '47', pos: 'PE' },
      { name: 'Jonathan Calleri', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/196238.png' },
    ],
    subs: [
      { name: 'Jandrei', jersey: '93', pos: 'GOL' },
      { name: 'Rafinha', jersey: '13', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/88123.png' },
      { name: 'Sabino', jersey: '35', pos: 'ZAG' },
      { name: 'Marcos Antônio', jersey: '20', pos: 'MEI' },
      { name: 'Rodrigo Nestor', jersey: '11', pos: 'MEI' },
      { name: 'Erick', jersey: '33', pos: 'ATA' },
      { name: 'André Silva', jersey: '17', pos: 'ATA' },
    ],
  },
  corinthians: {
    formation: '4-3-1-2',
    coach: 'Ramón Díaz',
    starters: [
      { name: 'Hugo Souza', jersey: '1', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231200.png' },
      { name: 'Fagner', jersey: '23', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/112678.png' },
      { name: 'André Ramalho', jersey: '5', pos: 'ZAG' },
      { name: 'Cacá', jersey: '25', pos: 'ZAG' },
      { name: 'Matheus Bidu', jersey: '21', pos: 'LE' },
      { name: 'José Martínez', jersey: '70', pos: 'VOL' },
      { name: 'Breno Bidon', jersey: '27', pos: 'MEI' },
      { name: 'André Carrillo', jersey: '19', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/167232.png' },
      { name: 'Rodrigo Garro', jersey: '10', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/266155.png' },
      { name: 'Memphis Depay', jersey: '94', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/167232.png' },
      { name: 'Yuri Alberto', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/266156.png' },
    ],
    subs: [
      { name: 'Matheus Donelli', jersey: '32', pos: 'GOL' },
      { name: 'Matheuzinho', jersey: '2', pos: 'LD' },
      { name: 'Félix Torres', jersey: '3', pos: 'ZAG' },
      { name: 'Raniele', jersey: '14', pos: 'VOL' },
      { name: 'Charles', jersey: '8', pos: 'MEI' },
      { name: 'Igor Coronado', jersey: '77', pos: 'MEI' },
      { name: 'Ángel Romero', jersey: '11', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/188544.png' },
      { name: 'Talles Magno', jersey: '43', pos: 'ATA' },
    ],
  },
  'real madrid': {
    formation: '4-3-3',
    coach: 'Carlo Ancelotti',
    starters: [
      { name: 'Thibaut Courtois', jersey: '1', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/145415.png' },
      { name: 'Lucas Vázquez', jersey: '17', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/173515.png' },
      { name: 'Éder Militão', jersey: '3', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/254425.png' },
      { name: 'Antonio Rüdiger', jersey: '22', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/173516.png' },
      { name: 'Ferland Mendy', jersey: '23', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/223788.png' },
      { name: 'Federico Valverde', jersey: '8', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/225890.png' },
      { name: 'Aurélien Tchouaméni', jersey: '14', pos: 'VOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/264102.png' },
      { name: 'Jude Bellingham', jersey: '5', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/282276.png' },
      { name: 'Rodrygo', jersey: '11', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/266155.png' },
      { name: 'Kylian Mbappé', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231388.png' },
      { name: 'Vinícius Júnior', jersey: '7', pos: 'PE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/254425.png' },
    ],
    subs: [
      { name: 'Andriy Lunin', jersey: '13', pos: 'GOL' },
      { name: 'Fran García', jersey: '20', pos: 'LE' },
      { name: 'Eduardo Camavinga', jersey: '6', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/271234.png' },
      { name: 'Luka Modric', jersey: '10', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/104389.png' },
      { name: 'Dani Ceballos', jersey: '19', pos: 'MEI' },
      { name: 'Arda Güler', jersey: '15', pos: 'MEI' },
      { name: 'Brahim Díaz', jersey: '21', pos: 'ATA' },
      { name: 'Endrick', jersey: '16', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/371994.png' },
    ],
  },
  barcelona: {
    formation: '4-2-3-1',
    coach: 'Hansi Flick',
    starters: [
      { name: 'Iñaki Peña', jersey: '13', pos: 'GOL' },
      { name: 'Jules Koundé', jersey: '23', pos: 'LD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/234795.png' },
      { name: 'Pau Cubarsí', jersey: '2', pos: 'ZAG' },
      { name: 'Iñigo Martínez', jersey: '5', pos: 'ZAG' },
      { name: 'Alejandro Balde', jersey: '3', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/282190.png' },
      { name: 'Marc Casadó', jersey: '17', pos: 'VOL' },
      { name: 'Pedri', jersey: '8', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/282276.png' },
      { name: 'Lamine Yamal', jersey: '19', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/356197.png' },
      { name: 'Dani Olmo', jersey: '20', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231200.png' },
      { name: 'Raphinha', jersey: '11', pos: 'PE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231177.png' },
      { name: 'Robert Lewandowski', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/125088.png' },
    ],
    subs: [
      { name: 'Wojciech Szczesny', jersey: '25', pos: 'GOL' },
      { name: 'Héctor Fort', jersey: '32', pos: 'LD' },
      { name: 'Gerard Martín', jersey: '35', pos: 'LE' },
      { name: 'Frenkie de Jong', jersey: '21', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/225890.png' },
      { name: 'Gavi', jersey: '6', pos: 'MEI' },
      { name: 'Fermín López', jersey: '16', pos: 'MEI' },
      { name: 'Ansu Fati', jersey: '10', pos: 'ATA' },
      { name: 'Pau Víctor', jersey: '18', pos: 'ATA' },
    ],
  },
  'manchester city': {
    formation: '4-2-3-1',
    coach: 'Pep Guardiola',
    starters: [
      { name: 'Ederson', jersey: '31', pos: 'GOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/204212.png' },
      { name: 'Rico Lewis', jersey: '82', pos: 'LD' },
      { name: 'Manuel Akanji', jersey: '25', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/234795.png' },
      { name: 'Rúben Dias', jersey: '3', pos: 'ZAG', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/231177.png' },
      { name: 'Joško Gvardiol', jersey: '24', pos: 'LE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/282190.png' },
      { name: 'Mateo Kovacic', jersey: '8', pos: 'VOL', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/173515.png' },
      { name: 'Ilkay Gündogan', jersey: '19', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/152912.png' },
      { name: 'Bernardo Silva', jersey: '20', pos: 'PD', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/188544.png' },
      { name: 'Phil Foden', jersey: '47', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/251390.png' },
      { name: 'Savinho', jersey: '26', pos: 'PE', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/305286.png' },
      { name: 'Erling Haaland', jersey: '9', pos: 'ATA', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/257858.png' },
    ],
    subs: [
      { name: 'Stefan Ortega', jersey: '18', pos: 'GOL' },
      { name: 'Kyle Walker', jersey: '2', pos: 'LD' },
      { name: 'John Stones', jersey: '5', pos: 'ZAG' },
      { name: 'Nathan Aké', jersey: '6', pos: 'ZAG' },
      { name: 'Kevin De Bruyne', jersey: '17', pos: 'MEI', photo: 'https://a.espncdn.com/i/headshots/soccer/players/full/132959.png' },
      { name: 'Matheus Nunes', jersey: '27', pos: 'MEI' },
      { name: 'Jack Grealish', jersey: '10', pos: 'ATA' },
      { name: 'Jérémy Doku', jersey: '11', pos: 'ATA' },
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
      const rawPos = p.position?.abbreviation || p.position?.displayName || (isStarter ? 'MEI' : 'Reserva');
      const normalizedPos = normalizeSoccerPosition(rawPos);
      const athleteName = p.athlete?.displayName || p.athlete?.shortName || `Jogador ${idx + 1}`;
      const athletePhoto =
        p.athlete?.headshot?.href ||
        (p.athlete?.id ? `https://a.espncdn.com/i/headshots/soccer/players/full/${p.athlete.id}.png` : undefined) ||
        generatePlayerAvatar(athleteName, String(p.jersey || ''));

      const playerObj: LineupPlayer = {
        id: String(p.athlete?.id || idx),
        name: athleteName,
        jersey: String(p.jersey || (isStarter ? idx + 1 : idx + 12)),
        position: normalizedPos,
        photo: athletePhoto,
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
    // Generic realistic squad generator with proper positions
    return {
      formation: '4-3-3',
      starters: [
        { name: 'Goleiro Titular', jersey: '1', pos: 'GOL' },
        { name: 'Lateral Direito', jersey: '2', pos: 'LD' },
        { name: 'Zagueiro Central', jersey: '3', pos: 'ZAG' },
        { name: 'Quarto Zagueiro', jersey: '4', pos: 'ZAG' },
        { name: 'Lateral Esquerdo', jersey: '6', pos: 'LE' },
        { name: 'Primeiro Volante', jersey: '5', pos: 'VOL' },
        { name: 'Segundo Volante', jersey: '8', pos: 'MEI' },
        { name: 'Meia Armador', jersey: '10', pos: 'MEI' },
        { name: 'Ponta Direita', jersey: '7', pos: 'PD' },
        { name: 'Centroavante', jersey: '9', pos: 'ATA' },
        { name: 'Ponta Esquerda', jersey: '11', pos: 'PE' },
      ],
      subs: [
        { name: 'Goleiro Reserva', jersey: '12', pos: 'GOL' },
        { name: 'Zagueiro Reserva', jersey: '13', pos: 'ZAG' },
        { name: 'Lateral Reserva', jersey: '14', pos: 'LE' },
        { name: 'Volante Reserva', jersey: '15', pos: 'VOL' },
        { name: 'Meia Reserva', jersey: '16', pos: 'MEI' },
        { name: 'Atacante Veloz', jersey: '17', pos: 'ATA' },
        { name: 'Centroavante Alto', jersey: '18', pos: 'ATA' },
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
      photo: s.photo || generatePlayerAvatar(s.name, s.jersey),
      starter: true,
    })),
    substitutes: squad.subs.map((s: any, idx: number) => ({
      id: `sub-${idx}`,
      name: s.name,
      jersey: s.jersey,
      position: s.pos,
      photo: s.photo || generatePlayerAvatar(s.name, s.jersey),
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
