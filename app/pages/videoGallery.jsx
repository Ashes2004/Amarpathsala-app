import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";

const VideoGallery = () => {
  const [Videos, setVideos] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await AsyncStorage.getItem("videoGallery");
        if (data) {
          const result = JSON.parse(data);

          const allVideos = result.map((video) => ({
            id: video.videoId,
            title: video.title,
            thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
          }));
          setVideos(allVideos);
        }
      } catch (error) {
        console.error("Error fetching Videos:", error);
      }
    };
    fetchVideos();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          router.push(`/pages/gallery-video-player/${item.id}/${item.title}`);
        }}
      >
        {/* Video Thumbnail */}
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        {/* Video Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Video Gallery</Text>
      </View>
      <View style={{ alignItems: "center", margin: 10 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#00879E",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 20,
            elevation: 5,
          }}
          onPress={() => {
            router.push("/pages/videoManager");
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {Videos.length == 0 ? "Add Video" : "Manage Videos"}
          </Text>
        </TouchableOpacity>
      </View>

      {Videos.length == 0 && (
        <Text style={styles.noVideosText}>{"No Videos Available"} </Text>
      )}
      <View
        style={{
          width: "100%",
          height: 0,
          backgroundColor: "black",
          marginTop: 6,
          marginBottom: 10,
        }}
      />

      <FlatList
        data={Videos}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
  headerContainer: {
    backgroundColor: "#3A3960",
    height: 130,
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
  listContainer: {
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    width: "48%",
    padding: 10,
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
  thumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  noVideosText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
};

export default VideoGallery;
