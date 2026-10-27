
/* ========================================
   1. CAPTURA DOS ELEMENTOS HTML
======================================== */

const formulario = document.querySelector("#formulario-sorteio");
const campoQuantidade = document.querySelector("#quantidade");
const campoMinimo = document.querySelector("#valor-minimo");
const campoMaximo = document.querySelector("#valor-maximo");
const opcaoNaoRepetir = document.querySelector("#nao-repetir");
const botaoSortear = document.querySelector("#botao-sortear");
const mensagem = document.querySelector("#mensagem");
const areaResultados = document.querySelector("#area-resultados");
const resultados = document.querySelector("#resultados");

// As validações serão controladas pelo JavaScript.
formulario.noValidate = true;

/* ========================================
   2. FUNÇÕES AUXILIARES
======================================== */

// Exibe mensagens de erro ou sucesso.
function exibirMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

// Limpa as mensagens anteriores.
function limparMensagem() {
  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

// Remove os resultados do sorteio anterior.
function limparResultados() {
  resultados.replaceChildren();
  areaResultados.hidden = true;
}

// Aguarda um intervalo de tempo.
function aguardar(tempo) {
  return new Promise((resolver) => {
    setTimeout(resolver, tempo);
  });
}

/* ========================================
   3. VALIDAÇÃO DO FORMULÁRIO
======================================== */

function validarFormulario() {
  const quantidadeTexto = campoQuantidade.value.trim();
  const minimoTexto = campoMinimo.value.trim();
  const maximoTexto = campoMaximo.value.trim();

  // Verifica se todos os campos foram preenchidos.
  if (!quantidadeTexto || !minimoTexto || !maximoTexto) {
    return {
      valido: false,
      erro: "Preencha todos os campos antes de sortear."
    };
  }

  const quantidade = Number(quantidadeTexto);
  const minimo = Number(minimoTexto);
  const maximo = Number(maximoTexto);

  // Aceita somente números inteiros seguros.
  if (
    !Number.isSafeInteger(quantidade) ||
    !Number.isSafeInteger(minimo) ||
    !Number.isSafeInteger(maximo)
  ) {
    return {
      valido: false,
      erro: "Informe apenas números inteiros válidos."
    };
  }

  // A quantidade precisa ser maior que zero.
  if (quantidade < 1) {
    return {
      valido: false,
      erro: "A quantidade deve ser pelo menos 1."
    };
  }

  // O máximo precisa ser maior que o mínimo.
  if (maximo <= minimo) {
    return {
      valido: false,
      erro: "O valor máximo deve ser maior que o mínimo."
    };
  }

  // Calcula quantos números inteiros existem no intervalo.
  const totalDisponivel = maximo - minimo + 1;

  if (
    !Number.isSafeInteger(totalDisponivel) ||
    totalDisponivel < 1
  ) {
    return {
      valido: false,
      erro: "O intervalo informado é muito grande."
    };
  }

  // Sem repetição, a quantidade não pode superar o intervalo.
  if (opcaoNaoRepetir.checked && quantidade > totalDisponivel) {
    return {
      valido: false,
      erro: `Existem apenas ${totalDisponivel} números disponíveis nesse intervalo.`
    };
  }

  return {
    valido: true,
    quantidade,
    minimo,
    maximo,
    totalDisponivel,
    naoRepetir: opcaoNaoRepetir.checked
  };
}

/* ========================================
   4. SORTEIO COM REPETIÇÃO
======================================== */

function sortearComRepeticao(quantidade, minimo, maximo) {
  const numerosSorteados = [];
  const tamanhoIntervalo = maximo - minimo + 1;

  for (let indice = 0; indice < quantidade; indice++) {
    const numero = Math.floor(
      Math.random() * tamanhoIntervalo
    ) + minimo;

    numerosSorteados.push(numero);
  }

  return numerosSorteados;
}

/* ========================================
   5. SORTEIO SEM REPETIÇÃO
======================================== */

// Embaralha virtualmente o intervalo sem criar um array gigante.
function sortearSemRepeticao(quantidade, minimo, totalDisponivel) {
  const trocas = new Map();
  const numerosSorteados = [];

  for (let indice = 0; indice < quantidade; indice++) {
    // Escolhe uma posição aleatória entre as posições restantes.
    const indiceAleatorio =
      indice +
      Math.floor(
        Math.random() * (totalDisponivel - indice)
      );

    // Recupera os valores virtuais das posições.
    const numeroEscolhido = trocas.has(indiceAleatorio)
      ? trocas.get(indiceAleatorio)
      : indiceAleatorio;

    const numeroAtual = trocas.has(indice)
      ? trocas.get(indice)
      : indice;

    // Simula a troca de posições do algoritmo Fisher-Yates.
    trocas.set(indiceAleatorio, numeroAtual);

    // Converte a posição sorteada em um número do intervalo.
    numerosSorteados.push(minimo + numeroEscolhido);
  }

  return numerosSorteados;
}

/* ========================================
   6. EXIBIÇÃO DOS RESULTADOS
======================================== */

function exibirResultados(numerosSorteados) {
  resultados.replaceChildren();

  numerosSorteados.forEach((numero, indice) => {
    const elementoNumero = document.createElement("div");

    elementoNumero.classList.add("numero-sorteado");
    elementoNumero.textContent = numero;

    // Anima cada número com um pequeno intervalo.
    elementoNumero.style.animationDelay = `${indice * 70}ms`;

    resultados.appendChild(elementoNumero);
  });

  areaResultados.hidden = false;
}

/* ========================================
   7. EXECUÇÃO DO SORTEIO
======================================== */

formulario.addEventListener("submit", async (evento) => {
  // Impede o recarregamento da página.
  evento.preventDefault();

  // Evita cliques repetidos durante a execução.
  if (botaoSortear.disabled) {
    return;
  }

  limparMensagem();
  limparResultados();

  // Valida os dados antes de realizar o sorteio.
  const dados = validarFormulario();

  if (!dados.valido) {
    exibirMensagem(dados.erro, "erro");
    return;
  }

  // Informa que o sorteio está em andamento.
  botaoSortear.disabled = true;
  botaoSortear.textContent = "Sorteando...";

  try {
    exibirMensagem("Preparando seu sorteio...", "sucesso");

    // Pequena pausa para dar retorno visual ao usuário.
    await aguardar(650);

    let numerosSorteados;

    if (dados.naoRepetir) {
      numerosSorteados = sortearSemRepeticao(
        dados.quantidade,
        dados.minimo,
        dados.totalDisponivel
      );
    } else {
      numerosSorteados = sortearComRepeticao(
        dados.quantidade,
        dados.minimo,
        dados.maximo
      );
    }

    // Mostra os números sorteados na página.
    exibirResultados(numerosSorteados);

    exibirMensagem(
      `Sorteio concluído! ${numerosSorteados.length} número(s) sorteado(s).`,
      "sucesso"
    );
  } catch (erro) {
    console.error("Erro durante o sorteio:", erro);

    exibirMensagem(
      "Não foi possível concluir o sorteio. Tente novamente.",
      "erro"
    );
  } finally {
    // Reabilita o botão mesmo se ocorrer um erro.
    botaoSortear.disabled = false;
    botaoSortear.textContent = "Sortear números";
  }
});
