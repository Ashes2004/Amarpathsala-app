import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Notification handler for background notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Load the saved toggle state on app start
    loadToggleState();

    // Register for notifications
    registerForPushNotificationsAsync();

    // Schedule notifications if toggle is enabled
    if (isEnabled) {
      scheduleNotifications();
    }

    return () => {
      if (!isEnabled) {
        cancelAllNotifications(); // Stop notifications if disabled
      }
    };
  }, [isEnabled]);

  // Load toggle state from AsyncStorage
  const loadToggleState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('notificationToggle');
      if (savedState !== null) {
        setIsEnabled(JSON.parse(savedState)); // Parse and set the toggle state
      }
    } catch (error) {
      console.error('Failed to load toggle state:', error);
    }
  };

  // Save toggle state to AsyncStorage
  const saveToggleState = async (state) => {
    try {
      await AsyncStorage.setItem('notificationToggle', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save toggle state:', error);
    }
  };

  // Toggle notifications on/off
  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    saveToggleState(newState);

    if (newState) {
      scheduleNotifications(); // Start notifications
    } else {
      cancelAllNotifications(); // Stop notifications
    }
  };

  // Schedule notifications every 10 seconds
  const scheduleNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync(); // Clear existing notifications

    const trigger = { seconds: 10, repeats: true }; // Repeat every 10 seconds

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Background Notification',
        body: 'This notification is sent every 10 seconds!',
        data: { someData: 'goes here' },
      },
      trigger,
    });

    console.log('Notifications scheduled.');
  };

  // Cancel all scheduled notifications
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled.');
  };

  // Register for push notifications
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      alert('Must use a physical device for Push Notifications.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push notification token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Notifications are {isEnabled ? 'Enabled' : 'Disabled'}
      </Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        {isEnabled
          ? 'Notifications will be sent every 10 seconds, even if the app is closed.'
          : 'Notifications are turned off.'}
      </Text>
    </View>
  );
}
