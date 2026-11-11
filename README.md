# desafio_teste_batalha_naval

Desafio de testes: casos de teste para testar a **batalha naval** em tabuleiro **10 × 10**, com 1 porta-aviões (5 casas), 1 encouraçado (4), 1 submarino (3) e 1 destroier ou hidroavião (2), com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) | Tarefas B1–B5: CI, documentação dos testes e 12 casos de teste |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) | Tarefas G1–G6: estrutura do projeto e 15 casos de teste |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits. A divisão das tarefas e as regras completas estão em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-XX-NN"   # um caso só
```

## Funcionamento dos casos de teste

**Situação atual:** somente os casos de teste. O jogo ainda não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem depender de sorte:** o cenário (cartas, minas, peças, frota, puzzle) é montado por parâmetros de URL, então cada teste começa sempre do mesmo jeito. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`.
- **Integração contínua:** o GitHub Actions roda `npm ci` e `npm run verificar` em todo push e Pull Request.

## Casos de teste (27)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-BN-01 | Tabuleiros 10 × 10 | `tests/posicionamento.spec.js` | `tabuleiro-jogador` e `tabuleiro-inimigo` com 100 casas cada; rótulos A–J e 1–10 visíveis | Gustavo |
| TC-BN-02 | Lista da frota | `tests/posicionamento.spec.js` | `navio-P`, `navio-E`, `navio-S`, `navio-D` visíveis com tamanhos 5, 4, 3, 2; `btn-iniciar` desabilitado | Gustavo |
| TC-BN-03 | Posicionar na horizontal | `tests/posicionamento.spec.js` | `jogador-A1` a `jogador-E1` = `navio`; `F1` = `agua`; `navio-P` some da lista | Gustavo |
| TC-BN-04 | Girar para vertical | `tests/posicionamento.spec.js` | `J1`, `J2`, `J3`, `J4` = `navio` | Gustavo |
| TC-BN-05 | Fora do tabuleiro | `tests/posicionamento.spec.js` | Nenhuma casa muda; `mensagem` avisa posição inválida; `navio-P` continua na lista | Gustavo |
| TC-BN-06 | Sobreposição | `tests/posicionamento.spec.js` | E não é colocado (C1–C4 sem mudança além do P); aviso em `mensagem` | Gustavo |
| TC-BN-07 | Iniciar só com a frota completa | `tests/posicionamento.spec.js` | `btn-iniciar` desabilitado com 3; habilitado com 4 | Gustavo |
| TC-BN-08 | Aleatório válido | `tests/posicionamento.spec.js` | Exatamente 14 casas `navio`; lista vazia; `btn-iniciar` habilitado | Gustavo |
| TC-BN-09 | Inimigo escondido | `tests/posicionamento.spec.js` | Antes do tiro: `vez` = "Jogador" e as 100 casas do inimigo `desconhecido`, inclusive as 14 da frota. O tiro em A1 dá `acerto` (o navio estava lá, escondido) | Gustavo |
| TC-BN-10 | Água | `tests/batalha.spec.js` | `erro`; `mensagem` = "Água" | Breno |
| TC-BN-11 | Acerto | `tests/batalha.spec.js` | `acerto`; `mensagem` = "Fogo!" | Breno |
| TC-BN-12 | Casa repetida | `tests/batalha.spec.js` | O 2º clique não conta: o computador atirou só 1 vez (1 casa `erro` no tabuleiro do jogador) | Breno |
| TC-BN-13 | Afundar | `tests/batalha.spec.js` | As duas = `afundado`; `mensagem` = "Você afundou o Destroier"; `restantes-inimigo` = 3 | Breno |
| TC-BN-14 | Vez do computador | `tests/batalha.spec.js` | `jogador-A1` = `acerto`; `vez` volta a "Jogador" | Breno |
| TC-BN-15 | Computador não repete | `tests/batalha.spec.js` | 40 casas diferentes atingidas no tabuleiro do jogador (`erro` + `acerto` + `afundado` = 40), salvo se o jogo acabar antes | Breno |
| TC-BN-16 | Vitória | `tests/fim-de-jogo.spec.js` | `mensagem` = "Você venceu!"; `restantes-inimigo` = 0; clicar mais casas não faz nada | Breno |
| TC-BN-17 | Derrota | `tests/fim-de-jogo.spec.js` | `mensagem` = "Você perdeu!"; `restantes-jogador` = 0; navios inimigos revelados (`navio`) | Breno |
| TC-BN-18 | Reiniciar | `tests/fim-de-jogo.spec.js` | Volta à fase 1: lista com 4 navios, tabuleiros zerados, `btn-iniciar` desabilitado | Breno |
| TC-BN-19 | Parâmetro `jogador` | `tests/posicionamento.spec.js` | As 14 casas de `FROTA_PADRAO` = `navio` (e só elas); lista de navios vazia; `vez` = "Jogador" | Gustavo |
| TC-BN-20 | Sair por baixo e borda exata | `tests/posicionamento.spec.js` | A8: nenhuma casa muda, `mensagem` com "inválida", `navio-E` continua. A7: A7–A10 = `navio` | Gustavo |
| TC-BN-21 | Frota do computador tem 14 casas | `tests/posicionamento.spec.js` | "Você venceu!"; 14 casas do inimigo `afundado`; `restantes-inimigo` = 0 | Gustavo |
| TC-BN-22 | Mensagem de cada navio (parametrizado) | `tests/batalha.spec.js` | "Você afundou o Porta-aviões" / "Encouraçado" / "Submarino" / "Destroier"; `restantes-inimigo` = 3 | Breno |
| TC-BN-23 | Computador atira também depois de acerto | `tests/batalha.spec.js` | `jogador-A1` = `acerto`; `vez` = "Jogador" | Breno |
| TC-BN-24 | Sem tiro antes de Iniciar | `tests/batalha.spec.js` | Continua `desconhecido`; nenhuma casa do jogador muda | Breno |
| TC-BN-25 | Tiro em volta do acerto | `tests/cpu-caca.spec.js` | 1º tiro do computador = C1 (`acerto`); o 2º é B1, D1 ou C2 | Gustavo |
| TC-BN-26 | Até fechar o navio | `tests/cpu-caca.spec.js` | Até afundar, cada tiro do computador é vizinho de um acerto no porta-aviões; afunda em no máximo 12 tiros depois do primeiro | Gustavo |
| TC-BN-27 | Acerto na borda | `tests/cpu-caca.spec.js` | O 2º tiro é A6, A8 ou B7 | Gustavo |

## Estrutura

```
index.html                esqueleto da tela (elementos da seção 3)
js/main.js                ponto de entrada do jogo
tests/helpers.js          abrirJogo(), cenários fixos e atalhos
tests/*.spec.js           casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md           regras, contrato, tarefas e casos de teste
docs/                     matriz de cobertura e TDD com IA
```
