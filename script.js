document.addEventListener("DOMContentLoaded", () => {
  const produtos = [
    { id: '1', nome: 'X-Burguer', descricao: 'Pão, carne, queijo e molho especial.', preco: 15.00, img: 'img/xburguer.jpg' },
    { id: '2', nome: 'Batata Frita', descricao: 'Batata crocante frita.', preco: 10.00, img: 'img/batata.jpg' },
    { id: '3', nome: 'Refrigerante', descricao: 'Refrigerante gelado.', preco: 5.00, img: 'img/refri.jpg' }
  ];

  const container = document.getElementById('cardapio');
  let carrinho = {};

  // Renderização dos produtos (mantenha igual)
  produtos.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.nome}">
      <h2>${item.nome}</h2>
      <p>${item.descricao}</p>
      <p class="preco">R$ ${item.preco.toFixed(2)}</p>
      <div class="quantidade-controls">
        <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
        <span id="qtd-${item.id}">0</span>
        <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Controles de quantidade (mantenha igual)
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (!carrinho[id]) carrinho[id] = 0;
      carrinho[id] += action === 'plus' ? 1 : -1;
      if (carrinho[id] < 0) carrinho[id] = 0;
      document.getElementById(`qtd-${id}`).innerText = carrinho[id];
    });
  });

  // Função para enviar pedido (ATUALIZADA)
  async function enviarPedido(pedido) {
    try {
      const response = await fetch('https://restaurante-brown.vercel.app/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Pedido enviado com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      return false;
    }
  }

  // Botão Finalizar Pedido (ATUALIZADO)
  document.getElementById('finalizarBtn').addEventListener('click', () => {
    const itensPedido = [];
    let total = 0;

    for (const id in carrinho) {
      if (carrinho[id] > 0) {
        const produto = produtos.find(p => p.id === id);
        itensPedido.push({
          nome: produto.nome,
          quantidade: carrinho[id],
          preco: produto.preco
        });
        total += produto.preco * carrinho[id];
      }
    }

    if (itensPedido.length === 0) {
      alert('Adicione itens ao pedido antes de finalizar!');
      return;
    }

    document.getElementById('resumoItens').innerHTML = itensPedido
      .map(item => `<li>${item.nome} x${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2)}</li>`)
      .join('');
    
    document.getElementById('resumoTotal').textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('resumoModal').classList.remove('hidden');
  });

  // Botão Confirmar Pedido (ATUALIZADO)
  document.getElementById('confirmarBtn').addEventListener('click', async () => {
    const mesa = document.getElementById('mesaInput').value.trim();
    if (!mesa) {
      alert('Por favor, informe o número da mesa.');
      return;
    }

    const itensPedido = [];
    let total = 0;

    for (const id in carrinho) {
      if (carrinho[id] > 0) {
        const produto = produtos.find(p => p.id === id);
        itensPedido.push({
          nome: produto.nome,
          quantidade: carrinho[id],
          preco: produto.preco
        });
        total += produto.preco * carrinho[id];
      }
    }

    const pedido = {
      mesa,
      itens: itensPedido,
      total: total,
      horario: new Date().toISOString()
    };

    const enviado = await enviarPedido(pedido);
    
    if (enviado) {
      document.getElementById('resumoModal').classList.add('hidden');
      document.getElementById('pagamentoModal').classList.remove('hidden');
      document.getElementById('qrValor').textContent = `R$ ${total.toFixed(2)}`;
      document.getElementById('qrImagem').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pagamento-R$${total.toFixed(2)}`;
    } else {
      alert('Erro ao enviar pedido. Por favor, tente novamente.');
    }
  });

  document.getElementById('confirmarPagamentoBtn').addEventListener('click', () => {
    const mesa = mesaInput.value.trim();
    const valor = qrValor.textContent;
    document.getElementById('pagamentoModal').classList.add('hidden');
    alert(`Pagamento de ${valor} confirmado para a mesa ${mesa}. Obrigado!`);
    carrinho = {};
    renderizarProdutos();
  });

  // Inicialização
  renderizarProdutos();
});