import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Linking } from 'react-native';
import { getPaypalLink } from './api';

export default function BankLinkScreen({ route }: any) {
  const { user, token } = route.params;
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLink = async () => {
    setLoading(true);
    try {
      const res = await getPaypalLink(token);
      setLink(res.data.url);
    } catch (e) {
      setLink('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLink();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link PayPal Account</Text>
      {link ? (
        <Button title="Link PayPal" onPress={() => Linking.openURL(link)} />
      ) : (
        <Text>{loading ? 'Loading...' : 'Unable to get link.'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
});
