import { View, FlatList, StyleSheet, Text, Image, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const FeatureCard = ({ featureName, logo, link }) => {
  return (
    <TouchableOpacity onPress={() => router.push(link)} style={styles.card}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.featureName}>{featureName}</Text>

    </TouchableOpacity>
  );
};



//https://img.icons8.com/color/2x/book.png

const FeatureList = () => {
  const features = [
    {
        id: '1',
        name: 'Manage Playlists',
        logo: require('../assets/featureImage/video.png'),
        link: '/pages/playlist', 
      },
      {
        id: '2',
        name: 'Video Gallery',
        logo: require('../assets/featureImage/gallery.png'),
        link: '/pages/videoGallery', 
      },
      
      {
        id: '3',
        name: 'My To-Dos',
        logo: require('../assets/featureImage/todo-list.png'),
        link: '/pages/Todo', 
      },
     
     
      {
        id: '4',
        name: 'Meditate',
        logo: require('../assets/featureImage/lotus.png'),
        link: '/pages/meditationSetup',  
      },
      {
        id: '5',
         name: 'Browser',
        logo: require('../assets/featureImage/internet.png'),
        link: '/pages/browser',
       
      },
      {
        id: '6',
        name: 'Games',
        logo: require('../assets/featureImage/controller.png'),
        link: '/pages/games',
      },
     
      {
        id: '7', 
        name: 'Amar Bot',
        logo: require('../assets/featureImage/bot.png'),
        link: '/pages/chatBot',  
      },
      {
        id: '8',
        name: 'PDF Reader',
        logo: require('../assets/featureImage/book.png'),
        link: '/pages/pdfGallery', 
      },
      {
        id: '9',
        name: 'Saved Videos',
        logo: require('../assets/featureImage/bookmark.png'),
        link: '/pages/savedVideos', 
      },
      
      
     
      
  ];

  return (
    <FlatList
      data={features}
      horizontal
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <FeatureCard
          featureName={item.name}
          logo={item.logo}
          link={item.link}
        />
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 20,
    paddingLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 110,
    height: 120,
    borderColor: '#E88541',
    borderWidth: 1,
    overflow: 'hidden',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginBottom: 2,
  },
  featureName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 18,
    paddingTop:10,
    backgroundColor: '#0A94C3',
    width: 150,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#fff',
    height:80,

    
  },
});

export default FeatureList;
