import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen'; 
import CardapioScreen from './screens/CardapioScreen'; // Corrigido o nome da tela
import PedidoScreen from './screens/PedidoScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import PedidoConfirmado from './screens/PedidoConfirmado'; // Nova tela
import RelatorioPedidos from './screens/RelatorioPedidos'; // Nova tela

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cardapio" component={CardapioScreen} />
        <Stack.Screen name="Pedido" component={PedidoScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="PedidoConfirmado" component={PedidoConfirmado} />
        <Stack.Screen name="RelatorioPedidos" component={RelatorioPedidos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
