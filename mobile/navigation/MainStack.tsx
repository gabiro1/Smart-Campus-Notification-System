import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';

// Screens
import FeedScreen from '../screens/student/FeedScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import RemindersScreen from '../screens/student/RemindersScreen';
import AISummaryScreen from '../screens/student/AISummaryScreen';
import DepartmentsScreen from '../screens/student/DepartmentsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCreateEventScreen from '../screens/admin/AdminCreateEventScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import EventDetailScreen from '../screens/shared/EventDetailScreen';

// Icons
import { Home, User, Clock, Sparkles, Building2, BarChart3 } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Event Feed',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="AISummary"
        component={AISummaryScreen}
        options={{
          title: 'AI Summary',
          tabBarIcon: ({ color }) => <Sparkles color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Departments"
        component={DepartmentsScreen}
        options={{
          title: 'Departments',
          tabBarIcon: ({ color }) => <Building2 color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="AdminCreateEvent"
        component={AdminCreateEventScreen}
        options={{
          title: 'Create Event',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'guild_president';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAdmin ? (
        <Stack.Screen
          name="AdminRoot"
          component={AdminTabs}
          options={{ animationEnabled: false }}
        />
      ) : (
        <Stack.Screen
          name="StudentRoot"
          component={StudentTabs}
          options={{ animationEnabled: false }}
        />
      )}
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerShown: true,
          title: 'Event Details',
          headerStyle: {
            backgroundColor: '#111827',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
}
