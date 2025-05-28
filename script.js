document.addEventListener("DOMContentLoaded", () => {
  const produtos = [
    { id: '1', nome:'X-Burguer', descricao:'Pão, carne, queijo e molho especial.', preco:15.00, img:'img/xburguer.jpg' },
    { id: '2', nome: 'Batata Frita', descricao: 'Batata crocante frita.', preco: 10.00, img: 'img/batata.jpg' },
    { id: '3', nome: 'Refrigerante', descricao: 'Refrigerante gelado.', preco: 5.00, img: 'img/refri.jpg' },
    { id: '4', nome: 'Cerveja', descricao: 'Cerveja puto malte.', preco: 15.00, img: 'img/cerveja.jpg' }
  ];

  const container = document.getElementById('cardapio');
  let carrinho = {};

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

  document.getElementById('finalizarBtn').addEventListener('click', () => {
    const resumoItens = document.getElementById('resumoItens');
    const resumoTotal = document.getElementById('resumoTotal');
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
      alert('Adicione itens antes de finalizar.');
      return;
    }
    resumoTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('resumoModal').classList.remove('hidden');
  });

  document.getElementById('fecharModalBtn').addEventListener('click', () => {
    document.getElementById('resumoModal').classList.add('hidden');
  });

  document.getElementById('confirmarBtn').addEventListener('click', () => {
    const mesa = document.getElementById('mesaInput').value.trim();
    if (!mesa) {
      alert('Informe o número da mesa.');
      return;
    }

    const pedido = [];
    let total = 0;
    for (let id in carrinho) {
      if (carrinho[id] > 0) {
        const p = produtos.find(x => x.id === id);
        pedido.push({ nome: p.nome, quantidade: carrinho[id], preco: p.preco });
        total += p.preco * carrinho[id];
      }
    }

    const pedidoFinal = {
      mesa,
      itens: pedido,
      total: total.toFixed(2),
      horario: new Date().toLocaleString()
    };

    enviarPedidoParaServidor(pedidoFinal);

    document.getElementById('resumoModal').classList.add('hidden');
    document.getElementById('pagamentoModal').classList.remove('hidden');
    document.getElementById('qrValor').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('qrImagem').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pagamento-R$${total.toFixed(2)}`;
  });

  document.getElementById('confirmarPagamentoBtn').addEventListener('click', () => {
    const mesa = document.getElementById('mesaInput').value.trim();
    const valor = document.getElementById('qrValor').textContent;
    document.getElementById('pagamentoModal').classList.add('hidden');
    alert(`Pagamento de ${valor} confirmado para a mesa ${mesa}. Obrigado!`);
    
  });
});

function enviarPedidoParaServidor(pedido) {
  fetch('https://restaurante-brown.vercel.app/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido)
  })
  .then(res => res.json())
  .then(data => console.log('Pedido enviado:', data))
  .catch(err => console.error('Erro:', err));
}                                