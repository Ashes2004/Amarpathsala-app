import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const SchultTableGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCoins();
    generateNumbers();
    loadBestTime();
  }, []);

  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning]);

  const fetchCoins = async () => {
    const storedCoins = await AsyncStorage.getItem("coins");
    const coin = parseInt(storedCoins) || 0;
    if (coin > 0) {
      const newCoins = coin - 1;
      await AsyncStorage.setItem("coins", newCoins.toString());
      sendNotification(newCoins);
    } else {
      Alert.alert("💸 Not Enough Coins 😔", "Earn more coins to play! 🎮");
      router.back();
    }
  };

  const sendNotification = async (newcoin) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Great job 😊!", `You used 1 coin to play.\nRemaining coins: ${newcoin}`);
    } else {
      await Notifications.presentNotificationAsync({
        title: "Great job 😊",
        body: `You used 1 coin to play schulte table\nRemaining coins: ${newcoin}`,
      });
    }
  };

  const generateNumbers = () => {
    const shuffledNumbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    );
    setNumbers(shuffledNumbers);
    setNextNumber(1);
    setElapsedTime(0);
    setTimerRunning(false);
  };

  const loadBestTime = async () => {
    const storedBestTime = await AsyncStorage.getItem("bestTime");
    if (storedBestTime) {
      setBestTime(parseFloat(storedBestTime));
    }
  };

  const handlePress = async (num) => {
    if (!timerRunning) {
      setTimerRunning(true);
    }
    if (num === nextNumber) {
      if (num === 25) {
        setTimerRunning(false);
        if (!bestTime || elapsedTime < bestTime) {
          setBestTime(elapsedTime);
          await AsyncStorage.setItem("bestTime", elapsedTime.toString());
        }
        Alert.alert("🎉 You did it! 🎉", `You completed the Schult Table in ${elapsedTime} seconds! 🎯\nBest Time: ${bestTime ? bestTime : elapsedTime} seconds`);
      }
      setNextNumber(nextNumber + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schulte Table Game</Text>
      <Text style={styles.timer}>Elapsed Time: {elapsedTime}s</Text>
      <Text style={styles.timer}>Best Time: {bestTime ? bestTime : "__"}s</Text>
      <View style={styles.grid}>
        {numbers.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              num < nextNumber ? styles.disabledCell : styles.activeCell
            ]}
            onPress={() => handlePress(num)}
            disabled={num < nextNumber}
          >
            <Text style={styles.cellText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.howToPlayButton}>
        <Text style={styles.howToPlayText}>How to Play</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Tap numbers in ascending order from 1 to 25 as fast as you can!</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#ecf0f1",
    marginBottom: 20,
  },
  timer: {
    fontSize: 18,
    color: "#ecf0f1",
    marginBottom: 10,
  },
  grid: {
    width: 350,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cell: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#34495e",
    margin: 5,
    borderRadius: 5,
  },
  activeCell: {
    backgroundColor: "#3498db",
  },
  disabledCell: {
    backgroundColor: "#780C28",
  },
  cellText: {
    color: "#ecf0f1",
    fontSize: 20,
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
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});

export default SchultTableGame;
