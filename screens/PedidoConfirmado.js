import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function PedidoConfirmado() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header 
        title="Pedido Confirmado" 
        showBackButton={true} 
        onBackPress={() => navigation.navigate('Home')}
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#2e7d32" />
        </View>
        
        <Text style={styles.texto}>Seu pedido foi enviado com sucesso!</Text>
        <Text style={styles.subtexto}>Obrigado pela preferência!</Text>
        
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.botaoTexto}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -height * 0.1,
  },
  iconContainer: {
    marginBottom: 30,
  },
  texto: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtexto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  botao: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});