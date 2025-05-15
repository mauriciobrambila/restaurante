import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function AdminLoginScreen({ navigation }) {
  const [senha, setSenha] = useState('');
  const senhaCorreta = '123'; // ← Você pode trocar por outra senha local
  const autenticar = () => {
    if (senha === senhaCorreta) {
      navigation.replace('AdminDashboard');
    } else {
      Alert.alert('Erro', 'Senha incorreta');
    }
  };

  return (
       <View style={{ marginVertical: 25  }}>
       <Header 
         title="Login Admin" 
         showBackButton={true} 
         onBackPress={() => navigation.goBack()}
       />
     
      <View style={styles.container}>
        <Text style={styles.label}>             Digite a senha:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity style={styles.btn} onPress={autenticar}>
          <Text style={styles.btnTexto}>Entrar  </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
  },
  label: {
    fontSize: 18,
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#c62828',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnTexto: {
    color: '#fff',
    fontSize: 18,
  },
});
