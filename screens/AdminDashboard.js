import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, 
  Platform, Image } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as ImageManipulator from 'expo-image-manipulator';

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyCOIPGdGlJazNtrnrp6j8MbXUOqW7OSspQ",
  authDomain: "restaurante-e2ff0.firebaseapp.com",
  projectId: "restaurante-e2ff0",
  storageBucket: "restaurante-e2ff0.firebasestorage.app",
  messagingSenderId: "839289505253",
  appId: "1:839289505253:web:2ccdd32cc64fc010b4db0c"
};

// No início do arquivo (após os imports)
let app;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    app = getApp();
    db = getFirestore();
  }
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
}

export default function AdminDashboard({ navigation }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      // Tenta carregar do Firebase primeiro
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const produtosFirebase = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProdutos(produtosFirebase);
      await AsyncStorage.setItem('produtos', JSON.stringify(produtosFirebase));
    } catch (error) {
      console.error("Erro ao carregar do Firebase:", error);
      // Fallback para dados locais
      const dadosLocais = await AsyncStorage.getItem('produtos');
      if (dadosLocais) {
        setProdutos(JSON.parse(dadosLocais));
      }
    } finally {
      setLoading(false);
    }
  };

  const processarImagem = async (uri) => {
    try {
      // Redimensiona a imagem para otimização
      const imagemProcessada = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return imagemProcessada.uri;
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      return uri; // Retorna a original se falhar
    }
  };

  const adicionarProduto = async () => {
    if (!nome || !descricao || !preco) {
      Alert.alert('Erro', 'Preencha nome, descrição e preço!');
      return;
    }

    try {
      setLoading(true);
      
      // Cria objeto do produto
      const novoProduto = {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem: imagem || 'sem-imagem.jpg',
        createdAt: new Date().toISOString()
      };

      // Adiciona ao Firebase
      const docRef = await addDoc(collection(db, "produtos"), novoProduto);
      const produtoComId = { ...novoProduto, id: docRef.id };

      // Atualiza estado local
      const novosProdutos = [...produtos, produtoComId];
      setProdutos(novosProdutos);
      await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));

      // Limpa o formulário
      setNome('');
      setDescricao('');
      setPreco('');
      setImagem('');

      Alert.alert('Sucesso', 'Produto adicionado localmente e na nuvem!');
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      Alert.alert(
        'Erro', 
        'Produto foi salvo localmente, mas não na nuvem. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja remover este produto de todos os dispositivos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Remove do Firebase
              await deleteDoc(doc(db, "produtos", id));
              
              // Remove localmente
              const novosProdutos = produtos.filter(p => p.id !== id);
              setProdutos(novosProdutos);
              await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));
            } catch (error) {
              console.error("Erro ao excluir:", error);
              Alert.alert('Erro', 'Não foi possível excluir da nuvem');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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