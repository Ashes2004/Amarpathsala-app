import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import CardComponent from "./cardComponent";
import { router } from "expo-router";

const ListComponent = ({ content }) => {
 
  
  const modifiedContent =
    content.slice(0, 3).length > 0
      ? [
          ...content.slice(0, 3),
          {
            id: "view-all",
            title: "View All",
            thumbnail: null,
            type: content[0].type,
          },
        ]
      : [];

  // Render Item for FlatList
  const renderItem = ({ item }) => {
    if (item.id === "view-all") {
     

      return (
        <TouchableOpacity
          style={styles.viewAllCard}
          onPress={() => {
            if(item.type == "playlist")
            {
              router.push('/pages/PlaylistDetails')
            }else{
              router.push('/pages/savedVideos')
            }
          }}
        >
          <Image
            source={require("../assets/images/viewall.jpg")}
            style={styles.viewAllImage}
          />
        </TouchableOpacity>
      );
    }
    // Render regular video cards
    return (
      <CardComponent
        title={item.title}
        thumbnail={item.thumbnail}
        id={item.id}
        type={item.type}
        description={item.description ? item.description : null}
      />
    );
  };

  return (
    <View style={styles.container}>
      {content.length === 0 ? (
        // Display "No Data" card when the content is empty
        <TouchableOpacity style={styles.noDataCard}>
          {/* Video Thumbnail */}
          <Image
            source={{
              uri: "https://img.freepik.com/free-vector/file-searching-illustrated-concept-landing-page_52683-24619.jpg",
            }}
            style={styles.thumbnail}
          />

          {/* Video Title */}
          <Text style={styles.title} numberOfLines={2}>
            No Saved Content
          </Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={modifiedContent}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default ListComponent;

// Styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    backgroundColor: "#f9f9f9",
  },
  listContainer: {
    paddingHorizontal: 1,
  },
  viewAllCard: {
    width: 140,
    padding: 4,
    marginBottom: 10,
    marginHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  viewAllImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
  },
  noDataCard: {
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
