import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true); 
  const [winner, setWinner] = useState(null);
  const [modalVisible, setModalVisible] = useState(true); 
  const [difficulty, setDifficulty] = useState("easy"); 
  const [coins, setCoins] = useState(0); 

  useEffect(() => {
    const fetchCoins = async () => {
      const storedCoins = await AsyncStorage.getItem("coins");
      setCoins(parseInt(storedCoins) || 0);
    };
    fetchCoins();
  }, []);
 
  const startGame = async () => {
    if (coins > 0) {
      const newCoins = coins - 1;
      setCoins(newCoins);
      await AsyncStorage.setItem("coins", newCoins.toString());
      sendNotification(newCoins);
    } else {
      Alert.alert("💸 Not Enough Coins 😔", "You need at least 1 coin to play.");
      router.back();
    }
  };

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes(null) ? null : "Tie";
  };

  const computerMove = (currentBoard) => {
    let move;
    const availableMoves = currentBoard
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    if (difficulty === "easy") {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === "medium") {
      move = findBestMove(currentBoard, "O", "X", 2);
      if (move === null) move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === "hard") {
      move = findBestMove(currentBoard, "O", "X", 5);
    }
    return move;
  };

  const findBestMove = (board, ai, player, depth) => {
    if (depth === 0) return null;
    const emptyIndices = board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    for (let index of emptyIndices) {
      let copy = [...board];
      copy[index] = ai;
      if (checkWinner(copy) === ai) return index;
    }
    for (let index of emptyIndices) {
      let copy = [...board];
      copy[index] = player;
      if (checkWinner(copy) === player) return index;
    }
    return emptyIndices.length > 0 ? emptyIndices[0] : null;
  };

  const handlePress = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner === "Tie" ? "Tie" : gameWinner === "X" ? "You" : "Computer");
      return;
    }

    setPlayerTurn(false);
    setTimeout(() => {
      const computerIndex = computerMove(newBoard);
      newBoard[computerIndex] = "O";
      setBoard(newBoard);
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner === "Tie" ? "Tie" : "Computer");
      }
      setPlayerTurn(true);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setPlayerTurn(true);
    setModalVisible(true);
  };
  const sendNotification = async (newcoin) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      alert(
        `Great job 😊!\nYou used 1 coin to play.\nRemaining coins: ${newcoin}`
      );
    } else {
      await Notifications.presentNotificationAsync({
        title: "Great job 😊",
        body: `You used 1 coin to play Tic Tac Toe\nRemaining coins: ${newcoin}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Choose Difficulty</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setDifficulty("easy");
              setModalVisible(false);
              startGame();
            }}
          >
            <Text style={styles.modalButtonText}>Easy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setDifficulty("medium");
              setModalVisible(false);
              startGame();
            }}
          >
            <Text style={styles.modalButtonText}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setDifficulty("hard");
              setModalVisible(false);
              startGame();
            }}
          >
            <Text style={styles.modalButtonText}>Hard</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Text style={styles.title}>Tic Tac Toe</Text>
      <View style={styles.board}>
        {board.map((value, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              value === "X" && styles.xCell,
              value === "O" && styles.oCell,
            ]}
            onPress={() => handlePress(index)}
            disabled={!playerTurn || winner !== null}
          >
            <Text style={styles.cellText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {winner && (
        <Text style={styles.winnerText}>
          {winner === "Tie" ? "It's a Tie!" : `${winner} Wins!`}
        </Text>
      )}
     <View style={{display:'flex' , flexDirection:'row' , gap:18}}>
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
        <Text style={styles.resetButtonText}>Back</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ecf0f1",
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "33.33%",
    height: "33.33%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#34495e",
  },
  cellText: {
    fontSize: 40,
    color: "#ecf0f1",
    fontWeight: "bold",
  },
  xCell: {
    backgroundColor: "#e74c3c",
  },
  oCell: {
    backgroundColor: "#3498db",
  },
  winnerText: {
    fontSize: 24,
    color: "#1abc9c",
    marginVertical: 20,
  },
  resetButton: {
    backgroundColor: "#9b59b6",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
  },
  backButton: {
    backgroundColor: "#16C47F",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
  },
  resetButtonText: {
    color: "#ecf0f1",
    fontWeight: "bold",
    fontSize: 18,
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 28,
    color: "#ecf0f1",
    marginBottom: 20,
    fontWeight: "bold",
  },
  modalButton: {
    backgroundColor: "#1abc9c",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    marginVertical: 10,
  },
  modalButtonText: {
    color: "#ecf0f1",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TicTacToe;
