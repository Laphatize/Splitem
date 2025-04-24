import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { register, login } from './api';
import { darkBg, accent, cardBg, textPrimary, textSecondary, error, border } from '../theme';

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      setError('');
      if (isLogin) {
        const res = await login({ email, password });
        navigation.replace('Main', { user: res.data.user, token: res.data.token });
      } else {
        await register({ email, password, name });
        setIsLogin(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkBg }]}> 
      <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12 }}>
        <Text style={[styles.title, { color: accent }]}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
        {!isLogin && (
          <TextInput placeholder="Name" placeholderTextColor={textSecondary} value={name} onChangeText={setName} style={[styles.input, { color: textPrimary, borderColor: border, backgroundColor: darkBg }]} />
        )}
        <TextInput placeholder="Email" placeholderTextColor={textSecondary} value={email} onChangeText={setEmail} style={[styles.input, { color: textPrimary, borderColor: border, backgroundColor: darkBg }]} autoCapitalize="none" />
        <TextInput placeholder="Password" placeholderTextColor={textSecondary} value={password} onChangeText={setPassword} style={[styles.input, { color: textPrimary, borderColor: border, backgroundColor: darkBg }]} secureTextEntry />
        {!!error && <Text style={[styles.error, { color: error }]}>{error}</Text>}
        <TouchableOpacity style={{ backgroundColor: accent, borderRadius: 8, padding: 14, marginTop: 10 }} onPress={handleAuth}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 18 }} onPress={() => setIsLogin(!isLogin)}>
          <Text style={{ color: accent, textAlign: 'center' }}>{isLogin ? 'Need an account? Register' : 'Have an account? Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 16 },
  error: { marginBottom: 12, textAlign: 'center', fontWeight: '500', fontSize: 15 },
});
