// Testes de fim de jogo (Breno — B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, casa, casasNoEstado, FROTA_PADRAO, CASAS_FROTA_PADRAO, TIROS_AGUA } from './helpers.js';

const CENARIO = { jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO, tiroscpu: TIROS_AGUA };

test('TC-BN-16 vitória encerra a partida', async () => {
  const user = await abrirJogo(CENARIO);
  for (const coord of CASAS_FROTA_PADRAO) await user.click(casa('inimigo', coord));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Você venceu!');
  expect(screen.getByTestId('restantes-inimigo')).toHaveTextContent(/^0$/);
  const antes = casa('inimigo', 'J10').getAttribute('data-estado');
  await user.click(casa('inimigo', 'J10'));
  expect(casa('inimigo', 'J10')).toHaveAttribute('data-estado', antes);
});

test('TC-BN-17 derrota revela a frota inimiga', async () => {
  const user = await abrirJogo({ jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO, tiroscpu: CASAS_FROTA_PADRAO.join(',') });
  for (const coord of TIROS_AGUA.split(',').slice(0, 14)) await user.click(casa('inimigo', coord));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Você perdeu!');
  expect(screen.getByTestId('restantes-jogador')).toHaveTextContent(/^0$/);
  expect(casasNoEstado('inimigo', 'navio')).toHaveLength(14);
});
