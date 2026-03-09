import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Reminder {
  id: string;
  title: string;
  deadline: Date;
  completed: boolean;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Submit project assignment',
      deadline: new Date(Date.now() + 86400000 * 2),
      completed: false,
    },
    {
      id: '2',
      title: 'Attend workshop on AI',
      deadline: new Date(Date.now() + 86400000),
      completed: false,
    },
    {
      id: '3',
      title: 'Register for conference',
      deadline: new Date(Date.now() + 86400000 * 5),
      completed: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddReminder = () => {
    if (!newReminder.trim()) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder,
      deadline: selectedDate,
      completed: false,
    };

    setReminders([...reminders, reminder]);
    setNewReminder('');
    setSelectedDate(new Date());
    setShowModal(false);
  };

  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const sortedReminders = [...reminders].sort(
    (a, b) => {
      const activeA = a.completed ? 1 : 0;
      const activeB = b.completed ? 1 : 0;
      if (activeA !== activeB) return activeA - activeB;
      return a.deadline.getTime() - b.deadline.getTime();
    }
  );

  const renderReminderItem = ({ item }: { item: Reminder }) => {
    const isOverdue = item.deadline < new Date() && !item.completed;
    const formattedDate = item.deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={{
          backgroundColor: item.completed ? '#1a3a2e' : '#1f2937',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: isOverdue ? '#ef4444' : item.completed ? '#10b981' : '#3b82f6',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => handleToggleReminder(item.id)}
            style={{ paddingTop: 2 }}
          >
            {item.completed ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <Circle size={24} color="#94a3b8" />
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: item.completed ? '#94a3b8' : '#fff',
                textDecorationLine: item.completed ? 'line-through' : 'none',
                marginBottom: 6,
              }}
            >
              {item.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color={isOverdue ? '#ef4444' : '#94a3b8'} />
              <Text
                style={{
                  fontSize: 12,
                  color: isOverdue ? '#ef4444' : item.completed ? '#10b981' : '#cbd5e1',
                  fontWeight: '500',
                }}
              >
                {formattedDate}
                {isOverdue ? ' (Overdue)' : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteReminder(item.id)}
            style={{
              padding: 8,
              backgroundColor: '#334155',
              borderRadius: 6,
            }}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <FlatList
        data={sortedReminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No reminders yet</Text>
          </View>
        }
      />

      {/* Add Reminder Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3b82f6',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: '#1f2937',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#fff',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Add Reminder
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                What do you need to remember?
              </Text>
              <TextInput
                placeholder="Enter reminder..."
                placeholderTextColor="#475569"
                value={newReminder}
                onChangeText={setNewReminder}
                multiline
                style={{
                  backgroundColor: '#111827',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 8,
                  padding: 12,
                  color: '#fff',
                  minHeight: 60,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 12,
                }}
              >
                Deadline
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: '#111827',
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
                  {selectedDate.toLocaleDateString('en-US', {
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
                  value={selectedDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
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
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddReminder}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  Add Reminder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
