// Helpers dos testes de interface (tarefa G1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, vi } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (cenário fixo)
 * @param {object} opcoesUser repassado a userEvent.setup (ex.: { advanceTimers: vi.advanceTimersByTime })
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  vi.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

export const LETRAS = 'ABCDEFGHIJ'.split('');
export const TODAS_AS_CASAS = LETRAS.flatMap((letra) => Array.from({ length: 10 }, (_, i) => `${letra}${i + 1}`));

/**
 * FROTA_PADRAO: P em A1–E1, E em A3–D3, S em A5–C5, D em A7–B7 (todos horizontais).
 * Formato `Letra:Casa:Orientação`.
 */
export const FROTA_PADRAO = 'P:A1:H,E:A3:H,S:A5:H,D:A7:H';
export const CASAS_FROTA_PADRAO = ['A1', 'B1', 'C1', 'D1', 'E1', 'A3', 'B3', 'C3', 'D3', 'A5', 'B5', 'C5', 'A7', 'B7'];
// TIROS_AGUA: as 30 casas das linhas 8–10 (sem navio na FROTA_PADRAO), para o computador sempre errar.
export const TIROS_AGUA = [8, 9, 10].flatMap((n) => LETRAS.map((letra) => `${letra}${n}`)).join(',');

export const casa = (lado, coord) => screen.getByTestId(`${lado}-${coord}`);
export const casasDe = (lado) => screen.getAllByTestId(new RegExp(`^${lado}-[A-J](10|[1-9])$`));
export const casasNoEstado = (lado, estado) => casasDe(lado).filter((c) => c.getAttribute('data-estado') === estado);
