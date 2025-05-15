// Dados do cardápio (exemplo)
const produtos = [
    {
      id: 1,
      nome: 'X-Burguer',
      descricao: 'Pão, carne, queijo e molho especial.',
      preco: 18.00,
      imagem: 'https://source.unsplash.com/300x200/?burger'
    },
    {
      id: 2,
      nome: 'Pizza Calabresa',
      descricao: 'Calabresa, cebola, mussarela e orégano.',
      preco: 35.00,
      imagem: 'https://source.unsplash.com/300x200/?pizza'
    },
    {
      id: 3,
      nome: 'Suco Natural',
      descricao: 'Suco natural de frutas da estação.',
      preco: 7.50,
      imagem: 'https://source.unsplash.com/300x200/?juice'
    }
  ];
  
  const container = document.getElementById('cardapio');
  const modal = document.getElementById('resumoModal');
  const listaResumo = document.getElementById('listaResumo');
  const nomeClienteInput = document.getElementById('nomeCliente');
  const enviarPedidoBtn = document.getElementById('enviarPedidoBtn');
  const fecharModalBtn = document.getElementById('fecharModal');
  const confirmacao = document.getElementById('confirmacao');
  
  let carrinho = {};
  
  // Renderiza os produtos na tela
  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card';
  
    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h2>${produto.nome}</h2>
      <p>${produto.descricao}</p>
      <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
      <div class="quantidade-controls">
        <button onclick="alterarQuantidade(${produto.id}, -1)">-</button>
        <span id="qtd-${produto.id}">0</span>
        <button onclick="alterarQuantidade(${produto.id}, 1)">+</button>
      </div>
    `;
  
    container.appendChild(card);
  });
  
  // Altera quantidade no carrinho
  function alterarQuantidade(id, delta) {
    if (!carrinho[id]) {
      carrinho[id] = 0;
    }
    carrinho[id] += delta;
    if (carrinho[id] < 0) carrinho[id] = 0;
    document.getElementById(`qtd-${id}`).innerText = carrinho[id];
  }
  
  // Exibe o modal de resumo
  function abrirResumo() {
    listaResumo.innerHTML = '';
    let total = 0;
  
    for (const id in carrinho) {
      const qtd = carrinho[id];
      if (qtd > 0) {
        const produto = produtos.find(p => p.id == id);
        const subtotal = produto.preco * qtd;
        total += subtotal;
  
        const item = document.createElement('li');
        item.textContent = `${produto.nome} x${qtd} - R$ ${subtotal.toFixed(2)}`;
        listaResumo.appendChild(item);
      }
    }
  
    if (total === 0) {
      alert('Adicione algum item ao pedido antes de finalizar.');
      return;
    }
  
    const totalItem = document.createElement('li');
    totalItem.style.fontWeight = 'bold';
    totalItem.textContent = `Total: R$ ${total.toFixed(2)}`;
    listaResumo.appendChild(totalItem);
  
    modal.classList.remove('hidden');
  }
  
  // Fecha o modal
  fecharModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  // Envia o pedido
  enviarPedidoBtn.addEventListener('click', () => {
    const nome = nomeClienteInput.value.trim();
    if (!nome) {
      alert('Por favor, insira seu nome.');
      return;
    }
  
    const pedido = [];
    let total = 0;
  
    for (const id in carrinho) {
      const qtd = carrinho[id];
      if (qtd > 0) {
        const produto = produtos.find(p => p.id == id);
        pedido.push(`${produto.nome} x${qtd}`);
        total += produto.preco * qtd;
      }
    }
  
    const mensagem = `Pedido de ${nome}:\n${pedido.join('\n')}\nTotal: R$ ${total.toFixed(2)}`;
    
    // Simula envio (alert e confirmação)
    alert('Pedido enviado com sucesso!');
    confirmacao.innerText = 'Pedido enviado com sucesso! Obrigado.';
    
    // Reset
    carrinho = {};
    produtos.forEach(p => document.getElementById(`qtd-${p.id}`).innerText = '0');
    nomeClienteInput.value = '';
    modal.classList.add('hidden');
  });
  