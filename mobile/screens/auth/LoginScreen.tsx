import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#fff',
                marginBottom: 8,
              }}
            >
              Welcome Back
            </Text>
            <Text style={{ fontSize: 16, color: '#94a3b8', lineHeight: 24 }}>
              Stay updated with important events and reminders
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Email Address
            </Text>
            <TextInput
              placeholder="your@email.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!isLoading}
              style={{
                backgroundColor: '#1e293b',
                borderWidth: 1,
                borderColor: '#334155',
                borderRadius: 8,
                padding: 14,
                color: '#fff',
                fontSize: 16,
              }}
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Password
            </Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              style={{
                backgroundColor: '#1e293b',
                borderWidth: 1,
                borderColor: '#334155',
                borderRadius: 8,
                padding: 14,
                color: '#fff',
                fontSize: 16,
              }}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#64748b' : '#3b82f6',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
              <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '600' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
