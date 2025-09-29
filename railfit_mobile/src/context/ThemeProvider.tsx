import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import context and constants
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Colors from './src/constants/Colors';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AssetsScreen from './src/screens/AssetsScreen';
import InspectionsScreen from './src/screens/InspectionsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ScanScreen from './src/screens/ScanScreen';
import InteractiveMenuDemo from './src/screens/InteractiveMenuDemo';
import OfflineInspectionsScreen from './src/screens/OfflineInspectionsScreen';
import OfflineStorageDemo from './src/screens/OfflineStorageDemo';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Assets: undefined;
  Inspections: undefined;
  Alerts: undefined;
  Analytics: undefined;
  Settings: undefined;
  Scan: undefined;
  InteractiveMenuDemo: undefined;
  OfflineInspections: undefined;
  OfflineStorageDemo: undefined;
};



const Stack = createStackNavigator<RootStackParamList>();




// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.surface} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Assets" component={AssetsScreen} />
            <Stack.Screen name="Inspections" component={InspectionsScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="InteractiveMenuDemo" component={InteractiveMenuDemo} />
            <Stack.Screen name="OfflineInspections" component={OfflineInspectionsScreen} />
            <Stack.Screen name="OfflineStorageDemo" component={OfflineStorageDemo} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}