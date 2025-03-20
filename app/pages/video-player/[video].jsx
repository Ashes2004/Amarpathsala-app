import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import NetInfo from "@react-native-community/netinfo";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { useKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";

export default function Video() {
  const { video } = useLocalSearchParams();
  useKeepAwake();
  const [allplaylists, setAllPlaylists] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [completed, setcompleted] = useState(false);
  const [videoTitle, setVideoTitle] = useState("Loading...");
  const [videoDescription, setVideoDescription] = useState("");
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [note, setNote] = useState("");
  const [coins, setCoins] = useState(0);
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchCoins = async () => {
      const storedCoins = await AsyncStorage.getItem("coins");
      setCoins(parseInt(storedCoins) || 0);
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadSavedVideos = async () => {
      try {
        const savedData = await AsyncStorage.getItem("savedVideos");
        const videos = savedData ? JSON.parse(savedData) : [];
        setSavedVideos(videos);
        const alreadySaved = videos.some((v) => v.videoId === video);
        setIsSaved(alreadySaved);
      } catch (error) {
        console.error("Error loading saved videos:", error);
      }
    };

    const fetchVideoTitle = async () => {
      try {
        const title = await AsyncStorage.getItem("currentVideoTitle");
        if (title !== null) {
          setVideoTitle(title);
        }
      } catch (error) {
        console.error("Error fetching video title:", error);
      }
    };
    const fetchVideoDescription = async () => {
      try {
        const Description = await AsyncStorage.getItem(
          "currentVideoDescription"
        );
        if (Description !== null) {
          setVideoDescription(Description);
          console.log("desci: ", Description);
        }
      } catch (error) {
        console.error("Error fetching video title:", error);
      }
    };

    const fetchNote = async () => {
      try {
        const savedNote = await AsyncStorage.getItem(`note-${video}`);
        if (savedNote !== null) {
          setNote(savedNote);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    loadSavedVideos();
    fetchVideoTitle();
    fetchVideoDescription();
    fetchNote();
  }, [video]);

  useEffect(() => {
    fetchPlaylists();
  }, []);
  
  const fetchPlaylists = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem("playlists");
      const playlistId = await AsyncStorage.getItem("OneplaylistId");

      if (!storedPlaylists) {
        setAllPlaylists([]);
        return;
      }

      const playlists = JSON.parse(storedPlaylists);
      setAllPlaylists(playlists);

      // Find the current playlist
      const currentPlaylist = playlists.find(
        (playlist) => playlist.playlistId === playlistId
      );
      if (currentPlaylist) {
        const isCompleted = currentPlaylist.videos.some(
          (vid) => vid.videoId === video && vid.completed
        );
        console.log("is completed: ", isCompleted);
        console.log("hiii");
        setcompleted(isCompleted);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const updatePlaylists = async (playlists) => {
    try {
      await AsyncStorage.setItem("playlists", JSON.stringify(playlists));
    } catch (error) {
      console.error("Error updating playlists:", error);
    }
  };

  const markCompleted = async () => {
    try {
      let videoId = video;
      const playlistId = await AsyncStorage.getItem("OneplaylistId");

      if (!playlistId) return;
      let isMarkCompletButtonPressed = false;
      let updated = false;
      const updatedPlaylists = allplaylists.map((playlist) => {
        if (playlist.playlistId === playlistId) {
          playlist.videos = playlist.videos.map((vid) => {
            if (vid.videoId === videoId) {
              if (!vid.completed) {
                vid.completed = true;
                isMarkCompletButtonPressed = true;
              } else {
                vid.completed = false;
              }

              updated = true;
            }
            return vid;
          });
        }
        return playlist;
      });

      if (updated) {
        setAllPlaylists(updatedPlaylists);
        setcompleted(!completed);
        await updatePlaylists(updatedPlaylists);
      }
      if (isMarkCompletButtonPressed) {
        const newCoins = coins + 5;
        setCoins(newCoins);
        await AsyncStorage.setItem("coins", newCoins.toString());
        sendNotification(newCoins);
      }
    } catch (error) {
      console.error("Error marking video as completed:", error);
    }
  };

  const sendNotification = async (newcoin) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      alert(
        `Great job 😊!\nYou get 5 coin for completing the video.\nTotal coins: ${newcoin}`
      );
    } else {
      await Notifications.presentNotificationAsync({
        title: "Great job 😊",
        body: `You get 5 coin for completing the video.\nTotal coins: ${newcoin}`,
      });
    }
  };

  const handleSaveUnsave = async () => {
    try {
      let updatedVideos = [...savedVideos];

      if (isSaved) {
        updatedVideos = updatedVideos.filter((v) => v.videoId !== video);
      } else {
        updatedVideos.push({
          videoId: video,
          title: videoTitle,
          description: videoDescription ? videoDescription : null,
        });
      }

      await AsyncStorage.setItem("savedVideos", JSON.stringify(updatedVideos));
      setSavedVideos(updatedVideos);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error updating saved videos:", error);
    }
  };

  const handleSaveNote = async () => {
    try {
      await AsyncStorage.setItem(`note-${video}`, note);
      Alert.alert("✅ Success", "Notes saved!");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const onFullScreenChange = async (isFullScreen) => {
    if (isFullScreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isConnected ? (
        <>
          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#0997C5"
              style={styles.loader}
            />
          )}
          <YoutubePlayer
            height={225}
            width={windowWidth}
            videoId={video}
            onReady={() => setIsLoading(false)}
            onFullScreenChange={onFullScreenChange}
          />

          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => setIsDescriptionVisible(!isDescriptionVisible)}
          >
            <Text style={styles.videoTitle}>{videoTitle}</Text>
            <AntDesign
              name={isDescriptionVisible ? "up" : "down"}
              size={25}
              color="#EFF3EA"
              style={{
                backgroundColor: "#C30E59", // Tomato (a vibrant and attractive color)
                padding: 8,
                borderRadius: 50,
              }}
            />
          </TouchableOpacity>

          {isDescriptionVisible && (
            <Text style={styles.descriptionText} selectable>
              {videoDescription}
            </Text>
          )}
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "black",
              marginBottom: 25,
            }}
          ></View>
          <View
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingHorizontal: 15,
            }}
          >
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: completed ? "#AA5486" : "#2A9D8F" },
              ]}
              onPress={markCompleted}
            >
              <Text style={styles.saveButtonText}>
                {completed ? "Completed" : "Mark Completed"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: isSaved ? "#264653" : "#155E95" },
              ]}
              onPress={handleSaveUnsave}
            >
              <Text style={styles.saveButtonText}>
                {isSaved ? "Unsave" : "Save Video"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write your note here..."
              value={note}
              onChangeText={setNote}
            />
            <TouchableOpacity
              style={styles.saveNoteButton}
              onPress={handleSaveNote}
            >
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>
          No internet connection. Please check your connection and try again.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loader: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
    padding: 8,
  },
  saveButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    width: "full",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: "#fff",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  errorText: {
    color: "#000",
    fontSize: 18,
    textAlign: "center",
  },
  noteContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  textInput: {
    height: 250,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    textAlignVertical: "top",
    backgroundColor: "#ECEBDE",
  },
  saveNoteButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 10,
  },
  descriptionText: {
    padding: 15,
    fontSize: 14,
    color: "#555",
    backgroundColor: "#fafafa",
  },
});
