import React, { useState, Suspense, lazy } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Lazy load screens for better performance
const DashboardScreen = lazy(() => import('./src/screens/ProfessionalDashboardScreen'));
const AssetsScreen = lazy(() => import('./src/screens/ProfessionalAssetsScreen'));
const InspectionsScreen = lazy(() => import('./src/screens/InspectionsScreen'));
const AnalyticsScreen = lazy(() => import('./src/screens/ProfessionalAnalyticsScreen'));
const AlertsScreen = lazy(() => import('./src/screens/ProfessionalAlertsScreen'));
const SettingsScreen = lazy(() => import('./src/screens/ProfessionalSettingsScreen'));
const LoginScreen = lazy(() => import('./src/screens/LoginScreen'));

// Import ScanScreen normally to avoid lazy loading issues with camera components
import ScanScreen from './src/screens/ScanScreen';

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

const sidebarItems: SidebarItem[] = [
  { id: '1', title: 'Dashboard', icon: 'grid-outline', screen: 'Dashboard' },
  { id: '2', title: 'Assets', icon: 'cube-outline', screen: 'Assets' },
  { id: '3', title: 'QR Scan', icon: 'qr-code-outline', screen: 'Scan' },
  { id: '4', title: 'Inspections', icon: 'search-outline', screen: 'Inspections' },
  { id: '5', title: 'Analytics', icon: 'analytics-outline', screen: 'Analytics' },
  { id: '6', title: 'Alerts', icon: 'notifications-outline', screen: 'Alerts' },
  { id: '7', title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
];

// Loading component for better UX during screen transitions
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3b82f6" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogin = (loginUserType: string) => {
    setUserType(loginUserType);
    setIsAuthenticated(true);
    setCurrentScreen('Dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('');
    setCurrentScreen('Dashboard');
  };

  const navigateToScreen = (screen: string) => {
    setCurrentScreen(screen);
    setSidebarVisible(false);
  };

  const mockNavigation = {
    navigate: (screen: string) => setCurrentScreen(screen),
    goBack: () => setCurrentScreen('Dashboard'),
    reset: () => setCurrentScreen('Dashboard'),
  };

  const renderCurrentScreen = () => {
    const screenComponents = {
      Dashboard: () => <DashboardScreen navigation={mockNavigation as any} />,
      Assets: () => <AssetsScreen />,
      Scan: () => <ScanScreen navigation={mockNavigation as any} />,
      Inspections: () => <InspectionsScreen />,
      Analytics: () => <AnalyticsScreen />,
      Alerts: () => <AlertsScreen />,
      Settings: () => <SettingsScreen />,
    };

    const ScreenComponent = screenComponents[currentScreen as keyof typeof screenComponents] || screenComponents.Dashboard;
    
    return (
      <Suspense fallback={<LoadingScreen />}>
        <ScreenComponent />
      </Suspense>
    );
  };

  const getCurrentScreenTitle = () => {
    const item = sidebarItems.find(item => item.screen === currentScreen);
    return item ? item.title : 'Dashboard';
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LoginScreen onLogin={handleLogin} />
      </Suspense>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{getCurrentScreenTitle()}</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackdrop}
            onPress={() => setSidebarVisible(false)}
          />
          
          <View style={styles.sidebar}>
            {/* Sidebar Header */}
            <View style={styles.sidebarHeader}>
              <View style={styles.logoContainer}>
                <Ionicons name="train" size={32} color="#1e40af" />
                <Text style={styles.logoText}>RailFit</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSidebarVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="#1e40af" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Railway Inspector</Text>
                <Text style={styles.userRole}>{userType}</Text>
              </View>
            </View>

            {/* Navigation Items */}
            <ScrollView style={styles.navigationContainer}>
              {sidebarItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navigationItem,
                    currentScreen === item.screen && styles.navigationItemActive
                  ]}
                  onPress={() => navigateToScreen(item.screen)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={currentScreen === item.screen ? "#1e40af" : "#6b7280"} 
                  />
                  <Text style={[
                    styles.navigationText,
                    currentScreen === item.screen && styles.navigationTextActive
                  ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sidebar Footer */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    height: 60,
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hamburgerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.75,
    maxWidth: 300,
    backgroundColor: '#ffffff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  navigationContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  navigationItemActive: {
    backgroundColor: '#eff6ff',
  },
  navigationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 16,
  },
  navigationTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 16,
  },
});