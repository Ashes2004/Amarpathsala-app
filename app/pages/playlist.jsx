import {
  View,
  Text,
  TextInput,
  Modal,
  Linking,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PlaylistTable from "../../components/playlistTable";
import NetInfo from "@react-native-community/netinfo";

const Playlist = () => {
  const [apiKey, setApiKey] = useState("null");
  const [playlistLink, setPlaylistLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showbtn, setShowbtn] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [internet, setInternet] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setInternet(false);
        Alert.alert("No Internet", "Please check your internet connection");
      } else {
        setInternet(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await AsyncStorage.getItem("playlists");
        const showApiBtn = await AsyncStorage.getItem("showApiBtn");
        if (data) {
          setPlaylists(JSON.parse(data));
        }

        if (showApiBtn) {
          setShowbtn(true);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);
  function getRandomAPIKey() {
    let APIkeys = [
     //youtube api keys
    ];
  
    return APIkeys[Math.floor(Math.random() * APIkeys.length)];
  }
  
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const storedApiKey = await AsyncStorage.getItem("youtubeApiKey");
  
        if (!storedApiKey) {
          console.log("No saved API key, using random key.");
          setApiKey(getRandomAPIKey());
        } else {
          console.log("Using user-saved API key:", storedApiKey);
          setUserApiKey(storedApiKey);
          setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error("Error checking YouTube API key:", error);
      }
    };
  
    checkApiKey();
  }, []);
  
  const handleSaveApiKey = async () => {
    try {
      if (userApiKey) {
        await AsyncStorage.setItem("youtubeApiKey", userApiKey);
        setShowModal(false);
        setApiKey(userApiKey);
      }
    } catch (error) {
      console.error("Error saving YouTube API key:", error);
    }
  };
  
  const fetchPlaylist = async () => {
    try {
      Keyboard.dismiss();
      const playlistId = extractPlaylistId(playlistLink);
      if (!playlistId) {
        Alert.alert("Error", "Invalid playlist link.");
        return;
      }
  
      let fetchedPlaylists = await AsyncStorage.getItem("playlists");
      let playlists = JSON.parse(fetchedPlaylists) || [];
  
      if (playlists.some((playlist) => playlist.playlistId === playlistId)) {
        Alert.alert("Info", "You already have this playlist saved.");
        return;
      }
  
      setLoading(true);
      let storedApiKey = apiKey; // Start with the current API key
      let videos = [];
      let nextPageToken = "";
      let success = false;
      console.log("used api key: " , storedApiKey);
      
  
      do {
        try {
          let response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${storedApiKey}&pageToken=${nextPageToken}`
          );
          let data = await response.json();
  
          if (data.error) {
            let retry = await handleApiError(data.error);
            if (retry) {
              storedApiKey = getRandomAPIKey(); // Only try random if no user-saved key
              setApiKey(storedApiKey);
              continue;
            } else {
              return;
            }
          }
  
          videos.push(
            ...data.items.map((item) => ({
              title: item.snippet.title,
              videoId: item.snippet.resourceId.videoId,
              description: item.snippet.description,
              completed: false,
            }))
          );
  
          nextPageToken = data.nextPageToken || "";
        } catch (error) {
          console.error("Error fetching playlist items:", error);
          break;
        }
      } while (nextPageToken);
  
      const response2 = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${storedApiKey}`
      );
      const data2 = await response2.json();
  
      if (data2.error) {
        handleApiError(data2.error);
        return;
      }
  
      const playlistItems = {
        playlistTitle: data2.items[0]?.snippet?.title || "Unknown Playlist",
        playlistId,
        videos,
      };
  
      await savePlaylistToStorage(playlistItems);
      setLoading(false);
      Alert.alert("Success", "Playlist added successfully!");
      setPlaylistLink("");
      success = true;
    } catch (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };
  
  const handleApiError = async (error) => {
    const reason = error.errors[0]?.reason;
    const message = error.message || "Unknown error";
  
    // console.error("YouTube API Error:", message);
  
    if (reason === "playlistNotFound") {
      Alert.alert("Error", "Invalid Playlist ID. Please check and try again.");
      setLoading(false);
      return false;

    }
  
    if (reason === "quotaExceeded") {
      Alert.alert(
        "⚠️ API Limit Reached ⏳",
        "The API key has reached its quota limit. Please add your own API key or try again later."
      );
  
      setShowbtn(true);
      await AsyncStorage.setItem("showApiBtn", "true");
      setLoading(false);
      // If no user-saved API key, allow retrying with a random one
      return userApiKey ? false : true;
    }
  
    if (reason === "backendError") {
      setLoading(false);
      Alert.alert("Error", "YouTube's server is currently facing an issue, or this playlist cannot be accessed. Please try again later.");

      return false;
    }
  
    Alert.alert("Error", message);
    return false;
  };
  

  // const fetchPlaylist = async () => {
  //   try {
  //     const playlistId = extractPlaylistId(playlistLink);
  //     if (!playlistId) {
  //       Alert.alert("Error", "Invalid playlist link.");
  //       return;
  //     }

  //     // const storedApiKey = await AsyncStorage.getItem("youtubeApiKey");
  //     // if (!storedApiKey) {
  //     //   setShowModal(true);
  //     //   return;
  //     // }

  //     let fetchedPlaylists = await AsyncStorage.getItem("playlists");
  //     let playlists = JSON.parse(fetchedPlaylists);

  //     if (playlists != null) {
  //       const currentPlaylist = playlists.find(
  //         (playlist) => playlist.playlistId === playlistId
  //       );

  //       if (currentPlaylist) {
  //         alert("You already have this playlist saved");
  //         return;
  //       }
  //     }
  //     console.log(apiKey);
  //     setLoading(true);
  //     const storedApiKey = apiKey;

  //     let videos = [];
  //     let nextPageToken = "";

  //     do {
  //       const response = await fetch(
  //         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${storedApiKey}&pageToken=${nextPageToken}`
  //       );

  //       if (!response.ok) {
  //         console.log("Failed to fetch playlist. Please check your API key.");
  //         const storedApiKey = await AsyncStorage.getItem("youtubeApiKey");
  //         if (!storedApiKey) {
  //           Alert.alert(
  //             "⚠️ API Limit Reached ⏳",
  //             "The default API keys have reached their limit. To continue adding playlists, please add your own API key. Thank you!"
  //           );
  //           setShowbtn(true);
  //           await AsyncStorage.setItem("showApiBtn", "true");
  //           setLoading(false);
  //         }
  //         return;
  //       }

  //       const data = await response.json();
  //       videos = [
  //         ...videos,
  //         ...data.items.map((item) => ({
  //           title: item.snippet.title,
  //           videoId: item.snippet.resourceId.videoId,
  //           description:item.snippet.description,
  //           completed: false,
  //         })),
  //       ];

  //       nextPageToken = data.nextPageToken || "";
  //     } while (nextPageToken);

  //     // Fetch playlist details (Title, etc.)
  //     const response2 = await fetch(
  //       `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${storedApiKey}`
  //     );

  //     if (!response2.ok) {
  //       console.log("Failed to fetch playlist details.");
  //       const storedApiKey = await AsyncStorage.getItem("youtubeApiKey");
  //       if (!storedApiKey) {
  //         Alert.alert(
  //           "⚠️ API Limit Reached ⏳",
  //           "The default API keys have reached their limit. 🔑 To continue adding playlists, please add your own API key. Thank you! 😊"
  //         );

  //         setShowbtn(true);
  //         await AsyncStorage.setItem("showApiBtn", "true");
  //         setLoading(false);
  //       }
  //       return;
  //     }

  //     const data2 = await response2.json();

  //     const playlistItems = {
  //       playlistTitle: data2.items[0]?.snippet?.title || "Unknown Playlist",
  //       playlistId: playlistId,
  //       videos: videos,
  //     };

  //     await savePlaylistToStorage(playlistItems);
  //     setLoading(false);
  //     Alert.alert("Success", "Playlist added successfully!");
  //     setPlaylistLink("");
  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   }
  // };

  const savePlaylistToStorage = async (playlistItems) => {
    try {
      const storedPlaylists = JSON.parse(
        (await AsyncStorage.getItem("playlists")) || "[]"
      );

      // Append the new playlist object to the stored playlists array
      const updatedPlaylists = [...storedPlaylists, playlistItems];

      await AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error("Error saving playlist to storage:", error);
    }
  };

  const extractPlaylistId = (url) => {
    const match = url.match(/(?:list=)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleLinkPress = () => {
    Linking.openURL("https://youtu.be/EPeDTRNKAVo?si=mmxkycF7QF51N4ps");
  };

  if (!internet) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 22 }}>No Internet Connection</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View
        style={{
          height: 320,
          backgroundColor: "#1B4D70",
          borderBottomRightRadius: 25,
          borderBottomLeftRadius: 25,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        <Image
          source={require("../../assets/images/playlistHome.png")}
          style={{
            width: 270,
            height: 270,
            resizeMode: "contain",
          }}
        />
        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: "white",
            paddingBottom: 10,
            letterSpacing: 1.2,
          }}
        >
          Playlist Manager
        </Text>
      </View>
      {showbtn && (
        <View style={{ alignItems: "flex-end", margin: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#640D5F",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 20,
            }}
            onPress={() => {
              setShowModal(true);
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Add API Key
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Main Section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
          marginTop: 5,
          elevation: 3,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 1,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            paddingHorizontal: 15,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: "#fff",
            marginRight: 10,
            height: 50,
          }}
          placeholder="Enter Youtube playlist Link"
          placeholderTextColor="#aaa"
          value={playlistLink}
          onChangeText={setPlaylistLink}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#4CAF50",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
          onPress={fetchPlaylist}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <ActivityIndicator size="large" color="#0997C5" />
          <Text style={{ marginLeft: 10 }}>Please Wait.....</Text>
        </View>
      ) : (
        <PlaylistTable playlists={playlists} setPlaylists={setPlaylists} />
      )}

      {/* Modal for YouTube API Key */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "85%",
                backgroundColor: "white",
                borderRadius: 15,
                padding: 25,
                elevation: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Add Your YouTube API Key:
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "400",
                  fontStyle: "italic",
                  marginBottom: 10,
                  padding: 10,
                  color: "green",
                }}
              >
                " Your data is completely safe. This is only used to fetch your
                playlist securely. It is only stored in your local storage and
                never shared with us ".
              </Text>

              <TextInput
                value={userApiKey}
                onChangeText={setUserApiKey}
                placeholder="Enter API Key"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  marginBottom: 15,
                  padding: 10,
                  width: "100%",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: "#007bff",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
                onPress={handleSaveApiKey}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Save API Key
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLinkPress}>
                <Text
                  style={{
                    color: "#007bff",
                    marginTop: 15,
                    fontSize: 16,
                  }}
                >
                  How to get API Key
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Playlist;
