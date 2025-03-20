import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    const storedCoins = await AsyncStorage.getItem("coins");
    const coin = parseInt(storedCoins);
    if (coin > 0) {
      const newCoins = coin - 1;
      await AsyncStorage.setItem("coins", newCoins.toString());
      sendNotification(newCoins);
    } else {
      Alert.alert(
        "💸 Not Enough Coins 😔",
        "You need at least 1 coin to play. 🌟 Earn more coins to start playing! 🎮"
      );
      router.back();
    }
  };

  const sendNotification = async (newcoin) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Great job 😊!",
        `You used 1 coin to play.\nRemaining coins: ${newcoin}`
      );
    } else {
      await Notifications.presentNotificationAsync({
        title: "Great job 😊",
        body: `You used 1 coin to play Memory Game\nRemaining coins: ${newcoin}`,
      });
    }
  };

  useEffect(() => {
    const shuffledCards = [...Array(8).keys(), ...Array(8).keys()].sort(
      () => Math.random() - 0.5
    );
    setCards(shuffledCards);
  }, []);

  const handleCardPress = (index) => {
    if (
      flippedCards.length < 2 &&
      !flippedCards.includes(index) &&
      !matchedCards.includes(index)
    ) {
      setFlippedCards([...flippedCards, index]);

      if (flippedCards.length === 1) {
        const [firstIndex] = flippedCards;
        if (cards[firstIndex] === cards[index]) {
          setMatchedCards([...matchedCards, firstIndex, index]);
          setFlippedCards([]);
          if (matchedCards.length + 2 === cards.length) {
            Alert.alert("🎉 Congratulations! 🎉", "You've matched all the cards! 🃏✨");
          }
        } else {
          setTimeout(() => setFlippedCards([]), 1000);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              flippedCards.includes(index) || matchedCards.includes(index)
                ? styles.cardFlipped
                : styles.cardHidden,
            ]}
            onPress={() => handleCardPress(index)}
          >
            <Text style={styles.cardText}>
              {flippedCards.includes(index) || matchedCards.includes(index)
                ? card
                : "?"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.howToPlayButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.howToPlayText}>How To Play</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How To Play</Text>
            <Text style={styles.modalText}>{" 1. Tap on a card to reveal it.\n\n 2. Tap another card to find its match.\n\n 3. Match all pairs to win the game.\n\n 4. Have fun and test your memory!"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ecf0f1",
    marginBottom: 20,
  },
  grid: {
    width: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#34495e",
    margin: 5,
    borderRadius: 5,
  },
  cardHidden: {
    backgroundColor: "#34495e",
  },
  cardFlipped: {
    backgroundColor: "#1abc9c",
  },
  cardText: {
    color: "#ecf0f1",
    fontSize: 24,
    fontWeight: "bold",
  },
  howToPlayButton: {
    marginTop: 20,
    padding: 10,
  },
  howToPlayText: {
    color: "#f39c12",
    fontSize: 18,
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MemoryGame;