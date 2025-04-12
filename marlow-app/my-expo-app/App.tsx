import { HomeScreen } from 'components/HomeScreen';
import { ChatScreen } from 'components/ChatScreen';
import { DevicesScreen } from 'components/DevicesScreen';
import { SettingsScreen } from 'components/SettingsScreen';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import './global.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'devices':
        return <DevicesScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };
  
  return (
    <>
      <View className="flex-1">
        {renderScreen()}
        
        {/* Bottom Navigation */}
        <View className="bg-zinc-900 border-t border-zinc-800 pb-6 pt-2 flex-row justify-around">
          <TabButton 
            icon="home" 
            label="Home" 
            active={activeTab === 'home'} 
            onPress={() => setActiveTab('home')} 
          />
          <TabButton 
            icon="hardware-chip" 
            label="Devices" 
            active={activeTab === 'devices'} 
            onPress={() => setActiveTab('devices')} 
          />
          <TabButton 
            icon="chatbubble" 
            label="Chat" 
            active={activeTab === 'chat'} 
            onPress={() => setActiveTab('chat')} 
          />
          <TabButton 
            icon="settings" 
            label="Settings" 
            active={activeTab === 'settings'} 
            onPress={() => setActiveTab('settings')} 
          />
        </View>
      </View>
      <StatusBar style="light" />
    </>
  );
}

interface TabButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton = ({ icon, label, active, onPress }: TabButtonProps) => {
  const iconName = active ? icon : `${icon}-outline` as keyof typeof Ionicons.glyphMap;
  
  return (
    <TouchableOpacity 
      className="items-center justify-center" 
      onPress={onPress}
    >
      <Ionicons 
        name={iconName}
        size={24} 
        color={active ? '#00FFFF' : '#888888'} 
      />
      <Text className={`text-xs mt-1 ${active ? 'text-cyan-400' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
