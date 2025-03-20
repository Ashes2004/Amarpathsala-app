import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const CoinModal = ({ coins }) => {
  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2767/2767768.png' }} 
          style={styles.coinImage} 
        />
        <Text style={styles.title}>Your Coins</Text>
        <Text style={styles.coinCount}>{coins}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dim background
  },
  modal: {
    width: 250,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  coinImage: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  coinCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f39c12', // Gold-like color
  },
});

export default CoinModal;
