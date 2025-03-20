import { useRouter } from "expo-router";
import React, { useState , useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
 
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
const generateEmptyBoard = () => Array(9).fill().map(() => Array(9).fill(null));

const isValidMove = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generatePuzzle = (difficulty) => {
  let board = generateEmptyBoard();
  solveSudoku(board); 
  
  const removeCount = difficulty === "easy" ? 20 : difficulty === "medium" ? 40 : 55;
  let removed = 0;

  while (removed < removeCount) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (board[row][col] !== null) {
      let temp = board[row][col];
      board[row][col] = null;

      let copy = board.map(row => [...row]); // Create a copy
      if (!solveSudoku(copy)) {
        board[row][col] = temp; // Restore if not solvable
      } else {
        removed++;
      }
    }
  }
  
  return board;
};


const Sudoku = () => {
  const [grid, setGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [coins, setCoins] = useState(0); 

  useEffect(() => {
    const fetchCoins = async () => {
      const storedCoins = await AsyncStorage.getItem("coins");
      setCoins(parseInt(storedCoins) || 0);
    };
    fetchCoins();
  }, []);


  const handleCellPress = (row, col) => {
    setSelectedCell({ row, col });
  };

   
  
  const isMoveValid = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  };

  const handleNumberPress = (num) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    

    if (!isMoveValid(grid, row, col, num)) {
      Alert.alert("Incorrect Move", `${num} is not a valid move here.`);
      return;
    }

    const newGrid = grid.map((r, rowIndex) =>
      r.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? num : cell
      )
    );
    setGrid(newGrid);
    setSelectedCell(null);
    checkWin(newGrid);
  };

  const checkWin = (grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) return;
      }
    }
    Alert.alert("Congratulations!", "You completed the Sudoku!");
  };

  const startGame = async (difficulty) => {
    if (coins > 0) {
        const newCoins = coins - 1;
        setCoins(newCoins);
        await AsyncStorage.setItem("coins", newCoins.toString());
        sendNotification(newCoins);
      } else {
        Alert.alert("💸 Not Enough Coins 😔", "You need at least 1 coin to play.");
        router.back();
      }
    setGrid(generatePuzzle(difficulty));
    setModalVisible(false);
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
          body: `You used 1 coin to play Sudoku\nRemaining coins: ${newcoin}`,
        });
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sudoku</Text>

      
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Difficulty</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => startGame("easy")}
            >
              <Text style={styles.modalButtonText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => startGame("medium")}
            >
              <Text style={styles.modalButtonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => startGame("hard")}
            >
              <Text style={styles.modalButtonText}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isSelected =
                selectedCell &&
                selectedCell.row === rowIndex &&
                selectedCell.col === colIndex;
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    { borderRightWidth: (colIndex + 1) % 3 === 0 ? 3 : 1 },
                    { borderBottomWidth: (rowIndex + 1) % 3 === 0 ? 3 : 1 },
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text style={styles.cellText}>
                    {cell !== null ? cell : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.numbers}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#34495e",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ecf0f1",
    marginBottom: 20,
  },
  grid: {
    backgroundColor: "#ecf0f1",
    padding: 3,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#7f8c8d",
  },
  selectedCell: {
    backgroundColor: "#d0e7ff",
  },
  cellText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  numbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    justifyContent: "center",
    marginTop: 30,
  },
  numberButton: {
    width: 50,
    height: 50,
    margin: 5,
    backgroundColor: "#2980b9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2980b9",
    padding: 15,
    width: 150,
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Sudoku;
