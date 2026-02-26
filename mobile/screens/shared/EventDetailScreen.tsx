import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/apiClient';
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Heart,
  Share2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../stores/authStore';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  targetSchool: string;
  targetDept: string;
  targetLevel?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  aiMatchScore?: number;
  ratings?: any[];
  createdBy: {
    name: string;
    role: string;
  };
}

export default function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { user } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      loadEventDetail();
    }, [eventId])
  );

  const loadEventDetail = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getEventDetail(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load event details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateEvent = async (rating: number) => {
    setIsSubmitting(true);
    try {
      await apiClient.rateEvent(eventId, rating);
      setUserRating(rating);
      Toast.show({
        type: 'success',
        text1: 'Rating Submitted',
        text2: 'Thank you for your feedback!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit rating',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInterest = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.addEventInterest(eventId);
      Toast.show({
        type: 'success',
        text1: 'Interest Recorded',
        text2: 'You will receive updates about this event',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark interest',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event?.title}\n\n${event?.description}`,
        title: event?.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <Text style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center' }}>
          Event not found
        </Text>
      </View>
    );
  }

  const eventDate = new Date(event.date);
  const matchScore = Math.round(event.aiMatchScore || 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111827' }}>
      <View style={{ padding: 16, paddingBottom: 32 }}>
        {/* Header Card */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor:
              matchScore >= 80
                ? '#10b981'
                : matchScore >= 60
                  ? '#3b82f6'
                  : '#ef9310',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 }}>
                {event.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View
                  style={{
                    backgroundColor:
                      event.priority === 'high'
                        ? '#ef4444'
                        : event.priority === 'medium'
                          ? '#f97316'
                          : '#3b82f6',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {event.priority} Priority
                  </Text>
                </View>
                {matchScore > 0 && (
                  <View
                    style={{
                      backgroundColor: '#3b82f6',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                      {matchScore}% Match
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                padding: 8,
                backgroundColor: '#334155',
                borderRadius: 8,
              }}
            >
              <Share2 size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
            About This Event
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#cbd5e1',
              lineHeight: 22,
            }}
          >
            {event.description}
          </Text>
        </View>

        {/* Event Details */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Event Details
          </Text>

          <DetailRow
            icon={Calendar}
            label="Date & Time"
            value={eventDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />

          <DetailRow icon={Users} label="Department" value={event.targetDept || 'General'} />

          <DetailRow icon={MapPin} label="School" value={event.targetSchool} />
        </View>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
              Topics
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {event.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: '#334155',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: '#e2e8f0', fontSize: 12 }}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Organizer */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
            Organized By
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>
                {event.createdBy.name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                {event.createdBy.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {event.createdBy.role.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        {user?.role === 'student' && (
          <View
            style={{
              backgroundColor: '#1f2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
              Rate This Event
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleRateEvent(rating)}
                  disabled={isSubmitting}
                >
                  <Star
                    size={32}
                    color={rating <= userRating ? '#fbbf24' : '#475569'}
                    fill={rating <= userRating ? '#fbbf24' : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {userRating > 0 && (
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                You rated this event {userRating} star{userRating > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={handleAddInterest}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#3b82f6',
              paddingVertical: 14,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Heart size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  Mark as Interested
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}
    >
      <Icon size={20} color="#3b82f6" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#e2e8f0', fontWeight: '500' }}>{value}</Text>
      </View>
    </View>
  );
}
