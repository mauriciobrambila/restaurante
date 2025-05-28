import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const imagens = {
  'xburguer.jpg': require('../img/xburguer.jpg'),
  'batata.jpg': require('../img/batata.jpg'),
  'refri.jpg': require('../img/refri.jpg'),
};

export default function CardapioScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [pedido, setPedido] = useState([]);

  useEffect(() => {
    const carregarProdutos = async () => {
      const dados = await AsyncStorage.getItem('produtos');
      if (dados) {
        setProdutos(JSON.parse(dados));
      } else {
        const dadosExemplo = [
          {
            id: '1',
            nome: 'X-Burguer',
            descricao: 'Pão, carne, queijo e salada',
            preco: 15.00,
            imagem: 'xburguer.jpg',
          },
          {
            id: '2',
            nome: 'Batata Frita',
            descricao: 'Batata crocante frita',
            preco: 10.00,
            imagem: 'batata.jpg',
          },
          {
            id: '3',
            nome: 'Refrigerante',
            descricao: 'Refrigerante gelado',
            preco: 5.00,
            imagem: 'refri.jpg',
          },
          {
            id: '4',
            nome: 'Cerveja',
            descricao: 'Cerveja puro malte',
            preco: 15.00,
            imagem: 'cerveja.jpg',
          },
        ];
        await AsyncStorage.setItem('produtos', JSON.stringify(dadosExemplo));
        setProdutos(dadosExemplo);
      }
    };
    carregarProdutos();
  }, []);

  const adicionarAoPedido = (produto) => {
    const existe = pedido.find((p) => p.id === produto.id);
    if (existe) {
      const atualizados = pedido.map((p) =>
        p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
      );
      setPedido(atualizados);
    } else {
      setPedido([...pedido, { ...produto, quantidade: 1 }]);
    }
  };

  const removerDoPedido = (produto) => {
    const existe = pedido.find((p) => p.id === produto.id);
    if (existe) {
      if (existe.quantidade > 1) {
        const atualizados = pedido.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade - 1 } : p
        );
        setPedido(atualizados);
      } else {
        const atualizados = pedido.filter((p) => p.id !== produto.id);
        setPedido(atualizados);
      }
    }
  };

  const renderItem = ({ item }) => {
    const quantidade = pedido.find((p) => p.id === item.id)?.quantidade || 0;
    const imagem = imagens[item.imagem] || require('../img/xburguer.jpg');

    return (
      <View style={styles.item}>
        <Image source={imagem} style={styles.imagem} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.desc}>{item.descricao}</Text>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
        </View>
        <View style={styles.contador}>
          <TouchableOpacity onPress={() => removerDoPedido(item)}>
            <Ionicons name="remove-circle-outline" size={26} color="#c62828" />
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

  return (
    <View style={{ flex: 1 }}>
      <Header 
        title="Cardapio" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
      {pedido.length > 0 && (
        <TouchableOpacity 
          style={styles.btn} 
          onPress={irParaPedido}
        >
          <Text style={styles.btnTexto}>Finalizar Pedido ({pedido.length} itens)</Text>
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