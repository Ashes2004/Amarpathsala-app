import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  StyleSheet,
  Keyboard,
} from "react-native";


import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons"; // Import Icons

const VideoManager = () => {
  const [videoLink, setVideoLink] = useState("");
  const [title, setTitle] = useState("");
  const [videos, setVideos] = useState([]);
  const [editingVideoId, setEditingVideoId] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  // Extract YouTube Video ID
  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  };

  // Load videos from AsyncStorage
  const loadVideos = async () => {
    const savedVideos = await AsyncStorage.getItem("videoGallery");
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
  };

  // Save or Edit Video
  const addOrEditVideo = async () => {
    Keyboard.dismiss(); 
    if (!videoLink.trim() || !title.trim()) {
      Alert.alert("Error", "Both fields are required!");
      return;
    }

    const videoId = getYouTubeVideoId(videoLink);
    if (!videoId) {
      Alert.alert("Invalid URL", "Please enter a valid YouTube link!");
      return;
    }

    if (editingVideoId) {
      // Edit existing video
      const updatedVideos = videos.map((video) =>
        video.videoId === editingVideoId ? { ...video, title } : video
      );
      await AsyncStorage.setItem("videoGallery", JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
      setEditingVideoId(null);
    } else {
      // **Prevent duplicate entries**
      const isDuplicate = videos.some((video) => video.videoId === videoId);
      if (isDuplicate) {
        Alert.alert("Duplicate Video", "This video has already been added!");
        return;
      }

      // Add new video
      const newVideo = { videoId, title };
      const updatedVideos = [...videos, newVideo];

      await AsyncStorage.setItem("videoGallery", JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
    }

    setVideoLink("");
    setTitle("");
  };

  // Delete Video
  const deleteVideo = async (videoId) => {
    const updatedVideos = videos.filter((video) => video.videoId !== videoId);
    await AsyncStorage.setItem("videoGallery", JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  // Edit Video (Fix: Show Video Link in Input)
  const editVideo = (videoId, currentTitle) => {
    setEditingVideoId(videoId);
    setTitle(currentTitle);
    setVideoLink(`https://www.youtube.com/watch?v=${videoId}`); // Fix: Restore Video Link
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Video Manager</Text>
      </View>
      <View style={{margin:10}}/>
        <TextInput
          placeholder="Enter YouTube Video Link"
          value={videoLink}
          onChangeText={setVideoLink}
          style={styles.input}
          editable={!editingVideoId} // Disable input while editing
        />

        <TextInput
          placeholder="Enter Video Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addButton} onPress={addOrEditVideo}>
          <Text style={styles.addButtonText}>
            {editingVideoId ? "Update Video" : "Add Video"}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={videos}
          keyExtractor={(item) => item.videoId}
          renderItem={({ item }) => (
            <View style={styles.videoCard}>
              <Image
                source={{
                  uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                }}
                style={styles.thumbnail}
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => editVideo(item.videoId, item.title)}
                  >
                    <MaterialIcons name="edit" size={22} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteVideo(item.videoId)}>
                    <MaterialIcons name="delete" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 , padding:15 }}

        />
      
    </View>
  );
};

// Styles for Professional UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 15,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: "#3D0301",
    height: 110,
    width: "100%",

    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    marginHorizontal:15,
    
  },
  addButton: {
    backgroundColor: "#118B50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal:25
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  videoCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 100,
    height: 58,
    borderRadius: 8,
  },
  videoInfo: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 14,
  },
});

export default VideoManager;
