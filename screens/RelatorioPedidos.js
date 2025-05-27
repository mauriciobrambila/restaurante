import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

export default function RelatorioPedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const dados = await AsyncStorage.getItem('pedidos_finalizados');
      if (dados) {
        setPedidos(JSON.parse(dados));
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mesa}>Mesa: {item.mesa}</Text>
        <TouchableOpacity onPress={() => excluirPedido(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#c62828" />
        </TouchableOpacity>
      </View>
      
      {/* Correção: Certifique-se que tudo está dentro de componentes Text */}
      <Text style={styles.data}>
        {item.horario ? new Date(item.horario).toLocaleDateString('pt-BR') : 'Data não disponível'}
      </Text>
      
      {item.itens.map((produto, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemNome}>{produto.nome}</Text>
          <Text style={styles.itemQuantidade}>x{produto.quantidade}</Text>
          <Text style={styles.itemPreco}>R$ {(produto.preco * produto.quantidade).toFixed(2)}</Text>
        </View>
      ))}
      
      <Text style={styles.total}>Total: R$ {item.total.toFixed(2)}</Text>
    </View>
  );

  const excluirPedido = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja excluir este pedido?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const novosPedidos = pedidos.filter(pedido => pedido.id !== id);
            await AsyncStorage.setItem('pedidos_finalizados', JSON.stringify(novosPedidos));
            setPedidos(novosPedidos);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Relatório de Pedidos" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
      />
      
      <FlatList
        data={pedidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  lista: {
    padding: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mesa: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  data: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingVertical: -3,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemNome: {
    flex: -2,
    fontSize: 14,
  },
  itemQuantidade: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  itemPreco: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
  },
  total: {
    marginTop: -5,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'right',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: -5,
  },
  limparBtn: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#c62828',
  },
  limparTexto: {
    color: '#c62828',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazioTexto: {
    marginTop: 15,
    color: '#999',
    fontSize: 16,
  },
});