import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { darkBg, accent } from '../theme';

export default function BillSplitResultsModal() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { split } = route.params || { split: {} };
  return (
    <Modal visible animationType="slide" transparent>
      <SafeAreaView style={{ flex: 1, backgroundColor: darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.modal}>
          <Text style={{ color: accent, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Bill Split Results</Text>
          {Object.entries(split || {}).map(([person, amount]) => (
            <Text key={person} style={styles.result}>{person}: ${Number(amount).toFixed(2)}</Text>
          ))}
          <TouchableOpacity style={styles.okBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: darkBg, fontWeight: 'bold', fontSize: 16 }}>OK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { backgroundColor: darkBg, padding: 32, borderRadius: 14, width: 320, alignItems: 'center' },
  result: { color: '#fff', fontSize: 18, marginBottom: 8 },
  okBtn: { backgroundColor: accent, borderRadius: 8, paddingHorizontal: 32, paddingVertical: 12, marginTop: 18 },
});
