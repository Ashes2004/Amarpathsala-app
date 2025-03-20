import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import NetInfo from "@react-native-community/netinfo";

const PlaylistViewer = () => {
  const { playlistViewer } = useLocalSearchParams();
  const [playlist, setPlaylist] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        Alert.alert(
          "🚫 No Internet Connection 🌐",
          "It seems like you're offline. Please check your internet connection 🔧."
        );
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await AsyncStorage.getItem("playlists");
        if (data) {
          const playlists = JSON.parse(data);
          const foundPlaylist = playlists.find(
            (p) => p?.playlistId == playlistViewer
          );
          if (foundPlaylist) {
            setPlaylist(foundPlaylist);
            await AsyncStorage.setItem("OneplaylistId", playlistViewer);

            // Count completed videos
            const completedVideos = foundPlaylist.videos.filter(
              (vid) => vid.completed
            ).length;
            setCompletedCount(completedVideos);
          } else {
            console.log("Playlist not found");
          }
        } else {
          console.log("No playlists found in storage");
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylist();
  }, [playlistViewer]);

  useEffect(() => {
    const removeVideoTitle = async () => {
      const videoTitle = await AsyncStorage.getItem("currentVideoTitle");
      if (videoTitle !== null) {
        await AsyncStorage.removeItem("currentVideoTitle");
      }
    };
    removeVideoTitle();
  }, []);

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const totalVideos = playlist.videos.length;
  const progress = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{playlist.playlistTitle}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Completed: {completedCount}/{totalVideos}
        </Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Video List */}
      <View style={styles.content}>
        <FlatList
          data={playlist.videos}
          keyExtractor={(item, index) => `${item.videoId}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.videoItem,
                item.completed ? styles.completed : null,
              ]}
              onPress={async () => {
                await AsyncStorage.setItem("currentVideoTitle", item.title);

                await AsyncStorage.setItem(
                  "currentVideoDescription",
                  item.description
                );

                console.log("title :" , item.title , "desc: " , item.description );
                
                router.push(`/pages/video-player/${item.videoId}`);
              }}
            >
              <Image
                source={{
                  uri: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
                }}
                style={styles.thumbnail}
              />
              <Text style={styles.videoTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 160,
    width: "100%",
    backgroundColor: "#23486A",
    justifyContent: "center",
    alignItems: "center",
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F2EFE7",
    padding: 10,
  },
  progressContainer: {
    padding: 15,
    alignItems: "center",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  progressBarBackground: {
    width: "90%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "green",
    borderRadius: 5,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  completed: {
    backgroundColor: "#c8e6c9",
  },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  thumbnail: {
    width: 90,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default PlaylistViewer;
