import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm MarlowAI. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request. Marlow systems are optimizing for your needs.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.sender === 'ai';
    
    return (
      <View 
        className={`my-2 max-w-[80%] rounded-2xl p-3 ${
          isAI 
            ? 'bg-zinc-800 self-start rounded-bl-none' 
            : 'bg-cyan-900 self-end rounded-br-none'
        }`}
      >
        <Text className="text-white">{item.text}</Text>
        <Text className="text-gray-400 text-xs mt-1 self-end">
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <View className="flex-1 pt-12 px-4">
        <Text className="text-white text-2xl font-bold mb-4">MARLOW<Text className="text-cyan-400">AI</Text></Text>
        
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        
        <View className="flex-row items-center mb-4 border border-zinc-800 rounded-full px-4 py-2">
          <TextInput 
            className="flex-1 text-white"
            placeholder="Type your message..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            onPress={sendMessage}
            className="ml-2 bg-cyan-900 w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}; 