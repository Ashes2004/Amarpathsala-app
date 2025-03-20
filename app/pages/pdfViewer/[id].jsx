import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

const GoogleDrivePDFViewer = () => {
  const { id } = useLocalSearchParams();
  const pdfUrl = `https://drive.google.com/file/d/${id}/view`;

  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <WebView
        source={{ uri: pdfUrl }}
        style={styles.webview}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
  },
});

export default GoogleDrivePDFViewer;
