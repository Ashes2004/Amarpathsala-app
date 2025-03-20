import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ImageBackground,
  Alert,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";

const MeditationTimer = () => {
  const { meditationTimer } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(
    parseInt(meditationTimer, 10) * 60
  );
  const [musicId, setMusicId] = useState("none");
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useKeepAwake();
  const motivationalTexts = [
    "Relax and Breathe...",
    "You are in control of your mind.",
    "Every breath is a fresh start.",
    "Stay calm and let go of stress.",
    "Inner peace begins now.",
    "Embrace the present moment.",
    "Let go of negativity, inhale peace.",
    "Your mind is a peaceful sanctuary.",
    "Breathe in courage, breathe out fear.",
    "You are stronger than your thoughts.",
    "Serenity flows within you.",
    "Let your soul find harmony.",
    "Calmness is your superpower.",
    "Your inner light shines brightly.",
    "Each breath brings clarity and strength."
  ];
  
  const [motivationIndex, setMotivationIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((prev) => (prev + 1) % motivationalTexts.length);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true, delay: 1000 }),
      ]).start();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const soundRef = useRef(null);
  const timerRef = useRef(null);

  const bowl = require("../../../assets/music/bowl.mp3");
  const om = require("../../../assets/music/om.mp3");
  const rain =  require("../../../assets/music/rain.mp3");
  const nature =  require("../../../assets/music/nature.mp3");
  const theta =  require("../../../assets/music/theta.mp3");
  const flute =  require("../../../assets/music/flute.mp3");
  const musicLists = [
    { id: "none", name: "No Music" },
    { id: rain, name: "Rain Sound" },
    { id: flute, name: "Flute Sound" },
    { id: bowl, name: "Bowl Sound" },
    { id: om, name: "Om Sound" },
    { id: nature, name: "Nature Sound" },
    { id: theta, name: "Theta Sound" },
   
  ];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  useEffect(() => {
    const handleSoundPlayback = async () => {
      if (isPlaying && musicId && musicId !== "none") {
        const { sound } = await Audio.Sound.createAsync(musicId, {
          shouldPlay: true,
          isLooping: true,
        });
        soundRef.current = sound;
      } else if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    };

    handleSoundPlayback();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isPlaying, musicId]);

  const updateCoin = async (coin) => {
    const storedCoins = await AsyncStorage.getItem("coins");
    const prevcoin = parseInt(storedCoins);
    const newCoin = prevcoin + coin;
    await AsyncStorage.setItem("coins", newCoin.toString());
    sendNotification(newCoin, coin);
  };
  const handleEnd = async () => {
    setIsPlaying(false);
    setMusicId("none");
    console.log(secondsLeft);
    const TotalTime = parseInt(meditationTimer) * 60;
    if (secondsLeft == TotalTime) {
      updateCoin(parseInt(meditationTimer)*5);
    }
    router.back();
  };

  const selectMusic = (id) => {
    setMusicId(id);
    setModalVisible(false);
  };

  const sendNotification = async (newcoin, coin) => {
    const { status } = await Notifications.getPermissionsAsync();
    const message = `🎉 Great job! 🎉\nYou've earned ${coin} coins. 💰\nTotal coins: ${newcoin} 🌟`;
  
    if (status !== "granted") {
      Alert.alert("👏 Well Done!", message);
    } else {
      await Notifications.presentNotificationAsync({
        title: "✨ Meditation Completed ✨",
        body: message,
      });
    }
  };
  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/meditation.jpg")}
      style={styles.backgroundImage}
    >
      <TouchableOpacity
        style={styles.musicIcon}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="musical-notes-outline" size={30} color="#fff" />
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>
      <TouchableOpacity
        style={styles.endButton}
        onPress={handleEnd}
        disabled={!isPlaying}
      >
        <Text style={styles.buttonText}>End</Text>
      </TouchableOpacity>
      <Animated.Text style={[styles.motivationalText, { opacity: fadeAnim }]}>
        "{motivationalTexts[motivationIndex]}"
      </Animated.Text>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Music</Text>
            <FlatList
              data={musicLists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.musicItem}
                  onPress={() => selectMusic(item.id)}
                >
                  <Text
                    style={[
                      styles.musicText,
                      { color: item.id === musicId ? "red" : "black" },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>

           
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  musicIcon: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#4DA1A9",
    padding: 10,
    borderRadius: 50,
    borderColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    
    
  },
  timerContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 30,
    marginVertical: 20,
  },
  timerText: {
    fontSize: 50,
    color: "#FFF",
    fontWeight: "bold",
  },
  endButton: {
    marginTop: 20,
    backgroundColor: "#D9534F",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  musicItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    width: "100%",
    alignItems: "center",
  },
  musicText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#D9534F",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  motivationalText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5C7285",
    position: "absolute",
    top: "30%",
    textAlign: "center",
    paddingHorizontal: 20,
    fontStyle:'italic',
    
    
  },
});

export default MeditationTimer;
