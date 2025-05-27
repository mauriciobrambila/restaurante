document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('cardapio');
    const finalizarBtn = document.getElementById('finalizarBtn');
    let produtos = [];
    let carrinho = {};
  
    // Debug inicial
    console.log("Iniciando carregamento do cardápio...");
  
    async function carregarCardapio() {
      try {
        container.innerHTML = '<p class="loading">Carregando cardápio...</p>';
        
        const response = await fetch('https://restaurante-brown.vercel.app/api/pedidos?action=getProdutos');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        produtos = await response.json();
        console.log("Produtos recebidos:", produtos);
  
        if (produtos.length === 0) {
          container.innerHTML = '<p class="empty">Cardápio vazio</p>';
          finalizarBtn.style.display = 'none';
          return;
        }
  
        renderizarCardapio();
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
        container.innerHTML = `
          <p class="error">Erro ao carregar cardápio</p>
          <button onclick="location.reload()">Tentar novamente</button>
        `;
        finalizarBtn.style.display = 'none';
      }
    }
  
    function renderizarCardapio() {
      container.innerHTML = produtos.map(produto => `
        <div class="card" data-id="${produto.id}">
          <img src="${produto.imagem || 'img/sem-imagem.jpg'}" 
               alt="${produto.nome}"
               onerror="this.src='img/sem-imagem.jpg'">
          <h3>${produto.nome}</h3>
          <p>${produto.descricao}</p>
          <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
          <div class="quantidade-controls">
            <button class="qty-btn minus" data-id="${produto.id}">-</button>
            <span class="qty" id="qtd-${produto.id}">0</span>
            <button class="qty-btn plus" data-id="${produto.id}">+</button>
          </div>
        </div>
      `).join('');
  
      // Adiciona eventos
      document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const isPlus = e.target.classList.contains('plus');
          
          carrinho[id] = (carrinho[id] || 0) + (isPlus ? 1 : -1);
          carrinho[id] = Math.max(0, carrinho[id]);
          
          document.getElementById(`qtd-${id}`).textContent = carrinho[id];
          finalizarBtn.style.display = Object.values(carrinho).some(qty => qty > 0) ? 'block' : 'none';
        });
      });
    }
  
    // Inicializa
    await carregarCardapio();
  
    // Restante do código para finalizar pedido...
    finalizarBtn.addEventListener('click', () => {
      const itensSelecionados = produtos.filter(p => carrinho[p.id] > 0);
      if (itensSelecionados.length === 0) {
        alert('Adicione itens ao pedido antes de finalizar!');
        return;
      }
      // Abre o modal de resumo...
    });
  });