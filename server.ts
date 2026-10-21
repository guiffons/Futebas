/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. ESPN API Proxy with CORS, User-Agent, and error handling
app.use('/api/espn', async (req: Request, res: Response) => {
  const espnPath = req.url.replace(/^\//, '');
  const targetUrl = `https://site.api.espn.com/${espnPath}`;

  try {
    const fetchRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    const data = await fetchRes.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=15'); // short cache for fast live scores
    res.status(fetchRes.status).send(data);
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/json');
    res.status(502).json({ error: err.message || 'Error fetching ESPN data' });
  }
});

// 2. Image Proxy to prevent CORS/Referer blocking on club logos when shared
app.get('/api/image-proxy', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    res.status(400).send('Missing url parameter');
    return;
  }

  try {
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      res.status(400).send('Invalid protocol');
      return;
    }

    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!imageRes.ok) {
      res.status(imageRes.status).send('Failed to fetch image');
      return;
    }

    const contentType = imageRes.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

    const arrayBuffer = await imageRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send(err.message || 'Image proxy error');
  }
});

// 3. Gemini API Video Highlights & Match Recap endpoint
app.post('/api/gemini/highlights', async (req: Request, res: Response) => {
  try {
    const {
      homeTeam,
      awayTeam,
      score,
      competition,
      date,
      goals,
      events,
    } = req.body;

    const matchLabel = `${homeTeam || 'Mandante'} vs ${awayTeam || 'Visitante'}`;
    const scoreLabel = score || '';
    const compLabel = competition || 'Futebol';

    const prompt = `Você é o analista e curador esportivo de futebol da plataforma Futebas.
O usuário quer assistir aos melhores momentos ("Video Highlights") e ler o resumo dos lances do seguinte jogo:
- Partida: ${matchLabel}
- Placar: ${scoreLabel}
- Campeonato: ${compLabel}
- Data aproximada: ${date || 'recente'}
- Gols anotados: ${JSON.stringify(goals || [])}
- Eventos principais: ${JSON.stringify(events || [])}

Tarefas:
1. Faça uma pesquisa na web pelos vídeos de melhores momentos e gols reais desta partida (no YouTube, GE / Globo Esporte, CazéTV, TNT Sports, ESPN, etc.).
2. Identifique URLs ou IDs de vídeos do YouTube reais ou prováveis para embed (como formato "https://www.youtube.com/embed/VIDEO_ID" ou links diretos de busca/canal oficial).
3. Escreva um resumo empolgante em português dos melhores momentos do jogo, destacando os minutos e autores dos gols, lances capitais, defesas do goleiro e jogadas decisivas.
4. Forneça uma lista estruturada de lances capitais com minuto e descrição.

Responda OBRIGATORIAMENTE em JSON válido com a seguinte estrutura:
{
  "title": "Melhores Momentos: Nome do Jogo",
  "headline": "Uma frase de impacto sobre o resultado",
  "summary": "Texto de 2 a 3 parágrafos narrando o andamento do jogo, ritmo e gols",
  "youtubeEmbedUrl": "https://www.youtube-nocookie.com/embed/VIDEO_ID ou null se não houver um ID exato",
  "recommendedVideos": [
    {
      "title": "Título do vídeo oficial",
      "channel": "Canal (ex: CazéTV, GE, TNT Sports, ESPN Brasil)",
      "url": "Link para assistir no YouTube",
      "duration": "Ex: 10:15"
    }
  ],
  "goalsTimeline": [
    {
      "minute": "24'",
      "player": "Nome",
      "team": "Time",
      "description": "Como foi o gol"
    }
  ],
  "keyHighlights": [
    "Destaque 1",
    "Destaque 2",
    "Destaque 3"
  ],
  "playerOfTheMatch": {
    "name": "Craque do Jogo",
    "team": "Time",
    "reason": "Motivo do destaque"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Você é um assistente de jornalismo esportivo brasileiro especializado em futebol, tabelas e vídeos de melhores momentos. Sempre responda em JSON estrito sem markdown ao redor.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible backticks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Fallback search link if no video link was found
    const searchTerms = encodeURIComponent(`${homeTeam} ${awayTeam} melhores momentos gols`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchTerms}`;

    if (!parsedData.recommendedVideos || parsedData.recommendedVideos.length === 0) {
      parsedData.recommendedVideos = [
        {
          title: `Gols e Melhores Momentos: ${matchLabel}`,
          channel: 'YouTube Futebol',
          url: youtubeSearchUrl,
          duration: 'Oficial',
        },
      ];
    }

    parsedData.youtubeSearchUrl = youtubeSearchUrl;

    res.json(parsedData);
  } catch (err: any) {
    console.error('Error generating highlights with Gemini:', err);
    // Provide a graceful fallback response so the modal never breaks
    const homeTeam = req.body.homeTeam || 'Mandante';
    const awayTeam = req.body.awayTeam || 'Visitante';
    const searchTerms = encodeURIComponent(`${homeTeam} ${awayTeam} melhores momentos gols`);

    res.json({
      title: `Melhores Momentos: ${homeTeam} x ${awayTeam}`,
      headline: `Confira os principais lances e gols de ${homeTeam} contra ${awayTeam}.`,
      summary: `A partida entre ${homeTeam} e ${awayTeam} teve intensidade, disputas acirradas e grandes jogadas. Veja os melhores momentos e o resumo completo dos lances.`,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${searchTerms}`,
      recommendedVideos: [
        {
          title: `Assistir aos Gols de ${homeTeam} x ${awayTeam} no YouTube`,
          channel: 'Transmissão Oficial',
          url: `https://www.youtube.com/results?search_query=${searchTerms}`,
          duration: 'Compacto Oficial',
        },
      ],
      goalsTimeline: (req.body.goals || []).map((g: any) => ({
        minute: g.minute || '00',
        player: g.player || 'Gol',
        team: g.teamName || '',
        description: `Gol marcado aos ${g.minute || ''} por ${g.player || ''}`,
      })),
      keyHighlights: [
        `Disputa entre ${homeTeam} e ${awayTeam}`,
        'Finalizações e defesas dos goleiros',
        'Lances de perigo e jogadas construídas',
      ],
      playerOfTheMatch: {
        name: req.body.goals?.[0]?.player || homeTeam,
        team: req.body.goals?.[0]?.teamName || homeTeam,
        reason: 'Atuação decisiva na partida',
      },
    });
  }
});

// Setup Vite Dev Middleware in dev, or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Futebas] Server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
