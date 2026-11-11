// Tiros num lado do jogo. Um lado = { frota, tiros } (tiros = casas já atingidas, em ordem).
export const criarLado = (frota) => ({ frota, tiros: [] });

const navioEm = (lado, coord) => lado.frota.find((n) => n.casas.includes(coord));
export const temNavio = (lado, coord) => Boolean(navioEm(lado, coord));
const afundou = (lado, navio) => navio.casas.every((c) => lado.tiros.includes(c));

/**
 * Atira em `coord`. Devolve { lado, resultado, navio? }:
 * resultado = 'repetido' (já tinha tiro ali; nada muda), 'agua', 'acerto' ou 'afundado'.
 */
export function atirar(lado, coord) {
  if (lado.tiros.includes(coord)) return { lado, resultado: 'repetido' };
  const novo = { ...lado, tiros: [...lado.tiros, coord] };
  const navio = navioEm(novo, coord);
  if (!navio) return { lado: novo, resultado: 'agua' };
  return { lado: novo, resultado: afundou(novo, navio) ? 'afundado' : 'acerto', navio };
}

/** Estado visível de uma casa atingida: 'erro', 'acerto' ou 'afundado' (null se ninguém atirou nela). */
export function estadoDoTiro(lado, coord) {
  if (!lado.tiros.includes(coord)) return null;
  const navio = navioEm(lado, coord);
  if (!navio) return 'erro';
  return afundou(lado, navio) ? 'afundado' : 'acerto';
}

export const naviosRestantes = (lado) => lado.frota.filter((n) => !afundou(lado, n)).length;
export const derrotado = (lado) => naviosRestantes(lado) === 0;
