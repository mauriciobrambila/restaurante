import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, Image } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
//import { app } from '../firebaseConfig'; // Importe sua configuração do Firebase
import { app, db, storage } from '../../firebaseConfig';

export default function AdminDashboard({ navigation }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [produtos, setProdutos] = useState([]);
  const storage = getStorage(app); // Inicializa o Firebase Storage

  // Carrega produtos do Firebase + cache local
  const carregarProdutos = async () => {
    try {
      const response = await fetch('https://restaurante-brown.vercel.app/api/pedidos?action=getProdutos');
      const data = await response.json();
      setProdutos(data);
      await AsyncStorage.setItem('produtos', JSON.stringify(data));
    } catch (error) {
      const dados = await AsyncStorage.getItem('produtos');
      if (dados) setProdutos(JSON.parse(dados));
    }
  };

  // Upload de imagem para o Firebase Storage
  const uploadImagem = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `produtos/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Erro no upload:", error);
      Alert.alert("Erro", "Não foi possível enviar a imagem");
      return null;
    }
  };

  // Adiciona produto ao Firebase
  const adicionarProduto = async () => {
    if (!nome || !descricao || !preco || !imagem) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      const imagemUrl = await uploadImagem(imagem);
      if (!imagemUrl) return;

      const novoProduto = {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem: imagemUrl, // URL pública da imagem
        id: Date.now().toString(),
      };

      // Envia para o Firebase
      await fetch('https://restaurante-brown.vercel.app/api/pedidos?action=addProduto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProduto),
      });

      // Atualiza localmente
      const novosProdutos = [...produtos, novoProduto];
      setProdutos(novosProdutos);
      await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));

      // Limpa o formulário
      setNome('');
      setDescricao('');
      setPreco('');
      setImagem('');
      
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      Alert.alert("Erro", "Não foi possível salvar o produto");
    }
  };

  // Remove produto do Firebase
  const excluirProduto = async (id) => {
    Alert.alert('Excluir Produto', 'Remover este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: async () => {
          try {
            await fetch('https://restaurante-brown.vercel.app/api/pedidos?action=removeProduto', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });

            const novosProdutos = produtos.filter(p => p.id !== id);
            setProdutos(novosProdutos);
            await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir");
          }
        },
      },
    ]);
  };
  const selecionarImagem = async () => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha a fonte da imagem',
      [
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
              const uriProcessada = await processarImagem(resultado.assets[0].uri);
              setImagem(uriProcessada);
            }
          }
        },
        {
          text: 'Câmera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera');
              return;
            }

            const resultado = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

            if (!resultado.canceled) {
              const uriProcessada = await processarImagem(resultado.assets[0].uri);
              setImagem(uriProcessada);
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.imagem && (
        <Image 
          source={{ uri: item.imagem }} 
          style={styles.imagemPreview} 
          onError={() => console.log("Erro ao carregar imagem")}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.desc}>{item.descricao}</Text>
        <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => excluirProduto(item.id)}
        disabled={loading}
      >
        <Ionicons name="trash" size={25} color="#c62828" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ marginBottom: -10, marginVertical: 30 }}>
        <Header 
          title="Painel do Administrador" 
          showBackButton={true} 
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Adicionar Novo Produto</Text>
        
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          placeholder="Ex: X-Burguer"
          placeholderTextColor="#999"
          editable={!loading}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          style={styles.input}
          placeholder="Ex: Pão, carne, queijo..."
          placeholderTextColor="#999"
          multiline
          editable={!loading}
        />

        <Text style={styles.label}>Preço</Text>
        <TextInput
          value={preco}
          onChangeText={setPreco}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="Ex: 18.50"
          placeholderTextColor="#999"
          editable={!loading}
        />

        <Text style={styles.label}>Imagem</Text>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={selecionarImagem}
          disabled={loading}
        >
          <Text style={styles.imagePickerText}>
            {imagem ? 'Imagem selecionada' : 'Selecionar da galeria ou câmera'}
          </Text>
          <Ionicons name="image" size={30} color="#2e7d32" />
        </TouchableOpacity>

        {imagem && (
          <Image 
            source={{ uri: imagem }} 
            style={styles.selectedImagePreview} 
            resizeMode="cover"
          />
        )}

        <TouchableOpacity 
          style={[styles.btn, loading && { opacity: 0.7 }]} 
          onPress={adicionarProduto}
          disabled={loading}
        >
          <Text style={styles.btnTexto}>
            {loading ? 'Salvando...' : 'Adicionar Produto'}
          </Text>
          {!loading && <Ionicons name="add-circle" size={30} color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, {backgroundColor: '#3f51b5', marginBottom: 15}]}
          onPress={() => navigation.navigate('RelatorioPedidos')}
          disabled={loading}
        >
          <Text style={styles.btnTexto}>Ver Relatório de Pedidos</Text>
        </TouchableOpacity>
        
        {produtos.length === 0 ? (
          <Text style={styles.emptyText}>
            {loading ? 'Carregando...' : 'Nenhum produto cadastrado'}
          </Text>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={{ marginTop: 15 }}
            contentContainerStyle={{ paddingBottom: 10 }}
            refreshing={loading}
            onRefresh={carregarProdutos}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center'
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 3,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
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
  imagemPreview: {
    width: 70,
    height: 70,
    borderRadius: 5,
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
    marginBottom: 10,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#2e7d32',
    marginTop: 20,
    fontSize: 16,
  }
});