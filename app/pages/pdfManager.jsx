import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const PDFManager = () => {
  const [pdfId, setPdfId] = useState("");
  const [title, setTitle] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [editingPdfId, setEditingPdfId] = useState(null);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    const savedPdfs = await AsyncStorage.getItem("pdfGallery");
    if (savedPdfs) {
      setPdfs(JSON.parse(savedPdfs));
    }
  };

  const addOrEditPdf = async () => {
    Keyboard.dismiss();
    
    if (!pdfId.trim() || !title.trim()) {
      Alert.alert("Error", "Both fields are required!");
      return;
    }
  
    // Check if the link is from Google Drive
    const googleDriveRegex = /drive\.google\.com/;
    if (!googleDriveRegex.test(pdfId)) {
      Alert.alert("Invalid Link", "Please enter a valid Google Drive PDF link!");
      return;
    }
  
    if (editingPdfId) {
      const updatedPdfs = pdfs.map((pdf) =>
        pdf.pdfId === editingPdfId ? { ...pdf, title } : pdf
      );
      await AsyncStorage.setItem("pdfGallery", JSON.stringify(updatedPdfs));
      setPdfs(updatedPdfs);
      setEditingPdfId(null);
    } else {
      const isDuplicate = pdfs.some((pdf) => pdf.pdfId === pdfId);
      if (isDuplicate) {
        Alert.alert("Duplicate PDF", "This PDF has already been added!");
        return;
      }
      const newPdf = { pdfId, title };
      const updatedPdfs = [...pdfs, newPdf];
      await AsyncStorage.setItem("pdfGallery", JSON.stringify(updatedPdfs));
      setPdfs(updatedPdfs);
    }
  
    setPdfId("");
    setTitle("");
  };
  

  const deletePdf = async (pdfId) => {
    const updatedPdfs = pdfs.filter((pdf) => pdf.pdfId !== pdfId);
    await AsyncStorage.setItem("pdfGallery", JSON.stringify(updatedPdfs));
    setPdfs(updatedPdfs);
  };

  const editPdf = (pdfId, currentTitle) => {
    setEditingPdfId(pdfId);
    setTitle(currentTitle);
    setPdfId(pdfId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Google Drive PDF Manager</Text>
        <Text style={styles.subHeaderText}>The PDF must be accessible to everyone on Drive.</Text>

      </View>

      <TextInput
        placeholder="Enter Google Drive PDF Link"
        value={pdfId}
        onChangeText={setPdfId}
        style={styles.input}
        editable={!editingPdfId}
      />

      <TextInput
        placeholder="Enter PDF Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TouchableOpacity style={styles.addButton} onPress={addOrEditPdf}>
        <Text style={styles.addButtonText}>
          {editingPdfId ? "Update PDF" : "Add PDF"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={pdfs}
        keyExtractor={(item) => item.pdfId}
        renderItem={({ item }) => (
          <View style={styles.pdfCard}>
            <MaterialIcons name="picture-as-pdf" size={40} color="red" />
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => editPdf(item.pdfId, item.title)}
                >
                  <MaterialIcons name="edit" size={22} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePdf(item.pdfId)}>
                  <MaterialIcons name="delete" size={22} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, padding: 15 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerContainer: {
    backgroundColor: "#3D0301",
    height: 110,
    width: "100%",

    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subHeaderText: {
    marginTop:5,
    fontSize: 12,
    fontWeight: "semibold",
    color: "#fff",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#118B50",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 23,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  pdfCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pdfInfo: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pdfTitle: { fontSize: 14, fontWeight: "bold", color: "#333", flex: 1 },
  actionButtons: { flexDirection: "row", gap: 14 },
});

export default PDFManager;
