# Planejamento — desafio_teste_batalha_naval

Batalha naval em tabuleiro **10 × 10**, jogador contra o computador: **casos de teste de interface em JavaScript**. O jogo em si não é implementado por enquanto (fase GREEN desativada); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto e testes de: tabuleiros e fase de posicionamento dos navios |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Testes de: fase de batalha (tiros, afundar, computador), fim de jogo; CI e documentação dos testes |

---

## 1. Regras do jogo (o que os testes verificam)

- Dois tabuleiros **10 × 10**: o do jogador e o do inimigo (computador). Colunas **A–J**, linhas **1–10**. Coordenada = letra + número (ex.: `C7`).
- **Frota de cada lado (4 navios, 14 casas):**

  | Navio | Letra | Casas |
  |---|---|---|
  | Porta-aviões | P | 5 |
  | Encouraçado | E | 4 |
  | Submarino | S | 3 |
  | Destroier (ou Hidroavião) | D | 2 |

- **Fase 1 — posicionamento:** o jogador escolhe um navio, a orientação (horizontal → para a direita / vertical → para baixo) e clica na casa inicial. Não pode sair do tabuleiro nem sobrepor outro navio. Há o botão **Aleatório**. **Iniciar** só habilita com os 4 navios posicionados.
- O computador posiciona sua frota aleatoriamente com as mesmas regras. Os navios do inimigo ficam escondidos.
- **Fase 2 — batalha:** o jogador clica numa casa do tabuleiro inimigo → **Água** ou **Fogo!** (acerto). Quando todas as casas de um navio são atingidas: "Você afundou o *Nome*". Depois de cada tiro do jogador, o computador atira uma vez no tabuleiro do jogador (a vez sempre alterna).
- Não se atira duas vezes na mesma casa (nem o jogador, nem o computador).
- **Fim:** vence quem afundar os 4 navios do outro primeiro. Ao perder, os navios inimigos que sobraram são revelados. **Reiniciar** volta para a fase 1.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega atual | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado até segunda ordem (ver [docs/FASE-GREEN.md](docs/FASE-GREEN.md)) |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.

