import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  // Placeholder for notifications
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text>No notifications yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
});
