// Testes dos tabuleiros e do posicionamento da frota (Gustavo — G2 a G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, within, casa, casasDe, casasNoEstado, LETRAS } from './helpers.js';

/** Escolhe o navio na lista e clica na casa inicial do tabuleiro do jogador. */
async function posicionar(user, navio, coord) {
  await user.click(screen.getByTestId(`navio-${navio}`));
  await user.click(casa('jogador', coord));
}

test('TC-BN-01 dois tabuleiros 10 × 10 com rótulos A–J e 1–10', async () => {
  await abrirJogo();
  for (const lado of ['jogador', 'inimigo']) {
    expect(casasDe(lado)).toHaveLength(100);
    const tabuleiro = within(screen.getByTestId(`tabuleiro-${lado}`));
    for (const letra of LETRAS) expect(tabuleiro.getAllByText(letra, { exact: true }).length).toBeGreaterThan(0);
    for (let n = 1; n <= 10; n++) expect(tabuleiro.getAllByText(String(n), { exact: true }).length).toBeGreaterThan(0);
  }
});

test('TC-BN-02 lista da frota com os tamanhos e Iniciar desabilitado', async () => {
  await abrirJogo();
  const tamanhos = { P: '5', E: '4', S: '3', D: '2' };
  for (const [navio, tamanho] of Object.entries(tamanhos)) {
    expect(screen.getByTestId(`navio-${navio}`)).toBeVisible();
    expect(screen.getByTestId(`navio-${navio}`)).toHaveTextContent(tamanho);
  }
  expect(screen.getByTestId('btn-iniciar')).toBeDisabled();
});

test('TC-BN-09 navios do inimigo ficam escondidos', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-aleatorio'));
  await user.click(screen.getByTestId('btn-iniciar'));
  expect(casasNoEstado('inimigo', 'desconhecido')).toHaveLength(100);
});
