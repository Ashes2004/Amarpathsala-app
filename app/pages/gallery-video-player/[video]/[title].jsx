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

export default function Video() {
  const { video, title } = useLocalSearchParams();
  useKeepAwake();
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [note, setNote] = useState("");
  const windowWidth = Dimensions.get("window").width;
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
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

    fetchNote();
  }, [video]);

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

          <Text style={styles.videoTitle}>{title}</Text>

          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "black",
              marginBottom: 25,
            }}
          ></View>

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
    marginRight: 18,
    width: 100,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
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
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },


});
