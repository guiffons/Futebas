/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamBadgeInfo {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  initials: string;
  svg: string;
}

/**
 * High-definition, authentic official club logos from ESPN CDN
 */
export const OFFICIAL_TEAM_LOGOS: Record<string, string> = {
  // Brasileirão Série A
  'flamengo': 'https://a.espncdn.com/i/teamlogos/soccer/500/819.png',
  'palmeiras': 'https://a.espncdn.com/i/teamlogos/soccer/500/2029.png',
  'são paulo': 'https://a.espncdn.com/i/teamlogos/soccer/500/2026.png',
  'sao paulo': 'https://a.espncdn.com/i/teamlogos/soccer/500/2026.png',
  'corinthians': 'https://a.espncdn.com/i/teamlogos/soccer/500/874.png',
  'atlético-mg': 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png',
  'atletico-mg': 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png',
  'atlético mineiro': 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png',
  'atletico mineiro': 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png',
  'grêmio': 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png',
  'gremio': 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png',
  'botafogo': 'https://a.espncdn.com/i/teamlogos/soccer/500/6076.png',
  'fluminense': 'https://a.espncdn.com/i/teamlogos/soccer/500/3445.png',
  'cruzeiro': 'https://a.espncdn.com/i/teamlogos/soccer/500/6272.png',
  'vasco': 'https://a.espncdn.com/i/teamlogos/soccer/500/3454.png',
  'vasco da gama': 'https://a.espncdn.com/i/teamlogos/soccer/500/3454.png',
  'internacional': 'https://a.espncdn.com/i/teamlogos/soccer/500/1936.png',
  'inter-rs': 'https://a.espncdn.com/i/teamlogos/soccer/500/1936.png',
  'bahia': 'https://a.espncdn.com/i/teamlogos/soccer/500/3406.png',
  'fortaleza': 'https://a.espncdn.com/i/teamlogos/soccer/500/3421.png',
  'athletico-pr': 'https://a.espncdn.com/i/teamlogos/soccer/500/6074.png',
  'atletico-pr': 'https://a.espncdn.com/i/teamlogos/soccer/500/6074.png',
  'santos': 'https://a.espncdn.com/i/teamlogos/soccer/500/2674.png',
  'remo': 'https://a.espncdn.com/i/teamlogos/soccer/500/4936.png',
  'vitória': 'https://a.espncdn.com/i/teamlogos/soccer/500/3455.png',
  'vitoria': 'https://a.espncdn.com/i/teamlogos/soccer/500/3455.png',
  'juventude': 'https://a.espncdn.com/i/teamlogos/soccer/500/3432.png',
  'criciúma': 'https://a.espncdn.com/i/teamlogos/soccer/500/3416.png',
  'criciuma': 'https://a.espncdn.com/i/teamlogos/soccer/500/3416.png',
  'red bull bragantino': 'https://a.espncdn.com/i/teamlogos/soccer/500/1999.png',
  'bragantino': 'https://a.espncdn.com/i/teamlogos/soccer/500/1999.png',
  'cuiabá': 'https://a.espncdn.com/i/teamlogos/soccer/500/10499.png',
  'cuiaba': 'https://a.espncdn.com/i/teamlogos/soccer/500/10499.png',
  'atlético-go': 'https://a.espncdn.com/i/teamlogos/soccer/500/7516.png',
  'atletico-go': 'https://a.espncdn.com/i/teamlogos/soccer/500/7516.png',

  // UEFA Champions League
  'real madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  'manchester city': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  'barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  'bayern münchen': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'bayern munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'bayern': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'arsenal': 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  'liverpool': 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  'paris saint-germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'psg': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'ac milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  'milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  'internazionale': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'inter milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'inter': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'juventus': 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  'borussia dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'chelsea': 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  'atletico madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'atlético de madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'manchester united': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'man united': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'como': 'https://a.espncdn.com/i/teamlogos/soccer/500/2572.png',
  'rb leipzig': 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  'leipzig': 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  'aston villa': 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png',
  'sporting cp': 'https://a.espncdn.com/i/teamlogos/soccer/500/340.png',
  'sporting': 'https://a.espncdn.com/i/teamlogos/soccer/500/340.png',
  'benfica': 'https://a.espncdn.com/i/teamlogos/soccer/500/338.png',
  'porto': 'https://a.espncdn.com/i/teamlogos/soccer/500/437.png',
  'bayer leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  'leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  'atalanta': 'https://a.espncdn.com/i/teamlogos/soccer/500/109.png',
  'monaco': 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  'lille': 'https://a.espncdn.com/i/teamlogos/soccer/500/164.png',
  'galatasaray': 'https://a.espncdn.com/i/teamlogos/soccer/500/434.png',
  'fenerbahçe': 'https://a.espncdn.com/i/teamlogos/soccer/500/436.png',
  'fenerbahce': 'https://a.espncdn.com/i/teamlogos/soccer/500/436.png',
  'slavia prague': 'https://a.espncdn.com/i/teamlogos/soccer/500/494.png',
  'club brugge': 'https://a.espncdn.com/i/teamlogos/soccer/500/490.png',
  'real betis': 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
  'feyenoord': 'https://a.espncdn.com/i/teamlogos/soccer/500/139.png',
  'shakhtar donetsk': 'https://a.espncdn.com/i/teamlogos/soccer/500/503.png',
  'shakhtar': 'https://a.espncdn.com/i/teamlogos/soccer/500/503.png',
  'lens': 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png',
  'viking fk': 'https://a.espncdn.com/i/teamlogos/soccer/500/409.png',
  'lask linz': 'https://a.espncdn.com/i/teamlogos/soccer/500/1435.png',
  'celtic': 'https://a.espncdn.com/i/teamlogos/soccer/500/301.png',
  'stuttgart': 'https://a.espncdn.com/i/teamlogos/soccer/500/134.png',
  'bologna': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  'girona': 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png',
  'psv eindhoven': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
  'psv': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
};

