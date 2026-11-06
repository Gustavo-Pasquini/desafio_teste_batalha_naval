# Matriz regra → casos de teste — Batalha naval

| # | Regra (seção 1) | TCs | Situação |
|---|---|---|---|
| 1 | Dois tabuleiros 10 × 10, rótulos | 01 | ✅ |
| 2 | Frota 5 + 4 + 3 + 2 | 02, 03, 04, 07, 08 | ✅ |
| 3 | Horizontal → direita, vertical → baixo | 03, 04 | ✅ |
| 4 | Não sai do tabuleiro | 05 (só pela direita) | ⚠️ falta sair por baixo e a borda exata → **TC-BN-20** |
| 5 | Não sobrepõe | 06 | ✅ |
| 6 | Iniciar só com 4 navios; Aleatório; parâmetro `jogador` | 07, 08, 19 | ✅ |
| 7 | Frota do computador válida e escondida | 09 | ❌ ninguém confere que o computador tem 14 casas → **TC-BN-21** |
| 8 | Água / Fogo! | 10, 11 | ✅ |
| 9 | "Você afundou o *Nome*" | 13 (só Destroier) | ⚠️ → **TC-BN-22** |
| 10 | A vez **sempre** alterna (também depois de acerto) | 14 (só depois de água) | ❌ → **TC-BN-23** |
| 11 | Sem tiro repetido (jogador e computador) | 12, 15 | ✅ |
| 12 | Só se atira na fase 2 | — | ❌ → **TC-BN-24** |
| 13 | Vitória, derrota (revela), reiniciar | 16, 17, 18 | ✅ |

### TCs novos — Batalha naval

| ID | Dono / tarefa | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|---|
| TC-BN-20 | Gustavo / G4 | Sair por baixo e borda exata | E vertical em A8 (A8–A11) → recusado; depois E vertical em A7 (A7–A10) → aceito | 1º: nenhuma casa muda, aviso "inválida". 2º: A7–A10 = `navio` |
| TC-BN-21 | Gustavo / G5 | Frota do computador tem 14 casas | `?jogador=FROTA_PADRAO&tiroscpu=<as 86 casas de água da FROTA_PADRAO>`; atirar A1, A2, … até "Você venceu!" | No inimigo, 14 casas `afundado`; `restantes-inimigo` = 0 |
| TC-BN-22 | Breno / B3 | Mensagem de cada navio (parametrizado) | `?inimigo=FROTA_PADRAO` (+ `jogador`, `tiroscpu` de água); afundar P, E, S ou D | "Você afundou o Porta-aviões / Encouraçado / Submarino / Destroier"; `restantes-inimigo` = 3 |
| TC-BN-23 | Breno / B4 | Computador atira também depois de acerto | `tiroscpu=A1`; jogador acerta `inimigo-A1` | `jogador-A1` = `acerto`; `vez` = "Jogador" |
| TC-BN-24 | Breno / B2 | Sem tiro antes de Iniciar | Fase 1, clicar `inimigo-A1` | Continua `desconhecido`; nada muda no tabuleiro do jogador |

**Para que serve:** se o código dos jogos vai ser gerado só a partir dos testes, cada regra da seção 1 do PLANEJAMENTO.md tem um teste que a obriga a existir?

**Legenda**
- ✅ coberta, com exemplo suficiente para não dar para "decorar";
- ⚠️ coberta, mas com um exemplo só ou de forma parcial;
- ❌ sem teste;
- ❓ a regra não está definida no plano e precisa de uma decisão de vocês.

Mantenha esta matriz atualizada: todo TC novo entra na linha da regra que ele cobre. Uma regra sem TC não vai existir no jogo gerado.
