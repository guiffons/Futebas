# Futebas Pro: Expansão de Ligas, Central Ao Vivo e Compartilhamento

Plataforma em tempo real aprimorada com cobertura ampliada para as principais ligas europeias e sul-americanas, central de lances ao vivo com radar tático integrado na tela, novo logotipo esportivo escuro minimalista, atualização contínua e silenciosa sem popups intrusivos e compartilhamento descomplicado para acesso instantâneo em qualquer computador ou celular.

### User Review & Critical Decisions

> [!IMPORTANT]
> As escolhas prioritárias confirmadas pelo usuário foram integradas à arquitetura do projeto:
> - **Ligas prioritárias**: Cobertura expandida para todas as principais ligas sul-americanas e europeias (Brasileirão Série A, Série B, Copa do Brasil, Copa Libertadores, UEFA Champions League, Premier League inglesa, La Liga espanhola, Serie A italiana e Bundesliga).
> - **Lances ao vivo na tela**: Minuto a minuto interativo com radar tático dinâmico (indicando ataques perigosos, finalizações, faltas e cartões em tempo real diretamente na interface) sem necessidade de sites externos piratas ou inseguros.
> - **Identidade visual**: Emblema esportivo escuro monocromático de alta precisão com acabamento em tons de carbono e grafite, substituindo a bola com anel verde anterior.
> - **Transmissões oficiais**: Guia "Onde Assistir" com canais oficiais (CazéTV, Globo, Premiere, ESPN, TNT) e embeds diretos quando disponíveis.

---

### 1. Overview & Core Concept

- **O que entrega**: Acompanhamento futebolístico ao vivo com atualização silenciosa a cada 10-15 segundos, permitindo alternar rapidamente entre ligas internacionais e nacionais, visualizar horários detalhados no fuso brasileiro (Brasília), consultar escalações apenas quando confirmadas pelos clubes, acompanhar lances minuto a minuto com radar gráfico na tela e compartilhar o link público com amigos sem necessidade de instalação.
- **Público-alvo**: Torcedores que querem acompanhar placares e lances no trabalho, faculdade ou em casa sem poluição visual, sem avisos incômodos de "atualizado" e com dados rápidos e confiáveis.
- **Valor agregado**: Experiência fluida, zero bugs de recarregamento em loop de vídeos, e compartilhamento instantâneo via link direto e QR Code.

---

### 2. User Experience & Visual Design

#### Fluxos de Usuário Principais
1. **Seleção de Ligas no Topo**: O torcedor visualiza um seletor horizontal com as principais ligas (Brasileirão A, Libertadores, Champions, Premier League, La Liga e menu "Mais Ligas" para Série B, Copa do Brasil, etc.) com contagem de jogos em andamento.
2. **Card de Jogo & Horário**: Exibição proeminente do horário oficial da partida em fuso horário de Brasília (ex: "Hoje às 21:30" ou "2T 74'"), estádio, placar em tempo real e status limpo sem badges repetidos.
3. **Escalações Inteligentes**: Caso os clubes ainda não tenham publicado os 11 titulares oficiais (o que ocorre cerca de 1h antes do pontapé inicial), a aba de escalação não polui a tela com escalações falsas; exibe status informativo claro ou oculta o botão até a confirmação da súmula.
4. **Central Ao Vivo & Radar Tático**: Ao abrir os lances do jogo, o usuário vê um radar tático do gramado que se move conforme as ações (ataque perigoso, escanteio, finalização, defesa do goleiro) combinado com a linha do tempo minuto a minuto.
5. **Compartilhamento com Amigos**: Botão "Compartilhar" no cabeçalho que abre um modal com o link oficial direto da aplicação, botão de copiar em 1 clique com feedback visual, QR Code gerado em SVG e explicação clara garantindo compatibilidade total em qualquer navegador (Chrome, Edge, Safari, Firefox) de PC ou celular.

#### Identidade Visual & Design System
- **Logotipo Minimalista**: Emblema de escudo esportivo geométrico escuro monocromático (zinc-900/carbon com contornos nítidos e detalhe discreto), acompanhado pela tipografia moderna `FUTEBAS` em caixa alta condensada.
- **Paleta de Cores (60-30-10)**:
  - 60% Fundo preto absoluto (`#050706` e `#090d0b`) para contraste esportivo de alto desempenho.
  - 30% Superfícies em cinza carbono (`zinc-900` e `zinc-800/80`) com divisores sutis de 1px.
  - 10% Verde neon esportivo (`#00ff87`) restrito a indicadores de gol, tempo de jogo ao vivo e ações prioritárias.
