document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById('cardapio');
  const resumoItens = document.getElementById('resumoItens');
  const resumoTotal = document.getElementById('resumoTotal');
  const qrValor = document.getElementById('qrValor');
  const qrImagem = document.getElementById('qrImagem');
  const mesaInput = document.getElementById('mesaInput');
  
  let carrinho = {};
  let produtos = [];

  // Carrega produtos do Firebase
  async function carregarProdutos() {
    try {
      const response = await fetch('https://restaurante-brown.vercel.app/api/pedidos?action=getProdutos');
      produtos = await response.json();
      renderizarCardapio();
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
      alert("Não foi possível carregar o cardápio. Tente recarregar a página.");
    }
  }

  // Renderiza os produtos na tela
  function renderizarCardapio() {
    container.innerHTML = '';
    
    produtos.forEach(item => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${item.imagem || 'img/sem-imagem.jpg'}" alt="${item.nome}" onerror="this.src='img/sem-imagem.jpg'">
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

    // Adiciona eventos aos botões
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        
        if (!carrinho[id]) carrinho[id] = 0;
        carrinho[id] += action === 'plus' ? 1 : -1;
        if (carrinho[id] < 0) carrinho[id] = 0;
        
        document.getElementById(`qtd-${id}`).textContent = carrinho[id];
      });
    });
  }

  // Finalizar pedido - Mostra modal
  document.getElementById('finalizarBtn').addEventListener('click', () => {
    resumoItens.innerHTML = '';
    let total = 0;
    
    for (let id in carrinho) {
      if (carrinho[id] > 0) {
        const p = produtos.find(x => x.id === id);
        const subtotal = p.preco * carrinho[id];
        total += subtotal;
        
        const li = document.createElement('li');
        li.textContent = `${p.nome} x${carrinho[id]} = R$ ${subtotal.toFixed(2)}`;
        resumoItens.appendChild(li);
      }
    }
    
    if (total === 0) {
      alert('Adicione itens antes de finalizar!');
      return;
    }
    
    resumoTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('resumoModal').classList.remove('hidden');
  });

  // Fechar modal
  document.getElementById('fecharModalBtn').addEventListener('click', () => {
    document.getElementById('resumoModal').classList.add('hidden');
  });

  // Confirmar pedido - Mostra QR Code
  document.getElementById('confirmarBtn').addEventListener('click', async () => {
    const mesa = mesaInput.value.trim();
    if (!mesa) {
      alert('Informe o número da mesa!');
      return;
    }

    const pedido = [];
    let total = 0;
    
    for (let id in carrinho) {
      if (carrinho[id] > 0) {
        const p = produtos.find(x => x.id === id);
        pedido.push({ 
          nome: p.nome, 
          quantidade: carrinho[id], 
          preco: p.preco 
        });
        total += p.preco * carrinho[id];
      }
    }

    // Envia para o Firebase
    try {
      await fetch('https://restaurante-brown.vercel.app/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mesa,
          itens: pedido,
          total: total.toFixed(2),
          horario: new Date().toISOString()
        })
      });
      
      // Mostra QR Code
      document.getElementById('resumoModal').classList.add('hidden');
      document.getElementById('pagamentoModal').classList.remove('hidden');
      qrValor.textContent = `R$ ${total.toFixed(2)}`;
      qrImagem.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pix:${total.toFixed(2)}-Mesa:${mesa}`;
      
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    }
  });

  // Confirmar pagamento
  document.getElementById('confirmarPagamentoBtn').addEventListener('click', () => {
    const mesa = mesaInput.value;
    const valor = qrValor.textContent;
    
    alert(`Pagamento de ${valor} confirmado para a mesa ${mesa}. Obrigado!`);
    document.getElementById('pagamentoModal').classList.add('hidden');
    
    // Limpa carrinho
    carrinho = {};
    produtos.forEach(item => {
      document.getElementById(`qtd-${item.id}`).textContent = '0';
    });
    mesaInput.value = '';
  });

  // Inicializa
  carregarProdutos();
});