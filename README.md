# Deck Builder — Pokémon TCG

Construtor de decks de Pokémon TCG com validação de regras oficiais (Standard e
Expanded) e visão do metagame atual. Arquivo único (`index.html`), vanilla JS,
sem build step. Hospedado em **deck.joaoabitante.net**.

## Regra de privacidade deste projeto

Diferente dos projetos 100% offline (elisaofiscal.tax), este **faz requisições
de rede em runtime** — mas só para dados públicos:

| Destino | O quê |
|---|---|
| `api.tcgdex.net` / `assets.tcgdex.net` | banco de cartas e imagens (TCGdex, open source) |
| `meta.json` (mesma origem) | metagame gerado 1x/dia por GitHub Action a partir do Limitless TCG |
| `r2.limitlesstcg.net` | ícones de Pokémon no meta viewer |

**Nenhum dado pessoal sai do navegador.** Decks e preferências ficam em
localStorage; o cache de cartas/meta fica em IndexedDB (TTL 24h, botão
"Atualizar dados" força refresh). O CSP no `vercel.json` restringe `connect-src`
a `self` + `api.tcgdex.net` — qualquer outra chamada é bloqueada pelo navegador.

## Onde atualizar quando o formato rotacionar

Em `index.html`, objeto `CONFIG`:

```js
STANDARD_MARKS: ['H', 'I', 'J'],
```

A Pokémon anuncia a rotação por volta de janeiro (vigora em abril) em
pokemon.com > News ("Standard Format Rotation"). Quando sair a próxima, remova a
mark mais antiga e adicione a nova. Última atualização: rotação de 10/abr/2026
(saiu a G; ficaram H, I, J).

Se a Pokémon iniciar um novo bloco de sets (pós-série "me"), acrescente o id da
série em `CONFIG.ABBREV_SERIES` (usado no import/export e no filtro de sets).

## Validação de regras

`validateDeck()` em `index.html` é função pura, separada da UI:

- exatamente 60 cartas (menos que 60 = "incompleto", mais = inválido);
- máximo 4 cópias **por nome** (impressões diferentes somam), exceto Energia Básica (ilimitada);
- máximo 1 carta ACE SPEC (detectada pela raridade `ACE SPEC Rare` do TCGdex);
- Standard: regulation mark dentro de `STANDARD_MARKS`; reimpressões antigas sem
  mark usam o flag `legal.standard` do TCGdex como fallback;
- Expanded: sem restrição de mark; usa `legal.expanded` (cobre a banlist).

**Testes:** abra `index.html?test=1` — o resultado aparece no topo da página.

## Metagame (meta.json)

`scripts/update-meta.mjs` (Node ≥ 18, sem dependências) lê o ranking público de
`limitlesstcg.com/decks` + uma decklist recente por arquétipo e grava
`meta.json`. O workflow `.github/workflows/update-meta.yml` roda 1x/dia
(09:17 UTC) e commita só se houver mudança. Rodar manualmente:

```
node scripts/update-meta.mjs
```

Se o Limitless mudar o HTML, o script sai com erro e o workflow fica vermelho —
o site continua servindo o `meta.json` anterior. Ajustar os regex em
`parseRanking()` / `parseDecklist()`.

Win rate não é publicado na página-fonte; a tabela mostra pontos e share.
Os dados são de terceiros (Limitless TCG) com atribuição visível na UI.

## Import/Export

Formato Pokémon TCG Live / RK9: `4 Iono PAL 185`, com blocos
`Pokémon:/Trainer:/Energy:` no export. O mapa "abreviação de set → set TCGdex"
é montado em runtime a partir de `abbreviation.official` dos sets (cache 30d).
No import, energias básicas sem set (`4 Grass Energy`) resolvem para o set SVE.
Se o TCG Live recusar alguma linha específica, confira o par SET/NÚMERO — o
TCGdex ocasionalmente difere da numeração usada pelo Live em promos.

## Deploy (deck.joaoabitante.net)

Site estático puro — segue o AGENTS.md da pasta mãe (GitHub é a fonte de
verdade; deploy só via `git push`):

1. Criar repo no GitHub e conectar na Vercel (Framework Preset: **Other**,
   sem build command, output = raiz).
2. Em Vercel > Settings > Domains, adicionar `deck.joaoabitante.net`; no DNS do
   joaoabitante.net, CNAME `deck` → `cname.vercel-dns.com`.
3. Habilitar o GitHub Action (aba Actions do repo) — o commit diário do
   meta.json dispara redeploy automático na Vercel.
4. Registrar o projeto no `projetos.json` da pasta mãe.

Nota: o CSP usa `script-src 'unsafe-inline'` porque o projeto é um arquivo
único com JS inline — trade-off consciente do formato single-file.
