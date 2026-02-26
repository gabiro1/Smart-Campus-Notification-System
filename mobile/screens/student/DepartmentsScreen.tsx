import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';

interface Department {
  id: string;
  name: string;
  school: string;
  eventCount: number;
  description: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'Computer Science',
    school: 'School of Technology',
    eventCount: 12,
    description: 'Programming, AI, Web Development',
  },
  {
    id: '2',
    name: 'Engineering',
    school: 'School of Technology',
    eventCount: 8,
    description: 'Mechanical, Electrical, Civil',
  },
  {
    id: '3',
    name: 'Business Administration',
    school: 'School of Business',
    eventCount: 6,
    description: 'Management, Finance, Entrepreneurship',
  },
  {
    id: '4',
    name: 'Biological Sciences',
    school: 'School of Science',
    eventCount: 7,
    description: 'Research, Biology, Biotechnology',
  },
  {
    id: '5',
    name: 'Physics',
    school: 'School of Science',
    eventCount: 5,
    description: 'Quantum Physics, Astronomy',
  },
  {
    id: '6',
    name: 'English Literature',
    school: 'School of Arts',
    eventCount: 9,
    description: 'Writing, Drama, Classics',
  },
];

export default function DepartmentsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepartments = DEPARTMENTS.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDepartmentCard = ({ item }: { item: Department }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetail', { departmentId: item.id })}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3b82f6',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
          {item.name.charAt(0)}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
          {item.school}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#cbd5e1',
          }}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>

      {/* Event Count & Arrow */}
      <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
        <View
          style={{
            backgroundColor: '#334155',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: '600' }}>
            {item.eventCount} events
          </Text>
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  const renderSchoolSection = ({ item: school }: { item: string }) => {
    const deptInSchool = filteredDepartments.filter((d) => d.school === school);

    if (deptInSchool.length === 0) return null;

    return (
      <View key={school} style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#3b82f6',
            marginBottom: 12,
            paddingHorizontal: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {school}
        </Text>
        {deptInSchool.map((dept) => (
          <TouchableOpacity
            key={dept.id}
            onPress={() => navigation.navigate('EventDetail', { departmentId: dept.id })}
            activeOpacity={0.7}
            style={{
              backgroundColor: '#1f2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
                {dept.name.charAt(0)}
              </Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
                {dept.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#cbd5e1',
                }}
                numberOfLines={1}
              >
                {dept.description}
              </Text>
            </View>

            {/* Event Count & Arrow */}
            <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
              <View
                style={{
                  backgroundColor: '#334155',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: '600' }}>
                  {dept.eventCount} events
                </Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const schools = Array.from(
    new Set(filteredDepartments.map((d) => d.school))
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <View style={{ padding: 16, paddingBottom: 12 }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1f2937',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search departments..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 8,
              color: '#fff',
              fontSize: 14,
            }}
          />
        </View>
      </View>

      {/* Departments List */}
      <FlatList
        data={schools}
        renderItem={renderSchoolSection}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 16 }}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No departments found</Text>
          </View>
        }
      />
    </View>
  );
}
