document.addEventListener("DOMContentLoaded", () => {
  // Dados dos produtos
  const produtos = [
    { id: '1', nome: 'X-Burguer', descricao: 'Pão, carne, queijo e molho especial.', preco: 15.00, img: 'img/xburguer.jpg' },
    { id: '2', nome: 'Batata Frita', descricao: 'Batata crocante frita.', preco: 10.00, img: 'img/batata.jpg' },
    { id: '3', nome: 'Refrigerante', descricao: 'Refrigerante gelado.', preco: 5.00, img: 'img/refri.jpg' }
  ];

  // Elementos DOM
  const container = document.getElementById('cardapio');
  const resumoItens = document.getElementById('resumoItens');
  const resumoTotal = document.getElementById('resumoTotal');
  const mesaInput = document.getElementById('mesaInput');
  const qrValor = document.getElementById('qrValor');
  const qrImagem = document.getElementById('qrImagem');
  
  let carrinho = {};

  // Renderiza os produtos
  function renderizarProdutos() {
    container.innerHTML = produtos.map(item => `
      <div class="card">
        <img src="${item.img}" alt="${item.nome}" onerror="this.src='img/sem-imagem.jpg'">
        <h2>${item.nome}</h2>
        <p>${item.descricao}</p>
        <p class="preco">R$ ${item.preco.toFixed(2)}</p>
        <div class="quantidade-controls">
          <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
          <span id="qtd-${item.id}">0</span>
          <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
        </div>
      </div>
    `).join('');
  }

  // Atualiza a quantidade no carrinho
  function atualizarCarrinho(id, action) {
    if (!carrinho[id]) carrinho[id] = 0;
    carrinho[id] += action === 'plus' ? 1 : -1;
    carrinho[id] = Math.max(0, carrinho[id]);
    document.getElementById(`qtd-${id}`).textContent = carrinho[id];
  }

  // Mostra o resumo do pedido
  function mostrarResumoPedido() {
    resumoItens.innerHTML = '';
    let total = 0;
    
    for (const id in carrinho) {
      if (carrinho[id] > 0) {
        const produto = produtos.find(p => p.id === id);
        const subtotal = produto.preco * carrinho[id];
        total += subtotal;
        
        const li = document.createElement('li');
        li.textContent = `${produto.nome} x${carrinho[id]} = R$ ${subtotal.toFixed(2)}`;
        resumoItens.appendChild(li);
      }
    }
    
    if (total === 0) {
      alert('Adicione itens antes de finalizar.');
      return false;
    }
    
    resumoTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    return total;
  }

  // Envia o pedido para o servidor
  async function enviarPedido(mesa, total) {
    const itensPedido = [];
    
    for (const id in carrinho) {
      if (carrinho[id] > 0) {
        const produto = produtos.find(p => p.id === id);
        itensPedido.push({
          id: produto.id,
          nome: produto.nome,
          quantidade: carrinho[id],
          preco: produto.preco
        });
      }
    }
    
    const pedido = {
      mesa,
      itens: itensPedido,
      total: parseFloat(total.toFixed(2)), // Garante que é número
      horario: new Date().toISOString() // Formato padrão para datas
    };
    
    try {
      const response = await fetch('https://restaurante-brown.vercel.app/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
      
      const data = await response.json();
      console.log('Pedido enviado:', data);
      return true;
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      return false;
    }
  }

  // Event Listeners
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('qty-btn')) {
      const id = e.target.getAttribute('data-id');
      const action = e.target.getAttribute('data-action');
      atualizarCarrinho(id, action);
    }
  });

  document.getElementById('finalizarBtn').addEventListener('click', () => {
    const total = mostrarResumoPedido();
    if (total !== false) {
      document.getElementById('resumoModal').classList.remove('hidden');
    }
  });

  document.getElementById('fecharModalBtn').addEventListener('click', () => {
    document.getElementById('resumoModal').classList.add('hidden');
  });

  document.getElementById('confirmarBtn').addEventListener('click', async () => {
    const mesa = mesaInput.value.trim();
    if (!mesa) {
      alert('Informe o número da mesa.');
      return;
    }
    
    const total = parseFloat(resumoTotal.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    const enviado = await enviarPedido(mesa, total);
    if (enviado) {
      document.getElementById('resumoModal').classList.add('hidden');
      document.getElementById('pagamentoModal').classList.remove('hidden');
      
      qrValor.textContent = `R$ ${total.toFixed(2)}`;
      qrImagem.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pagamento-R$${total.toFixed(2)}`;
    } else {
      alert('Erro ao enviar pedido. Tente novamente.');
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