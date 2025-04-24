import { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  battery: number;
  lastConnected: string;
}

export const DevicesScreen = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'core1',
      name: 'MARLOW CORE',
      type: 'Raspberry Pi',
      status: 'Online',
      battery: 50,
      lastConnected: '2 minutes ago'
    },
    {
      id: 'falcon1',
      name: 'MARLOW FALCON',
      type: 'Drone',
      status: 'Flying',
      battery: 90,
      lastConnected: 'Just now'
    },
    {
      id: 'sensor1',
      name: 'Temperature Sensor',
      type: 'IoT Device',
      status: 'Idle',
      battery: 75,
      lastConnected: '1 hour ago'
    },
    {
      id: 'camera1',
      name: 'Security Camera',
      type: 'Camera',
      status: 'Offline',
      battery: 0,
      lastConnected: '2 days ago'
    }
  ]);

  const renderDeviceItem = ({ item }: { item: Device }) => {
    const batteryColor = item.status === 'Offline' 
      ? 'bg-gray-500' 
      : item.battery > 70 
        ? 'bg-green-500' 
        : item.battery > 30 
          ? 'bg-yellow-400' 
          : 'bg-red-500';
    
    const statusColor = item.status === 'Online' || item.status === 'Flying'
      ? 'text-green-500'
      : item.status === 'Idle'
        ? 'text-yellow-400'
        : 'text-gray-500';

    return (
      <TouchableOpacity className="bg-zinc-900 rounded-lg p-4 mb-3">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-cyan-900 items-center justify-center">
              <Ionicons 
                name={
                  item.type === 'Raspberry Pi' 
                    ? 'hardware-chip' 
                    : item.type === 'Drone' 
                      ? 'airplane' 
                      : item.type === 'IoT Device' 
                        ? 'thermometer' 
                        : 'videocam'
                } 
                size={20} 
                color="#00FFFF" 
              />
            </View>
            <View className="ml-3">
              <Text className="text-white font-bold">{item.name}</Text>
              <Text className="text-gray-400 text-xs">{item.type}</Text>
            </View>
          </View>
          <Switch 
            value={item.status !== 'Offline'}
            trackColor={{ false: '#3e3e3e', true: '#164e63' }}
            thumbColor={item.status !== 'Offline' ? '#00FFFF' : '#f4f3f4'}
          />
        </View>
        
        <View className="mt-3 flex-row justify-between items-center">
          <Text className={`text-sm ${statusColor}`}>
            {item.status}
          </Text>
          <View className="flex-row items-center">
            <View className="w-12 h-2 bg-gray-800 rounded-full mr-2">
              <View 
                className={`h-2 rounded-full ${batteryColor}`} 
                style={{ width: `${item.battery}%` }} 
              />
            </View>
            <Text className="text-gray-400 text-xs">
              {item.battery}%
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-500 text-xs mt-1">
          Last connected: {item.lastConnected}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black p-6 pt-12">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">Devices</Text>
        <TouchableOpacity className="bg-zinc-800 p-2 rounded-full">
          <Ionicons name="add" size={24} color="#00FFFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}; 