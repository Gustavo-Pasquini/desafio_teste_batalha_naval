// Testes da batalha (Breno — B2 a B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, casa, casasNoEstado, FROTA_PADRAO, TIROS_AGUA, TODAS_AS_CASAS } from './helpers.js';

const CENARIO = { jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO, tiroscpu: TIROS_AGUA };

test('TC-BN-10 tiro na água', async () => {
  const user = await abrirJogo(CENARIO);
  await user.click(casa('inimigo', 'J10'));
  expect(casa('inimigo', 'J10')).toHaveAttribute('data-estado', 'erro');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Água$/);
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

test('TC-BN-24 não permite atirar durante o posicionamento', async () => {
  const user = await abrirJogo();
  await user.click(casa('inimigo', 'A1'));
  expect(casa('inimigo', 'A1')).toHaveAttribute('data-estado', 'desconhecido');
  expect(casasNoEstado('jogador', 'acerto')).toHaveLength(0);
  expect(casasNoEstado('jogador', 'erro')).toHaveLength(0);
});

test('TC-BN-13 afunda o destroier e reduz os restantes', async () => {
  const user = await abrirJogo(CENARIO);
  await user.click(casa('inimigo', 'A7'));
  await user.click(casa('inimigo', 'B7'));
  for (const coord of ['A7', 'B7']) expect(casa('inimigo', coord)).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Você afundou o Destroier');
  expect(screen.getByTestId('restantes-inimigo')).toHaveTextContent(/^3$/);
});

test.each([
  ['Porta-aviões', ['A1', 'B1', 'C1', 'D1', 'E1']],
  ['Encouraçado', ['A3', 'B3', 'C3', 'D3']],
  ['Submarino', ['A5', 'B5', 'C5']],
  ['Destroier', ['A7', 'B7']],
])('TC-BN-22 afundar o %s identifica o navio', async (nome, coordenadas) => {
  const user = await abrirJogo(CENARIO);
  for (const coord of coordenadas) await user.click(casa('inimigo', coord));
  for (const coord of coordenadas) expect(casa('inimigo', coord)).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(`Você afundou o ${nome}`);
  expect(screen.getByTestId('restantes-inimigo')).toHaveTextContent(/^3$/);
});

test('TC-BN-14 computador atira na ordem configurada', async () => {
  const user = await abrirJogo({ ...CENARIO, tiroscpu: 'A1' });
  await user.click(casa('inimigo', 'J10'));
  expect(casa('jogador', 'A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('vez')).toHaveTextContent('Jogador');
});

test('TC-BN-15 computador não repete tiros aleatórios', async () => {
  const user = await abrirJogo({ jogador: FROTA_PADRAO, inimigo: FROTA_PADRAO });
  for (const coord of TODAS_AS_CASAS.slice(0, 40)) {
    if (/venceu|perdeu/i.test(screen.getByTestId('mensagem').textContent)) break;
    await user.click(casa('inimigo', coord));
  }
  const tiros = casasNoEstado('jogador', 'acerto').length + casasNoEstado('jogador', 'erro').length;
  expect(tiros).toBe(40);
});

test('TC-BN-23 computador joga mesmo após acerto do jogador', async () => {
  const user = await abrirJogo({ ...CENARIO, tiroscpu: 'A1' });
  await user.click(casa('inimigo', 'A1'));
  expect(casa('inimigo', 'A1')).toHaveAttribute('data-estado', 'acerto');
  expect(casa('jogador', 'A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('vez')).toHaveTextContent('Jogador');
});
