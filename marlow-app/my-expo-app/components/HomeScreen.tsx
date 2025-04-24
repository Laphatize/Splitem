import { useState } from 'react';
import { Text, View, Image, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkBg, cardBg, accent, textPrimary, textSecondary, border } from '../theme';

interface Device {
  id: string;
  name: string;
  image: string;
  battery: number;
  status: string;
  options: string[];
}

export const HomeScreen = ({ username = "Pranav" }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  const devices: Device[] = [
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

  const openBottomSheet = (device: Device) => {
    setSelectedDevice(device);
  };

  const closeBottomSheet = () => {
    setSelectedDevice(null);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: darkBg, padding: 24 },
    headerText: { color: accent, fontSize: 24, fontWeight: '300', marginTop: 40 },
    greetingText: { color: accent, fontSize: 32, marginTop: 32 },
    aiSection: { marginTop: 32 },
    aiTitle: { color: accent, fontSize: 20, fontWeight: 'bold' },
    aiText: { color: textPrimary, fontSize: 18, marginTop: 8 },
    deviceSection: { marginTop: 48 },
    deviceTitle: { color: accent, fontSize: 20 },
    deviceCard: { borderColor: border, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    deviceImage: { width: 80, height: 80 },
    deviceInfo: { flex: 1, alignItems: 'flex-end' },
    deviceName: { color: accent, fontSize: 18, fontWeight: 'bold' },
    deviceBattery: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    deviceBatteryBar: { width: 48, height: 8, borderRadius: 4, backgroundColor: border },
    deviceBatteryLevel: { color: accent, marginLeft: 8 },
    bottomSheetModal: { flex: 1, backgroundColor: darkBg, opacity: 0.5 },
    bottomSheet: { backgroundColor: darkBg, borderRadius: 24, position: 'absolute', bottom: 0, width: '100%', padding: 24 },
    bottomSheetDivider: { width: 64, height: 4, borderRadius: 2, backgroundColor: border, alignSelf: 'center', marginBottom: 24 },
    bottomSheetDeviceInfo: { flexDirection: 'row', marginBottom: 24 },
    bottomSheetDeviceImage: { width: 96, height: 96, borderRadius: 12 },
    bottomSheetDeviceText: { marginLeft: 16, justifyContent: 'center' },
    bottomSheetDeviceName: { color: accent, fontSize: 18, fontWeight: 'bold' },
    bottomSheetDeviceStatus: { color: textSecondary },
    bottomSheetDeviceBattery: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    bottomSheetDeviceBatteryBar: { width: 64, height: 8, borderRadius: 4, backgroundColor: border },
    bottomSheetDeviceBatteryLevel: { color: accent, marginLeft: 8 },
    bottomSheetOptions: { borderBottomColor: border, borderBottomWidth: 1 },
    bottomSheetOption: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bottomSheetOptionText: { color: accent, fontSize: 16 },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>MARLOW<Text style={{ fontWeight: 'bold' }}>OS</Text></Text>
      
      {/* Greeting */}
      <Text style={styles.greetingText}>Hello <Text style={{ fontWeight: 'bold' }}>{username}</Text></Text>
      
      {/* AI Section */}
      <View style={styles.aiSection}>
        <Text style={styles.aiTitle}>MARLOW<Text style={{ fontWeight: 'bold' }}>AI</Text></Text>
        <Text style={styles.aiText}>You will be presenting at <Text style={{ fontWeight: 'bold' }}>Bitcamp</Text> in a few weeks.</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textPrimary, fontSize: 18 }}>
              I've learned to recognize Abhinav Byreddy and Aaftab Jafri. You can utilize <Text style={{ color: accent, fontWeight: '500' }}>Marlow Falcon</Text> to track them in a proximity near you.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#7A0BC0', justifyContent: 'center', alignItems: 'center', borderColor: '#FFFFFF', borderWidth: 2 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>AB</Text>
            </View>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center', borderColor: '#FFFFFF', borderWidth: 2, marginLeft: -16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>AJ</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Devices Section */}
      <Text style={styles.deviceTitle}>DEVICES</Text>
      
      {devices.map((device, index) => (
        <TouchableOpacity 
          key={device.id}
          style={styles.deviceCard}
          onPress={() => openBottomSheet(device)}
        >
          <Image 
            source={{ uri: device.image }} 
            style={styles.deviceImage} 
            resizeMode="contain"
          />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <View style={styles.deviceBattery}>
              <View style={styles.deviceBatteryBar}>
                <View 
                  style={{ height: 8, borderRadius: 4, backgroundColor: device.battery >= 70 ? accent : textSecondary, width: `${device.battery}%` }} 
                />
              </View>
              <Text style={styles.deviceBatteryLevel}>{device.battery}%</Text>
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
          style={styles.bottomSheetModal}
          onPress={closeBottomSheet}
        >
          <Pressable 
            style={styles.bottomSheet}
            onPress={e => e.stopPropagation()}
          >
            {selectedDevice && (
              <>
                <View style={styles.bottomSheetDivider} />
                
                <View style={styles.bottomSheetDeviceInfo}>
                  <Image 
                    source={{ uri: selectedDevice.image }} 
                    style={styles.bottomSheetDeviceImage} 
                    resizeMode="contain"
                  />
                  <View style={styles.bottomSheetDeviceText}>
                    <Text style={styles.bottomSheetDeviceName}>{selectedDevice.name}</Text>
                    <Text style={styles.bottomSheetDeviceStatus}>Status: {selectedDevice.status}</Text>
                    <View style={styles.bottomSheetDeviceBattery}>
                      <View style={styles.bottomSheetDeviceBatteryBar}>
                        <View 
                          style={{ height: 8, borderRadius: 4, backgroundColor: selectedDevice.battery >= 70 ? accent : textSecondary, width: `${selectedDevice.battery}%` }} 
                        />
                      </View>
                      <Text style={styles.bottomSheetDeviceBatteryLevel}>{selectedDevice.battery}%</Text>
                    </View>
                  </View>
                </View>

                <Text style={{ color: accent, fontSize: 16, marginBottom: 16 }}>Configuration Options</Text>
                
                <View style={styles.bottomSheetOptions}>
                  {selectedDevice.options.map((option, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.bottomSheetOption}
                    >
                      <Text style={styles.bottomSheetOptionText}>{option}</Text>
                      <Text style={{ color: textSecondary }}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}; 