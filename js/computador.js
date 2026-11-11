// Tiros do computador: primeiro a ordem configurada (parâmetro tiroscpu), depois sorteio.
// Nunca repete uma casa.
import { TODAS_AS_CASAS } from './tabuleiro.js';

/**
 * Próxima casa em que o computador atira.
 * @param {string[]} ordem casas na ordem desejada (pode ser vazia)
 * @param {string[]} jaAtiradas casas em que o computador já atirou
 * @param {() => number} aleatorio número em [0, 1)
 * @returns {string|null} a casa, ou null se não sobrar nenhuma
 */
export function proximoTiro(ordem, jaAtiradas, aleatorio = Math.random) {
  const livre = (c) => !jaAtiradas.includes(c);
  const daOrdem = ordem.find(livre);
  if (daOrdem) return daOrdem;
  const livres = TODAS_AS_CASAS.filter(livre);
  return livres.length ? livres[Math.floor(aleatorio() * livres.length)] : null;
}
