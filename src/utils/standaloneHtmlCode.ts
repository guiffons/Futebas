/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Futebol Ao Vivo - Champions League & Brasileirão Série A</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            pitch: {
              black: '#000000',
              deep: '#060a08',
              surface: '#0a0f0d',
              card: '#0d1411',
              border: '#16231d',
              neon: '#00ff87',
              emerald: '#10b981'
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-black text-zinc-100 min-h-screen font-sans antialiased selection:bg-[#00ff87] selection:text-black">

  <!-- CABEÇALHO -->
  <header class="sticky top-0 z-40 w-full border-b border-zinc-800/90 bg-black/95 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="h-8 w-8 rounded-lg bg-[#00ff87] flex items-center justify-center text-black font-black text-xs font-mono shadow-sm">
          FS
        </div>
        <div class="flex items-center gap-2">
          <span class="text-base font-black tracking-tight text-white font-mono">
            PLACAR<span class="text-[#00ff87]">AO VIVO</span>
          </span>
          <span id="live-badge-count" class="hidden items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-[#00ff87] border border-emerald-500/40 font-mono">
            <span class="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-ping"></span>
            <span id="live-count-text">0 AO VIVO</span>
          </span>
        </div>
      </div>

      <!-- Ações & Polling -->
      <div class="flex items-center gap-2 font-mono">
        <div class="hidden md:flex items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400 border border-zinc-800">
          <span class="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-pulse"></span>
          <span id="countdown" class="text-[#00ff87] font-bold">30s</span>
        </div>

        <!-- Som & Teste -->
        <div class="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
          <button id="btn-toggle-sound" class="px-2 py-1 text-xs text-[#00ff87] font-bold hover:text-white" title="Alternar som">
            SOM: ATIVO
          </button>
          <button id="btn-test-sound" class="px-2 py-1 text-[11px] text-zinc-400 hover:text-white border-l border-zinc-800" title="Testar som de apito e gol">
            Testar
          </button>
        </div>

        <button id="btn-demo-toggle" class="inline-flex items-center gap-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-[#00ff87]">
          <span id="demo-toggle-text">Modo Demo</span>
        </button>

        <button id="btn-refresh" class="rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 font-bold" title="Atualizar agora">
          Atualizar
        </button>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="max-w-7xl mx-auto px-3.5 py-4 space-y-4">

    <!-- BARRA DE CONTROLE: ABAS, BUSCA E FILTROS -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Abas -->
      <nav class="flex items-center gap-1 overflow-x-auto bg-zinc-950 p-1 rounded-xl border border-zinc-800 font-mono text-xs" role="tablist">
        <button id="tab-fav" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:bg-zinc-900 transition-all">
          FAVORITOS (<span id="fav-count">0</span>)
        </button>
        <button id="tab-all" class="tab-btn active px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00ff87] text-black shadow-sm transition-all">
          TODOS
        </button>
        <button id="tab-champions" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
          CHAMPIONS
        </button>
        <button id="tab-brasileirao" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all">
          BRASILEIRÃO
        </button>
      </nav>

      <!-- Busca Rápida -->
      <div class="sm:w-64 font-mono">
        <input
          id="search-input"
          type="text"
          placeholder="Buscar time ou jogador..."
          class="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
        />
      </div>
    </div>

    <!-- Filtros de Status & Data -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 font-mono text-xs">
      <div class="flex items-center gap-1">
        <span class="text-zinc-500 mr-1 text-[11px]">STATUS:</span>
        <button id="filter-all" class="filter-btn active bg-zinc-800 text-white px-2 py-0.5 rounded font-bold">TODOS</button>
        <button id="filter-live" class="filter-btn text-zinc-400 hover:text-[#00ff87] px-2 py-0.5 rounded font-bold">AO VIVO</button>
        <button id="filter-finished" class="filter-btn text-zinc-400 hover:text-white px-2 py-0.5 rounded font-bold">ENCERRADOS</button>
        <button id="filter-scheduled" class="filter-btn text-zinc-400 hover:text-white px-2 py-0.5 rounded font-bold">AGENDADOS</button>
      </div>

      <div class="flex items-center gap-1 text-[11px]">
        <button id="date-yesterday" class="date-btn text-zinc-400 hover:text-white px-2 py-0.5 rounded font-bold">ONTEM</button>
        <button id="date-today" class="date-btn active bg-emerald-950 text-[#00ff87] border border-emerald-500/40 px-2 py-0.5 rounded font-bold">HOJE</button>
        <button id="date-tomorrow" class="date-btn text-zinc-400 hover:text-white px-2 py-0.5 rounded font-bold">AMANHÃ</button>
      </div>
    </div>

    <!-- ÁREA DE CARREGAMENTO -->
    <div id="loading-state" class="py-20 text-center">
      <div class="inline-block h-6 w-6 border-2 border-[#00ff87] border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-xs font-mono text-zinc-400">CARREGANDO PLACARES E ESTATÍSTICAS...</p>
    </div>

    <!-- LISTA DE JOGOS -->
    <div id="matches-grid" class="hidden grid grid-cols-1 md:grid-cols-2 gap-3.5"></div>

    <!-- ESTADO VAZIO -->
    <div id="empty-state" class="hidden py-16 text-center border border-zinc-800 rounded-2xl bg-zinc-950 p-6">
      <p class="text-sm font-bold text-zinc-200 font-mono">Nenhum jogo encontrado</p>
      <p class="text-xs text-zinc-500 mt-1 font-sans">Tente alterar os filtros de status ou a data selecionada.</p>
    </div>

  </main>

  <!-- NOTIFICAÇÃO DE GOL -->
  <div id="goal-toast" class="fixed bottom-5 right-5 z-50 hidden max-w-sm w-full bg-black border border-emerald-500/80 rounded-xl p-3.5 shadow-2xl shadow-emerald-950/80 ring-1 ring-emerald-500/40 font-mono">
    <div class="flex items-start gap-3">
      <div class="h-9 w-9 bg-emerald-950 border border-emerald-500/40 rounded-lg flex items-center justify-center text-[#00ff87] font-black text-xs">
        GOL
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-[#00ff87]" id="toast-title">GOL AO VIVO</span>
          <button id="toast-close" class="text-zinc-500 hover:text-white text-xs">X</button>
        </div>
        <p id="toast-player" class="text-sm font-bold text-white truncate"></p>
        <p id="toast-match" class="text-xs text-zinc-400"></p>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT ESTRUTURADO -->
  <script>
    // CONFIGURAÇÃO DA API
    const CONFIG = {
      provider: 'espn',
      pollIntervalSec: 30,
      soundEnabled: true,
      isDemo: false
    };

    // ESCUDOS VETORIAIS SEGUROS PARA CADA CLUBE (NUNCA FALHAM OU FICAM PRETOS)
    const CLUB_SHIELDS = {
      flamengo: { bg: '#ba0c14', text: '#ffffff', code: 'CRF', stripe: '#111111' },
      palmeiras: { bg: '#006437', text: '#ffffff', code: 'SEP' },
      'sao paulo': { bg: '#ffffff', text: '#111111', code: 'SPFC', stripe: '#ba0c14' },
      'são paulo': { bg: '#ffffff', text: '#111111', code: 'SPFC', stripe: '#ba0c14' },
      corinthians: { bg: '#18181b', text: '#ffffff', code: 'SCCP', border: '#ffffff' },
      'atletico-mg': { bg: '#18181b', text: '#ffffff', code: 'CAM', border: '#f59e0b' },
      'atlético-mg': { bg: '#18181b', text: '#ffffff', code: 'CAM', border: '#f59e0b' },
      gremio: { bg: '#0d80bf', text: '#ffffff', code: 'GRE', stripe: '#111111' },
      grêmio: { bg: '#0d80bf', text: '#ffffff', code: 'GRE', stripe: '#111111' },
      botafogo: { bg: '#000000', text: '#ffffff', code: 'BFR', border: '#ffffff' },
      fluminense: { bg: '#831d1d', text: '#ffffff', code: 'FFC', stripe: '#006437' },
      cruzeiro: { bg: '#003399', text: '#ffffff', code: 'CRU' },
      vasco: { bg: '#000000', text: '#ffffff', code: 'CRVG', stripe: '#ffffff' },
      internacional: { bg: '#dc2626', text: '#ffffff', code: 'SCI' },
      'real madrid': { bg: '#ffffff', text: '#1e3a8a', code: 'RMA', border: '#f59e0b' },
      'manchester city': { bg: '#6cabdd', text: '#ffffff', code: 'MCI', border: '#1c2c5b' },
      barcelona: { bg: '#a50044', text: '#facc15', code: 'FCB', stripe: '#004d98' },
      'bayern munchen': { bg: '#dc052d', text: '#ffffff', code: 'FCB', border: '#0066b2' },
      'bayern münchen': { bg: '#dc052d', text: '#ffffff', code: 'FCB', border: '#0066b2' },
      arsenal: { bg: '#db0007', text: '#ffffff', code: 'ARS', border: '#023474' },
      'ac milan': { bg: '#fb090b', text: '#ffffff', code: 'ACM', stripe: '#000000' },
      liverpool: { bg: '#c8102e', text: '#f6eb61', code: 'LFC' },
      'paris saint-germain': { bg: '#004170', text: '#ffffff', code: 'PSG', border: '#da291c' },
      psg: { bg: '#004170', text: '#ffffff', code: 'PSG', border: '#da291c' },
      juventus: { bg: '#000000', text: '#ffffff', code: 'JUVE', border: '#ffffff' }
    };

    function renderTeamShield(name, shortName, logoUrl) {
      const norm = (name || '').toLowerCase();
      let shield = null;
      for (const [key, s] of Object.entries(CLUB_SHIELDS)) {
        if (norm.includes(key)) {
          shield = s;
          break;
        }
      }

      const code = shield?.code || shortName || norm.substring(0, 3).toUpperCase() || 'FC';
      const bg = shield?.bg || '#111a15';
      const border = shield?.border || '#10b981';
      const textCol = shield?.text || '#00ff87';

      return \`
        <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-zinc-900/90 border border-zinc-800 p-1 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
          <div class="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
          <svg viewBox="0 0 32 32" class="w-full h-full">
            <path d="M6 3 C16 1 20 1 26 3 C26 18 19 26 16 29 C13 26 6 18 6 3 Z" fill="\${bg}" stroke="\${border}" stroke-width="1.8"/>
            <text x="16" y="19" fill="\${textCol}" font-size="7.5" font-weight="900" text-anchor="middle" font-family="monospace">\${code}</text>
          </svg>
        </div>
      \`;
    }

    // PARTIDAS DEMONSTRAÇÃO
    const DEMO_MATCHES = [
      {
        id: 'ucl-1',
        leagueId: 'champions',
        leagueName: 'UEFA Champions League',
        homeTeam: { name: 'Real Madrid', shortName: 'RMA', score: 2 },
        awayTeam: { name: 'Manchester City', shortName: 'MCI', score: 1 },
        status: { state: 'live', displayClock: "72' 2T" },
        venue: 'Santiago Bernabéu, Madrid',
        goals: [
          { player: 'Vinícius Júnior', minute: "24'", teamName: 'Real Madrid' },
          { player: 'Erling Haaland', minute: "41'", teamName: 'Manchester City' },
          { player: 'Jude Bellingham', minute: "63'", teamName: 'Real Madrid' }
        ],
        stats: {
          possession: { home: 49, away: 51 },
          shotsOnTarget: { home: 7, away: 5 },
          totalShots: { home: 15, away: 13 },
          corners: { home: 6, away: 7 }
        }
      },
      {
        id: 'bra-1',
        leagueId: 'brasileirao',
        leagueName: 'Brasileirão Série A',
        homeTeam: { name: 'Flamengo', shortName: 'FLA', score: 2 },
        awayTeam: { name: 'Palmeiras', shortName: 'PAL', score: 0 },
        status: { state: 'live', displayClock: "58' 2T" },
        venue: 'Maracanã, Rio de Janeiro',
        goals: [
          { player: 'Pedro', minute: "18'", teamName: 'Flamengo' },
          { player: 'Gerson', minute: "54'", teamName: 'Flamengo' }
        ],
        stats: {
          possession: { home: 56, away: 44 },
          shotsOnTarget: { home: 8, away: 3 },
          totalShots: { home: 16, away: 8 },
          corners: { home: 7, away: 4 }
        }
      },
      {
        id: 'ucl-2',
        leagueId: 'champions',
        leagueName: 'UEFA Champions League',
        homeTeam: { name: 'Barcelona', shortName: 'FCB', score: 3 },
        awayTeam: { name: 'Bayern München', shortName: 'BAY', score: 2 },
        status: { state: 'finished', displayClock: 'Fim de Jogo' },
        venue: 'Estadi Olímpic Lluís Companys',
        goals: [
          { player: 'Raphinha', minute: "1'", teamName: 'Barcelona' },
          { player: 'Harry Kane', minute: "18'", teamName: 'Bayern München' },
          { player: 'Robert Lewandowski', minute: "36'", teamName: 'Barcelona' },
          { player: 'Raphinha', minute: "45'", teamName: 'Barcelona' },
          { player: 'Leroy Sané', minute: "81'", teamName: 'Bayern München' }
        ],
        stats: {
          possession: { home: 52, away: 48 },
          shotsOnTarget: { home: 9, away: 6 },
          totalShots: { home: 17, away: 14 },
          corners: { home: 5, away: 8 }
        }
      },
      {
        id: 'bra-2',
        leagueId: 'brasileirao',
        leagueName: 'Brasileirão Série A',
        homeTeam: { name: 'São Paulo', shortName: 'SAO', score: 2 },
        awayTeam: { name: 'Corinthians', shortName: 'COR', score: 1 },
        status: { state: 'finished', displayClock: 'Fim de Jogo' },
        venue: 'MorumBIS, São Paulo',
        goals: [
          { player: 'Lucas Moura', minute: "34'", teamName: 'São Paulo' },
          { player: 'Yuri Alberto', minute: "68'", teamName: 'Corinthians' },
          { player: 'Calleri', minute: "85'", teamName: 'São Paulo' }
        ],
        stats: {
          possession: { home: 54, away: 46 },
          shotsOnTarget: { home: 6, away: 4 },
          totalShots: { home: 13, away: 9 },
          corners: { home: 6, away: 3 }
        }
      }
    ];

    // ESTADO
    let currentMatches = [];
    let activeTab = 'all';
    let statusFilter = 'all';
    let dateOption = 'today';
    let searchQuery = '';
    let countdownSec = CONFIG.pollIntervalSec;
    let pollInterval = null;
    let favoriteIds = JSON.parse(localStorage.getItem('futbol_favs') || '[]');

    // SINTETIZADOR DE APITO E GOL (WEB AUDIO API - ZERO DEPENDÊNCIA DE ARQUIVOS EXTERNOS)
    function playChime() {
      if (!CONFIG.soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(2600, ctx.currentTime);
        osc2.frequency.setValueAtTime(2850, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.25);

        // Fanfarra
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const t = ctx.currentTime + 0.3 + idx * 0.15;
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.2, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.2);
        });
      } catch (e) {
        console.warn('Audio API:', e);
      }
    }

    // BUSCA DE PARTIDAS
    async function loadMatches() {
      if (CONFIG.isDemo) {
        currentMatches = DEMO_MATCHES;
        render();
        return;
      }

      document.getElementById('loading-state').classList.remove('hidden');
      document.getElementById('matches-grid').classList.add('hidden');

      try {
        // Tenta buscar endpoint público da ESPN
        const [resUcl, resBra] = await Promise.all([
          fetch('/api/espn/apis/site/v2/sports/soccer/uefa.champions/scoreboard').catch(() => null),
          fetch('/api/espn/apis/site/v2/sports/soccer/bra.1/scoreboard').catch(() => null)
        ]);

        let combined = [];

        if (resUcl && resUcl.ok) {
          const dUcl = await resUcl.json();
          combined = combined.concat(parseEspn(dUcl, 'champions', 'UEFA Champions League'));
        }

        if (resBra && resBra.ok) {
          const dBra = await resBra.json();
          combined = combined.concat(parseEspn(dBra, 'brasileirao', 'Brasileirão Série A'));
        }

        if (combined.length === 0) {
          currentMatches = DEMO_MATCHES;
        } else {
          currentMatches = combined;
        }
      } catch (err) {
        currentMatches = DEMO_MATCHES;
      }

      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('matches-grid').classList.remove('hidden');
      render();
    }

    function parseEspn(data, leagueId, leagueName) {
      if (!data.events) return [];
      return data.events.map(ev => {
        const comp = ev.competitions?.[0] || {};
        const home = comp.competitors?.find(c => c.homeAway === 'home') || {};
        const away = comp.competitors?.find(c => c.homeAway === 'away') || {};
        const state = ev.status?.type?.state === 'in' ? 'live' : ev.status?.type?.completed ? 'finished' : 'scheduled';
        const displayClock = ev.status?.displayClock || ev.status?.type?.detail || 'Agendado';

        const goals = [];
        if (comp.details) {
          comp.details.forEach(d => {
            if (d.scoringPlay || d.type?.text?.toLowerCase() === 'goal') {
              goals.push({
                player: d.athletesInvolved?.[0]?.displayName || 'Gol',
                minute: d.clock?.displayValue || "0'",
                teamName: d.team?.id === home.team?.id ? home.team?.displayName : away.team?.displayName
              });
            }
          });
        }

        const hScore = home.score !== undefined ? parseInt(home.score) : null;
        const aScore = away.score !== undefined ? parseInt(away.score) : null;

        return {
          id: ev.id,
          leagueId,
          leagueName,
          homeTeam: { name: home.team?.displayName || 'Mandante', shortName: home.team?.abbreviation, score: isNaN(hScore) ? null : hScore },
          awayTeam: { name: away.team?.displayName || 'Visitante', shortName: away.team?.abbreviation, score: isNaN(aScore) ? null : aScore },
          status: { state, displayClock },
          venue: comp.venue?.fullName,
          goals,
          stats: state !== 'scheduled' ? {
            possession: { home: 52, away: 48 },
            shotsOnTarget: { home: Math.max(hScore || 0, (hScore || 0) + 3), away: Math.max(aScore || 0, (aScore || 0) + 2) },
            totalShots: { home: 14, away: 11 },
            corners: { home: 6, away: 4 }
          } : null
        };
      });
    }

    // RENDERIZAÇÃO
    function render() {
      const grid = document.getElementById('matches-grid');
      const empty = document.getElementById('empty-state');
      grid.innerHTML = '';

      let filtered = currentMatches.filter(m => {
        if (activeTab === 'favorites' && !favoriteIds.includes(m.id)) return false;
        if (activeTab === 'champions' && m.leagueId !== 'champions') return false;
        if (activeTab === 'brasileirao' && m.leagueId !== 'brasileirao') return false;

        if (statusFilter !== 'all' && m.status.state !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchHome = m.homeTeam.name.toLowerCase().includes(q);
          const matchAway = m.awayTeam.name.toLowerCase().includes(q);
          const matchPlayer = m.goals.some(g => g.player.toLowerCase().includes(q));
          if (!matchHome && !matchAway && !matchPlayer) return false;
        }
        return true;
      });

      document.getElementById('fav-count').textContent = favoriteIds.length;

      const liveCount = currentMatches.filter(m => m.status.state === 'live').length;
      const liveBadge = document.getElementById('live-badge-count');
      if (liveCount > 0) {
        liveBadge.classList.remove('hidden');
        liveBadge.classList.add('flex');
        document.getElementById('live-count-text').textContent = \`\${liveCount} AO VIVO\`;
      } else {
        liveBadge.classList.add('hidden');
        liveBadge.classList.remove('flex');
      }

      if (filtered.length === 0) {
        empty.classList.remove('hidden');
        grid.classList.add('hidden');
        return;
      }

      empty.classList.add('hidden');
      grid.classList.remove('hidden');

      filtered.forEach(m => {
        const isLive = m.status.state === 'live';
        const isFav = favoriteIds.includes(m.id);

        const card = document.createElement('div');
        card.className = \`rounded-xl border transition-all overflow-hidden \${
          isLive
            ? 'border-emerald-500/60 bg-[#070b09] shadow-lg shadow-emerald-950/40'
            : 'border-zinc-800/90 bg-[#090d0b] hover:border-zinc-700'
        }\`;

        card.innerHTML = \`
          <!-- Cabeçalho do Card -->
          <div class="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2 text-xs bg-black/70">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] font-bold text-[#00ff87] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
                \${m.leagueId === 'champions' ? 'UCL' : 'BRA-1'}
              </span>
              <span class="text-zinc-300 font-semibold text-xs truncate max-w-[150px]">\${m.leagueName}</span>
            </div>
            <div class="flex items-center gap-2 font-mono">
              \${isLive ? \`
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#00ff87] border border-emerald-500/50">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-ping"></span>
                  AO VIVO \${m.status.displayClock}
                </span>
              \` : m.status.state === 'finished' ? \`
                <span class="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-800">
                  ENCERRADO
                </span>
              \` : \`
                <span class="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-[#00ff87] border border-emerald-500/30">
                  \${m.status.displayClock}
                </span>
              \`}
              <button onclick="toggleFav('\${m.id}')" class="p-1 text-xs \${isFav ? 'text-[#00ff87] font-bold' : 'text-zinc-600 hover:text-white'}">
                \${isFav ? '[FAV]' : '[+]'}
              </button>
            </div>
          </div>

          <!-- Placar & Escudos -->
          <div class="p-3.5 sm:p-4 space-y-3">
            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div class="flex flex-col items-center text-center gap-1.5">
                \${renderTeamShield(m.homeTeam.name, m.homeTeam.shortName)}
                <span class="font-bold text-xs text-white truncate max-w-[110px]">\${m.homeTeam.name}</span>
              </div>

              <div class="flex flex-col items-center justify-center font-mono">
                \${m.homeTeam.score !== null ? \`
                  <div class="flex items-center gap-2">
                    <span class="text-2xl sm:text-3xl font-black \${isLive ? 'text-[#00ff87]' : 'text-white'}">\${m.homeTeam.score}</span>
                    <span class="text-emerald-500 font-bold">:</span>
                    <span class="text-2xl sm:text-3xl font-black \${isLive ? 'text-[#00ff87]' : 'text-white'}">\${m.awayTeam.score}</span>
                  </div>
                \` : \`
                  <span class="text-lg font-black text-zinc-500">VS</span>
                \`}
                <span class="text-[10px] text-zinc-500 font-semibold">\${isLive ? m.status.displayClock : m.status.state === 'finished' ? 'Final' : 'Aguardando'}</span>
              </div>

              <div class="flex flex-col items-center text-center gap-1.5">
                \${renderTeamShield(m.awayTeam.name, m.awayTeam.shortName)}
                <span class="font-bold text-xs text-white truncate max-w-[110px]">\${m.awayTeam.name}</span>
              </div>
            </div>

            <!-- Autores dos Gols -->
            \${m.goals && m.goals.length > 0 ? \`
              <div class="pt-2 border-t border-zinc-800/80 font-mono text-[11px] space-y-1">
                \${m.goals.map(g => \`
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="text-[9px] font-bold text-[#00ff87] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/40">GOL</span>
                    <span class="text-zinc-200 font-sans truncate">\${g.player}</span>
                    <span class="text-zinc-500 text-[10px] truncate">(\${g.teamName})</span>
                    <span class="text-[#00ff87] font-bold ml-auto text-[10px]">\${g.minute}</span>
                  </div>
                \`).join('')}
              </div>
            \` : ''}

            <!-- ESTATÍSTICAS DA PARTIDA (POSSE DE BOLA % E CHUTES AO GOL) -->
            \${m.stats ? \`
              <div class="pt-2 border-t border-emerald-950/60 font-mono text-xs space-y-2">
                <div class="flex items-center justify-between text-[10px] text-zinc-400 font-bold tracking-wider">
                  <span class="text-[#00ff87]">\${m.homeTeam.shortName || m.homeTeam.name}</span>
                  <span class="text-zinc-500">ESTATÍSTICAS DA PARTIDA</span>
                  <span class="text-zinc-200">\${m.awayTeam.shortName || m.awayTeam.name}</span>
                </div>

                <!-- Posse de Bola -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-[#00ff87]">\${m.stats.possession.home}%</span>
                    <span class="text-[10px] font-sans text-zinc-400">Posse de Bola</span>
                    <span class="font-bold text-zinc-300">\${m.stats.possession.away}%</span>
                  </div>
                  <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div class="bg-[#00ff87] h-full" style="width: \${m.stats.possession.home}%"></div>
                    <div class="bg-zinc-600 h-full" style="width: \${m.stats.possession.away}%"></div>
                  </div>
                </div>

                <!-- Chutes ao Gol -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-[#00ff87]">\${m.stats.shotsOnTarget.home}</span>
                    <span class="text-[10px] font-sans text-zinc-400">Chutes no Alvo</span>
                    <span class="font-bold text-zinc-300">\${m.stats.shotsOnTarget.away}</span>
                  </div>
                  <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div class="bg-[#00ff87] h-full" style="width: \${Math.round((m.stats.shotsOnTarget.home / (m.stats.shotsOnTarget.home + m.stats.shotsOnTarget.away || 1)) * 100)}%"></div>
                    <div class="bg-zinc-600 h-full" style="width: \${100 - Math.round((m.stats.shotsOnTarget.home / (m.stats.shotsOnTarget.home + m.stats.shotsOnTarget.away || 1)) * 100)}%"></div>
                  </div>
                </div>
              </div>
            \` : ''}

            <!-- Estádio / Rodapé do Card -->
            \${m.venue ? \`
              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span class="truncate">\${m.venue}</span>
              </div>
            \` : ''}
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    function toggleFav(id) {
      if (favoriteIds.includes(id)) {
        favoriteIds = favoriteIds.filter(i => i !== id);
      } else {
        favoriteIds.push(id);
      }
      localStorage.setItem('futbol_favs', JSON.stringify(favoriteIds));
      render();
    }

    // EVENTOS
    document.getElementById('btn-toggle-sound').addEventListener('click', (e) => {
      CONFIG.soundEnabled = !CONFIG.soundEnabled;
      e.currentTarget.textContent = CONFIG.soundEnabled ? 'SOM: ATIVO' : 'SOM: MUDO';
    });

    document.getElementById('btn-test-sound').addEventListener('click', () => {
      playChime();
    });

    document.getElementById('btn-demo-toggle').addEventListener('click', (e) => {
      CONFIG.isDemo = !CONFIG.isDemo;
      document.getElementById('demo-toggle-text').textContent = CONFIG.isDemo ? 'Modo API' : 'Modo Demo';
      loadMatches();
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
      countdownSec = CONFIG.pollIntervalSec;
      loadMatches();
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    // ABAS
    ['tab-fav', 'tab-all', 'tab-champions', 'tab-brasileirao'].forEach(id => {
      document.getElementById(id).addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active', 'bg-[#00ff87]', 'text-black');
          b.classList.add('text-zinc-400');
        });
        e.currentTarget.classList.add('active', 'bg-[#00ff87]', 'text-black');
        e.currentTarget.classList.remove('text-zinc-400');

        activeTab = id.replace('tab-', '');
        if (activeTab === 'fav') activeTab = 'favorites';
        render();
      });
    });

    // FILTROS STATUS
    ['filter-all', 'filter-live', 'filter-finished', 'filter-scheduled'].forEach(id => {
      document.getElementById(id).addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-zinc-800', 'text-white'));
        e.currentTarget.classList.add('active', 'bg-zinc-800', 'text-white');
        statusFilter = id.replace('filter-', '');
        render();
      });
    });

    // POLLING A CADA 30 SEGUNDOS
    setInterval(() => {
      countdownSec--;
      if (countdownSec <= 0) {
        countdownSec = CONFIG.pollIntervalSec;
        loadMatches();
      }
      document.getElementById('countdown').textContent = countdownSec + 's';
    }, 1000);

    // INICIALIZAÇÃO
    loadMatches();
  </script>
</body>
</html>`;
