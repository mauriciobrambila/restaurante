import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCOIPGdGlJazNtrnrp6j8MbXUOqW7OSspQ",
  authDomain: "restaurante-e2ff0.firebaseapp.com",
  projectId: "restaurante-e2ff0",
  storageBucket: "restaurante-e2ff0.firebasestorage.app",
  messagingSenderId: "839289505253",
  appId: "1:839289505253:web:2ccdd32cc64fc010b4db0c"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Permite CORS (para o app mobile e web acessarem)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  try {
    if (req.method === 'POST') {
      // Salva o pedido no Firestore
      const docRef = await addDoc(collection(db, 'pedidos'), req.body);
      res.status(200).json({ id: docRef.id, message: 'Pedido salvo no Firebase!' });
    
    } else if (req.method === 'GET') {
      // Busca todos os pedidos
      const snapshot = await getDocs(collection(db, 'pedidos'));
      const pedidos = [];
      snapshot.forEach(doc => {
        pedidos.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(pedidos);
    }
  } catch (error) {
    console.error("Erro no Firebase:", error);
    res.status(500).json({ error: "Erro ao processar pedido" });
  }
}