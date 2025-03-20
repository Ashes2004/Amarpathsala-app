import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Games = () => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // Fetch coins from AsyncStorage
    const fetchCoins = async () => {
      try {
        const savedCoins = await AsyncStorage.getItem("coins");
        if (savedCoins !== null) {
          setCoins(Number(savedCoins));
        }
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      }
    };

    fetchCoins();
  }, []);
  return (
    <View style = {{backgroundColor: "#34495e", flex:1 ,}}>
      <TouchableOpacity
        style={{ display: "flex", alignItems: "flex-end" , margin:25 }}
        onPress={() => router.push("/pages/coins")}
      >
        <Text
          style={{
            backgroundColor: "#ECEBDE",
            padding: 8,

            borderRadius: 20,
            fontSize: 18,
            fontWeight: 400,
            width: "full",
            textAlign: "center",
          }}
        >
          🪙 {coins}
        </Text>
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>Choose a Game</Text>
        <Text style={styles.subtitle}>You need 1🪙 to play 1 game</Text>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/pages/games/ticTakToe")}
        >
          <Text style={styles.buttonText}>Tic Tac Toe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/pages/games/sudoku")}
        >
          <Text style={styles.buttonText}>Sudoku</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/pages/games/memoryGame")}
        >
          <Text style={styles.buttonText}>Memory Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/pages/games/schultTable")}
        >
          <Text style={styles.buttonText}>Schulte Table</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push("/pages/games/rockPaperScissors")}
        >
          <Text style={styles.buttonText}>Rock, Paper, Scissors</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#34495e",
    padding: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ecf0f1",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#bdc3c7",
    marginBottom: 30,
    textAlign: "center",
    letterSpacing: 1,
  },
  gameButton: {
    backgroundColor: "#1abc9c",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 12,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: "#ecf0f1",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Games;
