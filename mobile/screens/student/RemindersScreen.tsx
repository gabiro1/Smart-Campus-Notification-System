import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Trash2, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { 
  FadeInDown, 
  FadeOutLeft, 
  Layout, 
  withSpring, 
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { apiClient } from '../../services/apiClient';

interface Reminder {
  _id: string;
  title: string;
  deadline: string;
  completed: boolean;
  priority?: string;
  description?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 86400000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      const response = await apiClient.getReminders();
      // Adjusting to common backend response structures logic
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data)) {
        setReminders(data);
      }
    } catch (error: any) {
      console.error('Error fetching reminders:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch',
        text2: 'Could not load your reminders. Pull to refresh.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminders();
  };

  const handleAddReminder = async () => {
    if (!newReminder.trim()) {
      Toast.show({ type: 'error', text1: 'Title required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: newReminder,
        deadline: selectedDate.toISOString(),
      };
      
      const response = await apiClient.createReminder(payload);
      const created = response.data?.data || response.data;
      
      // Optimistic upate if created object is valid, else refetch
      if (created && created._id) {
        setReminders(prev => [...prev, created]);
      } else {
        fetchReminders();
      }

      setNewReminder('');
      setSelectedDate(new Date(Date.now() + 86400000)); // Reset to tomorrow
      setShowModal(false);
      Toast.show({ type: 'success', text1: 'Reminder added!' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add reminder',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReminder = async (item: Reminder) => {
    const isCompleted = item.completed;
    const newStatus = !isCompleted;

    // Optimistically update the UI
    setReminders(prev => 
      prev.map(r => r._id === item._id ? { ...r, completed: newStatus } : r)
    );

    try {
      if (newStatus) {
        await apiClient.markReminderComplete(item._id);
      } else {
        await apiClient.markReminderUncomplete(item._id);
      }
    } catch (error) {
      // Revert on failure
      setReminders(prev => 
        prev.map(r => r._id === item._id ? { ...r, completed: isCompleted } : r)
      );
      Toast.show({ type: 'error', text1: 'Failed to update reminder' });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const previousReminders = [...reminders];
    setReminders(prev => prev.filter(r => r._id !== id));

    try {
      await apiClient.deleteReminder(id);
      Toast.show({ type: 'success', text1: 'Reminder deleted' });
    } catch (error) {
      setReminders(previousReminders);
      Toast.show({ type: 'error', text1: 'Failed to delete reminder' });
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    const activeA = a.completed ? 1 : 0;
    const activeB = b.completed ? 1 : 0;
    if (activeA !== activeB) return activeA - activeB;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const SkeletonItem = () => {
    const opacity = useSharedValue(0.3);
    
    useEffect(() => {
      opacity.value = withTiming(0.7, { duration: 800, }, () => {
         opacity.value = withTiming(0.3, { duration: 800 });
      });
      // A simple loop for skeleton
      const interval = setInterval(() => {
        opacity.value = withTiming(0.7, { duration: 800 }, () => {
          opacity.value = withTiming(0.3, { duration: 800 });
        });
      }, 1600);
      return () => clearInterval(interval);
    }, []);

    const style = useAnimatedStyle(() => ({
      opacity: opacity.value
    }));

    return (
      <Animated.View style={[styles.skeletonCard, style]}>
        <View style={styles.skeletonCircle} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '50%' }]} />
        </View>
      </Animated.View>
    );
  };

  const renderReminderItem = ({ item, index }: { item: Reminder; index: number }) => {
    const deadlineDate = new Date(item.deadline);
    const isOverdue = deadlineDate < new Date() && !item.completed;
    
    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const renderRightActions = () => {
      return (
        <View style={styles.deleteActionContainer}>
          <TouchableOpacity
            style={styles.deleteActionButton}
            onPress={() => handleDeleteReminder(item._id)}
          >
            <Trash2 size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify().damping(12)}
        exiting={FadeOutLeft}
        layout={Layout.springify()}
        style={styles.cardWrapper}
      >
        <Swipeable renderRightActions={renderRightActions} overshootRight={false} containerStyle={{ borderRadius: 12 }}>
          <View style={[
            styles.card,
            {
              backgroundColor: item.completed ? '#1a3a2e' : '#1f2937',
              borderLeftColor: isOverdue ? '#ef4444' : item.completed ? '#10b981' : '#3b82f6',
            }
          ]}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => handleToggleReminder(item)}
                style={{ padding: 4 }}
              >
                {item.completed ? (
                  <Animated.View entering={Layout.springify()}>
                    <CheckCircle2 size={26} color="#10b981" />
                  </Animated.View>
                ) : (
                  <Circle size={26} color="#94a3b8" />
                )}
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardTitle,
                    item.completed && styles.cardTitleCompleted
                  ]}
                >
                  {item.title}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {isOverdue ? <AlertCircle size={14} color="#ef4444" /> : <Calendar size={14} color={item.completed ? '#10b981' : '#94a3b8'} />}
                  <Text
                    style={[
                      styles.dateText,
                      isOverdue && { color: '#ef4444' },
                      item.completed && { color: '#10b981' }
                    ]}
                  >
                    {formattedDate} {isOverdue && '(Overdue)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3, 4].map(i => <SkeletonItem key={i} />)}
        </View>
      ) : (
        <FlatList
          data={sortedReminders}
          renderItem={renderReminderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reminders to show.</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add one.</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <AnimatedTouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Plus size={28} color="#fff" />
      </AnimatedTouchableOpacity>

      {/* Add Reminder Bottom Sheet Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Reminder</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What do you need to remember?</Text>
              <TextInput
                placeholder="E.g., Final project submission"
                placeholderTextColor="#475569"
                value={newReminder}
                onChangeText={setNewReminder}
                style={styles.textInput}
                autoFocus
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>When is the deadline?</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}
              >
                <Calendar size={18} color="#3b82f6" />
                <Text style={styles.datePickerText}>
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
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddReminder}
                style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115', // Sleek dark dashboard backdrop
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 6,
  },
  cardTitleCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  dateText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  deleteActionContainer: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteActionButton: {
    backgroundColor: '#ef4444',
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0f1115',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#0f1115',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    width: '80%',
  }
});
