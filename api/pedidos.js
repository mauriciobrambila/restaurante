import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOIPGdGlJazNtrnrp6j8MbXUOqW7OSspQ",
  authDomain: "restaurante-e2ff0.firebaseapp.com",
  projectId: "restaurante-e2ff0",
  storageBucket: "restaurante-e2ff0.appspot.com",
  messagingSenderId: "839289505253",
  appId: "1:839289505253:web:2ccdd32cc64fc010b4db0c"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Endpoint: Adicionar produto
    if (req.method === 'POST' && req.query.action === 'addProduto') {
      const { nome, descricao, preco, imagemBase64 } = req.body;
      
      // Upload da imagem para o Firebase Storage
      let imagemUrl = '';
      if (imagemBase64) {
        const storageRef = ref(storage, `produtos/${Date.now()}.jpg`);
        const buffer = Buffer.from(imagemBase64.split(',')[1], 'base64');
        await uploadBytes(storageRef, buffer);
        imagemUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'produtos'), {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem: imagemUrl,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ 
        id: docRef.id,
        message: 'Produto adicionado com sucesso!'
      });

    // Endpoint: Listar produtos
    } else if (req.method === 'GET' && req.query.action === 'getProdutos') {
      const snapshot = await getDocs(collection(db, 'produtos'));
      const produtos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.status(200).json(produtos);

    // Endpoint: Remover produto
    } else if (req.method === 'DELETE' && req.query.action === 'removeProduto') {
      const { id } = req.query;
      
      // Primeiro remove a imagem do storage se existir
      const produtoRef = doc(db, 'produtos', id);
      const produtoSnapshot = await getDocs(produtoRef);
      if (produtoSnapshot.exists() && produtoSnapshot.data().imagem) {
        const imageRef = ref(storage, produtoSnapshot.data().imagem);
        await deleteObject(imageRef);
      }

      await deleteDoc(produtoRef);
      res.status(200).json({ message: 'Produto removido com sucesso!' });

    // Endpoint: Atualizar produto
    } else if (req.method === 'PUT' && req.query.action === 'updateProduto') {
      const { id, nome, descricao, preco, imagemBase64 } = req.body;
      const produtoRef = doc(db, 'produtos', id);

      let updateData = {
        nome,
        descricao,
        preco: parseFloat(preco),
        updatedAt: new Date().toISOString()
      };

      // Se nova imagem foi enviada
      if (imagemBase64) {
        // Remove a imagem antiga se existir
        const produtoSnapshot = await getDocs(produtoRef);
        if (produtoSnapshot.exists() && produtoSnapshot.data().imagem) {
          const oldImageRef = ref(storage, produtoSnapshot.data().imagem);
          await deleteObject(oldImageRef);
        }

        // Faz upload da nova imagem
        const storageRef = ref(storage, `produtos/${Date.now()}.jpg`);
        const buffer = Buffer.from(imagemBase64.split(',')[1], 'base64');
        await uploadBytes(storageRef, buffer);
        updateData.imagem = await getDownloadURL(storageRef);
      }

      await updateDoc(produtoRef, updateData);
      res.status(200).json({ message: 'Produto atualizado com sucesso!' });

    // Endpoints originais para pedidos (mantidos para compatibilidade)
    } else if (req.method === 'POST') {
      const docRef = await addDoc(collection(db, 'pedidos'), req.body);
      res.status(200).json({ id: docRef.id, message: 'Pedido salvo no Firebase!' });
    
    } else if (req.method === 'GET') {
      const snapshot = await getDocs(collection(db, 'pedidos'));
      const pedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.status(200).json(pedidos);

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error("Erro no Firebase:", error);
    res.status(500).json({ 
      error: "Erro ao processar requisição",
      details: error.message 
    });
  }
}