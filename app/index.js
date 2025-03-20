import { View, Animated, StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";


const Index = () => {
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
   
  // useEffect(() => {
  //   const checkPopupStatus = async () => {
  //     try {
  //       const hasSeenPopup = await AsyncStorage.getItem("hasSeenPopup");
  //       console.log("index has seen popup: ", hasSeenPopup);
  
  //       await AsyncStorage.setItem("hasSeenPopup", "false");
  //     } catch (error) {
  //       console.error("Error accessing AsyncStorage:", error);
  //     }
  //   };
  //   checkPopupStatus();
  // }, []);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoTranslateY, {
        toValue: -50, // Shift further up when scaling down
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    });

    const timer = setTimeout(() => router.replace('/pages/home'), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/splash-first.png')}
        style={[
          styles.icon,
          { transform: [{ scale: logoScale }, { translateY: logoTranslateY }] }
        ]}
      />
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>Amar <Text style={{ color: "#0991C1" }}>Pathsala</Text></Animated.Text>
      <Animated.Text style={[styles.slogan, { opacity: sloganOpacity }]}> <Text style={{ color: "#E88541" }}>Empowering</Text> Self-Learning </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -90,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
});

export default Index;