Comandos que o projeto deve ter (`package.json` da tarefa G1):

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (vitest run) — por enquanto TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
npm run test:ui             # interface visual do Vitest no navegador (vitest --ui)
```

```json
"scripts": {
  "test": "vitest run",
  "test:ui": "vitest --ui",
  "verificar": "node scripts/verificar-testes.mjs",
  "verificar:completo": "node scripts/verificar-testes.mjs --completo"
}
```

### Por que os testes ficam falhando

A fase GREEN (implementar o jogo) está **desativada até segunda ordem**. Então cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `AssertionError`, `Unable to find an element by: [data-testid="carta-j1-0"]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` (já no repositório) faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`, tarefa G1)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-estado`, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- Elementos criados pelo jogo (células, cartas, peças, casas) **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário até a fase GREEN.

### Como um teste abre o jogo — `tests/helpers.js` (tarefa G1)

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // vazio por enquanto; na fase GREEN, inicia o jogo
  return userEvent.setup(opcoesUser);       // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { test, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de importar `js/*.js` ou chamar funções internas.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Esconder/mostrar se confere pelo atributo `hidden` (`toBeVisible()`); bloqueio, pelo `disabled` (`toBeDisabled()`).
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `abrirJogo(params, { advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título** (o verificador exige).
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/FASE-GREEN.md               o que fazer quando a implementação for liberada
```

Estrutura de pastas e dono de cada arquivo.

> ⚠️ Os arquivos de `js/` (fora o `main.js` vazio) e o `css/` são da **fase GREEN, desativada até segunda ordem**: ninguém os cria agora. A divisão fica pronta para quando ela for liberada ([docs/FASE-GREEN.md](docs/FASE-GREEN.md)).

```
desafio_teste_batalha_naval/
├── index.html              G1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js              G1  vazio (na fase GREEN: lê a URL e inicia o jogo)
├── js/tabuleiro.js         Gustavo  grade 10 × 10, coordenadas, validar posição
├── js/frota.js             Gustavo  navios, posicionar, girar, aleatório
├── js/ui-posicionamento.js Gustavo  desenha tabuleiros e a lista de navios
├── js/batalha.js           Breno    tiros, acerto/água, afundar, vez
├── js/computador.js        Breno    tiros do computador sem repetir
├── js/ui-batalha.js        Breno    mensagens, navios restantes, fim de jogo
├── tests/helpers.js        G1  (inclui as frotas fixas da seção 3)
├── tests/posicionamento.spec.js Gustavo
├── tests/batalha.spec.js        Breno
├── tests/fim-de-jogo.spec.js    Breno
├── .github/workflows/testes.yml Breno
├── vitest.config.js        G1
└── package.json            G1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `tabuleiro-jogador` / `tabuleiro-inimigo` | Os dois tabuleiros |
| `jogador-A1` … `jogador-J10` | Casas do jogador. `data-estado` = `agua` \| `navio` \| `acerto` \| `erro` \| `afundado` |
| `inimigo-A1` … `inimigo-J10` | Casas do inimigo. `data-estado` = `desconhecido` \| `erro` \| `acerto` \| `afundado` \| `navio` (só revelado no fim) |
| `navio-P`, `navio-E`, `navio-S`, `navio-D` | Botões da lista de navios a posicionar (**saem da página** quando posicionados) |
| `btn-girar` | Alterna orientação; `orientacao` mostra "Horizontal" ou "Vertical" |
| `btn-aleatorio` | Posiciona a frota do jogador aleatoriamente |
| `btn-iniciar` | Começa a batalha |
| `btn-reiniciar` | Volta para o posicionamento |
| `vez` | "Jogador" ou "Computador" |
| `restantes-inimigo` / `restantes-jogador` | Navios ainda não afundados (número) |
| `mensagem` | "Água", "Fogo!", "Você afundou o Destroier", "Você venceu!", "Você perdeu!", avisos de posição inválida (o aviso contém a palavra "inválida") |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `inimigo` | `?inimigo=P:A1:H,E:A3:H,S:A5:H,D:A7:H` | Frota fixa do computador. Formato `Letra:Casa:Orientação` (H ou V) |
| `jogador` | `?jogador=P:A1:H,E:A3:H,S:A5:H,D:A7:H` | Posiciona a frota do jogador e pula direto para a batalha |
| `tiroscpu` | `?tiroscpu=J10,J9,J8` | Ordem dos tiros do computador (depois de acabar a lista, volta a ser aleatório) |

### Frota fixa usada nos testes: `FROTA_PADRAO` = `P:A1:H,E:A3:H,S:A5:H,D:A7:H`

```
    A B C D E F G H I J
 1  P P P P P . . . . .
 2  . . . . . . . . . .
 3  E E E E . . . . . .
 4  . . . . . . . . . .
 5  S S S . . . . . . .
 6  . . . . . . . . . .
 7  D D . . . . . . . .
 8  . . . . . . . . . .
```

`TIROS_AGUA` = 30 casas sem navio das linhas 8–10 (`A8,B8,…,J10`), para o computador errar sempre.

## 4. Divisão de tarefas

> ⚠️ **Modo atual: somente testes.** A fase GREEN (implementar o jogo) está desativada até segunda ordem. As tarefas abaixo são de **escrever os casos de teste**; o código do jogo não é feito. Cada teste fica **falhando pelo motivo certo**. Quando a implementação for liberada: [docs/FASE-GREEN.md](docs/FASE-GREEN.md).

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx vitest run tests/<arquivo>.spec.js -t "TC-XX-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-XX-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da G1: se precisar mudar, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" escreve o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js` vazio, `.gitignore`, `index.html` esqueleto (elementos fixos da seção 3 **vazios**, sem texto nem atributos de estado), `tests/helpers.js` com `abrirJogo(params)`, `FROTA_PADRAO`, `TIROS_AGUA` | `gustavo/g1-setup` | index.html, js/main.js, config, tests/helpers.js | — |
| **G2** Tabuleiros 10 × 10 e lista de navios | `gustavo/g2-tabuleiros` | tests/posicionamento.spec.js | TC-BN-01, 02, 09 |
| **G3** Posicionar e girar | `gustavo/g3-posicionar` | tests/posicionamento.spec.js | TC-BN-03, 04, 07 |
| **G4** Posições inválidas | `gustavo/g4-validacao` | tests/posicionamento.spec.js | TC-BN-05, 06 |
| **G5** Posicionamento aleatório (jogador e computador) e parâmetros `inimigo`/`jogador` | `gustavo/g5-aleatorio` | tests/posicionamento.spec.js | TC-BN-08 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm run verificar`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Tiro: água, acerto e casa repetida | `breno/b2-tiros` | tests/batalha.spec.js | TC-BN-10 a 12 |
| **B3** Afundar navio e navios restantes | `breno/b3-afundar` | tests/batalha.spec.js | TC-BN-13 |
| **B4** Vez do computador e tiros sem repetir | `breno/b4-computador` | tests/batalha.spec.js | TC-BN-14, 15 |
| **B5** Vitória, derrota e reinício | `breno/b5-fim` | tests/fim-de-jogo.spec.js | TC-BN-16 a 18 |

## 5. Casos de teste (interface)

### Gustavo — tabuleiros e posicionamento

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-BN-01 | Tabuleiros 10 × 10 | Abrir a página | `tabuleiro-jogador` e `tabuleiro-inimigo` com 100 casas cada; rótulos A–J e 1–10 visíveis |
| TC-BN-02 | Lista da frota | Abrir a página | `navio-P`, `navio-E`, `navio-S`, `navio-D` visíveis com tamanhos 5, 4, 3, 2; `btn-iniciar` desabilitado |
| TC-BN-03 | Posicionar na horizontal | Clicar `navio-P`, clicar `jogador-A1` | `jogador-A1` a `jogador-E1` = `navio`; `F1` = `agua`; `navio-P` some da lista |
| TC-BN-04 | Girar para vertical | Clicar `navio-E`, `btn-girar` (`orientacao` = "Vertical"), clicar `jogador-J1` | `J1`, `J2`, `J3`, `J4` = `navio` |
| TC-BN-05 | Fora do tabuleiro | `navio-P` horizontal em `jogador-H1` | Nenhuma casa muda; `mensagem` avisa posição inválida; `navio-P` continua na lista |
| TC-BN-06 | Sobreposição | P horizontal em A1; depois `navio-E` vertical em `jogador-C1` | E não é colocado (C1–C4 sem mudança além do P); aviso em `mensagem` |
| TC-BN-07 | Iniciar só com a frota completa | Posicionar 3 navios → conferir; posicionar o 4º → conferir | `btn-iniciar` desabilitado com 3; habilitado com 4 |
| TC-BN-08 | Aleatório válido | 10 vezes: clicar `btn-aleatorio` | Exatamente 14 casas `navio`; lista vazia; `btn-iniciar` habilitado |
| TC-BN-09 | Inimigo escondido | `btn-aleatorio`, `btn-iniciar` | As 100 casas do inimigo com `data-estado="desconhecido"` |

### Breno — batalha e fim de jogo

Todos com `?jogador=FROTA_PADRAO&inimigo=FROTA_PADRAO&tiroscpu=TIROS_AGUA`, salvo quando dito outro.

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-BN-10 | Água | Clicar `inimigo-J10` | `erro`; `mensagem` = "Água" |
| TC-BN-11 | Acerto | Clicar `inimigo-A1` | `acerto`; `mensagem` = "Fogo!" |
| TC-BN-12 | Casa repetida | Clicar `inimigo-J10` duas vezes | O 2º clique não conta: o computador atirou só 1 vez (1 casa `erro` no tabuleiro do jogador) |
| TC-BN-13 | Afundar | Clicar `inimigo-A7` e `inimigo-B7` | As duas = `afundado`; `mensagem` = "Você afundou o Destroier"; `restantes-inimigo` = 3 |
| TC-BN-14 | Vez do computador | `tiroscpu=A1`. Clicar `inimigo-J10` | `jogador-A1` = `acerto`; `vez` volta a "Jogador" |
| TC-BN-15 | Computador não repete | Sem `tiroscpu`, jogar 40 tiros em casas diferentes do inimigo | 40 casas diferentes atingidas no tabuleiro do jogador (`erro` + `acerto` + `afundado` = 40), salvo se o jogo acabar antes |
| TC-BN-16 | Vitória | Acertar as 14 casas da frota inimiga | `mensagem` = "Você venceu!"; `restantes-inimigo` = 0; clicar mais casas não faz nada |
| TC-BN-17 | Derrota | `tiroscpu` = as 14 casas de `FROTA_PADRAO`; jogador atira em 14 casas de água | `mensagem` = "Você perdeu!"; `restantes-jogador` = 0; navios inimigos revelados (`navio`) |
| TC-BN-18 | Reiniciar | Depois do TC-BN-16, clicar `btn-reiniciar` | Volta à fase 1: lista com 4 navios, tabuleiros zerados, `btn-iniciar` desabilitado |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-...`, `breno/b2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas (os testes falham de propósito; o que não pode é teste passando ou falhando por erro do próprio teste). O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo** (a fase GREEN está desativada)
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_batalha_naval`
