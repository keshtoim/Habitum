// src/navigation/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Typography } from '../theme';
import { User } from '../storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface Props {
  user: User;
  onLogout: () => void;
}

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

function HomeTabs({ user, onLogout, navigation }: { user: User; onLogout: () => void; navigation: any }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Today"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Сегодня" focused={focused} />,
        }}
      >
        {() => <HomeScreen user={user} navigation={navigation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Статистика" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji={user.avatar} label="Профиль" focused={focused} />,
        }}
      >
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, onLogout }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bgCard },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { ...Typography.h3, color: Colors.textPrimary },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {({ navigation }) => (
            <HomeTabs user={user} onLogout={onLogout} navigation={navigation} />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{
            title: 'Новая привычка',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingTop: 8,
  },
  iconWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: Colors.accentGlow,
  },
  emoji: { fontSize: 22 },
  label: { ...Typography.micro, color: Colors.textMuted, marginTop: 2 },
  labelActive: { color: Colors.accentSoft },
});
