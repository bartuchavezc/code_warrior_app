import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import WeightScreen from './src/screens/WeightScreen';
import { getTheme } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const isDark = false;
  const theme = getTheme(isDark);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textMuted,
            tabBarStyle: {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              height: 75,
              paddingBottom: 24,
              paddingTop: 8,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
            }
          }}
        >
          {/* Main Workout Tab */}
          <Tab.Screen
            name="Rutina"
            component={WorkoutScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="fitness-center" size={size} color={color} />
              )
            }}
          />

          {/* Progress Tab */}
          <Tab.Screen
            name="Progreso"
            component={ProgressScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="bar-chart" size={size} color={color} />
              )
            }}
          />

          {/* Weight Tab */}
          <Tab.Screen
            name="Peso"
            component={WeightScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="monitor-weight" size={size} color={color} />
              )
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
