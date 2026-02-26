import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/apiClient';
import { LogOut, Edit2, Save } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const SAMPLE_INTERESTS = [
  'Technology',
  'Sports',
  'Arts',
  'Music',
  'Science',
  'Business',
  'Leadership',
  'Volunteering',
];

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    interests: user?.interests || [],
  });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setFormData({
          name: user.name,
          phoneNumber: user.phoneNumber,
          interests: user.interests,
        });
      }
    }, [user])
  );

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been saved',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111827' }}>
      <View style={{ padding: 16, paddingTop: 24 }}>
        {/* Profile Header */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#3b82f6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: '700', color: '#fff' }}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
            {user.email}
          </Text>
          <View
            style={{
              backgroundColor: '#334155',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '500' }}>
              {user.role.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Academic Information */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Academic Information
          </Text>
          <InfoRow label="School" value={user.school} />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Level" value={`Year ${user.level}`} />
        </View>

        {/* Contact Information */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              Contact Information
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={{ padding: 8 }}
            >
              <Edit2 size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={{
                    backgroundColor: '#111827',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                  Phone Number
                </Text>
                <TextInput
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: '#111827',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#64748b' : '#3b82f6',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Save size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                      Save Changes
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phoneNumber} />
            </>
          )}
        </View>

        {/* Interests */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
            Your Interests
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SAMPLE_INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                disabled={!isEditing}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: formData.interests.includes(interest) ? '#3b82f6' : '#334155',
                  borderWidth: 1,
                  borderColor: formData.interests.includes(interest) ? '#3b82f6' : '#475569',
                  opacity: isEditing ? 1 : 0.7,
                }}
              >
                <Text
                  style={{
                    color: formData.interests.includes(interest) ? '#fff' : '#cbd5e1',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {isEditing && (
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={{
                marginTop: 16,
                backgroundColor: '#3b82f6',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                Save Interests
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            paddingVertical: 14,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          <LogOut size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}
    >
      <Text style={{ fontSize: 14, color: '#94a3b8' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#e2e8f0', fontWeight: '500' }}>{value}</Text>
    </View>
  );
}
