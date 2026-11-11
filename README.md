# desafio_teste_batalha_naval

**Batalha naval** — Batalha naval 10 × 10 (porta-aviões 5, encouraçado 4, submarino 3, destroier 2) contra o computador: casos de teste de interface em JavaScript (Jest + Testing Library). O jogo é implementado a partir desses testes (TDD).

> 📋 O que cada integrante vai fazer, as regras do jogo e todos os casos de teste estão em **[PLANEJAMENTO.md](PLANEJAMENTO.md)**.

## Colaboradores

| Nome | RA | GitHub |
|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) |

A divisão do trabalho (quem faz cada tarefa e cada caso de teste) está em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18+.

```bash
npm install
npm test              # roda os testes de interface (todos verdes)
npm start             # jogar em http://localhost:8080
npm run verificar     # confere se cada teste falha pelo motivo certo e tem um ID do plano
```

## Funcionamento dos casos de teste

> ✅ **Fase GREEN liberada:** o jogo é implementado a partir dos testes, um caso por vez. `npm test` precisa ficar todo verde.

- **Tipo:** testes de interface, em JavaScript, com [Jest](https://jestjs.io) + [Testing Library](https://testing-library.com). Cada teste carrega o `index.html` (esqueleto da tela) num navegador simulado (jsdom), clica nos elementos como um jogador (`user-event`) e confere o que deveria aparecer na tela.
- **Metodologia (TDD):** cada caso foi escrito antes do código, um por vez (RED, commit `test:`); depois o jogo foi implementado para passar em um caso por vez (GREEN, commit `feat:`) e refatorado com tudo verde (`refactor:`). O passo a passo está em [`.claude/skills/tdd/SKILL.md`](.claude/skills/tdd/SKILL.md).
- **Onde ficam:** pasta `tests/`, um arquivo `*.spec.js` por grupo de regras. `tests/helpers.js` tem a função `abrirJogo(params)`, que monta a tela.
- **Como os elementos são encontrados:** pelo atributo `data-testid` de cada elemento da tela (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem sorte nos testes:** a partida pode ser montada pela URL (por exemplo, a ordem das cartas/peças/minas), então cada teste sempre começa do mesmo cenário.
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), igual à tabela do PLANEJAMENTO.md.
- **Como rodar:** `npm test` (todos), `npx jest tests/<arquivo>.spec.js` (um arquivo), `npm run verificar` (motivo da falha) e `npm run verificar:completo` (idem + TCs que faltam).

## Desenvolvimento com agentes de IA

O projeto está preparado para **Claude Code** e **Codex**. Os dois escrevem os testes um por vez e conferem o motivo de cada falha. Cada um tem a skill `tdd` e um hook que roda o verificador a cada edição. O Claude Code também tem sub-agentes separados para escrever e para revisar.

- Claude Code: `/tdd G2` · Codex: `$tdd G2` · depois, "go" escreve o próximo caso de teste.
- Detalhes, técnicas e fontes: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).

## Rastreabilidade dos testes

| IDs | Arquivo | O que verifica |
|---|---|---|
| TC-BN-01–09, 19–21 | `tests/posicionamento.spec.js` | Tabuleiros, posicionamento, validação, aleatoriedade e parâmetros de frota |
| TC-BN-10–15, 22–24 | `tests/batalha.spec.js` | Tiros, acertos, navios afundados e turno do computador |
| TC-BN-16–18 | `tests/fim-de-jogo.spec.js` | Vitória, derrota e reinício |
