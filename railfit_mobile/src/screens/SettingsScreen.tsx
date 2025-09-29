import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import SharedSidebar from '../components/SharedSidebar';
import { useSidebar } from '../hooks/useSidebar';

interface User {
  name: string;
  email: string;
  department: string;
  role: string;
  employeeId: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  criticalAlerts: boolean;
  maintenanceReminders: boolean;
  inspectionDue: boolean;
  systemUpdates: boolean;
}

interface AppSettings {
  darkMode: boolean;
  autoSync: boolean;
  offlineMode: boolean;
  biometricAuth: boolean;
  dataUsageOptimization: boolean;
}

export default function SettingsScreen() {
  const { user: authUser, logout } = useAuth();
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const [userProfile] = useState<User>({
    name: 'John Smith',
    email: 'john.smith@railfit.com',
    department: 'Operations',
    role: 'Senior Inspector',
    employeeId: 'EMP-001234',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    criticalAlerts: true,
    maintenanceReminders: true,
    inspectionDue: true,
    systemUpdates: false,
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    darkMode: false,
    autoSync: true,
    offlineMode: false,
    biometricAuth: true,
    dataUsageOptimization: true,
  });

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAppSetting = (key: keyof AppSettings, value: boolean) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Success', 'You have been signed out');
          },
        },
      ]
    );
  };

  const getSettingEmoji = (icon: string) => {
    switch (icon) {
      case 'notifications': return '🔔';
      case 'settings': return '⚙️';
      case 'shield': return '🛡️';
      case 'help-circle': return '❓';
      case 'information-circle': return 'ℹ️';
      case 'log-out': return '🚪';
      case 'person': return '👤';
      case 'close': return '✕';
      default: return '⚙️';
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Simulate password change
    Alert.alert('Success', 'Password changed successfully');
    setChangePasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your data for backup or analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data export initiated. You will receive an email when ready.');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightComponent,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.settingIconText}>{getSettingEmoji(icon)}</Text>
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showChevron && onPress && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const ToggleItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <SettingItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      showChevron={false}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
          thumbColor={value ? '#2563eb' : '#9ca3af'}
        />
      }
    />
  );

  const ProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={profileModalVisible}
      onRequestClose={() => setProfileModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile Information</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userProfile.name.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.profileInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{userProfile.name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userProfile.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{userProfile.department}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>{userProfile.role}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Employee ID</Text>
                  <Text style={styles.infoValue}>{userProfile.employeeId}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const ChangePasswordModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={changePasswordModalVisible}
      onRequestClose={() => setChangePasswordModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setChangePasswordModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Change Password</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your RailFit experience</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="person"
              title={userProfile.name}
              subtitle={`${userProfile.role} • ${userProfile.department}`}
              onPress={() => setProfileModalVisible(true)}
            />
            <SettingItem
              icon="key"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => setChangePasswordModalVisible(true)}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsGroup}>
            <ToggleItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive push notifications on this device"
              value={notificationSettings.pushNotifications}
              onValueChange={(value) => updateNotificationSetting('pushNotifications', value)}
            />
            <ToggleItem
              icon="warning"
              title="Critical Alerts"
              subtitle="High priority safety and system alerts"
              value={notificationSettings.criticalAlerts}
              onValueChange={(value) => updateNotificationSetting('criticalAlerts', value)}
            />
            <ToggleItem
              icon="construct"
              title="Maintenance Reminders"
              subtitle="Scheduled maintenance notifications"
              value={notificationSettings.maintenanceReminders}
              onValueChange={(value) => updateNotificationSetting('maintenanceReminders', value)}
            />
            <ToggleItem
              icon="calendar"
              title="Inspection Due"
              subtitle="Upcoming inspection reminders"
              value={notificationSettings.inspectionDue}
              onValueChange={(value) => updateNotificationSetting('inspectionDue', value)}
            />
            <ToggleItem
              icon="refresh"
              title="System Updates"
              subtitle="App and system update notifications"
              value={notificationSettings.systemUpdates}
              onValueChange={(value) => updateNotificationSetting('systemUpdates', value)}
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsGroup}>
            <ToggleItem
              icon="moon"
              title="Dark Mode"
              subtitle="Use dark theme for the app"
              value={appSettings.darkMode}
              onValueChange={(value) => updateAppSetting('darkMode', value)}
            />
            <ToggleItem
              icon="sync"
              title="Auto Sync"
              subtitle="Automatically sync data when connected"
              value={appSettings.autoSync}
              onValueChange={(value) => updateAppSetting('autoSync', value)}
            />
            <ToggleItem
              icon="cloud-offline"
              title="Offline Mode"
              subtitle="Enable offline functionality"
              value={appSettings.offlineMode}
              onValueChange={(value) => updateAppSetting('offlineMode', value)}
            />
            <ToggleItem
              icon="finger-print"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face recognition"
              value={appSettings.biometricAuth}
              onValueChange={(value) => updateAppSetting('biometricAuth', value)}
            />
            <ToggleItem
              icon="cellular"
              title="Data Usage Optimization"
              subtitle="Reduce data usage on mobile networks"
              value={appSettings.dataUsageOptimization}
              onValueChange={(value) => updateAppSetting('dataUsageOptimization', value)}
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="trash"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="download"
              title="Export Data"
              subtitle="Download your data for backup"
              onPress={handleExportData}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Get help and find answers"
              onPress={() => Alert.alert('Info', 'Help section coming soon')}
            />
            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Reach out to our support team"
              onPress={() => Alert.alert('Info', 'Contact support feature coming soon')}
            />
            <SettingItem
              icon="information-circle"
              title="About RailFit"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('About', 'RailFit Mobile v1.0.0\nBuilt for railway management')}
            />
          </View>
        </View>

        {/* Sign Out Section */}
        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ProfileModal />
      <ChangePasswordModal />
      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Settings"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
    minHeight: '100%',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  changePasswordButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingIconText: {
    fontSize: 20,
    color: '#2563eb',
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  signOutIcon: {
    fontSize: 20,
    color: '#ef4444',
    marginRight: 8,
  },
});