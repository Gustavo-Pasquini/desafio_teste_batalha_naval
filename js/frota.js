// Navios da frota (iguais para os dois lados), posicionar e frota aleatória.
import { TODAS_AS_CASAS, casasDoNavio } from './tabuleiro.js';

export const NAVIOS = [
  { letra: 'P', nome: 'Porta-aviões', tamanho: 5 },
  { letra: 'E', nome: 'Encouraçado', tamanho: 4 },
  { letra: 'S', nome: 'Submarino', tamanho: 3 },
  { letra: 'D', nome: 'Destroier', tamanho: 2 },
];

const navioPorLetra = (letra) => NAVIOS.find((n) => n.letra === letra);

/**
 * Posiciona um navio numa frota (lista de { letra, nome, tamanho, casas }).
 * Devolve { frota } com o navio incluído, ou { erro } se a posição for inválida.
 */
export function posicionar(frota, letra, inicio, orientacao) {
  const navio = navioPorLetra(letra);
  if (frota.some((n) => n.letra === letra)) return { erro: `${navio.nome} já está posicionado` };
  const casas = casasDoNavio(inicio, navio.tamanho, orientacao);
  if (!casas) return { erro: 'Posição inválida: o navio sairia do tabuleiro' };
  if (casas.some((c) => frota.some((outro) => outro.casas.includes(c)))) {
    return { erro: 'Posição inválida: o navio ficaria sobre outro navio' };
  }
  return { frota: [...frota, { ...navio, casas }] };
}

/** Frota completa em posições sorteadas (`aleatorio` devolve um número em [0, 1)). */
export function frotaAleatoria(aleatorio = Math.random) {
  let frota = [];
  for (const navio of NAVIOS) {
    for (;;) {
      const inicio = TODAS_AS_CASAS[Math.floor(aleatorio() * TODAS_AS_CASAS.length)];
      const orientacao = aleatorio() < 0.5 ? 'H' : 'V';
      const tentativa = posicionar(frota, navio.letra, inicio, orientacao);
      if (tentativa.frota) { frota = tentativa.frota; break; }
    }
  }
  return frota;
}

/** Lê "P:A1:H,E:A3:H,…" (formato da URL). Devolve a frota completa, ou null se o texto for inválido. */
export function lerFrota(texto) {
  if (!texto) return null;
  let frota = [];
  for (const parte of texto.split(',')) {
    const [letra, inicio, orientacao] = parte.trim().toUpperCase().split(':');
    if (!navioPorLetra(letra) || !['H', 'V'].includes(orientacao)) return null;
    const tentativa = posicionar(frota, letra, inicio, orientacao);
    if (!tentativa.frota) return null;
    frota = tentativa.frota;
  }
  return frotaCompleta(frota) ? frota : null;
}

export const frotaCompleta = (frota) => NAVIOS.every((n) => frota.some((f) => f.letra === n.letra));
