document.addEventListener("DOMContentLoaded", () => {
  const cardapio = [
    { id: 1, nome: "X-Burger", descricao: "Pão, carne, queijo e alface", preco: 18.9, imagem: "https://via.placeholder.com/150" },
    { id: 2, nome: "Pizza Calabresa", descricao: "Massa, calabresa, queijo e orégano", preco: 35.5, imagem: "https://via.placeholder.com/150" },
    { id: 3, nome: "Suco Natural", descricao: "Sabores variados, 500ml", preco: 7.0, imagem: "https://via.placeholder.com/150" },
  ];

  const pedido = {};

  const cardapioEl = document.getElementById("cardapio");
  const resumoModal = document.getElementById("resumoModal");
  const resumoItens = document.getElementById("resumoItens");
  const resumoTotal = document.getElementById("resumoTotal");
  const mesaInput = document.getElementById("mesaInput");
  const pagamentoModal = document.getElementById("pagamentoModal");
  const qrImagem = document.getElementById("qrImagem");
  const qrValor = document.getElementById("qrValor");

  // Renderiza os itens do cardápio
  cardapio.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" />
      <h3>${item.nome}</h3>
      <p>${item.descricao}</p>
      <p><strong>R$ ${item.preco.toFixed(2)}</strong></p>
      <div class="quantidade">
        <button class="menos" data-id="${item.id}">-</button>
        <span id="qtd-${item.id}">0</span>
        <button class="mais" data-id="${item.id}">+</button>
      </div>
    `;
    cardapioEl.appendChild(card);
  });

  // Aumentar e diminuir quantidade
  document.querySelectorAll(".mais").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      pedido[id] = (pedido[id] || 0) + 1;
      document.getElementById(`qtd-${id}`).innerText = pedido[id];
    });
  });

  document.querySelectorAll(".menos").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (pedido[id]) {
        pedido[id]--;
        if (pedido[id] === 0) delete pedido[id];
        document.getElementById(`qtd-${id}`).innerText = pedido[id] || 0;
      }
    });
  });

  // Finalizar pedido (resumo)
  document.getElementById("finalizarBtn").addEventListener("click", () => {
    resumoItens.innerHTML = "";
    let total = 0;

    for (let id in pedido) {
      const item = cardapio.find(p => p.id == id);
      const qtd = pedido[id];
      const li = document.createElement("li");
      li.textContent = `${item.nome} x ${qtd} = R$ ${(item.preco * qtd).toFixed(2)}`;
      resumoItens.appendChild(li);
      total += item.preco * qtd;
    }

    resumoTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    resumoModal.classList.remove("hidden");
  });

  document.getElementById("fecharModalBtn").addEventListener("click", () => {
    resumoModal.classList.add("hidden");
  });

  // Confirmar e abrir tela de pagamento
  document.getElementById("confirmarBtn").addEventListener("click", () => {
    const mesa = mesaInput.value;
    if (!mesa) {
      alert("Por favor, informe o número da mesa.");
      return;
    }

    // Fecha resumo, abre modal de pagamento
    resumoModal.classList.add("hidden");
    pagamentoModal.classList.remove("hidden");

    // Calcula total
    let total = 0;
    for (let id in pedido) {
      const item = cardapio.find(p => p.id == id);
      total += item.preco * pedido[id];
    }

    qrValor.textContent = `R$ ${total.toFixed(2)}`;

    // Gera QR fictício com valor
    qrImagem.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pagamento-R$${total.toFixed(2)}`;
  });

  // Finalizar pagamento
  document.getElementById("confirmarPagamentoBtn").addEventListener("click", () => {
    const mesa = mesaInput.value;
    const valor = qrValor.textContent;
    pagamentoModal.classList.add("hidden");
    alert(`Pagamento de ${valor} confirmado para a mesa ${mesa}. Obrigado.`);
  });
});
