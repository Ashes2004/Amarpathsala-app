import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons'; // You can use any icon library
import { router } from 'expo-router';

const PlaylistTable = ({ playlists, setPlaylists }) => {

  const deletePlaylist = async (playlistId) => {
    try {
      const updatedPlaylists = playlists.filter(item => item.playlistId !== playlistId);
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists); // Update state
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const renderPlaylistItem = ({ item }) => {
    const thumbnail = item?.videos[0]?.videoId
      ? `https://i.ytimg.com/vi/${item?.videos[0]?.videoId}/hqdefault.jpg`
      : 'https://via.placeholder.com/150'; // Fallback if no thumbnail

    return (
      <TouchableOpacity style={styles.playlistItem} onPress={()=> router.push(`/pages/playlist-viewer/${item.playlistId}`)}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        <Text style={styles.playlistTitle}>
          {item.playlistTitle.length > 20
            ? `${item.playlistTitle.substring(0, 30)}...`
            : item.playlistTitle}
        </Text>
        <TouchableOpacity onPress={() => deletePlaylist(item.playlistId)}>
          <AntDesign name="delete" size={26} color="red" style={styles.deleteIcon} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={playlists}
      keyExtractor={(item) => item.playlistId}
      renderItem={renderPlaylistItem}
      contentContainerStyle={{ paddingHorizontal:15 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteIcon: {
    marginLeft: 10,
  },
});

export default PlaylistTable;
