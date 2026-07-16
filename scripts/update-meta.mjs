// Gera meta.json a partir das páginas públicas do Limitless TCG.
// Roda 1x/dia via GitHub Action (.github/workflows/update-meta.yml) — os
// visitantes do site NUNCA batem no Limitless; leem só o meta.json estático.
//
// Fonte: https://limitlesstcg.com/decks (ranking de arquétipos do formato
// vigente, renderizado no servidor) + a decklist mais recente de cada
// arquétipo. Win rate não é publicado nessa página; o campo fica de fora.
//
// Se o HTML da fonte mudar e o parse falhar, o script sai com erro (exit 1):
// o workflow fica vermelho e o site continua servindo o meta.json anterior.
//
// Node >= 18 (fetch nativo), sem dependências.

import { writeFileSync } from 'node:fs';

const BASE = 'https://limitlesstcg.com';
const TOP_N = 15;
const UA = 'deck.joaoabitante.net meta updater (projeto pessoal; 1 req/dia; contato: github.com/joaoabitante)';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
  await sleep(600); // educado com a fonte: requisições sequenciais e espaçadas
  return r.text();
}

const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function parseRanking(html) {
  // Formato vigente: '<span class="label">Format:</span> TEF-CRI'
  const fmt = html.match(/Format:<\/span>\s*([A-Z0-9-]+)/);
  const rows = [...html.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td>(.*?)<\/td>\s*<td><a href="(\/decks\/\d+)">(.*?)<\/a><\/td>\s*<td>(\d+)<\/td>\s*<td>([\d.]+%)<\/td>/gs)];
  return {
    format: fmt ? strip(fmt[1]) : null,
    archetypes: rows.map(m => ({
      rank: +m[1],
      icons: [...m[2].matchAll(/src="([^"]+)"/g)].map(x => x[1]),
      deckUrl: BASE + m[3],
      name: strip(m[4]),
      points: +m[5],
      share: m[6],
    })),
  };
}

function parseDeckPage(html) {
  // Primeira decklist listada = resultado de torneio mais recente.
  const m = html.match(/href="(\/decks\/list\/\d+)"/);
  return m ? BASE + m[1] : null;
}

function parseDecklist(html) {
  const title = html.match(/<div class="decklist-title">\s*([^<]+)/);
  const tournament = html.match(/<a href="\/tournaments\/\d+[^"]*">([^<]+)<\/a>/);
  const player = html.match(/<a href="\/players\/\d+[^"]*">([^<]+)<\/a>/);

  const cards = [];
  // Colunas: heading "Pokémon (19)" seguido de .decklist-card com
  // data-set/data-number + .card-count/.card-name.
  const cols = html.split(/<div class="decklist-column-heading">/).slice(1);
  for (const col of cols) {
    const catRaw = strip(col.slice(0, col.indexOf('</div>')));
    const category = /Pok/.test(catRaw) ? 'Pokémon' : /Trainer/i.test(catRaw) ? 'Trainer' : 'Energy';
    for (const c of col.matchAll(/data-set="([^"]*)"\s+data-number="([^"]*)"[^>]*>[\s\S]*?card-count">(\d+)<\/span>\s*<span class="card-name">([^<]+)</g)) {
      cards.push({ category, set: c[1], number: c[2], qty: +c[3], name: strip(c[4]) });
    }
  }
  return {
    title: title ? strip(title[1]) : null,
    tournament: tournament ? strip(tournament[1]) : null,
    player: player ? strip(player[1]) : null,
    cards,
  };
}

async function main() {
  const ranking = parseRanking(await get(`${BASE}/decks`));
  if (!ranking.archetypes.length) {
    throw new Error('Parse do ranking retornou 0 arquétipos — o HTML da fonte deve ter mudado. Ajustar parseRanking().');
  }

  const top = ranking.archetypes.slice(0, TOP_N);
  for (const a of top) {
    try {
      const listUrl = parseDeckPage(await get(a.deckUrl));
      if (!listUrl) continue;
      const list = parseDecklist(await get(listUrl));
      if (list.cards.length) a.reference = { url: listUrl, ...list };
    } catch (e) {
      // Um arquétipo sem decklist não derruba a atualização inteira.
      console.error(`aviso: sem decklist de referência para "${a.name}": ${e.message}`);
    }
  }

  const out = {
    updated: new Date().toISOString(),
    source: 'Limitless TCG',
    sourceUrl: `${BASE}/decks`,
    format: ranking.format,
    archetypes: top,
  };
  writeFileSync(new URL('../meta.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
  console.log(`meta.json gerado: ${top.length} arquétipos, formato ${ranking.format}, ` +
    `${top.filter(a => a.reference).length} com decklist de referência.`);
}

main().catch(e => { console.error(e); process.exit(1); });
