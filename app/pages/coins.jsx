import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons"; 

const CoinsPage = () => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // Fetch coins from AsyncStorage
    const fetchCoins = async () => {
      try {
        const savedCoins = await AsyncStorage.getItem("coins");
        if (savedCoins !== null) {
          setCoins(Number(savedCoins));
        }
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      }
    };

    fetchCoins();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Top Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Coins</Text>
        <Text style={styles.coinAmount}>{coins} 🪙 </Text>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorks}>
        <Text style={styles.howItWorksTitle}>💡 How It Works</Text>
        <Text style={styles.howItWorksText}>
          🎮 1 Game requires 1 🪙 to play.
        </Text>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.howItWorksTitle}>💰 How to Earn More Coins</Text>
        <Text style={styles.howItWorksText}>📱 Daily App Check-In = 10 🪙</Text>
        <Text style={styles.howItWorksText}>✅ Complete 1 Todo = 2 🪙</Text>
        <Text style={styles.howItWorksText}>
          🧘‍♀️ 1 Minute of Meditation = 5 🪙
        </Text>
        
        <Text style={styles.howItWorksText}>🎥 Complete 1 Video = 5 🪙</Text>
      </View>

      {/* Developer Details Card */}
      <View style={styles.developerCard}>
        <Text style={styles.developerText}>
          Developed by <Text style={{ color: "#2973B2" }}>Ashes Das</Text>{" "}
        </Text>
        <View style={styles.socialLinks}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              Linking.openURL("https://www.linkedin.com/in/ashes-das-428377245")
            }
          >
            <FontAwesome name="linkedin" size={24} color="#0e76a8" />
            <Text style={styles.linkText}>LinkedIn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#eef2f3",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    marginTop: 45,
  },
  cardTitle: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  coinAmount: {
    fontSize: 40,
    fontWeight: "700",
    color: "#8e44ad",
  },
  howItWorks: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  howItWorksTitle: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  howItWorksText: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 16,
    color: "#555",
    fontWeight: "500",
  },
  developerCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    paddingVertical: 30,
    borderRadius: 15,
    marginTop: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  developerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  linkText: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "bold",
    color: "#2973B2",
  },
});

export default CoinsPage;
