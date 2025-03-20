import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Keyboard,
  BackHandler,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";

const Browser = () => {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sloganAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);
  const inputRef = useRef(null);

  // Mock suggestions list
  const allSuggestions = [
    "https://www.google.com",
    "https://www.wikipedia.org",
    "https://www.quora.com",
    "https://www.reddit.com/r/education",
    "https://www.bbc.com",
    "https://www.indiatoday.in",
    "https://www.ndtv.com",
    "https://www.thehindu.com",
    "https://www.timesofindia.indiatimes.com",
    "https://www.cnbc.com",
    "https://www.moneycontrol.com",
    "https://www.linkedin.com",
    "https://www.naukri.com",
    "https://www.indeed.com",
    "https://www.khanacademy.org",
    "https://www.edx.org",
    "https://www.coursera.org",
    "https://www.udemy.com",
    "https://www.futurelearn.com",
    "https://www.open.edu",
    "https://www.sciencedaily.com",
    "https://www.nationalgeographic.com",
    "https://www.britannica.com",
    "https://www.ted.com",
    "https://www.stackoverflow.com",
    "https://www.geeksforgeeks.org",
    "https://www.w3schools.com",
    "https://www.medium.com",
    "https://www.academia.edu",
    "https://www.researchgate.net",
    "https://www.springer.com",
    "https://www.jstor.org",
    "https://www.arxiv.org",
    "https://www.nature.com",
    "https://www.sciencemag.org",
    "https://www.grammarly.com/blog",
    "https://www.duolingo.com",
    "https://www.codeacademy.com",
    "https://www.hackerrank.com",
    "https://www.leetcode.com",
    "https://www.mit.edu",
    "https://www.stanford.edu",
    "https://www.harvard.edu",
    "https://www.ox.ac.uk",
    "https://www.cam.ac.uk",
    "https://www.nasa.gov",
    "https://www.noaa.gov",
    "https://www.who.int",
    "https://www.un.org",
    "https://www.imf.org",
    "https://mrchatur.com",
    "Top news in India today",
    "Most searched topics in India",
    "Best online shopping deals",
    "IPL live score",
    "Weather forecast in India",
    "Latest movie reviews",
    "Best tech gadgets 2025",
    "Top tourist destinations in India",
    "How to cook biryani",
    "How to file taxes in India",
    "Top mobile phones in India",
    "Best restaurants near me",
    "Upcoming festivals in India",
    "Tips for UPSC exam preparation",
    "Latest cricket news",
    "How to learn coding for free",
    "How to start an online business",
    "Best Bollywood movies of 2025",
    "Best free online courses",
    "How to make money online in India",
    "Best fitness tips for Indians",
    "How to meditate",
    "Most popular web series in India",
    "Top Indian e-commerce websites",
    "How to save money in India",
    "Latest job openings in India",
    "How to prepare for NEET",
    "Best schools in India",
    "How to get a driving license in India",
    "How to get a PAN card",
    "Top free YouTube channels for learning",
    "How to start a blog in India",
    "Best home workout routines",
    "Best online education platforms in India",
    "How to grow Instagram followers",
    "Best career advice",
    "Top places to visit in India",
    "How to make tea in Indian style",
    "How to plan a budget trip to India",
    "Best career options after 12th",
    "How to improve English speaking skills",
    "How to prepare for IIT JEE",
    "Best fitness apps in India",
    "How to make money from home",
    "Latest technology trends in India",
    "Ashes Das",
    "Who is Mr Ashes Das",
  ];

  // Check Internet Connection
  useEffect(() => {
    const checkConnection = async () => {
      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected);
    };
    checkConnection();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Splash Screen Animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(sloganAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 800);

    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
  }, []);

  // Handle Back Button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // Function to Handle URL Input
  const handleGo = () => {
    let formattedUrl = url.trim();
    setSuggestions([]);

    if (formattedUrl.includes(" ")) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(
        formattedUrl
      )}`;
    } else if (!formattedUrl.startsWith("http") && !formattedUrl.includes(".")) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(
        formattedUrl
      )}`;
    }else if(!formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setCurrentUrl(formattedUrl);
    Keyboard.dismiss();
  };
  const handleSugessionGo = (URL) => {
    let formattedUrl = URL.trim();

    if (!formattedUrl.startsWith("http") && !formattedUrl.includes(".")) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(
        formattedUrl
      )}`;
    } else if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
      console.log(formattedUrl);
      
    }

    setCurrentUrl(formattedUrl);
    Keyboard.dismiss();
  };

  // Function to filter suggestions based on user input
  const handleInputChange = (input) => {
    setUrl(input);

    if (input) {
      const filteredSuggestions = allSuggestions.filter((item) =>
        item.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Splash Screen
  if (showSplash) {
    return (
      <View style={styles.splashScreen}>
        <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>
          Amar Browser
        </Animated.Text>
        <Animated.Text style={[styles.slogan, { opacity: sloganAnim }]}>
          Fast. Secure. Smart.
        </Animated.Text>
      </View>
    );
  }

  // No Internet Screen
  if (!isConnected) {
    return (
      <View style={styles.noInternetContainer}>
        <Ionicons name="wifi-off" size={50} color="#ff3b30" />
        <Text style={styles.noInternetText}>No Internet Connection</Text>
      </View>
    );
  }

  const renderDefaultScreen = () => (
    <View style={styles.defaultScreen}>
      <Ionicons name="globe-outline" size={60} color="#007AFF" />
      <Text style={styles.defaultText}>Welcome to Amar Browser</Text>
      <Text style={styles.defaultSubText}>
        Search or enter a URL to start browsing
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={styles.urlBar}>
        <Ionicons
          onPress={() => {
            setUrl("https://www.google.com/");
            setCurrentUrl("https://www.google.com/");
          }}
          name="globe-outline"
          size={24}
          color="#007AFF"
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={url}
          onChangeText={handleInputChange} // Use handleInputChange for input change
          placeholder="Search or enter URL"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleGo}
          onFocus={() => {
            inputRef.current.setSelection(0, url.length);
          }}
        />
        <Pressable onPress={handleGo} style={styles.button}>
          <Ionicons name="search" size={20} color="white" />
        </Pressable>
      </View>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setUrl(item);
                setSuggestions([]);
                handleSugessionGo(item);
              }}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}
          style={styles.suggestionList}
        />
      )}

      {/* WebView */}
      {!currentUrl ? (
        renderDefaultScreen()
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
              setUrl(navState.url);
              setCanGoBack(navState.canGoBack);
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        </>
      )}

      {/* {!currentUrl ? (
        renderDefaultScreen()
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
          {isConnected && !isLoading ? (
            <WebView
              ref={webViewRef}
              source={{ uri: currentUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={(navState) => {
                setUrl(navState.url);
                setCanGoBack(navState.canGoBack);
              }}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => setCurrentUrl("404")}
              onHttpError={() => setCurrentUrl("404")}
            />
          ) : (
            <View style={styles.notFoundContainer}>
              <Ionicons name="alert-circle" size={50} color="#ff3b30" />
             
              <Text style={styles.notFoundText}>⚠️ Page Not Found! 🔍</Text>
            </View>
          )}
        </>
      )} */}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3674B5",
  },
  splashText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 18,
    color: "white",
    marginTop: 8,
    fontStyle: "italic",
  },
  urlBar: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
    borderRadius: 25,
    margin: 8,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: "#F5F8FA",
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    marginHorizontal: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8FA",
  },
  noInternetText: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  suggestionList: {
    position: "absolute",
    top: 80,
    left: 12,
    right: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    maxHeight: 200,
    zIndex: 1,
    borderRadius: 10,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
    backgroundColor: "#F8FAFC",
  },
  suggestionText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  defaultScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8FA",
  },
  defaultText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "#007AFF",
  },
  defaultSubText: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8FA",
  },
  notFoundText: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
  },
});

export default Browser;
