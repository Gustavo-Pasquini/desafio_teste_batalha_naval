# Planejamento — desafio_teste_batalha_naval

Batalha naval em tabuleiro **10 × 10**, jogador contra o computador, jogável no navegador, com casos de teste de interface em JavaScript.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto, tabuleiros e fase de posicionamento dos navios |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Fase de batalha (tiros, afundar, computador), fim de jogo, CI e documentação dos testes |

---

## 1. Regras que o jogo deve seguir (escopo)

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
| Jogo | HTML + CSS + JavaScript puro (ES Modules), sem framework. Ponto de entrada: `js/main.js` |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Servidor para jogar | `http-server` (`npm start`) |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm test` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `http-server`.

Comandos que o projeto deve ter (criados na tarefa G1):

```bash
npm install          # instala dependências (não baixa navegador)
npm start            # abre o jogo em http://localhost:8080 para jogar
npm test             # roda todos os testes uma vez (vitest run)
npm run test:watch   # roda de novo a cada arquivo salvo (vitest)
npm run test:ui      # interface visual do Vitest no navegador (vitest --ui)
```

Como um teste abre o jogo — `tests/helpers.js` (tarefa G1):

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // main.js lê location.search e inicia o jogo
  return userEvent.setup();                 // "user" para clicar como um jogador
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

Regras para os testes:

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de chamar funções internas do jogo.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Para esconder/mostrar algo use o atributo `hidden`; para bloquear botão, `disabled`. Assim `toBeVisible()` e `toBeDisabled()` funcionam.
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- `main.js` inicia o jogo assim que é importado e não usa `DOMContentLoaded` (o `index.html` carrega com `<script type="module" src="js/main.js">`, que já roda depois do HTML).
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título**, para ser rastreável na saída do Vitest.

Estrutura de pastas e dono de cada arquivo:

```
desafio_teste_batalha_naval/
├── index.html              G1
├── css/estilo.css          G1 (cada um estiliza a própria parte)
├── js/main.js              G1  ponto de entrada: lê a URL e inicia o jogo
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
| `navio-P`, `navio-E`, `navio-S`, `navio-D` | Botões da lista de navios a posicionar (somem quando posicionados) |
| `btn-girar` | Alterna orientação; `orientacao` mostra "Horizontal" ou "Vertical" |
| `btn-aleatorio` | Posiciona a frota do jogador aleatoriamente |
| `btn-iniciar` | Começa a batalha |
| `btn-reiniciar` | Volta para o posicionamento |
| `vez` | "Jogador" ou "Computador" |
| `restantes-inimigo` / `restantes-jogador` | Navios ainda não afundados (número) |
| `mensagem` | "Água", "Fogo!", "Você afundou o Destroier", "Você venceu!", "Você perdeu!", avisos de posição inválida |

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

Cada tarefa segue o mesmo ciclo (TDD), e os **dois tipos de commit precisam existir**:

1. Escrever os casos de teste da tarefa (vão falhar) → commit `test: TC-XX-NN ...`
2. Implementar o mínimo para passar → commit `feat: ...`
3. Refatorar se precisar, rodar `npm test` inteiro → commit `refactor:` / `fix:`
4. Abrir Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. Se precisar mexer num arquivo do outro, combine antes e faça um commit pequeno e separado.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js`, `.gitignore`, `index.html` com os `data-testid` da seção 3, `tests/helpers.js` com `abrirJogo(params)`, `FROTA_PADRAO`, `TIROS_AGUA`, e um teste "a página abre" | `gustavo/g1-setup` | index.html, css, config, helpers | — |
| **G2** Tabuleiros 10 × 10 e lista de navios | `gustavo/g2-tabuleiros` | tabuleiro.js, ui-posicionamento.js | TC-BN-01, 02, 09 |
| **G3** Posicionar e girar | `gustavo/g3-posicionar` | frota.js | TC-BN-03, 04, 07 |
| **G4** Posições inválidas | `gustavo/g4-validacao` | tabuleiro.js | TC-BN-05, 06 |
| **G5** Posicionamento aleatório (jogador e computador) e parâmetros `inimigo`/`jogador` | `gustavo/g5-aleatorio` | frota.js | TC-BN-08 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm test`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Tiro: água, acerto e casa repetida | `breno/b2-tiros` | batalha.js, ui-batalha.js | TC-BN-10 a 12 |
| **B3** Afundar navio e navios restantes | `breno/b3-afundar` | batalha.js | TC-BN-13 |
| **B4** Vez do computador e tiros sem repetir | `breno/b4-computador` | computador.js | TC-BN-14, 15 |
| **B5** Vitória, derrota e reinício | `breno/b5-fim` | ui-batalha.js | TC-BN-16 a 18 |

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
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-distribuicao`, `breno/b2-truco`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`. Commits pequenos (um caso de teste ou uma regra por commit).
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main`, `npm test` verde. O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 implementados em `tests/` e passando com `npm test`
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_batalha_naval`
