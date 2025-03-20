import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";


const MeditationSetup = () => {
  const [duration, setDuration] = useState(1);

  const handleStart = () => {
    router.push(`/pages/meditationTimer/${duration}`);
  };

  return (
   <ImageBackground
       source={require("../../assets/images/meditation.jpg")}
       style={styles.backgroundImage}
     >
      <Text style={styles.label}>Select Meditation Duration</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={duration}
          onValueChange={(itemValue) => setDuration(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="1 minute" value={1} />
          <Picker.Item label="5 minutes" value={5} />
          <Picker.Item label="10 minutes" value={10} />
          <Picker.Item label="15 minutes" value={15} />
          <Picker.Item label="20 minutes" value={20} />
          <Picker.Item label="30 minutes" value={30} />
          <Picker.Item label="45 minutes" value={45} />
        </Picker>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  } ,
 
  label: {
    fontSize: 18,
    color: "#6C757D",
    marginBottom: 10,
    fontWeight: "bold",
  },
  pickerContainer: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#B0C4B1",
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    overflow: "hidden",
    marginBottom: 20,
  },
  picker: {
    color: "#2F4F4F",
    height: 50,
    fontSize: 16,
  },
  startButton: {
    backgroundColor: "#76B5C5",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MeditationSetup;
