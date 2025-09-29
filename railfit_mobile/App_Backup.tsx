import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Import screens
import DashboardScreen from './src/screens/ProfessionalDashboardScreen';
import AssetsScreen from './src/screens/ProfessionalAssetsScreen';
import InspectionsScreen from './src/screens/InspectionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OfflineInspectionsScreen from './src/screens/OfflineInspectionsScreen';
import VendorDetailScreen from './src/screens/VendorDetailScreen';
import QRAssetManagementScreen from './src/screens/QRAssetManagementScreen';

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

const sidebarItems: SidebarItem[] = [
  { id: '1', title: 'Dashboard', icon: 'grid-outline', screen: 'Dashboard' },
  { id: '2', title: 'Assets', icon: 'cube-outline', screen: 'Assets' },
  { id: '3', title: 'Inspections', icon: 'search-outline', screen: 'Inspections' },
  { id: '4', title: 'Analytics', icon: 'analytics-outline', screen: 'Analytics' },
  { id: '5', title: 'Alerts', icon: 'notifications-outline', screen: 'Alerts' },
  { id: '6', title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Render your original screens based on selection
  const handleLogin = (loginUserType: string) => {
    setUserType(loginUserType);
    setIsAuthenticated(true);
    setCurrentScreen('Menu');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('');
    setCurrentScreen('Menu');
  };

  const mockNavigation = {
    navigate: (screen: string) => setCurrentScreen(screen),
    goBack: () => setCurrentScreen('Menu'),
    reset: () => setCurrentScreen('Menu'),
  };

  const renderScreen = () => {
    console.log('Current screen:', currentScreen);
    switch (currentScreen) {
      case 'Dashboard':
        console.log('Rendering dashboard screen');
        try {
          return <DashboardScreen navigation={mockNavigation as any} />;
        } catch (error) {
          console.error('Dashboard error:', error);
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: 'red', marginBottom: 10 }}>Dashboard Error:</Text>
              <Text>{error?.toString()}</Text>
            </View>
          );
        }
      case 'Assets':
        return <AssetsScreen />;
      case 'Scan':
        return <ScanScreen />;
      case 'Inspections':
        return <InspectionsScreen />;
      case 'Alerts':
        return <AlertsScreen />;
      case 'Profile':
        return <ProfileScreen title="Profile" onMenuPress={() => setCurrentScreen('Menu')} />;
      case 'Settings':
        return <SettingsScreen />;
      case 'Register':
        return <RegisterScreen navigation={mockNavigation as any} />;
      case 'OfflineInspections':
        return <OfflineInspectionsScreen />;
      case 'VendorDetail':
        return <VendorDetailScreen onClose={() => setCurrentScreen('Menu')} />;
      case 'WearAnalysis':
        return <AnalyticsScreen />;
      case 'MaintenanceSchedule':
        return <QRAssetManagementScreen />;
      default:
        console.log('Unknown screen:', currentScreen);
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Screen not found: {currentScreen}</Text>
          </View>
        );
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen !== 'Menu') {
    return (
      <View style={styles.fullScreen}>
        <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
        
        {/* Professional Header with Back Button */}
        <View style={styles.screenHeader}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => setCurrentScreen('Menu')}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{currentScreen}</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <SafeAreaView style={styles.screenContent}>
          {renderScreen()}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appTitle}>RailFIT</Text>
              <Text style={styles.appSubtitle}>Railway Asset Management System</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {userType && (
            <View style={styles.userInfo}>
              <Text style={styles.userTypeText}>Logged in as: {userType.charAt(0).toUpperCase() + userType.slice(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerDecor} />
      </View>

      {/* Quick Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Modules</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>✓</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userType === 'admin' ? '👑' : userType === 'manager' ? '�' : '🔍'}</Text>
          <Text style={styles.statLabel}>{userType.charAt(0).toUpperCase() + userType.slice(1)}</Text>
        </View>
      </View>

      {/* Main Menu Grid */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>System Modules</Text>
        
        <View style={styles.menuGrid}>
          {[
            { name: 'Dashboard', icon: '📊', desc: 'Overview & Analytics', color: '#3b82f6' },
            { name: 'Assets', icon: '🏗️', desc: 'Asset Management', color: '#10b981' },
            { name: 'Scan', icon: '📱', desc: 'QR Code Scanner', color: '#f59e0b' },
            { name: 'Inspections', icon: '🔍', desc: 'Quality Control', color: '#8b5cf6' },
            { name: 'Alerts', icon: '🚨', desc: 'System Alerts', color: '#ef4444' },
            { name: 'Profile', icon: '👤', desc: 'User Profile', color: '#6b7280' },
            { name: 'Settings', icon: '⚙️', desc: 'Configuration', color: '#374151' },
            { name: 'Register', icon: '📝', desc: 'User Registration', color: '#14b8a6' },
            { name: 'OfflineInspections', icon: '📴', desc: 'Offline Mode', color: '#f97316' },
            { name: 'VendorDetail', icon: '🏢', desc: 'Vendor Info', color: '#06b6d4' },
            { name: 'WearAnalysis', icon: '�', desc: 'Analytics Dashboard', color: '#84cc16' },
            { name: 'MaintenanceSchedule', icon: '�', desc: 'QR Asset Management', color: '#a855f7' }
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.moduleCard, { borderLeftColor: item.color }]}
              onPress={() => setCurrentScreen(item.name)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleIcon}>{item.icon}</Text>
                <View style={[styles.moduleStatus, { backgroundColor: item.color }]} />
              </View>
              <Text style={styles.moduleTitle}>{item.name}</Text>
              <Text style={styles.moduleDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 75,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: -10,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 25,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  menuGrid: {
    gap: 12,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 28,
  },
  moduleStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenHeader: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 6,
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  screenTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 80,
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  userTypeText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '500',
  },
});