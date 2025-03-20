import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

const choices = [
  { name: "Rock", emoji: "✊", color: "#ff4d4d" },
  { name: "Paper", emoji: "✋", color: "#ffcc00" },
  { name: "Scissors", emoji: "✌️", color: "#66ccff" },
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    const storedCoins = await AsyncStorage.getItem("coins");
    const coin = parseInt(storedCoins) || 0;
    if (coin > 0) {
      await AsyncStorage.setItem("coins", (coin - 1).toString());
      await sendNotification(coin - 1);
    } else {
      Alert.alert("Not Enough Coins!", "Earn more coins to play.");
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
          body: `You used 1 coin to play Rock Paper Scissor\nRemaining coins: ${newcoin}`,
        });
      }
    };

  const playRound = (playerSelection) => {
    setPlayerChoice(playerSelection);
    animateSelection();
    
    const randomIndex = Math.floor(Math.random() * choices.length);
    const computerSelection = choices[randomIndex].name;
    setComputerChoice(computerSelection);

    setTimeout(() => {
      if (playerSelection === computerSelection) {
        setResult("It's a Tie!");
      } else if (
        (playerSelection === "Rock" && computerSelection === "Scissors") ||
        (playerSelection === "Paper" && computerSelection === "Rock") ||
        (playerSelection === "Scissors" && computerSelection === "Paper")
      ) {
        setResult("You Win!");
        setPlayerScore(playerScore + 1);
      } else {
        setResult("CPU Wins!");
        setComputerScore(computerScore + 1);
      }
    }, 500);
  };

  const animateSelection = () => {
    scaleAnim.setValue(1);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ROCK PAPER SCISSORS</Text>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreTitle}>PLAYER</Text>
          <Text style={styles.score}>{playerScore}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreTitle}>CPU</Text>
          <Text style={styles.score}>{computerScore}</Text>
        </View>
      </View>
      {playerChoice && computerChoice && (
        <Animated.View style={[styles.choiceDisplay, { opacity: fadeAnim }]}> 
          <View style={styles.choiceBox}>
            <Text style={styles.choiceLabel}>You Chose</Text>
            <Text style={styles.choiceText}>{choices.find(c => c.name === playerChoice)?.emoji}</Text>
          </View>
          <View style={styles.choiceBox}>
            <Text style={styles.choiceLabel}>CPU Chose</Text>
            <Text style={styles.choiceText}>{choices.find(c => c.name === computerChoice)?.emoji}</Text>
          </View>
        </Animated.View>
      )}
      <Text style={styles.subTitle}>Pick your weapon</Text>
      <View style={styles.choicesContainer}>
        {choices.map((choice) => (
          <View key={choice.name}>
            <TouchableOpacity
              style={[styles.choiceButton, { backgroundColor: choice.color }]}
              onPress={() => playRound(choice.name)}
            >
              <Animated.Text style={[styles.choiceText, { transform: [{ scale: scaleAnim }] }]}>
                {choice.emoji}
              </Animated.Text>
            </TouchableOpacity>
            <Text style={styles.choiceSubText}>{choice.name}</Text>
          </View>
        ))}
      </View>
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1c1e26" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 40 },
  subTitle: { fontSize: 16, color: "#aaa", marginTop: 20 },
  choicesContainer: { flexDirection: "row", gap: 14, justifyContent: "center", alignItems: "center" },
  choiceButton: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginVertical: 10 },
  choiceText: { fontSize: 40, color: "white" },
  choiceSubText: { fontSize: 12, color: "white", textAlign: "center" },
  result: { fontSize: 22, fontWeight: "bold", color: "#ffcc00", marginVertical: 20 },
  scoreBoard: { flexDirection: "row", justifyContent: "space-around", width: "80%", backgroundColor: "#333", padding: 15, borderRadius: 10, marginBottom: 20 },
  scoreBox: { alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: "#444", width: "40%" },
  scoreTitle: { fontSize: 18, fontWeight: "bold", color: "#ffcc00", marginBottom: 5 },
  score: { fontSize: 24, fontWeight: "bold", color: "white" },
  choiceDisplay: { flexDirection: "row", justifyContent: "space-around", width: "80%", marginBottom: 20 },
  choiceBox: { alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: "#555", width: "40%" },
  choiceLabel: { fontSize: 16, color: "#ffcc00", marginBottom: 5 },
});

export default RockPaperScissors;
