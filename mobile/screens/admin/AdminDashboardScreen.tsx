import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart3, TrendingUp, Users, Bell } from 'lucide-react-native';
import { apiClient } from '../../services/apiClient';

interface AdminStats {
  activeAlerts: number;
  targetedStudents: number;
  aiAccuracy: number;
  engagementRate: number;
  departmentData: Array<{
    department: string;
    events: number;
    engagement: number;
  }>;
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStats>({
    activeAlerts: 24,
    targetedStudents: 1250,
    aiAccuracy: 87,
    engagementRate: 72,
    departmentData: [
      { department: 'Computer Science', events: 8, engagement: 92 },
      { department: 'Engineering', events: 6, engagement: 78 },
      { department: 'Business', events: 5, engagement: 65 },
      { department: 'Science', events: 7, engagement: 81 },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch this from the API
      // const response = await apiClient.get('/admin/dashboard');
      // setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
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
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
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
            <BarChart3 size={28} color="#3b82f6" />
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>Dashboard</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#94a3b8' }}>System Performance Overview</Text>
        </View>

        {/* Key Metrics Grid */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <MetricCard
            icon={Bell}
            title="Active Alerts"
            value={stats.activeAlerts.toString()}
            unit="events"
            color="#3b82f6"
          />
          <MetricCard
            icon={Users}
            title="Targeted Students"
            value={stats.targetedStudents.toString()}
            unit="users"
            color="#10b981"
          />
          <MetricCard
            icon={TrendingUp}
            title="AI Accuracy"
            value={`${stats.aiAccuracy}%`}
            unit="match rate"
            color="#f97316"
          />
          <MetricCard
            icon={TrendingUp}
            title="Engagement"
            value={`${stats.engagementRate}%`}
            unit="interaction rate"
            color="#ef4444"
          />
        </View>

        {/* Department Performance */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Department Performance
          </Text>

          {stats.departmentData.map((dept, index) => (
            <View key={index} style={{ marginBottom: index < stats.departmentData.length - 1 ? 16 : 0 }}>
              {/* Department Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#e2e8f0' }}>
                  {dept.department}
                </Text>
                <Text style={{ fontSize: 13, color: '#94a3b8' }}>
                  {dept.events} events • {dept.engagement}% engaged
                </Text>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: '#334155',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${dept.engagement}%`,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
            Quick Actions
          </Text>
          <View style={{ gap: 12 }}>
            <ActionButton title="View Analytics" icon="📊" color="#3b82f6" />
            <ActionButton title="Manage Users" icon="👥" color="#10b981" />
            <ActionButton title="View Audit Logs" icon="📋" color="#f97316" />
            <ActionButton title="System Settings" icon="⚙️" color="#8b5cf6" />
          </View>
        </View>

        {/* Recent Activity */}
        <View
          style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
            Recent Activity
          </Text>

          {[
            { title: 'AI Bootcamp Event Created', time: '2 hours ago', status: 'success' },
            { title: '150 students marked interest', time: '4 hours ago', status: 'success' },
            { title: 'New user registration', time: '6 hours ago', status: 'info' },
            { title: 'Event cancelled: Workshop', time: '1 day ago', status: 'warning' },
          ].map((activity, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < 3 ? 1 : 0,
                borderBottomColor: '#334155',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    activity.status === 'success'
                      ? '#10b981'
                      : activity.status === 'warning'
                        ? '#f97316'
                        : '#3b82f6',
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#e2e8f0', fontWeight: '500' }}>
                  {activity.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {activity.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  unit,
  color,
}: {
  icon: any;
  title: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '48%',
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        borderTopWidth: 3,
        borderTopColor: color,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <Icon size={20} color={color} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 11, color: '#475569' }}>({unit})</Text>
    </View>
  );
}

function ActionButton({
  title,
  icon,
  color,
}: {
  title: string;
  icon: string;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#e2e8f0', flex: 1 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 18, color: '#94a3b8' }}>›</Text>
    </TouchableOpacity>
  );
}
