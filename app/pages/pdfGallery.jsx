import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const PdfGallery = () => {
  const [pdfs, setPdfs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const data = await AsyncStorage.getItem("pdfGallery");
        if (data) {
          const result = JSON.parse(data);
          
          const allPdfs = result.map((pdf, index) => ({
            id: index.toString(),
            title: pdf.title,
            uri: pdf.pdfId,
          }));
          setPdfs(allPdfs);
        }
      } catch (error) {
        console.error("Error fetching PDFs:", error);
      }
    };
    fetchPdfs();
  }, []);

  function extractDriveFileId(url) {
    const match = url.match(/(?:drive\.google\.com\/.*\/d\/|id=)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        const id = extractDriveFileId(item.uri);
        router.push(`/pages/pdfViewer/${id}`);
      }}
    >
      <MaterialIcons name="picture-as-pdf" size={50} color="#D32F2F" style={styles.icon} />
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>PDF Gallery</Text>
      </View>
      <View style={{ alignItems: "center", margin: 10 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/pages/pdfManager");
          }}
        >
          <Text style={styles.buttonText}>{pdfs.length === 0 ? "Add PDF" : "Manage PDFs"}</Text>
        </TouchableOpacity>
      </View>
      {pdfs.length === 0 && (
        <Text style={styles.noPdfsText}>{"No PDFs Available"}</Text>
      )}
      <View style={styles.separator} />
      <FlatList
        data={pdfs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    backgroundColor: "#3A3960",
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  noPdfsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#00879E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  separator: {
    width: "100%",
    height: 0,
    backgroundColor: "black",
    marginTop: 6,
    marginBottom: 10,
  },
};

export default PdfGallery;
