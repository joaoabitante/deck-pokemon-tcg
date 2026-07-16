# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/), versionamento SemVer.

## [1.0.0] — 2026-07-15

### Adicionado
- Construtor de decks com busca no TCGdex (nome, categoria, tipo de energia, HP mínimo, set), grid com imagens e contadores por categoria.
- Validação de regras como função pura testável (`?test=1`): 60 cartas, máx. 4 cópias por nome (Energia Básica ilimitada), máx. 1 ACE SPEC, regulation marks por formato (Standard H/I/J após a rotação de 10/abr/2026; Expanded sem restrição de mark + banlist via `legal.expanded`).
- Meta viewer com dados do Limitless TCG (top 15 arquétipos, share, decklist de referência importável), atualizado 1x/dia por GitHub Action → `meta.json` estático.
- Import/export em formato Pokémon TCG Live / RK9 (`4 Iono PAL 185`).
- Cache local (IndexedDB, TTL 24h) com refresh manual; decks salvos em localStorage — nenhum dado pessoal sai do navegador.
- Modo escuro por padrão, layout responsivo, headers de segurança no `vercel.json`.
