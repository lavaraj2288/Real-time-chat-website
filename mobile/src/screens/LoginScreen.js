import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { colors } from '../styles/theme';
import { DEFAULT_SERVER_URL } from '../services/socket';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Required', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      onLoginSuccess(data.user, serverUrl);
    } catch (err) {
      Alert.alert('Connection Error', err.message || 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>💬</Text>
        </View>
        <Text style={styles.title}>PulseChat Mobile</Text>
        <Text style={styles.subtitle}>Real-time messaging for Android</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. AndroidUser"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Backend Server URL</Text>
          <TextInput
            style={styles.input}
            placeholder="http://10.0.2.2:5000"
            placeholderTextColor={colors.textMuted}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
          />
          <Text style={styles.hintText}>
            Emulator: 10.0.2.2:5000 | Device: your PC LAN IP
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enter Chat Rooms →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  logoEmoji: {
    fontSize: 28
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14
  },
  hintText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
