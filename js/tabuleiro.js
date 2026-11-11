// Grade 10 × 10: colunas A–J, linhas 1–10. Coordenada = letra + número (ex.: "C7").
export const TAMANHO = 10;
export const LETRAS = 'ABCDEFGHIJ'.split('');
export const LINHAS = Array.from({ length: TAMANHO }, (_, i) => i + 1);

export const coordenada = (coluna, linha) => `${LETRAS[coluna]}${linha + 1}`;

/** Todas as casas, linha por linha (A1, B1, …, J10). */
export const TODAS_AS_CASAS = LINHAS.flatMap((_, linha) => LETRAS.map((_, coluna) => coordenada(coluna, linha)));

/** "C7" → { coluna: 2, linha: 6 } (base 0), ou null se não for uma casa do tabuleiro. */
export function lerCoordenada(texto) {
  const m = /^([A-Z])(\d{1,2})$/.exec(String(texto).trim().toUpperCase());
  if (!m) return null;
  const coluna = LETRAS.indexOf(m[1]);
  const linha = Number(m[2]) - 1;
  return dentro(coluna, linha) ? { coluna, linha } : null;
}

const dentro = (coluna, linha) => coluna >= 0 && coluna < TAMANHO && linha >= 0 && linha < TAMANHO;

/**
 * Casas ocupadas por um navio de `tamanho` a partir de `inicio`:
 * horizontal ("H") para a direita, vertical ("V") para baixo.
 * Devolve null se alguma casa sair do tabuleiro.
 */
export function casasDoNavio(inicio, tamanho, orientacao) {
  const origem = lerCoordenada(inicio);
  if (!origem) return null;
  const [dc, dl] = orientacao === 'V' ? [0, 1] : [1, 0];
  const casas = [];
  for (let i = 0; i < tamanho; i++) {
    const coluna = origem.coluna + dc * i;
    const linha = origem.linha + dl * i;
    if (!dentro(coluna, linha)) return null;
    casas.push(coordenada(coluna, linha));
  }
  return casas;
}

/** "J10,j9, X1" → ['J10', 'J9'] (normaliza e ignora o que não for casa do tabuleiro). */
export function lerCasas(texto) {
  return String(texto ?? '')
    .split(',')
    .map(lerCoordenada)
    .filter(Boolean)
    .map(({ coluna, linha }) => coordenada(coluna, linha));
}
