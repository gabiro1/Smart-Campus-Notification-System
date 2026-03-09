import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { apiClient } from '../../services/apiClient';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

const SCHOOLS = ['School of Technology', 'School of Science', 'School of Business', 'School of Arts'];
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Business Admin', 'Science'];
const LEVELS = ['100', '200', '300', '400'];
const PRIORITIES = ['low', 'medium', 'high'];
const TAGS = [
  'Technology',
  'Sports',
  'Arts',
  'Music',
  'Science',
  'Business',
  'Leadership',
  'Workshop',
];

export default function AdminCreateEventScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    targetSchool: '',
    targetDept: '',
    targetLevel: '',
    tags: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter((t) => t !== tag)
      : [...formData.tags, tag];
    handleInputChange('tags', newTags);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      handleInputChange('date', date);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleCreateEvent = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.targetSchool ||
      !formData.targetDept ||
      formData.tags.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        targetSchool: formData.targetSchool,
        targetDept: formData.targetDept,
        targetLevel: formData.targetLevel || undefined,
        tags: formData.tags,
        priority: formData.priority,
      });

      Toast.show({
        type: 'success',
        text1: 'Event Created',
        text2: 'Event has been created and notifications have been sent',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        targetSchool: '',
        targetDept: '',
        targetLevel: '',
        tags: [],
        priority: 'medium',
      });
      setStep(1);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Creating Event',
        text2: error.response?.data?.message || 'Failed to create event',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#111827' }}
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 }}>
            Create Event
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
                Event Title *
              </Text>
              <TextInput
                placeholder="e.g., AI Bootcamp 2024"
                placeholderTextColor="#475569"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                editable={!isLoading}
                style={{
                  backgroundColor: '#1f2937',
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
                Description *
              </Text>
              <TextInput
                placeholder="Describe the event details, agenda, and what attendees will learn..."
                placeholderTextColor="#475569"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                editable={!isLoading}
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: '#1f2937',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                  color: '#fff',
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Event Date & Time *
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: '#1f2937',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Calendar size={18} color="#3b82f6" />
                <Text style={{ color: '#fff', fontSize: 14 }}>
                  {formData.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </>
        )}

        {/* Step 2: Target Audience */}
        {step === 2 && (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Target School *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SCHOOLS.map((school) => (
                  <TouchableOpacity
                    key={school}
                    onPress={() => handleInputChange('targetSchool', school)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        formData.targetSchool === school ? '#3b82f6' : '#1f2937',
                      borderWidth: 1,
                      borderColor:
                        formData.targetSchool === school ? '#3b82f6' : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color: formData.targetSchool === school ? '#fff' : '#cbd5e1',
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {school.replace('School of ', '')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Department *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    onPress={() => handleInputChange('targetDept', dept)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        formData.targetDept === dept ? '#3b82f6' : '#1f2937',
                      borderWidth: 1,
                      borderColor:
                        formData.targetDept === dept ? '#3b82f6' : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color: formData.targetDept === dept ? '#fff' : '#cbd5e1',
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Target Year Level
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => handleInputChange('targetLevel', level)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        formData.targetLevel === level ? '#3b82f6' : '#1f2937',
                      borderWidth: 1,
                      borderColor:
                        formData.targetLevel === level ? '#3b82f6' : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color: formData.targetLevel === level ? '#fff' : '#cbd5e1',
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      Year {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Step 3: Tags & Priority */}
        {step === 3 && (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Event Tags * (Select at least 1)
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: formData.tags.includes(tag)
                        ? '#3b82f6'
                        : '#1f2937',
                      borderWidth: 1,
                      borderColor: formData.tags.includes(tag)
                        ? '#3b82f6'
                        : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color: formData.tags.includes(tag) ? '#fff' : '#cbd5e1',
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Priority
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PRIORITIES.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => handleInputChange('priority', priority)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        formData.priority === priority ? '#3b82f6' : '#1f2937',
                      borderWidth: 1,
                      borderColor:
                        formData.priority === priority ? '#3b82f6' : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formData.priority === priority ? '#fff' : '#cbd5e1',
                        fontSize: 13,
                        fontWeight: '500',
                        textTransform: 'capitalize',
                      }}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Navigation Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
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
              <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600' }}>
                Back
              </Text>
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
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleCreateEvent}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: isLoading ? '#64748b' : '#10b981',
                alignItems: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  Create Event
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
