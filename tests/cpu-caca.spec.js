// Testes do computador caçando depois de um acerto (Gustavo — G6).
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, casa, FROTA_PADRAO, TIROS_AGUA, TODAS_AS_CASAS, LETRAS } from './helpers.js';

const CENARIO = { jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO };
const AGUA = TIROS_AGUA.split(','); // casas sem navio no inimigo: o jogador nunca acerta
const ATINGIDA = ['erro', 'acerto', 'afundado'];
const atingidas = () => new Set(TODAS_AS_CASAS.filter((c) => ATINGIDA.includes(casa('jogador', c).getAttribute('data-estado'))));

/** O jogador atira em `alvo`; devolve a casa nova que o computador atingiu em seguida. */
async function rodada(user, alvo) {
  const antes = atingidas();
  await user.click(casa('inimigo', alvo));
  const novas = [...atingidas()].filter((c) => !antes.has(c));
  expect(novas).toHaveLength(1);
  return novas[0];
}

/** Casas em cima, embaixo, à esquerda e à direita (dentro do tabuleiro). */
function vizinhas(coord) {
  const col = LETRAS.indexOf(coord[0]), lin = Number(coord.slice(1));
  return [[col - 1, lin], [col + 1, lin], [col, lin - 1], [col, lin + 1]]
    .filter(([c, l]) => c >= 0 && c < 10 && l >= 1 && l <= 10)
    .map(([c, l]) => `${LETRAS[c]}${l}`);
}

test('TC-BN-25 depois de acertar, o computador atira numa casa vizinha', async () => {
  const user = await abrirJogo({ ...CENARIO, tiroscpu: 'C1' });
  expect(await rodada(user, AGUA[0])).toBe('C1');
  expect(casa('jogador', 'C1')).toHaveAttribute('data-estado', 'acerto');
  expect(['B1', 'D1', 'C2']).toContain(await rodada(user, AGUA[1]));
});
