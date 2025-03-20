import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const PlaylistDetails = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await AsyncStorage.getItem("playlists");
        if (data) {
          const result = JSON.parse(data);
          

          const allPlaylists = result.map((playlist) => ({
            id: playlist.playlistId,
            title: playlist.playlistTitle,
            thumbnail: `https://i.ytimg.com/vi/${playlist?.videos[0]?.videoId}/hqdefault.jpg`,
          }));
          setPlaylists(allPlaylists);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          router.push(`/pages/playlist-viewer/${item.id}`);
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
        <Text style={styles.headerText}>Playlists</Text>
      </View>
      <FlatList
        data={playlists}
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

    marginBottom: 20,
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
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
};

export default PlaylistDetails;
