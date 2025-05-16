import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'pedidos.json');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await fs.readFile(filePath, 'utf8');
      res.status(200).json(JSON.parse(data));
    } else if (req.method === 'POST') {
      const novoPedido = req.body;

      const data = await fs.readFile(filePath, 'utf8');
      const pedidos = JSON.parse(data);
      pedidos.push(novoPedido);

      await fs.writeFile(filePath, JSON.stringify(pedidos, null, 2));
      res.status(201).json({ message: 'Pedido salvo com sucesso' });
    } else {
      res.status(405).json({ message: 'Método não permitido' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
}
