import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/apiClient';
import { Star, Heart } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  targetSchool: string;
  targetDept: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  aiMatchScore?: number;
  ratings?: any[];
}

export default function FeedScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadEvents = useCallback(async (pageNum = 1) => {
    try {
      const response = await apiClient.getEventFeed(pageNum);
      if (pageNum === 1) {
        setEvents(response.data.events || []);
      } else {
        setEvents((prev) => [...prev, ...(response.data.events || [])]);
      }
      setHasMore(response.data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading events:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load events',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents(1);
    }, [loadEvents])
  );

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
  }, [events]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadEvents(1);
  }, [loadEvents]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadEvents(page + 1);
    }
  };

  const handleInterest = async (eventId: string) => {
    try {
      await apiClient.addEventInterest(eventId);
      Toast.show({
        type: 'success',
        text1: 'Marked as interested',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error marking interest',
      });
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const matchScore = Math.round(item.aiMatchScore || 0);
    const eventDate = new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#1f2937',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor:
            matchScore >= 80
              ? '#10b981'
              : matchScore >= 60
                ? '#3b82f6'
                : '#ef9310',
        }}
      >
        {/* Match Badge */}
        {matchScore > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
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

        {/* Title */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#fff',
            marginBottom: 8,
            marginRight: 80,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 13,
            color: '#cbd5e1',
            lineHeight: 18,
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {item.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: '#334155',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#e2e8f0', fontSize: 11 }}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer Info */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: '#334155',
            paddingTop: 12,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
              {eventDate}
            </Text>
            <Text style={{ fontSize: 12, color: '#cbd5e1', fontWeight: '500' }}>
              {item.targetDept || 'General'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleInterest(item._id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#3b82f6',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Heart size={14} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '500' }}>
              Interested
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <FlatList
        data={sortedEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No events available</Text>
          </View>
        }
      />
    </View>
  );
}
