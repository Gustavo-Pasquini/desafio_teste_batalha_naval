// Textos da partida (mensagens, vez, navios restantes); só escreve na tela.
export const MENSAGENS = {
  posicione: 'Escolha um navio na lista e clique na casa inicial do seu tabuleiro',
  escolhaNavio: 'Escolha primeiro um navio na lista',
  pronto: 'Frota posicionada: clique em Iniciar',
  suaVez: 'Sua vez: atire no tabuleiro inimigo',
  vitoria: 'Você venceu!',
  derrota: 'Você perdeu!',
};

const PELO_RESULTADO = {
  agua: () => 'Água',
  acerto: () => 'Fogo!',
  afundado: (navio) => `Você afundou o ${navio.nome}`,
};

/** Mensagem do tiro do jogador ({ resultado, navio } de batalha.atirar). */
export const mensagemDoTiro = ({ resultado, navio }) => PELO_RESULTADO[resultado](navio);

export function escrever(elemento, texto) {
  if (elemento.textContent !== texto) elemento.textContent = texto;
}
