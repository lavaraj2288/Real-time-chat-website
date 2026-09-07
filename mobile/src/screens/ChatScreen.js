import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { colors } from '../styles/theme';
import { getSocket } from '../services/socket';

export default function ChatScreen({ room, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join room
    socket.emit('joinRoom', {
      room: room.name,
      user: currentUser
    });

    socket.on('roomHistory', (data) => {
      if (data.room === room.name) {
        setMessages(data.messages || []);
        setLoading(false);
      }
    });

    socket.on('chatMessage', (newMsg) => {
      if (newMsg.room === room.name) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users || []);
    });

    socket.on('typing', ({ room: r, username, isTyping }) => {
      if (r === room.name) {
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(username) ? prev : [...prev, username];
          } else {
            return prev.filter((u) => u !== username);
          }
        });
      }
    });

    return () => {
      socket.emit('leaveRoom', { room: room.name });
      socket.off('roomHistory');
      socket.off('chatMessage');
      socket.off('onlineUsers');
      socket.off('typing');
    };
  }, [room.name, currentUser]);

  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('chatMessage', {
        room: room.name,
        sender: {
          username: currentUser.username,
          avatarColor: currentUser.avatarColor,
          isGuest: currentUser.isGuest
        },
        text: trimmed
      });

      // Stop typing
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.emit('typing', {
        room: room.name,
        username: currentUser.username,
        isTyping: false
      });
      isTypingRef.current = false;
    }

    setInputText('');
  };

  const handleInputChange = (text) => {
    setInputText(text);

    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', {
        room: room.name,
        username: currentUser.username,
        isTyping: true
      });
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing', {
        room: room.name,
        username: currentUser.username,
        isTyping: false
      });
    }, 1500);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* WhatsApp-style Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>#{room.displayName || room.name}</Text>
            <Text style={styles.headerSubtitle}>
              {onlineUsers.length} online • {room.topic || 'Group Chat'}
            </Text>
          </View>
        </View>

        {/* Message Feed */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || String(index)}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isSelf = item.sender?.username === currentUser?.username;
              return (
                <View
                  style={[
                    styles.messageRow,
                    isSelf ? styles.messageSelf : styles.messageOther
                  ]}
                >
                  {!isSelf && (
                    <Text style={styles.senderName}>
                      {item.sender?.username || 'Member'}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      isSelf ? styles.selfText : styles.otherText
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text style={styles.messageTime}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingBox}>
            <Text style={styles.typingText}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={handleInputChange}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  backText: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: '300'
  },
  headerContent: {
    marginLeft: 8,
    flex: 1
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.onlineGreen
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8
  },
  messageList: {
    padding: 16,
    paddingBottom: 8
  },
  messageRow: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  messageSelf: {
    alignSelf: 'flex-end',
    backgroundColor: colors.bubbleSelf,
    borderBottomRightRadius: 2
  },
  messageOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bubbleOther,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 2
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18
  },
  selfText: {
    color: '#ffffff'
  },
  otherText: {
    color: colors.textPrimary
  },
  messageTime: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  typingBox: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  typingText: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: colors.textPrimary,
    maxHeight: 100,
    fontSize: 14
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  sendDisabled: {
    opacity: 0.4
  },
  sendIcon: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 2
  }
});
