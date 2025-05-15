import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ title }) {
  return (
    <View style={styles.header}>
      <Ionicons name="restaurant" size={24} color="#fff" />
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#c62828',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 50,
    fontWeight: 'bold',
  },
});