/**
 * Returns official CDN logo for any known club
 */
export function getOfficialLogoUrl(teamName: string): string | undefined {
  if (!teamName) return undefined;
  const norm = teamName.toLowerCase().trim();
  for (const [key, url] of Object.entries(OFFICIAL_TEAM_LOGOS)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return url;
    }
  }
  return undefined;
}

/**
 * Creates an inline SVG data URI for a soccer club shield
 */
function makeShieldSvg(bg: string, stroke: string, text: string, textCol: string, stripeCol?: string): string {
  const stripe = stripeCol
    ? `<path d="M12 4 L28 4 L20 28 L4 28 Z" fill="${stripeCol}" opacity="0.6"/>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
    <defs>
      <linearGradient id="g_${text}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="${bg}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <path d="M16 2 C24 2, 28 6, 28 14 C28 23, 20 28, 16 30 C12 28, 4 23, 4 14 C4 6, 8 2, 16 2 Z" fill="url(#g_${text})" stroke="${stroke}" stroke-width="2"/>
    ${stripe}
    <text x="16" y="19" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="900" fill="${textCol}" text-anchor="middle" letter-spacing="0.5">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TEAM_BADGES: Record<string, string> = {
  // Brasileirão Série A
  'flamengo': makeShieldSvg('#c60000', '#000000', 'CRF', '#ffffff', '#000000'),
  'palmeiras': makeShieldSvg('#006437', '#ffffff', 'SEP', '#ffffff'),
  'são paulo': makeShieldSvg('#ffffff', '#c60000', 'SPFC', '#18181b', '#c60000'),
  'sao paulo': makeShieldSvg('#ffffff', '#c60000', 'SPFC', '#18181b', '#c60000'),
  'corinthians': makeShieldSvg('#18181b', '#ffffff', 'SCCP', '#ffffff'),
  'atlético-mg': makeShieldSvg('#18181b', '#f59e0b', 'CAM', '#ffffff', '#f59e0b'),
  'atletico-mg': makeShieldSvg('#18181b', '#f59e0b', 'CAM', '#ffffff', '#f59e0b'),
  'grêmio': makeShieldSvg('#0d80bf', '#18181b', 'GRE', '#ffffff', '#18181b'),
  'gremio': makeShieldSvg('#0d80bf', '#18181b', 'GRE', '#ffffff', '#18181b'),
  'botafogo': makeShieldSvg('#18181b', '#ffffff', 'BFR', '#ffffff'),
  'fluminense': makeShieldSvg('#831d1d', '#006437', 'FFC', '#ffffff', '#006437'),
  'cruzeiro': makeShieldSvg('#003399', '#ffffff', 'CRU', '#ffffff'),
  'vasco': makeShieldSvg('#18181b', '#ffffff', 'CRVG', '#ffffff', '#dc2626'),
  'internacional': makeShieldSvg('#dc2626', '#ffffff', 'SCI', '#ffffff'),
  'bahia': makeShieldSvg('#0047ab', '#dc2626', 'ECB', '#ffffff', '#dc2626'),
  'fortaleza': makeShieldSvg('#003399', '#dc2626', 'FEC', '#ffffff', '#dc2626'),
  'athletico-pr': makeShieldSvg('#dc2626', '#18181b', 'CAP', '#ffffff', '#18181b'),
  'santos': makeShieldSvg('#ffffff', '#18181b', 'SFC', '#18181b'),
  'remo': makeShieldSvg('#002663', '#ffffff', 'REM', '#ffffff'),

  // UEFA Champions League
  'real madrid': makeShieldSvg('#ffffff', '#f59e0b', 'RMA', '#18181b', '#3b82f6'),
  'manchester city': makeShieldSvg('#6cabdd', '#1c2c5b', 'MCI', '#ffffff', '#1c2c5b'),
  'barcelona': makeShieldSvg('#a50044', '#004d98', 'FCB', '#edbb00', '#004d98'),
  'bayern münchen': makeShieldSvg('#dc052d', '#0066b2', 'FCB', '#ffffff', '#0066b2'),
  'bayern munich': makeShieldSvg('#dc052d', '#0066b2', 'FCB', '#ffffff', '#0066b2'),
  'bayern': makeShieldSvg('#dc052d', '#0066b2', 'FCB', '#ffffff', '#0066b2'),
  'arsenal': makeShieldSvg('#db0007', '#023474', 'ARS', '#ffffff', '#023474'),
  'ac milan': makeShieldSvg('#fb090b', '#000000', 'ACM', '#ffffff', '#000000'),
  'milan': makeShieldSvg('#fb090b', '#000000', 'ACM', '#ffffff', '#000000'),
  'liverpool': makeShieldSvg('#c8102e', '#00b2a9', 'LFC', '#f6eb61'),
  'paris saint-germain': makeShieldSvg('#004170', '#da291c', 'PSG', '#ffffff', '#da291c'),
  'psg': makeShieldSvg('#004170', '#da291c', 'PSG', '#ffffff', '#da291c'),
  'juventus': makeShieldSvg('#000000', '#ffffff', 'JUVE', '#ffffff'),
  'inter': makeShieldSvg('#010e80', '#000000', 'INT', '#ffffff', '#0090d0'),
  'inter milan': makeShieldSvg('#010e80', '#000000', 'INT', '#ffffff', '#0090d0'),
  'borussia dortmund': makeShieldSvg('#fde100', '#000000', 'BVB', '#000000'),
  'dortmund': makeShieldSvg('#fde100', '#000000', 'BVB', '#000000'),
  'chelsea': makeShieldSvg('#034694', '#ffffff', 'CFC', '#ffffff', '#db0007'),
  'atletico madrid': makeShieldSvg('#cb3524', '#272e61', 'ATM', '#ffffff', '#272e61'),
};

/**
 * Gets high-quality club badge fallback
 */
export function getClubBadgeFallback(teamName: string, shortName?: string): string {
  const norm = (teamName || '').toLowerCase().trim();
  for (const [key, badge] of Object.entries(TEAM_BADGES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return badge;
    }
  }
  const initials = shortName?.substring(0, 3).toUpperCase() || norm.substring(0, 3).toUpperCase() || 'FC';
  return makeShieldSvg('#09090b', '#10b981', initials, '#10b981');
}
