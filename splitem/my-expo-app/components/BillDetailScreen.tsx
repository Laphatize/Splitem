import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { payBill } from './api';

export default function BillDetailScreen({ route, navigation }: any) {
  const { bill, user, token } = route.params;

  const handlePay = async () => {
    await payBill(bill._id, user.id, token);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{bill.name}</Text>
      <Text>Total: ${bill.total}</Text>
      <Text style={styles.subtitle}>Participants:</Text>
      <FlatList
        data={bill.participants}
        keyExtractor={item => item.user._id || item.user}
        renderItem={({ item }) => (
          <View style={styles.participantRow}>
            <Text>{item.user.name || item.user}</Text>
            <Text>Owes: ${item.amount}</Text>
            <Text>{item.paid ? 'Paid' : 'Unpaid'}</Text>
          </View>
        )}
      />
      {!bill.settled && (
        <Button title="Mark as Paid" onPress={handlePay} />
      )}
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  participantRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
