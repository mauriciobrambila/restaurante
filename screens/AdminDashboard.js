import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, 
  Platform, Image } from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard({ navigation }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug inicial
  useEffect(() => {
    console.log("Componente montado - Carregando produtos...");
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      console.log("Iniciando carregamento de produtos...");
      
      // Tenta buscar do Firebase primeiro
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      const produtosFirebase = [];
      
      querySnapshot.forEach((doc) => {
        console.log(`Produto encontrado: ${doc.id} => ${JSON.stringify(doc.data())}`);
        produtosFirebase.push({ id: doc.id, ...doc.data() });
      });

      setProdutos(produtosFirebase);
      await AsyncStorage.setItem('produtos', JSON.stringify(produtosFirebase));
      
      console.log("Produtos carregados com sucesso:", produtosFirebase.length);
    } catch (error) {
      console.error("Erro ao carregar do Firebase:", error);
      
      // Fallback para AsyncStorage
      const dadosLocais = await AsyncStorage.getItem('produtos');
      if (dadosLocais) {
        console.log("Usando dados locais do AsyncStorage");
        setProdutos(JSON.parse(dadosLocais));
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadImagem = async (uri) => {
    console.log("Iniciando upload de imagem...");
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const nomeArquivo = `produto_${Date.now()}.jpg`;
      const storageRef = ref(storage, `produtos/${nomeArquivo}`);
      
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      
      console.log("Upload de imagem concluído:", url);
      return url;
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  };

  const adicionarProduto = async () => {
    if (!nome || !descricao || !preco) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      setLoading(true);
      console.log("Adicionando novo produto...");

      let urlImagem = '';
      if (imagem) {
        urlImagem = await uploadImagem(imagem);
      }

      const novoProduto = {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem: urlImagem,
        createdAt: new Date().toISOString()
      };

      console.log("Dados do novo produto:", novoProduto);

      // Adiciona ao Firebase
      const docRef = await addDoc(collection(db, 'produtos'), novoProduto);
      novoProduto.id = docRef.id;

      // Atualiza estado local
      const novosProdutos = [...produtos, novoProduto];
      setProdutos(novosProdutos);
      await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));

      // Limpa formulário
      setNome('');
      setDescricao('');
      setPreco('');
      setImagem(null);

      console.log("Produto adicionado com sucesso!");
      Alert.alert('Sucesso', 'Produto adicionado ao cardápio!');
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      Alert.alert('Erro', 'Não foi possível adicionar o produto');
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente remover este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log(`Excluindo produto ID: ${id}`);
              
              // Remove do Firebase
              await deleteDoc(doc(db, 'produtos', id));
              
              // Atualiza estado local
              const novosProdutos = produtos.filter(p => p.id !== id);
              setProdutos(novosProdutos);
              await AsyncStorage.setItem('produtos', JSON.stringify(novosProdutos));
              
              console.log("Produto excluído com sucesso");
            } catch (error) {
              console.error("Erro ao excluir:", error);
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const selecionarImagem = async () => {
    console.log("Solicitando permissão para acessar mídia...");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para adicionar imagens');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    console.log("Resultado do seletor de imagem:", resultado);

    if (!resultado.canceled && resultado.assets) {
      setImagem(resultado.assets[0].uri);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.imagem && (
        <Image 
          source={{ uri: item.imagem }} 
          style={styles.imagemPreview} 
          onError={(e) => console.log("Erro ao carregar imagem:", e.nativeEvent.error)}
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ marginVertical: 30 }}>
        <Header 
          title="Painel do Administrador" 
          showBackButton={true} 
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Adicionar Novo Produto</Text>
        
        <Text style={styles.label}>Nome do Produto*</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          placeholder="Ex: X-Burguer"
          placeholderTextColor="#999"
          editable={!loading}
        />

        <Text style={styles.label}>Descrição*</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          style={styles.input}
          placeholder="Ex: Pão, carne, queijo..."
          placeholderTextColor="#999"
          multiline
          editable={!loading}
        />

        <Text style={styles.label}>Preço*</Text>
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
            {imagem ? 'Imagem selecionada' : 'Selecionar da galeria'}
          </Text>
          <Ionicons name="image" size={30} color="#2e7d32" />
        </TouchableOpacity>

        {imagem && (
          <Image 
            source={{ uri: imagem }} 
            style={styles.selectedImagePreview} 
            onError={(e) => console.log("Erro ao carregar preview:", e.nativeEvent.error)}
          />
        )}

        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={adicionarProduto}
          disabled={loading}
        >
          <Text style={styles.btnTexto}>
            {loading ? 'Processando...' : 'Adicionar Produto'}
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
        
        {loading && produtos.length === 0 ? (
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        ) : produtos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={{ marginTop: 15 }}
            contentContainerStyle={{ paddingBottom: 20 }}
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