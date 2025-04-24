import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  darkBg,
  cardBg,
  accent,
  accentSoft,
  textPrimary,
  textSecondary,
  border,
  inputBg,
  spacing,
  typography,
  shadows
} from '../theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'friend';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

const mockContacts: ChatContact[] = [
  {
    id: '1',
    name: 'Alice',
    lastMessage: 'I sent you $25 for dinner',
    timestamp: new Date(2025, 3, 22, 18, 30),
    unread: 2
  },
  {
    id: '2',
    name: 'Bob',
    lastMessage: 'Thanks for splitting the bill!',
    timestamp: new Date(2025, 3, 21, 14, 15),
    unread: 0
  },
  {
    id: '3',
    name: 'Charlie',
    lastMessage: 'When are we splitting the rent?',
    timestamp: new Date(2025, 3, 20, 9, 45),
    unread: 1
  },
  {
    id: '4',
    name: 'Dana',
    lastMessage: 'Movie night this weekend?',
    timestamp: new Date(2025, 3, 19, 20, 10),
    unread: 0
  }
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      text: 'Hey, did you get my payment for dinner?',
      sender: 'friend',
      senderName: 'Alice',
      timestamp: new Date(2025, 3, 22, 18, 25)
    },
    {
      id: '2',
      text: 'I sent you $25 through the app',
      sender: 'friend',
      senderName: 'Alice',
      timestamp: new Date(2025, 3, 22, 18, 30)
    },
    {
      id: '3',
      text: 'Not yet, let me check',
      sender: 'user',
      timestamp: new Date(2025, 3, 22, 18, 32)
    },
    {
      id: '4',
      text: 'Got it! Thanks for paying so quickly',
      sender: 'user',
      timestamp: new Date(2025, 3, 22, 18, 35)
    }
  ],
  '2': [
    {
      id: '1',
      text: 'Thanks for organizing the dinner!',
      sender: 'friend',
      senderName: 'Bob',
      timestamp: new Date(2025, 3, 21, 14, 10)
    },
    {
      id: '2',
      text: 'Thanks for splitting the bill!',
      sender: 'friend',
      senderName: 'Bob',
      timestamp: new Date(2025, 3, 21, 14, 15)
    }
  ],
  '3': [
    {
      id: '1',
      text: 'When are we splitting the rent?',
      sender: 'friend',
      senderName: 'Charlie',
      timestamp: new Date(2025, 3, 20, 9, 45)
    }
  ],
  '4': [
    {
      id: '1',
      text: 'Movie night this weekend?',
      sender: 'friend',
      senderName: 'Dana',
      timestamp: new Date(2025, 3, 19, 20, 10)
    }
  ]
};

export default function ChatScreen({ route }: any) {
  const { user, token } = route.params || {};
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>(mockContacts);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (activeChat && mockMessages[activeChat]) {
      setMessages(mockMessages[activeChat]);
      // Mark messages as read
      setContacts(prev => 
        prev.map(contact => 
          contact.id === activeChat ? { ...contact, unread: 0 } : contact
        )
      );
    }
  }, [activeChat]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim() === '' || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Update last message in contacts
    setContacts(prev => 
      prev.map(contact => 
        contact.id === activeChat 
          ? { ...contact, lastMessage: inputText, timestamp: new Date() } 
          : contact
      )
    );

    // Simulate response after delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Got your message! I\'ll respond soon.',
        sender: 'friend',
        senderName: contacts.find(c => c.id === activeChat)?.name,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderContactItem = ({ item }: { item: ChatContact }) => (
    <TouchableOpacity 
      style={[styles.contactItem, activeChat === item.id && styles.activeContactItem]}
      onPress={() => setActiveChat(item.id)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactInitial}>{item.name[0]}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactTime}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.contactFooter}>
          <Text 
            style={styles.contactLastMessage} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.friendBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.friendMessageText]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {!activeChat ? (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
        />
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={100}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={textPrimary} />
            </TouchableOpacity>
            <View style={styles.chatContact}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>
                  {contacts.find(c => c.id === activeChat)?.name[0]}
                </Text>
              </View>
              <Text style={styles.chatName}>
                {contacts.find(c => c.id === activeChat)?.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.chatOptions}>
              <Ionicons name="ellipsis-horizontal" size={24} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkBg
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: border
  },
  title: {
    ...typography.h2,
    color: textPrimary
  },
  contactsList: {
    padding: spacing.md
  },
  contactItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm
  },
  activeContactItem: {
    backgroundColor: cardBg
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  contactInitial: {
    ...typography.h3,
    color: textPrimary
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  contactName: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '600' as const
  },
  contactTime: {
    ...typography.small,
    color: textSecondary
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contactLastMessage: {
    ...typography.small,
    color: textSecondary,
    flex: 1,
    marginRight: spacing.sm
  },
  unreadBadge: {
    backgroundColor: accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs
  },
  unreadText: {
    ...typography.tiny,
    color: '#fff',
    fontWeight: '600' as const
  },
  chatContainer: {
    flex: 1
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: border
  },
  backButton: {
    marginRight: spacing.sm
  },
  chatContact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  chatAvatarText: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '600' as const
  },
  chatName: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '600' as const
  },
  chatOptions: {
    padding: spacing.sm
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.xl
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  userBubble: {
    backgroundColor: accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  friendBubble: {
    backgroundColor: cardBg,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4
  },
  messageText: {
    ...typography.body,
    marginBottom: spacing.xs
  },
  userMessageText: {
    color: '#fff'
  },
  friendMessageText: {
    color: textPrimary
  },
  messageTime: {
    ...typography.tiny,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: border
  },
  input: {
    flex: 1,
    backgroundColor: inputBg,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: textPrimary,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm
  },
  disabledButton: {
    opacity: 0.5
  }
});
