import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { createBill } from './api';

export default function AddBillScreen({ route, navigation }: any) {
  const { user, token } = route.params;
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [participants, setParticipants] = useState<{ user: string; amount: number }[]>([{ user: user.id, amount: 0 }]);
  const [error, setError] = useState('');

  const addParticipant = () => setParticipants([...participants, { user: '', amount: 0 }]);
  const updateParticipant = (idx: number, field: 'user' | 'amount', value: string) => {
    const updated = [...participants];
    if (field === 'amount') updated[idx][field] = Number(value);
    else updated[idx][field] = value;
    setParticipants(updated);
  };

  const handleCreate = async () => {
    try {
      setError('');
      if (!name || !total || participants.some(p => !p.user || !p.amount)) {
        setError('Fill all fields');
        return;
      }
      await createBill({ name, total: Number(total), createdBy: user.id, participants }, token);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Bill</Text>
      <TextInput placeholder="Bill Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Total Amount" value={total} onChangeText={setTotal} style={styles.input} keyboardType="numeric" />
      <Text style={styles.subtitle}>Participants</Text>
      <FlatList
        data={participants}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.participantRow}>
            <TextInput
              placeholder="User ID"
              value={item.user}
              onChangeText={v => updateParticipant(index, 'user', v)}
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              placeholder="Amount"
              value={item.amount ? String(item.amount) : ''}
              onChangeText={v => updateParticipant(index, 'amount', v)}
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              keyboardType="numeric"
            />
          </View>
        )}
        ListFooterComponent={<Button title="Add Participant" onPress={addParticipant} />}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button title="Create Bill" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  participantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
