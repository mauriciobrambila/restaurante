import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'pedidos.json');

export default async function handler(req, res) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Criar diretório se não existir
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (req.method === 'POST') {
      const novoPedido = req.body;
      
      // Ler pedidos existentes
      let pedidos = [];
      try {
        const data = await fs.readFile(filePath, 'utf8');
        pedidos = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      
      // Adicionar novo pedido
      pedidos.push(novoPedido);
      
      // Salvar no arquivo
      await fs.writeFile(filePath, JSON.stringify(pedidos, null, 2));
      
      res.status(200).json({ success: true, message: 'Pedido registrado!' });
    
    } else if (req.method === 'GET') {
      let pedidos = [];
      try {
        const data = await fs.readFile(filePath, 'utf8');
        pedidos = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      
      res.status(200).json(pedidos);
    
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}