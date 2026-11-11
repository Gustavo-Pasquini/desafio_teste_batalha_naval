// Ponto de entrada do jogo: ao ser importado, lê o DOM e a URL (seção 3 do PLANEJAMENTO.md) e inicia o jogo.
import { NAVIOS, posicionar, frotaAleatoria, lerFrota, frotaCompleta } from './frota.js';
import { lerCasas } from './tabuleiro.js';
import { criarLado, atirar, estadoDoTiro, temNavio, naviosRestantes, derrotado } from './batalha.js';
import { proximoTiro } from './computador.js';
import {
  criarGrade, pintarGrade, criarLista, rotularControles, desenharLista, desenharOrientacao, desenharControles,
} from './ui-posicionamento.js';
import { escrever, mensagemDoTiro, MENSAGENS } from './ui-batalha.js';

const porId = (id) => document.querySelector(`[data-testid="${id}"]`);
const params = new URLSearchParams(location.search);

const tela = {
  lista: criarLista(new Map(NAVIOS.map((n) => [n.letra, porId(`navio-${n.letra}`)]))),
  girar: porId('btn-girar'),
  orientacao: porId('orientacao'),
  aleatorio: porId('btn-aleatorio'),
  iniciar: porId('btn-iniciar'),
  reiniciar: porId('btn-reiniciar'),
  vez: porId('vez'),
  mensagem: porId('mensagem'),
  restantesJogador: porId('restantes-jogador'),
  restantesInimigo: porId('restantes-inimigo'),
  casasJogador: criarGrade(porId('tabuleiro-jogador'), 'jogador'),
  casasInimigo: criarGrade(porId('tabuleiro-inimigo'), 'inimigo'),
};

/** fase: 'posicionamento' → 'batalha' → 'fim'. */
let jogo;

function novoJogo(frotaDoJogador = null) {
  jogo = {
    fase: frotaDoJogador ? 'batalha' : 'posicionamento',
    jogador: criarLado(frotaDoJogador ?? []),
    inimigo: criarLado(lerFrota(params.get('inimigo')) ?? frotaAleatoria()),
    tirosCpu: lerCasas(params.get('tiroscpu')),
    escolhido: null,
    orientacao: 'H',
    mensagem: frotaDoJogador ? MENSAGENS.suaVez : MENSAGENS.posicione,
  };
}

const pendentes = () => NAVIOS.map((n) => n.letra).filter((letra) => !jogo.jogador.frota.some((n) => n.letra === letra));

function desenhar() {
  const { fase, jogador, inimigo } = jogo;
  desenharLista(tela.lista, pendentes(), jogo.escolhido);
  desenharOrientacao(tela.orientacao, jogo.orientacao);
  desenharControles(tela, { posicionando: fase === 'posicionamento', frotaPronta: frotaCompleta(jogador.frota) });
  pintarGrade(tela.casasJogador, (c) => estadoDoTiro(jogador, c) ?? (temNavio(jogador, c) ? 'navio' : 'agua'));
  pintarGrade(tela.casasInimigo, (c) => estadoDoTiro(inimigo, c) ?? (fase === 'fim' && temNavio(inimigo, c) ? 'navio' : 'desconhecido'));
  escrever(tela.vez, fase === 'batalha' ? 'Jogador' : '');
  escrever(tela.mensagem, jogo.mensagem);
  escrever(tela.restantesJogador, String(naviosRestantes(jogador)));
  escrever(tela.restantesInimigo, String(naviosRestantes(inimigo)));
}

/** Liga um clique a uma ação que muda o jogo e redesenha a tela. */
function aoClicar(elemento, acao) {
  elemento.addEventListener('click', () => {
    acao();
    desenhar();
  });
}

// --- Fase 1: posicionamento ---

for (const [letra, botao] of tela.lista.botoes) {
  aoClicar(botao, () => { jogo.escolhido = letra; });
}

for (const [coord, el] of tela.casasJogador) {
  aoClicar(el, () => {
    if (jogo.fase !== 'posicionamento') return;
    if (!jogo.escolhido) { jogo.mensagem = MENSAGENS.escolhaNavio; return; }
    const tentativa = posicionar(jogo.jogador.frota, jogo.escolhido, coord, jogo.orientacao);
    if (tentativa.erro) { jogo.mensagem = tentativa.erro; return; }
    jogo.jogador = criarLado(tentativa.frota);
    jogo.escolhido = null;
    jogo.mensagem = frotaCompleta(tentativa.frota) ? MENSAGENS.pronto : MENSAGENS.posicione;
  });
}

aoClicar(tela.girar, () => { jogo.orientacao = jogo.orientacao === 'H' ? 'V' : 'H'; });

aoClicar(tela.aleatorio, () => {
  jogo.jogador = criarLado(frotaAleatoria());
  jogo.escolhido = null;
  jogo.mensagem = MENSAGENS.pronto;
});

aoClicar(tela.iniciar, () => {
  if (jogo.fase !== 'posicionamento' || !frotaCompleta(jogo.jogador.frota)) return;
  jogo.fase = 'batalha';
  jogo.mensagem = MENSAGENS.suaVez;
});

aoClicar(tela.reiniciar, () => novoJogo());

// --- Fase 2: batalha (o computador responde logo depois de cada tiro válido do jogador) ---

function vezDoComputador() {
  const alvo = proximoTiro(jogo.tirosCpu, jogo.jogador.tiros);
  jogo.jogador = atirar(jogo.jogador, alvo).lado;
  if (derrotado(jogo.jogador)) {
    jogo.fase = 'fim';
    jogo.mensagem = MENSAGENS.derrota;
  }
}

for (const [coord, el] of tela.casasInimigo) {
  aoClicar(el, () => {
    if (jogo.fase !== 'batalha') return;
    const tiro = atirar(jogo.inimigo, coord);
    if (tiro.resultado === 'repetido') return;
    jogo.inimigo = tiro.lado;
    jogo.mensagem = mensagemDoTiro(tiro);
    if (derrotado(jogo.inimigo)) {
      jogo.fase = 'fim';
      jogo.mensagem = MENSAGENS.vitoria;
      return;
    }
    vezDoComputador();
  });
}

rotularControles(tela, NAVIOS);
novoJogo(lerFrota(params.get('jogador')));
desenhar();
