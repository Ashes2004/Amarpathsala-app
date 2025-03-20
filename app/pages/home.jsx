import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import FeatureList from "../../components/featureList";
import ListComponent from "../../components/listComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import samplePlaylist from "../../assets/Json/samplePlaylist.json";
import { router } from "expo-router";
import NetInfo from "@react-native-community/netinfo";

const Home = () => {
  const [imageheight, setImageHeight] = useState("30%");
  const [playlists, setPlaylists] = useState([]);
  const [coins, setCoins] = useState(0);
  const [SavedVideos, setSavedVideos] = useState([]);
  const [sample, setSample] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);
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

  // useEffect(() => {
  //   const checkPopupStatus = async () => {
  //     const hasSeenPopup = await AsyncStorage.getItem("hasSeenPopup");
  //     console.log("has seen poup: " , hasSeenPopup);
      
  //     if (!hasSeenPopup || hasSeenPopup === "false") {
  //       setShowPopup(true);
  //       await AsyncStorage.setItem("hasSeenPopup", "true");
  //     }
  //   };
  //   checkPopupStatus();
  // }, []);

  useEffect(() => {
    const checkVisitStatus = async () => {
      try {
        const isVisited = await AsyncStorage.getItem("isVisited");

        if (!isVisited) {
          // Show the notification
          await Notifications.presentNotificationAsync({
            title: "📚 Amar Pathsala 🎓",
            body: "🎉 Welcome to the app! 🚀 Let’s start learning and growing together. ✨",
          });

          await AsyncStorage.setItem("isVisited", "true");
          await AsyncStorage.setItem(
            "playlists",
            JSON.stringify(samplePlaylist.Playlist)
          );
          setSample(true);
        }
      } catch (error) {
        console.error("Error checking visit status:", error);
      }
    };

    checkVisitStatus();
  }, []);

  useEffect(() => {
    const checkVisitStatus = async () => {
      try {
        const lastVisitDate = await AsyncStorage.getItem("lastVisitDate");
        const today = new Date().toLocaleDateString();
        const isVisited =
          JSON.parse(await AsyncStorage.getItem("isVisited")) ?? false;
        console.log(
          "Last visited date: ",
          lastVisitDate,
          "Today: ",
          today,
          "isVisited: ",
          isVisited
        );

        if (lastVisitDate !== today && isVisited) {
          let storedCoins = await AsyncStorage.getItem("coins");
          let currentCoins = storedCoins ? parseInt(storedCoins) : 0;

          let updatedCoins = currentCoins + 10;
          await AsyncStorage.setItem("coins", updatedCoins.toString());

          setCoins((prevCoins) => prevCoins + 10);

          const { status } = await Notifications.getPermissionsAsync();
          console.log("Notification Permission Status:", status);

          if (status !== "granted") {
            Alert.alert(
              "🎉 Welcome Back!",
              "You earned 10 🪙 for your daily visit. Keep it up! 🚀"
            );
          } else {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🎉 Welcome Back!",
                body: "You earned 10 🪙 for your daily visit. Keep it up! 🚀",
              },
              trigger: null,
            });
          }

          // Save today's date as last visit
          await AsyncStorage.setItem("lastVisitDate", today);
        }
      } catch (error) {
        console.error("Error checking visit status:", error);
      }
    };

    checkVisitStatus();
  }, []);

  useEffect(() => {
    const removeVideoTitle = async () => {
      const videoTitle = await AsyncStorage.getItem("currentVideoTitle");
      if (videoTitle != undefined) {
        await AsyncStorage.removeItem("currentVideoTitle");
      }
    };
    removeVideoTitle();
  });
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem("coins");
        const today = new Date().toLocaleDateString();
        if (storedCoins == null) {
          setTimeout(() => {
            Alert.alert(
              "🎉 Welcome To  Amar Pathsala 🎓",
              "✨50 coins added to your wallet!\n💰Keep learning and playing! 🚀"
            );
          }, 1000);

          await AsyncStorage.setItem("coins", "50");
          await AsyncStorage.setItem("lastVisitDate", today);
          setCoins(50);
        } else {
          setCoins(parseInt(storedCoins));
          console.log("stored coins: ", storedCoins);
        }
      } catch (error) {
        console.error("Failed to load coins", error);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    const windowWidth = Dimensions.get("window").width;
    console.log(windowWidth);

    if (windowWidth <= 360) {
      setImageHeight("40%");
    } else if (windowWidth > 360 && windowWidth <= 768) {
      setImageHeight("30%");
    } else {
      setImageHeight("60%");
    }
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await AsyncStorage.getItem("playlists");
        if (data) {
          const result = JSON.parse(data);
          const allPlaylists = result.map((playlist) => ({
            type: "playlist",
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
  }, [sample]);

  useEffect(() => {
    const fetchSavedVideos = async () => {
      try {
        const data = await AsyncStorage.getItem("savedVideos");
        if (data) {
          const result = JSON.parse(data);
          const allSavedVideos = result.map((video) => ({
            type: "video",
            id: video.videoId,
            title: video.title,
            thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            description: video.description,
          }));
          setSavedVideos(allSavedVideos);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    fetchSavedVideos();
  }, []);

  return (
    <View style={styles.container}>
      {/* {showPopup && (
        <Modal transparent={true} animationType="fade" visible={showPopup}>
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>
              <Image
                source={{uri : 'https://img.freepik.com/premium-psd/smart-mobile-sale-poster-design-template_987701-1099.jpg'}}
                style={styles.adImage}
              />
            </View>
          </View>
        </Modal>
      )} */}



      <Image
        source={require("../../assets/images/home.jpg")}
        style={[styles.topImage, { height: imageheight }]}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={{ display: "flex", alignItems: "flex-end" }}
          onPress={() => router.push("/pages/coins")}
        >
          <Text
            style={{
              backgroundColor: "#ECEBDE",
              padding: 9,
              margin: 11,
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 400,
              width: "full",
              textAlign: "center",
            }}
          >
            🪙 {coins}
          </Text>
        </TouchableOpacity>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, fontFamily: "Arial", fontWeight: 800 }}>
            <Text>Explore</Text>{" "}
            <Text style={{ color: "#117AAA" }}>All Features</Text>
          </Text>
        </View>
        <View style={{ marginBottom: 20 }}>
          <FeatureList />
        </View>

        <Text style={styles.sectionTitle}>Your playlists</Text>
        <ListComponent content={playlists} />
        <View style={{ height: 40 }}></View>
        <Text style={styles.sectionTitle}>Saved videos</Text>
        <ListComponent content={SavedVideos} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topImage: {
    width: "100%",
    resizeMode: "cover",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FBFBFB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    elevation: 8,
  },
  scrollContent: {
    padding: 3,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginLeft: 10,
  },
  // popupContainer: {
  //   flex: 1,
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // popup: {
  //   width: "80%",
  //   backgroundColor: "#fff",
  //   borderRadius: 10,
  //   padding: 20,
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 4,
  //   elevation: 5,
  // },
  // closeButton: {
  //   position: "absolute",
  //   top: 10,
  //   right: 10,
  //   zIndex: 10,
  // },
  // closeText: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#333",
  // },
  // adImage: {
  //   width: "100%",
  //   height: 200,
  //   resizeMode: "contain",
  //   borderRadius: 8,
  // },
});

export default Home;
