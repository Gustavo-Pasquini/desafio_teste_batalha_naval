// Desenha os tabuleiros e a lista de navios; só desenha e escuta cliques.
import { LETRAS, LINHAS, TODAS_AS_CASAS } from './tabuleiro.js';

function rotulo(texto) {
  const el = document.createElement('span');
  el.className = 'rotulo';
  el.textContent = texto;
  return el;
}

/**
 * Cria as 100 casas (com rótulos A–J e 1–10) dentro do elemento do tabuleiro.
 * Devolve um Map coordenada → elemento da casa, para atualizar sem recriar.
 */
export function criarGrade(tabuleiro, lado) {
  const casas = new Map();
  tabuleiro.replaceChildren(rotulo(''), ...LETRAS.map(rotulo));
  for (const linha of LINHAS) {
    tabuleiro.append(rotulo(String(linha)));
    for (const letra of LETRAS) {
      const coord = `${letra}${linha}`;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'casa';
      el.dataset.testid = `${lado}-${coord}`;
      el.setAttribute('aria-label', coord);
      casas.set(coord, el);
      tabuleiro.append(el);
    }
  }
  return casas;
}

/** Atualiza o data-estado de cada casa a partir de uma função coordenada → estado. */
export function pintarGrade(casas, estadoDe) {
  for (const coord of TODAS_AS_CASAS) {
    const estado = estadoDe(coord);
    const el = casas.get(coord);
    if (el.dataset.estado !== estado) el.dataset.estado = estado;
  }
}

/**
 * Prepara a lista de navios: guarda onde os botões ficam na página para tirá-los
 * (quando posicionados) e devolvê-los depois na ordem original.
 */
export function criarLista(botoes) {
  const ultimo = [...botoes.values()].at(-1);
  const marcador = document.createComment('lista de navios');
  ultimo.after(marcador);
  return { botoes, marcador };
}

/** Deixa na página só os botões dos navios ainda não posicionados (na ordem original); marca o escolhido. */
export function desenharLista(lista, pendentes, escolhido) {
  for (const [letra, botao] of lista.botoes) {
    botao.setAttribute('aria-pressed', String(letra === escolhido));
    if (!pendentes.includes(letra)) botao.remove();
  }
  const naPagina = [...lista.botoes.values()].filter((b) => b.isConnected);
  const desejados = pendentes.map((letra) => lista.botoes.get(letra));
  if (desejados.some((b, i) => b !== naPagina[i])) lista.marcador.before(...desejados);
}

const NOMES_ORIENTACAO = { H: 'Horizontal', V: 'Vertical' };

export function desenharOrientacao(elemento, orientacao) {
  elemento.textContent = NOMES_ORIENTACAO[orientacao];
}

/** Textos fixos dos botões (os elementos vêm vazios do index.html). */
export function rotularControles(tela, navios) {
  for (const navio of navios) tela.lista.botoes.get(navio.letra).textContent = `${navio.nome} (${navio.tamanho})`;
  tela.girar.textContent = 'Girar';
  tela.aleatorio.textContent = 'Aleatório';
  tela.iniciar.textContent = 'Iniciar';
  tela.reiniciar.textContent = 'Reiniciar';
}

/** Girar e Aleatório só valem no posicionamento; Iniciar, só com a frota completa. */
export function desenharControles(tela, { posicionando, frotaPronta }) {
  tela.girar.disabled = !posicionando;
  tela.aleatorio.disabled = !posicionando;
  tela.iniciar.disabled = !(posicionando && frotaPronta);
}
