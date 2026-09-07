import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { colors } from '../styles/theme';

export default function RoomListScreen({
  currentUser,
  serverUrl,
  onSelectRoom,
  onLogout
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/rooms`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.warn('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Required', 'Please enter a room name');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${serverUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName.trim().toLowerCase(),
          displayName: newRoomName.trim(),
          topic: newRoomTopic.trim() || 'Mobile chat channel',
          createdBy: currentUser?.username || 'mobile_user'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not create room');
      }

      setRooms((prev) => [...prev, data.room]);
      setModalVisible(false);
      setNewRoomName('');
      setNewRoomTopic('');
      onSelectRoom(data.room);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PulseChat</Text>
          <Text style={styles.headerSubtitle}>Logged in as @{currentUser?.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Rooms ({rooms.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => onSelectRoom(item)}
            >
              <View style={styles.roomPrefix}>
                <Text style={styles.prefixText}>#</Text>
              </View>
              <View style={styles.roomDetails}>
                <Text style={styles.roomName}>{item.displayName || item.name}</Text>
                <Text style={styles.roomTopic} numberOfLines={1}>
                  {item.topic || 'General discussion'}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal to create room */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Room</Text>

            <TextInput
              style={styles.input}
              placeholder="Room handle (e.g. mobile-dev)"
              placeholderTextColor={colors.textMuted}
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Topic / Purpose"
              placeholderTextColor={colors.textMuted}
              value={newRoomTopic}
              onChangeText={setNewRoomTopic}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.createBtn]}
                onPress={handleCreateRoom}
                disabled={creating}
              >
                <Text style={styles.createText}>
                  {creating ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  logoutText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase'
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  addText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  roomPrefix: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  prefixText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: 'bold'
  },
  roomDetails: {
    flex: 1
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  roomTopic: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  arrow: {
    fontSize: 20,
    color: colors.textMuted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.textPrimary,
    marginBottom: 12
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  cancelBtn: {
    backgroundColor: colors.surfaceLight
  },
  cancelText: {
    color: colors.textSecondary
  },
  createBtn: {
    backgroundColor: colors.primary
  },
  createText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