- **Tipografia**: `Plus Jakarta Sans` para textos, títulos em seminegrito, e `tabular-nums font-mono` para minutos, placares e estatísticas.
- **Zero-Pill Discipline**: Eliminação de badges encapsulados desnecessários; textos informativos limpos separados por `·`.

---

### 3. Key Product Decisions & Trade-Offs

- **Remoção da Visualização "Lado a Lado"**:
  - *Abordagem*: Remover o botão e o modo de divisão de tela ("Lado a Lado"), simplificando a barra de filtros e concentrando o foco na listagem organizada de jogos e no detalhe imersivo de cada partida.
  - *Motivo*: O usuário solicitou explicitamente a remoção, evitando complexidade visual desnecessária em telas de laptops e celulares.

- **Atualizações Silenciosas em Segundo Plano**:
  - *Abordagem*: Eliminar qualquer notificação ou popup de "atualizou", executando as requisições de atualização via polling a cada 10-15s silenciosamente sem recriar o estado do DOM nem causar piscamento de tela.
  - *Motivo*: Alertas sonoros e visuais só devem ocorrer quando houver evento real e emocionante: **GOL!**.

- **Resolução do Bug de Vídeos (Melhores Momentos)**:
  - *Abordagem*: Estabilizar o `useEffect` e o `fetchHighlights` em `VideoHighlightsModal.tsx` usando um identificador único imutável por partida e placar (`${match.id}-${score}`), com cache em memória no cliente para não re-disparar a chamada a cada atualização de minuto do relógio.
  - *Motivo*: A causa raiz do problema era o objeto `match` sendo atualizado a cada ciclo de polling, o que resetava o modal para estado de carregamento repetidamente.

- **Minuto a Minuto e Radar na Tela vs. Sites Piratas**:
  - *Abordagem*: Sites piratas (como citado "rede canais") têm links voláteis, bloqueios de segurança por CORS e riscos de malware. Implementamos uma **Central da Partida Ao Vivo** com radar gráfico do gramado, linha do tempo minuto a minuto com narrativa dos lances, mais guia oficial "Onde Assistir" com transmissões oficiais seguras (CazéTV, canais abertos do YouTube).

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FUTEBAS FRONTEND                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Header: Novo Emblema Escuro + Botão Compartilhar + Mute + Tabela     │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │ CompetitionTabs: Brasileirão, UCL, Premier League, La Liga, etc.      │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │ MatchCard: Horários (Brasília), Placar, Status, Transmissão Oficial    │  │
│  │  ├─ Radar Tático & Minuto a Minuto Ao Vivo (Na tela)                  │  │
│  │  ├─ Escalações Oficiais (Apenas quando confirmadas)                  │  │
│  │  ├─ Estatísticas & Substituições                                     │  │
│  │  └─ Vídeos & Melhores Momentos (Sem recarregamento em loop)           │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │ ShareAppModal: Link direto público + Botão Copiar + QR Code SVG      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS PROXY & APIS                             │
│                                                                             │
│  • /api/espn/apis/site/v2/sports/soccer/{leagueSlug}/scoreboard             │
│    (bra.1, bra.2, bra.copa_do_brasil, conmebol.libertadores,                │
│     uefa.champions, eng.1, esp.1, ita.1, ger.1)                             │
│  • /api/espn/apis/site/v2/sports/soccer/{slug}/summary?event={id} (Lances)  │
│  • /api/gemini/highlights (Curadoria de resumo e vídeos com cache de ID)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mapeamento de Slugs de Ligas
- `brasileirao`: `bra.1` (Série A)
- `serie_b`: `bra.2` (Série B)
- `copa_brasil`: `bra.copa_do_brasil`
- `libertadores`: `conmebol.libertadores`
- `champions`: `uefa.champions`
- `premier_league`: `eng.1` (Premier League)
- `la_liga`: `esp.1` (La Liga)
- `serie_a_it`: `ita.1` (Serie A Itália)
- `bundesliga`: `ger.1` (Bundesliga Alemanha)
