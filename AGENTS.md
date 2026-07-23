# AGENTS.md — Deck Builder Pokémon TCG

> Contexto para qualquer assistente de IA (Claude Code, Codex, Cursor, Gemini CLI…).
> Autor: João Carlos Bueno Abitante (Contador CRC-SP 320961/O-4).

## Identidade
- **Projeto:** construtor de decks de Pokémon TCG com validação de regras oficiais (Standard e Expanded) e visão do metagame.
- **Repo:** git local (confirme o remote com `git remote -v` antes de push)
- **Domínio:** deck.joaoabitante.net
- **Stack:** arquivo único `index.html`, vanilla JS, sem build; `meta.json` atualizado via GitHub Action (dados Limitless); cartas via TCGdex.

## Regra de privacidade específica
- Rede em runtime é permitida **apenas** para dados públicos de cartas/meta (TCGdex, meta.json). Nenhum dado do usuário sai do navegador.

## Como trabalhar
- Leia o `README.md` e o `CHANGELOG.md` deste projeto (se existirem) antes de qualquer mudança.
- O **GitHub é a única fonte da verdade**; a Vercel é espelho (deploy automático no push).
- Nunca faça deploy manual (`vercel --prod`) nem publique com árvore suja; nunca edite no painel da Vercel.
- Trabalhe em branch (`fix/descricao-curta`); commits atômicos (`fix:`, `chore:`, `seo:`).
- Mantenha o `CHANGELOG.md` atualizado a cada entrega (padrão de todos os projetos do autor).
- Nunca commite segredo; env vars vivem só na Vercel e o nome (sem valor) vai em `.env.example`.

## Princípios não-negociáveis
- **Privacidade/LGPD:** zero coleta de dado pessoal; ferramentas client-side não fazem requisição de rede em runtime; zero tracker/analytics de terceiros; `referrer: no-referrer`.
- **Dependências:** preferir solução estática e autocontida (single-file quando possível), sem CDN e sem framework desnecessário.
- **Linguagem:** pt-BR direto e concreto, sem buzzword; nunca prometer função que não existe.
- **SEO e segurança:** meta tags + OpenGraph + canonical + JSON-LD nas páginas públicas; headers no `vercel.json` (CSP restritiva, HSTS, nosniff, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`).
- **Acessibilidade:** `lang="pt-BR"`, contraste AA, foco visível, `alt`/`aria`.

## Regras completas
As regras operacionais completas de todos os projetos estão em `../AGENTS.md`
(raiz da pasta mãe Projetos) e o catálogo em `../projetos.json`. Se este repo
foi clonado fora da pasta mãe, este arquivo já cobre o essencial.
