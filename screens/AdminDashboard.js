import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, Image } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AdminDashboard({ navigation }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const dados = await AsyncStorage.getItem('produtos');
    if (dados) {
      setProdutos(JSON.parse(dados));
    }
  };

  const salvarProdutos = async (novosProdutos) => {
    await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));
    setProdutos(novosProdutos);
  };

  const adicionarProduto = () => {
    if (!nome || !descricao || !preco || !imagem) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const novo = {
      id: Date.now().toString(),
      nome,
      descricao,
      preco: parseFloat(preco),
      imagem
    };

    const atualizados = [...produtos, novo];
    salvarProdutos(atualizados);
    setNome('');
    setDescricao('');
    setPreco('');
    setImagem('');
  };

  const excluirProduto = (id) => {
    Alert.alert('Excluir Produto', 'Remover este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const filtrados = produtos.filter((p) => p.id !== id);
          salvarProdutos(filtrados);
        },
      },
    ]);
  };

  const selecionarImagem = async () => {
    Alert.alert('Selecionar Imagem', 'Escolha local da imagem', [
      {
        text: 'Galeria',
        onPress: async () => {
          const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (!resultado.canceled) {
            setImagem(resultado.assets[0].uri);
          }
        },
      },
      {
        text: 'Câmera',
        onPress: async () => {
          const permissao = await ImagePicker.requestCameraPermissionsAsync();
          if (permissao.granted === false) {
            Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera');
            return;
          }

          const resultado = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (!resultado.canceled) {
            setImagem(resultado.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.imagem && (
        <Image source={{ uri: item.imagem }} style={styles.imagemPreview} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.desc}>{item.descricao}</Text>
        <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => excluirProduto(item.id)}>
        <Ionicons name="trash" size={25} color="#c62828" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
     <View style={{ marginBottom: -10, marginVertical: 30  }}>
  <Header 
    title="Painel do Administrador" 
    showBackButton={true} 
    onBackPress={() => navigation.goBack()}
  />
</View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>      Adicionar Novo Produto</Text>
        
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          placeholder="Ex: X-Burguer"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          style={styles.input}
          placeholder="Ex: Pão, carne, queijo..."
          placeholderTextColor="#999"
          multiline
        />

        <Text style={styles.label}>Preço</Text>
        <TextInput
          value={preco}
          onChangeText={setPreco}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="Ex: 18.50"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Imagem</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={selecionarImagem}>
          <Text style={styles.imagePickerText}>
            {imagem ? 'Imagem selecionada' : 'Selecionar da galeria ou câmera'}
          </Text>
          <Ionicons name="image" size={30} color="#2e7d32" />
        </TouchableOpacity>

        {imagem && (
          <Image source={{ uri: imagem }} style={styles.selectedImagePreview} />
        )}

        <TouchableOpacity style={styles.btn} onPress={adicionarProduto}>
          <Text style={styles.btnTexto}>Adicionar Produto </Text>
          <Ionicons name="add-circle" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
  style={[styles.btn, {backgroundColor: '#3f51b5', marginBottom: 15}]}
  onPress={() => navigation.navigate('RelatorioPedidos')}
>
  <Text style={styles.btnTexto}>Ver Relatório de Pedidos</Text>
</TouchableOpacity>
        
        {produtos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={{ marginTop: 15 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 15,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2e7d32',
    marginVertical: -5,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 9,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 3,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 10,
  },
  btn: {
    backgroundColor: '#2e7d32',
    padding: 8,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    padding: -5,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  desc: {
    color: '#666',
    fontSize: 14,
    marginTop: 3,
  },
  preco: {
    fontWeight: 'bold',
    marginTop: 3,
    color: '#2e7d32',
    fontSize: 15,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imagePickerText: {
    color: '#666',
    fontSize: 15,
  },
  selectedImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagemPreview: {
    width: 70,
    height: 70,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
});