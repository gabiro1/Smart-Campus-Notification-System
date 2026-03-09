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

const SCHOOLS = ['School of Technology', 'School of Science', 'School of Business', 'School of Arts'];
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Business Admin', 'Science'];
const LEVELS = ['100', '200', '300', '400'];

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    school: '',
    department: '',
    level: '',
    interests: [],
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();

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

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    handleInputChange('interests', newInterests);
  };

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phoneNumber ||
      !formData.school ||
      !formData.department ||
      !formData.level ||
      formData.interests.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        school: formData.school,
        department: formData.department,
        level: formData.level,
        interests: formData.interests,
      });
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Welcome to Event Alert System!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'Something went wrong',
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
          contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 }}>
              Create Account
            </Text>
            <Text style={{ fontSize: 14, color: '#94a3b8' }}>
              Step {step} of 3
            </Text>
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#475569"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  editable={!isLoading}
                  style={{
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Email
                </Text>
                <TextInput
                  placeholder="john@email.com"
                  placeholderTextColor="#475569"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  editable={!isLoading}
                  style={{
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Phone Number
                </Text>
                <TextInput
                  placeholder="+233 500 000 000"
                  placeholderTextColor="#475569"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  style={{
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Password
                </Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  editable={!isLoading}
                  style={{
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Confirm Password
                </Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  value={formData.passwordConfirm}
                  onChangeText={(text) => handleInputChange('passwordConfirm', text)}
                  secureTextEntry
                  editable={!isLoading}
                  style={{
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                  }}
                />
              </View>
            </>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  School
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 10 }}
                >
                  {SCHOOLS.map((school) => (
                    <TouchableOpacity
                      key={school}
                      onPress={() => handleInputChange('school', school)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        marginRight: 10,
                        backgroundColor: formData.school === school ? '#3b82f6' : '#1e293b',
                        borderWidth: 1,
                        borderColor: formData.school === school ? '#3b82f6' : '#334155',
                      }}
                    >
                      <Text
                        style={{
                          color: formData.school === school ? '#fff' : '#cbd5e1',
                          fontSize: 13,
                          fontWeight: '500',
                        }}
                      >
                        {school}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Department
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 10 }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      onPress={() => handleInputChange('department', dept)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        marginRight: 10,
                        backgroundColor: formData.department === dept ? '#3b82f6' : '#1e293b',
                        borderWidth: 1,
                        borderColor: formData.department === dept ? '#3b82f6' : '#334155',
                      }}
                    >
                      <Text
                        style={{
                          color: formData.department === dept ? '#fff' : '#cbd5e1',
                          fontSize: 13,
                          fontWeight: '500',
                        }}
                      >
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Year Level
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 10 }}
                >
                  {LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handleInputChange('level', level)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        marginRight: 10,
                        backgroundColor: formData.level === level ? '#3b82f6' : '#1e293b',
                        borderWidth: 1,
                        borderColor: formData.level === level ? '#3b82f6' : '#334155',
                      }}
                    >
                      <Text
                        style={{
                          color: formData.level === level ? '#fff' : '#cbd5e1',
                          fontSize: 13,
                          fontWeight: '500',
                        }}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                  Select Your Interests
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {SAMPLE_INTERESTS.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      onPress={() => toggleInterest(interest)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: formData.interests.includes(interest)
                          ? '#3b82f6'
                          : '#1e293b',
                        borderWidth: 1,
                        borderColor: formData.interests.includes(interest)
                          ? '#3b82f6'
                          : '#334155',
                      }}
                    >
                      <Text
                        style={{
                          color: formData.interests.includes(interest) ? '#fff' : '#cbd5e1',
                          fontSize: 13,
                          fontWeight: '500',
                        }}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Navigation Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 30 }}>
            {step > 1 && (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity
                onPress={() => setStep(step + 1)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: isLoading ? '#64748b' : '#3b82f6',
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
              <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600' }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
