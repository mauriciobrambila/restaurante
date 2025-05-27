import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOIPGdGlJazNtrnrp6j8MbXUOqW7OSspQ",
  authDomain: "restaurante-e2ff0.firebaseapp.com",
  projectId: "restaurante-e2ff0",
  storageBucket: "restaurante-e2ff0.appspot.com",
  messagingSenderId: "839289505253",
  appId: "1:839289505253:web:2ccdd32cc64fc010b4db0c"
};

// Inicialização robusta
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase inicializado com sucesso!");
} catch (error) {
  console.error("Erro na inicialização do Firebase:", error);
}

export { db, storage };