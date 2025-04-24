import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
};

type Suggestion = {
  id: string;
  text: string;
};

const mockSuggestions: Suggestion[] = [
  { id: '1', text: 'How much did I spend on food last month?' },
  { id: '2', text: 'Help me create a budget' },
  { id: '3', text: 'Show me ways to save money' },
  { id: '4', text: 'Analyze my spending habits' },
  { id: '5', text: 'Compare my spending to my peers' },
];

export default function AIAssistantScreen({ route }: any) {
  const { user, token } = route.params || {};
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm your financial AI assistant. I can help you understand your spending, create budgets, and find ways to save. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = (text: string = inputText) => {
    if (text.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    // Add loading message from AI
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText('');

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }];
      });

      // Update suggestions based on conversation context
      updateSuggestions(text);
    }, 1500);
  };

  const generateAIResponse = (query: string): string => {
    // This would be replaced with actual AI API calls
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('spend') && lowerQuery.includes('food')) {
      return "Based on your transactions, you spent $342.18 on food last month. That's about 23% of your total spending. This is slightly higher than your 3-month average of $315.25. Would you like to see a breakdown by restaurant vs. groceries?";
    }
    
    if (lowerQuery.includes('budget')) {
      return "I can help you create a budget! Based on your income and spending patterns, here's what I recommend:\n\n• Housing: $1,200 (32%)\n• Food: $400 (11%)\n• Transportation: $300 (8%)\n• Entertainment: $250 (7%)\n• Savings: $800 (21%)\n• Other: $350 (9%)\n\nWould you like me to set up automatic budget tracking for you?";
    }
    
    if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
      return "I've analyzed your spending and found a few ways you could save money:\n\n1. You're spending $45/month on subscription services you rarely use\n2. Your coffee purchases add up to $87/month\n3. You could save about $120/month by cooking at home more\n\nWould you like more specific advice on any of these areas?";
    }
    
    if (lowerQuery.includes('spending') && lowerQuery.includes('habit')) {
      return "Looking at your spending habits, I notice a few patterns:\n\n• You tend to spend more on weekends (42% of weekly spending)\n• Your highest spending category is food delivery\n• You've increased shopping expenses by 15% this month\n\nWould you like me to suggest some specific ways to optimize your spending?";
    }
    
    if (lowerQuery.includes('peer') || lowerQuery.includes('compare')) {
      return "Compared to others in your age group and income level:\n\n• You save 5% more than average (great job!)\n• Your entertainment spending is about average\n• Your food delivery spending is 20% higher than average\n\nWould you like tips on areas where you could improve?";
    }

    return "I can analyze your financial data to help with that. Would you like me to look at your recent transactions or provide general advice?";
  };

  const updateSuggestions = (query: string) => {
    // This would be replaced with actual AI-based suggestion generation
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('food')) {
      setSuggestions([
        { id: '1', text: 'Show me my top food expenses' },
        { id: '2', text: 'How can I reduce my food spending?' },
        { id: '3', text: 'Compare my food spending to last month' }
      ]);
    } else if (lowerQuery.includes('budget')) {
      setSuggestions([
        { id: '1', text: 'Adjust my budget categories' },
        { id: '2', text: 'Set a savings goal' },
        { id: '3', text: 'How am I tracking against my budget?' }
      ]);
    } else if (lowerQuery.includes('save')) {
      setSuggestions([
        { id: '1', text: 'Show me my subscription costs' },
        { id: '2', text: 'Create a savings plan' },
        { id: '3', text: 'Find my highest unnecessary expenses' }
      ]);
    } else {
      setSuggestions([
        { id: '1', text: 'Analyze my recent transactions' },
        { id: '2', text: 'Show me spending trends' },
        { id: '3', text: 'Give me financial tips' },
        { id: '4', text: 'Help me split a recent bill' }
      ]);
    }
  };

  const renderMessage = (message: Message) => {
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}
      >
        {message.isLoading ? (
          <ActivityIndicator size="small" color={textPrimary} />
        ) : (
          <Text 
            style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.aiText
            ]}
          >
            {message.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.aiProfileContainer}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.aiName}>Marlow AI</Text>
            <Text style={styles.aiStatus}>Financial Assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        <View style={styles.suggestionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map(suggestion => (
              <TouchableOpacity 
                key={suggestion.id} 
                style={styles.suggestionChip}
                onPress={() => sendMessage(suggestion.text)}
              >
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your finances..."
            placeholderTextColor={textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => sendMessage()}
            disabled={inputText.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() === '' ? textSecondary : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkBg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: border
  },
  aiProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  aiName: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '600' as const
  },
  aiStatus: {
    ...typography.small,
    color: accent
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cardBg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardAvoid: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.lg
  },
  messagesContent: {
    paddingBottom: spacing.lg
  },
  messageBubble: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    maxWidth: '80%',
    ...shadows.sm
  },
  userBubble: {
    backgroundColor: accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: cardBg,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4
  },
  messageText: {
    ...typography.body,
    lineHeight: 22
  },
  userText: {
    color: '#fff'
  },
  aiText: {
    color: textPrimary
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  suggestionsContent: {
    paddingRight: spacing.lg
  },
  suggestionChip: {
    backgroundColor: cardBg,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm
  },
  suggestionText: {
    ...typography.small,
    color: accent
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: border
  },
  input: {
    flex: 1,
    backgroundColor: inputBg,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    color: textPrimary,
    maxHeight: 100,
    ...typography.body
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm
  }
});
