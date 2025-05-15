import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import Header from '../components/Header';

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../img/logo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
                
        <View style={styles.content}>
          <Image
            source={require('../img/logo.jpg')} // Adicione sua logo na pasta img
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.welcomeText}>"Sabor que conquista, serviço que encanta"</Text>
          
          <TouchableOpacity 
            style={[styles.btn, styles.menuBtn]} 
            onPress={() => navigation.navigate('Cardapio')}
          >
            <Text style={styles.btnText}>Ver Cardápio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, styles.adminBtn]} 
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.btnText}>Área do Administrador</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Opacidade clara
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 370,
    height: 300,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 19,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    fontWeight: '900',
  },
  btn: {
    width: '95%',
    padding: 9,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: 'green',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 35,
  },
  menuBtn: {
    backgroundColor: '#2e7d32', // Verde
  },
  adminBtn: {
    backgroundColor: '#c62828', // Vermelho
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: '',
  },
});