import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Header from '../components/Header';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const imagens = {
  'xburguer.jpg': require('../img/xburguer.jpg'),
  'batata.jpg': require('../img/batata.jpg'),
  'refri.jpg': require('../img/refri.jpg'),
};

export default function PedidoScreen({ route, navigation }) {
  const { pedido } = route.params;
  const [mesa, setMesa] = useState('');
  const [mostrarQR, setMostrarQR] = useState(false);
  const total = pedido.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const finalizarPedido = async () => {
    if (!mesa) {
      Alert.alert('Atenção', 'Por favor, informe o número da mesa.');
      return;
    }

    setMostrarQR(true);
  };
    const confirmarPagamento = async () => {
    try {
      const pedidosAntigos = await AsyncStorage.getItem('pedidos_finalizados');
      const pedidosArray = pedidosAntigos ? JSON.parse(pedidosAntigos) : [];
      
      const novoPedido = {
        mesa,
        itens: pedido,
        total,
        data: new Date().toISOString()
      };

      pedidosArray.push(novoPedido);
      await AsyncStorage.setItem('pedidos_finalizados', JSON.stringify(pedidosArray));
      
      navigation.navigate('PedidoConfirmado');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível finalizar o pedido');
    }
  };

  const renderItem = ({ item }) => {
    const imagem = imagens[item.imagem] || require('../img/xburguer.jpg');
    
    return (
      <View style={styles.item}>
        <Image source={imagem} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.descricao}>{item.descricao}</Text>
        </View>
        <View style={styles.itemQuantidade}>
          <Text style={styles.quantidade}>{item.quantidade}x</Text>
          <Text style={styles.valor}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header 
        title="Resumo do pedido" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
      />
    
      <FlatList
        data={pedido}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {!mostrarQR ? (
              <>
                <TextInput
                  placeholder="Número da mesa"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="numeric"
                  value={mesa}
                  onChangeText={setMesa}
                />

                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.btn} 
                  onPress={finalizarPedido}
                >
                  <Text style={styles.btnTexto}>Gerar QR Code para Pagamento</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.qrContainer}>
                  <Text style={styles.qrLabel}>Pagamento via Pix</Text>
                  <View style={styles.qrCodeBox}>
                    <QRCode
                      value={`pix:chavepix@email.com?valor=${total.toFixed(2)}&nome=Restaurante&cidade=SAO_PAULO`}
                      size={200}
                    />
                  </View>
                  <Text style={styles.chavePix}>Chave Pix: chavepix@email.com</Text>
                  <Text style={styles.instrucoes}>Valor: R$ {total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.btn, {backgroundColor: '#2e7d32'}]} 
                  onPress={confirmarPagamento}
                >
                  <Text style={styles.btnTexto}>Confirmar Pagamento</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
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
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  footerContainer: {
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 5,
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemQuantidade: {
    alignItems: 'flex-end',
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantidade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginVertical: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 75,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  btn: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    alignItems: 'center',
    marginTop: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  qrCodeBox: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    width: 220,
    height: 210,
  },
  qrLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  chavePix: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  instrucoes: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
});