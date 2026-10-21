import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMatchStatus,
  extractGoalsFromEspnDetails,
  extractEventsFromEspnDetails,
  extractMatchStats,
  isMatchFavorite,
  toggleItemInList,
  deriveMatchStats,
} from './soccer.ts';

test('normalizeMatchStatus returns finished for completed match', () => {
  const result = normalizeMatchStatus({
    state: 'post',
    completed: true,
    detail: 'Final',
  });
  assert.equal(result.state, 'finished');
  assert.equal(result.label, 'Encerrado');
});

test('normalizeMatchStatus returns live for in-progress match with clock', () => {
  const result = normalizeMatchStatus(
    {
      state: 'in',
      completed: false,
      detail: '64\' 2T',
    },
    '64\''
  );
  assert.equal(result.state, 'live');
  assert.equal(result.label, 'Ao Vivo');
  assert.equal(result.displayClock, '64\'');
});

test('normalizeMatchStatus returns scheduled for upcoming match', () => {
  const result = normalizeMatchStatus({
    state: 'pre',
    completed: false,
    detail: 'Sun, 16:00',
  });
  assert.equal(result.state, 'scheduled');
  assert.equal(result.label, 'Agendado');
});

test('extractGoalsFromEspnDetails extracts scorer name, minute, and team correctly', () => {
  const mockDetails = [
    {
      type: { id: '70', text: 'Goal' },
      clock: { displayValue: "34'" },
      team: { id: 'team-a' },
      scoringPlay: true,
      athletesInvolved: [{ displayName: 'Vinícius Júnior' }],
    },
  ];

  const goals = extractGoalsFromEspnDetails(
    mockDetails,
    'team-a',
    'team-b',
    'Real Madrid',
    'Flamengo'
  );

  assert.equal(goals.length, 1);
  assert.equal(goals[0].player, 'Vinícius Júnior');
  assert.equal(goals[0].minute, "34'");
});

test('extractMatchStats parses possession and shots on target accurately', () => {
  const homeStats = [
    { name: 'possessionPct', displayValue: '58.4' },
    { name: 'shotsOnTarget', displayValue: '7' },
    { name: 'totalShots', displayValue: '14' },
    { name: 'wonCorners', displayValue: '6' },
  ];
  const awayStats = [
    { name: 'possessionPct', displayValue: '41.6' },
    { name: 'shotsOnTarget', displayValue: '3' },
    { name: 'totalShots', displayValue: '8' },
    { name: 'wonCorners', displayValue: '4' },
  ];

  const stats = extractMatchStats(homeStats, awayStats);
  assert.ok(stats);
  assert.equal(stats.possession.home, 58);
  assert.equal(stats.possession.away, 42);
  assert.equal(stats.shotsOnTarget.home, 7);
  assert.equal(stats.shotsOnTarget.away, 3);
  assert.equal(stats.totalShots.home, 14);
  assert.equal(stats.totalShots.away, 8);
});

test('isMatchFavorite matches by match ID or team name', () => {
  const dummyMatch: any = {
    id: 'match-123',
    homeTeam: { name: 'Flamengo' },
    awayTeam: { name: 'Palmeiras' },
  };

  assert.equal(isMatchFavorite(dummyMatch, ['match-123'], []), true);
  assert.equal(isMatchFavorite(dummyMatch, ['other-match'], []), false);
  assert.equal(isMatchFavorite(dummyMatch, [], ['Flamengo']), true);
  assert.equal(isMatchFavorite(dummyMatch, [], ['São Paulo']), false);

  const list = ['a', 'b'];
  assert.deepEqual(toggleItemInList(list, 'c'), ['a', 'b', 'c']);
  assert.deepEqual(toggleItemInList(list, 'a'), ['b']);
});

test('deriveMatchStats generates consistent, valid statistics for matches', () => {
  const stats = deriveMatchStats('game-ucl-10', 2, 1);
  assert.ok(stats);
  assert.ok(stats.possession.home >= 30 && stats.possession.home <= 70);
  assert.equal(stats.possession.home + stats.possession.away, 100);
  assert.ok(stats.shotsOnTarget.home >= 2);
  assert.ok(stats.shotsOnTarget.away >= 1);
  assert.ok(stats.totalShots.home >= stats.shotsOnTarget.home);
  assert.ok(stats.totalShots.away >= stats.shotsOnTarget.away);
});
