import { Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'option' | 'account';
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean;
}

export const SettingsScreen = () => {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Enable push notifications',
      type: 'toggle',
      icon: 'notifications',
      value: true
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Use dark theme',
      type: 'toggle',
      icon: 'moon',
      value: true
    },
    {
      id: 'location',
      title: 'Location Services',
      description: 'Allow tracking in the background',
      type: 'toggle',
      icon: 'location',
      value: false
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Manage your data and security options',
      type: 'option',
      icon: 'shield'
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version, licenses, and information',
      type: 'option',
      icon: 'information-circle'
    },
    {
      id: 'account',
      title: 'Account',
      description: 'Pranav@marlow.ai',
      type: 'account',
      icon: 'person-circle'
    }
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id 
          ? { ...setting, value: !setting.value } 
          : setting
      )
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity 
        key={item.id}
        className="flex-row items-center justify-between py-4 border-b border-zinc-800"
        onPress={() => item.type === 'toggle' ? toggleSetting(item.id) : null}
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
            <Ionicons name={item.icon} size={22} color="#00FFFF" />
          </View>
          <View className="ml-3">
            <Text className="text-white font-medium">{item.title}</Text>
            <Text className="text-gray-400 text-xs">{item.description}</Text>
          </View>
        </View>
        
        {item.type === 'toggle' ? (
          <Switch 
            value={item.value}
            onValueChange={() => toggleSetting(item.id)}
            trackColor={{ false: '#3e3e3e', true: '#164e63' }}
            thumbColor={item.value ? '#00FFFF' : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#666" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black p-6 pt-12">
      <Text className="text-white text-2xl font-bold mb-6">Settings</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-gray-400 uppercase text-xs mb-2">System</Text>
          {settings
            .filter(item => item.type === 'toggle')
            .map(renderSettingItem)}
        </View>
        
        <View className="mb-6">
          <Text className="text-gray-400 uppercase text-xs mb-2">App</Text>
          {settings
            .filter(item => item.type === 'option')
            .map(renderSettingItem)}
        </View>
        
        <View className="mb-6">
          <Text className="text-gray-400 uppercase text-xs mb-2">User</Text>
          {settings
            .filter(item => item.type === 'account')
            .map(renderSettingItem)}
        </View>
        
        <TouchableOpacity className="py-4 items-center mt-6 mb-10">
          <Text className="text-red-500 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}; 