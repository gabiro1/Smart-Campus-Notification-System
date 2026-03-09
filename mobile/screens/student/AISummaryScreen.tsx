import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/apiClient';
import { Sparkles, AlertCircle, Zap } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface SummaryItem {
  category: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  eventCount: number;
}

export default function AISummaryScreen() {
  const [summaries, setSummaries] = useState<SummaryItem[]>([
    {
      category: 'Technology Events',
      summary:
        'Multiple tech workshops and conferences happening this week. Focus on AI/ML bootcamp starting Thursday with hands-on project work.',
      priority: 'high',
      eventCount: 5,
    },
    {
      category: 'Sports & Recreation',
      summary: 'Football tournament registration closes today. Basketball games scheduled for the weekend.',
      priority: 'medium',
      eventCount: 3,
    },
    {
      category: 'Academic',
      summary:
        'Departmental seminars on cloud computing and cybersecurity. Registration required for both.',
      priority: 'medium',
      eventCount: 4,
    },
    {
      category: 'Leadership & Career',
      summary: 'Internship fair next week with 20+ companies. Resume review sessions available daily.',
      priority: 'high',
      eventCount: 6,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadSummaries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAIInsights();
      setSummaries(response.data.summaries || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading summaries:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load AI summaries',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSummaries();
    }, [loadSummaries])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSummaries();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f97316';
      case 'low':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Important';
      case 'low':
        return 'Normal';
      default:
        return 'Info';
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111827' }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
        />
      }
    >
      <View style={{ padding: 16, paddingTop: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Sparkles size={24} color="#3b82f6" />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>
              Your AI Summary
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              color: '#94a3b8',
              marginLeft: 32,
              marginTop: -4,
            }}
          >
            Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: '#1a2d4d',
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <AlertCircle size={20} color="#3b82f6" />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                color: '#3b82f6',
                fontWeight: '600',
                marginBottom: 4,
              }}
            >
              AI-Powered Insights
            </Text>
            <Text style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 18 }}>
              Our AI analyzes all events and creates personalized 1-minute summaries based on your interests.
            </Text>
          </View>
        </View>

        {/* Summary Items */}
        {summaries.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#1f2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderTopWidth: 3,
              borderTopColor: getPriorityColor(item.priority),
            }}
          >
            {/* Category Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#fff',
                  flex: 1,
                }}
              >
                {item.category}
              </Text>
              <View
                style={{
                  backgroundColor: getPriorityColor(item.priority),
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Zap size={12} color="#fff" fill="#fff" />
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                  {getPriorityLabel(item.priority)}
                </Text>
              </View>
            </View>

            {/* Summary Text */}
            <Text
              style={{
                fontSize: 13,
                color: '#cbd5e1',
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              {item.summary}
            </Text>

            {/* Event Count */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#334155',
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#334155',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600' }}>
                  {item.eventCount}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                event{item.eventCount !== 1 ? 's' : ''} related
              </Text>
            </View>
          </View>
        ))}

        {/* Regenerate Button */}
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#3b82f6',
            alignItems: 'center',
            marginBottom: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} color="#3b82f6" />
          <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '600' }}>
            Regenerate Summary
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
