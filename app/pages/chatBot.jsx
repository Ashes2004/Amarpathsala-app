import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Alert,
} from "react-native";
import Markdown from "react-native-markdown-display";
import NetInfo from "@react-native-community/netinfo";

const TypingIndicator = () => {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.typingIndicator}>
      {[0, 1, 2].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              opacity: dotAnim.interpolate({
                inputRange: [0, 1],
                outputRange: index === 0 ? [1, 0.3] : [0.3, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hi there! Welcome to Amar Pathsala! How can I help you get started with your studies today? Let me know what's on your mind – whether it's a question about a specific topic, a study technique you'd like to explore, or simply needing some motivation. I'm here to support you every step of the way!",
      type: "bot",
      fadeAnim: new Animated.Value(1),
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const [internet, setInternet] = useState(true);
 

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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newUserMessage = {
      text: input,
      type: "user",
      fadeAnim: new Animated.Value(0),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setTyping(true);

    Animated.timing(newUserMessage.fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(async () => {
      const response = await fetch(
        "https://amarpathsala-backend.vercel.app/api/ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newUserMessage.text }),
        }
      );
      if(!response.ok)
      { 
        setMessages([
          {
            text: "Hi there! Something Went Wrong Please try again later",
            type: "bot",
            fadeAnim: new Animated.Value(1),
          },
        ])
        setTyping(false);
        return;
      }
      const data = await response.json();
      const newBotMessage = {
        text: data.response,
        type: "bot",
        fadeAnim: new Animated.Value(0),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setTyping(false);

      Animated.timing(newBotMessage.fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.botMessage,
        { opacity: item.fadeAnim || 1 },
      ]}
    >
      <Markdown style={styles.messageText} >{item.text}</Markdown>
    </Animated.View>
  );
    if (!internet) {
         return (
           <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
             <Text style={{ fontSize: 22 , color:'red' }}>No Internet Connection</Text>
           </View>
         );
       }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: "https://img.icons8.com/fluency/2x/chatbot.png" }}
          style={styles.avatar}
        />
        <Text style={styles.headerText}>Amar Bot</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatContainer}
        ref={chatContainerRef}
        onContentSizeChange={() =>
          chatContainerRef.current?.scrollToEnd({ animated: true })
        }
      />

      {typing && (
        <View style={styles.typingContainer}>
          <TypingIndicator />
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    padding: 12,
    marginBottom:6
  },
  headerText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECE5DD",
    padding: 6,
  },
  chatContainer: { flexGrow: 1, paddingHorizontal: 10 },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    paddingHorizontal: 14,
  },
  botMessage: { alignSelf: "flex-start", backgroundColor: "#FFF" },
  messageText: { fontSize: 16, lineHeight: 22 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: "#ECE5DD",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#25D366",
    borderRadius: 20,
    padding: 10,
  },
  sendButtonText: { color: "white", fontSize: 18 },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingBottom: 10,
  },
  typingText: { color: "#999", marginLeft: 6 },
  typingIndicator: {
    flexDirection: "row",
    width: 40,
    justifyContent: "space-between",
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: "#075E54",
    borderRadius: 3,
  },
});

export default ChatBot;
