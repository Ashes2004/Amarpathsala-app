import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const CardComponent = ({ title, thumbnail, id , type  , description}) => {
  const setVideoDetails = async(videoTitle , videoDescription)=>{
  
    
    await AsyncStorage.setItem("currentVideoTitle" , videoTitle);
    
    
    await AsyncStorage.setItem("currentVideoDescription" , videoDescription);
  }
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        if(type === "playlist")
        {
          router.push(`/pages/playlist-viewer/${id}`);
        }else{
          await setVideoDetails(title , description);
          router.push(`/pages/saveVideo-player/${id}`);
        }
        
      }}
      key={id}
    >
      {/* Video Thumbnail */}
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />

      {/* Video Title */}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CardComponent;

// Styles
const styles = StyleSheet.create({
  card: {
    width: 240,
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
    height: 120,
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
});
