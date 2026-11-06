// Testes da batalha (Breno — B2 a B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, casa, casasNoEstado, FROTA_PADRAO, TIROS_AGUA } from './helpers.js';

const CENARIO = { jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO, tiroscpu: TIROS_AGUA };

test('TC-BN-10 tiro na água', async () => {
  const user = await abrirJogo(CENARIO);
  await user.click(casa('inimigo', 'J10'));
  expect(casa('inimigo', 'J10')).toHaveAttribute('data-estado', 'erro');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Água');
});

test('TC-BN-11 tiro acerta um navio', async () => {
  const user = await abrirJogo(CENARIO);
  await user.click(casa('inimigo', 'A1'));
  expect(casa('inimigo', 'A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Fogo!');
});

test('TC-BN-12 repetir tiro não consome outro turno', async () => {
  const user = await abrirJogo(CENARIO);
  await user.click(casa('inimigo', 'J10'));
  await user.click(casa('inimigo', 'J10'));
  expect(casa('inimigo', 'J10')).toHaveAttribute('data-estado', 'erro');
  expect(casasNoEstado('jogador', 'erro')).toHaveLength(1);
});
