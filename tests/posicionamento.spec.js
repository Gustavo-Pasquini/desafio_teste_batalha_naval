// Testes dos tabuleiros e do posicionamento da frota (Gustavo — G2 a G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, within, casa, casasDe, casasNoEstado, LETRAS, FROTA_PADRAO, CASAS_FROTA_PADRAO } from './helpers.js';

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
    for (const rotulo of [...LETRAS, ...Array.from({ length: 10 }, (_, i) => String(i + 1))]) {
      expect(tabuleiro.getAllByText(rotulo, { exact: true })[0]).toBeVisible();
    }
  }
});

test('TC-BN-02 lista da frota com os tamanhos e Iniciar desabilitado', async () => {
  await abrirJogo();
  const tamanhos = { P: '5', E: '4', S: '3', D: '2' };
  for (const [navio, tamanho] of Object.entries(tamanhos)) {
    expect(screen.getByTestId(`navio-${navio}`)).toBeVisible();
    expect(screen.getByTestId(`navio-${navio}`)).toHaveTextContent(new RegExp(`\\b${tamanho}\\b`)); // "2", não "12"
  }
  expect(screen.getByTestId('btn-iniciar')).toBeDisabled();
});

test('TC-BN-09 navios do inimigo ficam escondidos', async () => {
  const user = await abrirJogo({ inimigo: FROTA_PADRAO }); // há navios em A1–E1, A3–D3, A5–C5, A7–B7
  await user.click(screen.getByTestId('btn-aleatorio'));
  await user.click(screen.getByTestId('btn-iniciar'));
  expect(screen.getByTestId('vez')).toHaveTextContent('Jogador');
  for (const c of CASAS_FROTA_PADRAO) expect(casa('inimigo', c)).toHaveAttribute('data-estado', 'desconhecido');
  expect(casasNoEstado('inimigo', 'desconhecido')).toHaveLength(100);
  await user.click(casa('inimigo', 'A1'));
  expect(casa('inimigo', 'A1')).toHaveAttribute('data-estado', 'acerto'); // o navio estava lá, escondido
});

test('TC-BN-03 porta-aviões na horizontal ocupa A1 a E1', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1');
  for (const c of ['A1', 'B1', 'C1', 'D1', 'E1']) expect(casa('jogador', c)).toHaveAttribute('data-estado', 'navio');
  expect(casa('jogador', 'F1')).toHaveAttribute('data-estado', 'agua');
  expect(screen.queryByTestId('navio-P')).toBeNull(); // saiu da lista
});

test('TC-BN-04 girar para vertical: encouraçado em J1 ocupa J1 a J4', async () => {
  const user = await abrirJogo();
  expect(screen.getByTestId('orientacao')).toHaveTextContent('Horizontal');
  await user.click(screen.getByTestId('navio-E'));
  await user.click(screen.getByTestId('btn-girar'));
  expect(screen.getByTestId('orientacao')).toHaveTextContent('Vertical');
  await user.click(casa('jogador', 'J1'));
  for (const c of ['J1', 'J2', 'J3', 'J4']) expect(casa('jogador', c)).toHaveAttribute('data-estado', 'navio');
  expect(casa('jogador', 'J5')).toHaveAttribute('data-estado', 'agua');
});

test('TC-BN-07 Iniciar só habilita com os 4 navios', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1');
  await posicionar(user, 'E', 'A3');
  await posicionar(user, 'S', 'A5');
  expect(casasNoEstado('jogador', 'navio')).toHaveLength(12);
  expect(screen.getByTestId('btn-iniciar')).toBeDisabled();
  await posicionar(user, 'D', 'A7');
  expect(casasNoEstado('jogador', 'navio')).toHaveLength(14);
  expect(screen.getByTestId('btn-iniciar')).toBeEnabled();
});

test('TC-BN-20 navio vertical que sairia por baixo é recusado', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('navio-E'));
  await user.click(screen.getByTestId('btn-girar')); // vertical
  await user.click(casa('jogador', 'A8')); // A8–A11: não existe linha 11
  expect(casasNoEstado('jogador', 'agua')).toHaveLength(100);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(screen.getByTestId('navio-E')).toBeInTheDocument();
});

test('TC-BN-20 navio vertical encostado na borda de baixo é aceito', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('navio-E'));
  await user.click(screen.getByTestId('btn-girar')); // vertical
  await user.click(casa('jogador', 'A7')); // A7–A10: cabe exatamente
  for (const c of ['A7', 'A8', 'A9', 'A10']) expect(casa('jogador', c)).toHaveAttribute('data-estado', 'navio');
  expect(screen.queryByTestId('navio-E')).toBeNull();
});

test('TC-BN-05 navio que sairia do tabuleiro é recusado', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'H1'); // horizontal: precisaria de H1 até L1
  expect(casasNoEstado('jogador', 'agua')).toHaveLength(100);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(screen.getByTestId('navio-P')).toBeInTheDocument();
});

test('TC-BN-06 navio sobreposto é recusado', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1'); // A1–E1
  await user.click(screen.getByTestId('navio-E'));
  await user.click(screen.getByTestId('btn-girar')); // vertical
  await user.click(casa('jogador', 'C1')); // C1–C4 cruzaria o porta-aviões em C1
  expect(casasNoEstado('jogador', 'navio')).toHaveLength(5);
  for (const c of ['C2', 'C3', 'C4']) expect(casa('jogador', c)).toHaveAttribute('data-estado', 'agua');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(screen.getByTestId('navio-E')).toBeInTheDocument();
});
