import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";



const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [coins, setCoins] = useState(0);
  const currentDate = new Date();
  const date = currentDate.getDate();
  const day = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const month = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();
  const formattedDate = `${year}-${month}-${date}`;

  const loadTasks = async () => {
    try {
      const storedData = await AsyncStorage.getItem("tasks");
      let tasks = storedData ? JSON.parse(storedData) : [];
      const todayTasks = tasks.find((task) => task.date === formattedDate);
      if (todayTasks) {
        setTodos(todayTasks.tasks);
      }
      console.log("tasks: ", tasks);
      
    } catch (error) {
      console.log("Error loading tasks", error);
    }
  };

  const saveTasks = async (updatedTodos) => {
    try {
      const storedData = await AsyncStorage.getItem("tasks");
      let tasks = storedData ? JSON.parse(storedData) : [];
      const todayTasksIndex = tasks.findIndex(
        (task) => task.date === formattedDate
      );
      if (todayTasksIndex !== -1) {
        tasks[todayTasksIndex].tasks = updatedTodos;
      } else {
        tasks.push({ date: formattedDate, tasks: updatedTodos });
      }
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.log("Error saving tasks", error);
    }
  };

  const toggleCompletion = (id) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        if (!todo.completed) {
          updateCoins(coins + 2);

          sendSuccessNotification(todo.text);
          
        
        } else {
          updateCoins(coins - 1);
          sendFailureNotification(todo.text);
        }
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    setTodos(updatedTodos);
    saveTasks(updatedTodos);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const deleteTask = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);

    setTodos(updatedTodos);
    saveTasks(updatedTodos);
  };

  const addTask = () => {
    if (newTask.trim() === "") return;
    const newTodo = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTasks(updatedTodos);
    setNewTask("");
  };
  const updateCoins = async (newCoins) => {
    try {
      const validCoins = Math.max(0, newCoins); // Prevent negative coins
      await AsyncStorage.setItem("coins", validCoins.toString());
      setCoins(validCoins);
    } catch (error) {
      console.error("Failed to update coins", error);
    }
  };
  

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem("coins");
        if (storedCoins == null) {
          await AsyncStorage.setItem("coins", "0");
          setCoins(0); // Initialize coins to 0
        } else {
          setCoins(storedCoins ? parseInt(storedCoins) : 0); // Ensure valid number
          console.log("stored coins: ", storedCoins);
        }
      } catch (error) {
        console.error("Failed to load coins", error);
      }
    };
  
    fetchCoins();
  }, []);
  

  const sendSuccessNotification = async (text) => {
    const { status } = await Notifications.getPermissionsAsync();
    const message = `${text} is done! 🎉\nYou earned 2 🪙`;
  
    if (status !== "granted") {
      Alert.alert("✅ Task Completed!", message);
    } else {
      await Notifications.presentNotificationAsync({
        title: "🎯 Task Completed ✅",
        body: message,
      });
    }
  };
  
  const sendFailureNotification = async (text) => {
    const { status } = await Notifications.getPermissionsAsync();
    const message = `The task "${text}" was removed. ❌\nYou lost 1 🪙`;
  
    if (status !== "granted") {
      Alert.alert("⚠️ Task Removed", message);
    } else {
      await Notifications.presentNotificationAsync({
        title: "⚠️ Task Removed ❌",
        body: message,
      });
    }
  };
  
  
  const renderTodo = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleCompletion(item.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        overflow: 'hidden', // Ensures child elements don't overflow
        backgroundColor: item.completed ? "#c3f7d4" : "#ffffff",
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
        <Text style={[
          { fontSize: 16, flexShrink: 1 }, 
          item.completed && { textDecorationLine: 'line-through', color: '#aaaaaa' }
        ]}>
          {item.completed == true ? "✅" : ""} {item.text}
        </Text>
      </View>
     
      <TouchableOpacity 
        onPress={() => deleteTask(item.id)} 
        style={{ padding: 5, marginLeft: 10 }}
      >
        <Ionicons name="trash-bin-outline" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ display: "flex", alignItems: "flex-end" }} onPress={()=>router.push('/pages/coins')}>
        <Text
          style={{
            backgroundColor: "#ECEBDE",
            padding: 8,

            borderRadius: 20,
            fontSize: 16,
            fontWeight: 400,
            width: 'full',
            textAlign: "center",
          }}
        >
          🪙 {coins}
        </Text>
      </TouchableOpacity>
      <View style={{ alignItems: "center" }}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.monthYearText}>
            {month}, {year}
          </Text>
        </View>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item?.id?.toString()}
        style={styles.todoList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edf6f9",
    padding: 20,
  },
  header: {
    alignItems: "center",
    width: 150,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#02c39a",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dateText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#028090",
  },
  dayText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#05668d",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#02c39a",
  },
  todoList: {
    flex: 1,
    padding: 12,
  },
  todoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  todoText: {
    fontSize: 16,
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#7d7d7d",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButton: {
    backgroundColor: "#02c39a",
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
});

export default TodoApp;
