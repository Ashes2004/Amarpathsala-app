import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const SavedVideos = () => {
  const [savedVideos, setSavedVideos] = useState([]);

  useEffect(() => {
    const fetchSavedVideos = async () => {
      try {
        const data = await AsyncStorage.getItem("savedVideos");
        if (data) {
          setSavedVideos(JSON.parse(data));
        }
        console.log(savedVideos.length);
      } catch (error) {
        console.error("Error fetching saved videos:", error);
      }
    };

    fetchSavedVideos();
  }, []);
  const setVideoData = async (videoTitle , videoDescription) => {
    console.log(videoTitle);

    await AsyncStorage.setItem("currentVideoTitle", videoTitle);
    await AsyncStorage.setItem("currentVideoDescription" , videoDescription);
  };
  const renderItem = ({ item }) => {
  
    const thumbnailUrl = `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={async () => {
         await setVideoData(item.title , item.description);
           
          router.push(`/pages/saveVideo-player/${item.videoId}`);
        }}
      >
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View
        style={{
          backgroundColor: "#213555",
          height: 130,
          width: "100%",

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.headerText}>Saved Videos</Text>
      </View>

      {savedVideos.length == 0 && (
        <Text style={styles.noVideosText}>No Saved Videos </Text>
      )}
      <FlatList
        data={savedVideos}
        numColumns={2} // Display 2 cards per row
        keyExtractor={(item) => item.videoId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  listContainer: {
    marginTop: 20,
    marginBottom: 20,
    justifyContent: "space-between",
    padding: 10,
  },
  card: {
    width: "48%", // Set card width to 48% to fit two in a row
    padding: 8,
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  thumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  noVideosText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555", // Dark gray color
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
};

export default SavedVideos;
