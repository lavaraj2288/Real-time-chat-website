import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RoomListScreen from './src/screens/RoomListScreen';
import ChatScreen from './src/screens/ChatScreen';
import { initSocket, disconnectSocket, DEFAULT_SERVER_URL } from './src/services/socket';
import { colors } from './src/styles/theme';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [currentRoom, setCurrentRoom] = useState(null);

  const handleLoginSuccess = (user, url) => {
    setCurrentUser(user);
    setServerUrl(url);
    initSocket(url);
  };

  const handleLogout = () => {
    disconnectSocket();
    setCurrentUser(null);
    setCurrentRoom(null);
  };

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : currentRoom ? (
        <ChatScreen
          room={currentRoom}
          currentUser={currentUser}
          onBack={() => setCurrentRoom(null)}
        />
      ) : (
        <RoomListScreen
          currentUser={currentUser}
          serverUrl={serverUrl}
          onSelectRoom={(room) => setCurrentRoom(room)}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});
