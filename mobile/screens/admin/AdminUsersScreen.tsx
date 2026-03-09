import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Shield, User, Mail } from 'lucide-react-native';
import { apiClient } from '../../services/apiClient';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  department: string;
  level: string;
  status: 'active' | 'inactive';
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserItem[]>([
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@university.edu',
      role: 'student',
      school: 'School of Technology',
      department: 'Computer Science',
      level: '300',
      status: 'active',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@university.edu',
      role: 'lecturer',
      school: 'School of Technology',
      department: 'Computer Science',
      level: '',
      status: 'active',
    },
    {
      _id: '3',
      name: 'Dr. Ahmed Hassan',
      email: 'ahmed@university.edu',
      role: 'hod',
      school: 'School of Science',
      department: 'Physics',
      level: '',
      status: 'active',
    },
    {
      _id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@university.edu',
      role: 'student',
      school: 'School of Business',
      department: 'Business Admin',
      level: '200',
      status: 'inactive',
    },
    {
      _id: '5',
      name: 'Mike Johnson',
      email: 'mike@university.edu',
      role: 'guild_president',
      school: 'School of Arts',
      department: 'English Literature',
      level: '',
      status: 'active',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from the API
      // const response = await apiClient.get('/admin/users');
      // setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsers();
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterRole === 'all' || user.role === filterRole)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'hod':
        return '#8b5cf6';
      case 'lecturer':
        return '#3b82f6';
      case 'guild_president':
        return '#f97316';
      default:
        return '#10b981';
    }
  };

  const renderUserCard = ({ item }: { item: UserItem }) => (
    <View
      style={{
        backgroundColor: item.status === 'active' ? '#1f2937' : '#2d1f1f',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: item.status === 'active' ? '#10b981' : '#ef4444',
        opacity: item.status === 'active' ? 1 : 0.6,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          {/* Avatar */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: getRoleBadgeColor(item.role),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>
              {item.name.charAt(0)}
            </Text>
          </View>

          {/* User Info */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 }}>
              {item.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Mail size={12} color="#94a3b8" />
              <Text style={{ fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={{
            backgroundColor: item.status === 'active' ? '#10b981' : '#ef4444',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 8,
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
            {item.status}
          </Text>
        </View>
      </View>

      {/* Role & Department */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#334155',
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
            <View
              style={{
                backgroundColor: getRoleBadgeColor(item.role),
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
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
                {item.role.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>
            {item.department} • {item.level ? `Year ${item.level}` : 'Staff'}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '500' }}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleStats = () => {
    const stats = {
      student: users.filter((u) => u.role === 'student').length,
      lecturer: users.filter((u) => u.role === 'lecturer').length,
      hod: users.filter((u) => u.role === 'hod').length,
      guild_president: users.filter((u) => u.role === 'guild_president').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
    return stats;
  };

  const roleStats = getRoleStats();

  if (isLoading && users.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      {/* Header with Stats */}
      <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={24} color="#3b82f6" />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff' }}>
              User Management
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#94a3b8' }}>
            Total {users.length} users
          </Text>
        </View>

        {/* Role Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Students', count: roleStats.student, color: '#10b981' },
            { label: 'Lecturers', count: roleStats.lecturer, color: '#3b82f6' },
            { label: 'HODs', count: roleStats.hod, color: '#8b5cf6' },
            { label: 'Guild Pres.', count: roleStats.guild_president, color: '#f97316' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: '#1f2937',
                borderRadius: 8,
                padding: 10,
                borderTopWidth: 2,
                borderTopColor: stat.color,
              }}
            >
              <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: stat.color }}>
                {stat.count}
              </Text>
            </View>
          ))}
        </View>

        {/* Search & Filter */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1f2937',
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#334155',
            marginBottom: 12,
          }}
        >
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              color: '#fff',
              fontSize: 14,
              paddingVertical: 10,
            }}
          />
        </View>

        {/* Role Filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {['all', 'student', 'lecturer', 'hod'].map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setFilterRole(role)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filterRole === role ? '#3b82f6' : '#1f2937',
                borderWidth: 1,
                borderColor: filterRole === role ? '#3b82f6' : '#334155',
              }}
            >
              <Text
                style={{
                  color: filterRole === role ? '#fff' : '#cbd5e1',
                  fontSize: 12,
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                {role === 'all' ? 'All' : role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}
