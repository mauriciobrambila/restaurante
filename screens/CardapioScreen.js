import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração do Firebase (use a mesma do AdminDashboard)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function CardapioScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      setLoading(true);
      try {
        // Tenta carregar do Firebase primeiro
        const querySnapshot = await getDocs(collection(db, "produtos"));
        const produtosFirebase = [];
        
        querySnapshot.forEach((doc) => {
          produtosFirebase.push({
            id: doc.id,
            nome: doc.data().nome,
            descricao: doc.data().descricao,
            preco: doc.data().preco,
            imagem: doc.data().imagem || 'sem-imagem.jpg'
          });
        });

        if (produtosFirebase.length > 0) {
          setProdutos(produtosFirebase);
          await AsyncStorage.setItem('produtos', JSON.stringify(produtosFirebase));
        } else {
          // Fallback para dados locais
          const dadosLocais = await AsyncStorage.getItem('produtos');
          if (dadosLocais) {
            setProdutos(JSON.parse(dadosLocais));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setError("Não foi possível carregar o cardápio online");
        
        // Fallback para dados locais
        const dadosLocais = await AsyncStorage.getItem('produtos');
        if (dadosLocais) {
          setProdutos(JSON.parse(dadosLocais));
        }
      } finally {
        setLoading(false);
      }
    };

    carregarProdutos();
  }, []);

  const adicionarAoPedido = (produto) => {
    setPedido(prevPedido => {
      const existe = prevPedido.find((p) => p.id === produto.id);
      if (existe) {
        return prevPedido.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }
      return [...prevPedido, { ...produto, quantidade: 1 }];
    });
  };

  const removerDoPedido = (produto) => {
    setPedido(prevPedido => {
      const existe = prevPedido.find((p) => p.id === produto.id);
      if (!existe) return prevPedido;
      
      if (existe.quantidade > 1) {
        return prevPedido.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade - 1 } : p
        );
      }
      return prevPedido.filter((p) => p.id !== produto.id);
    });
  };

  const renderItem = ({ item }) => {
    const quantidade = pedido.find((p) => p.id === item.id)?.quantidade || 0;
    
    return (
      <View style={styles.item}>
        <Image 
          source={{ uri: item.imagem }} 
          style={styles.imagem}
          defaultSource={require('../img/sem-imagem.jpg')}
          onError={() => console.log("Erro ao carregar imagem")}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.desc}>{item.descricao}</Text>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
        </View>
        <View style={styles.contador}>
          <TouchableOpacity 
            onPress={() => removerDoPedido(item)}
            disabled={quantidade === 0}
          >
            <Ionicons 
              name="remove-circle-outline" 
              size={26} 
              color={quantidade === 0 ? "#ccc" : "#c62828"} 
            />
          </TouchableOpacity>
          <Text style={styles.quantidade}>{quantidade}</Text>
          <TouchableOpacity onPress={() => adicionarAoPedido(item)}>
            <Ionicons name="add-circle-outline" size={26} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const irParaPedido = () => {
    if (pedido.length === 0) return;
    navigation.navigate('Pedido', { pedido });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 10 }}>Carregando cardápio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c62828', marginBottom: 10 }}>{error}</Text>
        <Text>Usando cardápio local</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header 
        title="Cardápio" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
      />
      
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#666' }}>Nenhum produto disponível</Text>
          </View>
        }
      />
      
      {pedido.length > 0 && (
        <TouchableOpacity 
          style={styles.btn} 
          onPress={irParaPedido}
        >
          <Text style={styles.btnTexto}>
            Finalizar Pedido ({pedido.reduce((total, item) => total + item.quantidade, 0)} itens)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 15,
    paddingBottom: 80,
  },
  item: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 22,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  desc: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  preco: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#2e7d32',
    fontSize: 16,
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantidade: {
    fontSize: 20,
    minWidth: 20,
    textAlign: 'center',
  },
  btn: {
    position: 'absolute',
    bottom: 55,
    left: 20,
    right: 20,
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});