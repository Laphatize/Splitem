import { useState } from 'react';
import { Text, View, Image, TouchableOpacity, Modal, Pressable } from 'react-native';

export const HomeScreen = ({ username = "Pranav" }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  const devices = [
    {
      id: 'core',
      name: 'MARLOW CORE',
      image: 'https://emariete.com/wp-content/uploads/2020/04/RASP_03_011-1024x570.png',
      battery: 50,
      status: 'Online',
      options: ['Restart', 'Update firmware', 'Configure', 'Shutdown']
    },
    {
      id: 'falcon',
      name: 'MARLOW FALCON',
      image: 'https://images.squarespace-cdn.com/content/v1/5f590adf56d09a2b3afddf93/1618785665331-IOTRDE31W5H32TV3D9I1/Copy+of+tellodrone.png?format=2500w',
      battery: 90,
      status: 'Flying',
      options: ['Land now', 'Return home', 'Track mode', 'Camera settings']
    }
  ];

  const openBottomSheet = (device) => {
    setSelectedDevice(device);
  };

  const closeBottomSheet = () => {
    setSelectedDevice(null);
  };

  return (
    <View className="flex-1 bg-black p-6">
      {/* Header */}
      <Text className="text-white text-3xl font-light mt-10">MARLOW<Text className="font-bold">OS</Text></Text>
      
      {/* Greeting */}
      <Text className="text-white text-4xl mt-8">Hello <Text className="font-bold">{username}</Text></Text>
      
      {/* AI Section */}
      <View className="mt-8">
        <Text className="text-white text-2xl">MARLOW<Text className="font-bold">AI</Text></Text>
        <Text className="text-white text-xl mt-2">You will be presenting at <Text className="font-bold">Bitcamp</Text> in a few weeks.</Text>
        
        <View className="flex-row items-center mt-6">
          <View className="flex-1">
            <Text className="text-white text-xl">
              I've learned to recognize Abhinav Byreddy and Aaftab Jafri. You can utilize <Text className="text-cyan-400 font-medium">Marlow Falcon</Text> to track them in a proximity near you.
            </Text>
          </View>
          <View className="flex-row ml-2">
            <View className="w-16 h-16 rounded-full bg-purple-700 items-center justify-center border-2 border-white">
              <Text className="text-white text-xl font-bold">AB</Text>
            </View>
            <View className="w-16 h-16 rounded-full bg-blue-700 items-center justify-center border-2 border-white -ml-4">
              <Text className="text-white text-xl font-bold">AJ</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Devices Section */}
      <Text className="text-white text-2xl mt-12">DEVICES</Text>
      
      {devices.map(device => (
        <TouchableOpacity 
          key={device.id}
          className="mt-4 border border-gray-700 rounded-lg p-4 flex-row items-center"
          onPress={() => openBottomSheet(device)}
        >
          <Image 
            source={{ uri: device.image }} 
            className="w-20 h-20" 
            resizeMode="contain"
          />
          <View className="flex-1 items-end">
            <Text className="text-white text-xl font-bold">{device.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-12 h-2 bg-gray-800 rounded-full">
                <View 
                  className={`h-2 rounded-full ${device.battery >= 70 ? 'bg-green-500' : 'bg-yellow-400'}`} 
                  style={{ width: `${device.battery}%` }} 
                />
              </View>
              <Text className="text-white ml-2">{device.battery}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Bottom Sheet Modal */}
      <Modal
        visible={selectedDevice !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBottomSheet}
      >
        <Pressable 
          className="flex-1 bg-black/50"
          onPress={closeBottomSheet}
        >
          <Pressable 
            className="bg-zinc-900 rounded-t-3xl absolute bottom-0 w-full p-6"
            style={{ height: '60%' }}
            onPress={e => e.stopPropagation()}
          >
            {selectedDevice && (
              <>
                <View className="w-16 h-1 bg-gray-500 rounded-full self-center mb-6" />
                
                <View className="flex-row mb-6">
                  <Image 
                    source={{ uri: selectedDevice.image }} 
                    className="w-24 h-24 rounded-lg" 
                    resizeMode="contain"
                  />
                  <View className="ml-4 justify-center">
                    <Text className="text-white text-2xl font-bold">{selectedDevice.name}</Text>
                    <Text className="text-gray-400">Status: {selectedDevice.status}</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="w-16 h-2 bg-gray-800 rounded-full">
                        <View 
                          className={`h-2 rounded-full ${selectedDevice.battery >= 70 ? 'bg-green-500' : 'bg-yellow-400'}`} 
                          style={{ width: `${selectedDevice.battery}%` }} 
                        />
                      </View>
                      <Text className="text-white ml-2">{selectedDevice.battery}%</Text>
                    </View>
                  </View>
                </View>

                <Text className="text-white text-lg mb-4">Configuration Options</Text>
                
                <View className="divide-y divide-gray-800">
                  {selectedDevice.options.map((option, index) => (
                    <TouchableOpacity 
                      key={index}
                      className="py-4 flex-row justify-between items-center"
                    >
                      <Text className="text-white text-lg">{option}</Text>
                      <Text className="text-gray-500">›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}; 