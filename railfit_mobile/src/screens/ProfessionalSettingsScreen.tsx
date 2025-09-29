import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle' | 'value' | 'action';
  value?: boolean | string | number;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  badge?: string | number;
}

const SettingsScreen: React.FC = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlertSounds, setCriticalAlertSounds] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingSections = [
    {
      title: 'Account & Profile',
      icon: 'person-outline',
      items: [
        {
          id: 'profile',
          icon: 'person-circle-outline',
          title: 'Personal Information',
          subtitle: 'Update your profile details',
          type: 'navigate',
          onPress: () => Alert.alert('Profile', 'Navigate to profile settings'),
        },
        {
          id: 'organization',
          icon: 'business-outline',
          title: 'Organization Settings',
          subtitle: 'Railway Authority - Central Division',
          type: 'navigate',
          onPress: () => Alert.alert('Organization', 'Navigate to organization settings'),
        },
        {
          id: 'permissions',
          icon: 'key-outline',
          title: 'Role & Permissions',
          subtitle: 'Inspector Level 2',
          type: 'navigate',
          badge: 'Admin',
          onPress: () => Alert.alert('Permissions', 'Navigate to permissions'),
        },
      ] as SettingItem[]
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        {
          id: 'push',
          icon: 'phone-portrait-outline',
          title: 'Push Notifications',
          subtitle: 'Receive alerts on your device',
          type: 'toggle',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          id: 'email',
          icon: 'mail-outline',
          title: 'Email Notifications',
          subtitle: 'Get updates via email',
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          id: 'sounds',
          icon: 'volume-high-outline',
          title: 'Critical Alert Sounds',
          subtitle: 'Audio alerts for critical issues',
          type: 'toggle',
          value: criticalAlertSounds,
          onToggle: setCriticalAlertSounds,
        },
        {
          id: 'frequency',
          icon: 'time-outline',
          title: 'Notification Frequency',
          subtitle: 'Real-time',
          type: 'navigate',
          onPress: () => Alert.alert('Frequency', 'Configure notification frequency'),
        },
      ] as SettingItem[]
    },
    {
      title: 'System & Data',
      icon: 'settings-outline',
      items: [
        {
          id: 'sync',
          icon: 'sync-outline',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data when online',
          type: 'toggle',
          value: autoSync,
          onToggle: setAutoSync,
        },
        {
          id: 'offline',
          icon: 'cloud-offline-outline',
          title: 'Offline Mode',
          subtitle: 'Enable offline functionality',
          type: 'toggle',
          value: offlineMode,
          onToggle: setOfflineMode,
        },
        {
          id: 'storage',
          icon: 'archive-outline',
          title: 'Storage Management',
          subtitle: '2.4 GB used of 5 GB',
          type: 'navigate',
          onPress: () => Alert.alert('Storage', 'Manage app storage'),
        },
        {
          id: 'backup',
          icon: 'cloud-upload-outline',
          title: 'Data Backup',
          subtitle: 'Last backup: 2 hours ago',
          type: 'navigate',
          onPress: () => Alert.alert('Backup', 'Configure data backup'),
        },
      ] as SettingItem[]
    },
    {
      title: 'Security & Privacy',
      icon: 'shield-checkmark-outline',
      items: [
        {
          id: 'biometric',
          icon: 'finger-print-outline',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face unlock',
          type: 'toggle',
          value: biometricAuth,
          onToggle: setBiometricAuth,
        },
        {
          id: 'password',
          icon: 'lock-closed-outline',
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'navigate',
          onPress: () => Alert.alert('Password', 'Change password'),
        },
        {
          id: 'sessions',
          icon: 'phone-portrait-outline',
          title: 'Active Sessions',
          subtitle: '3 active devices',
          type: 'navigate',
          badge: 3,
          onPress: () => Alert.alert('Sessions', 'Manage active sessions'),
        },
        {
          id: 'privacy',
          icon: 'eye-off-outline',
          title: 'Privacy Settings',
          subtitle: 'Data sharing preferences',
          type: 'navigate',
          onPress: () => Alert.alert('Privacy', 'Configure privacy settings'),
        },
      ] as SettingItem[]
    },
    {
      title: 'Appearance',
      icon: 'color-palette-outline',
      items: [
        {
          id: 'theme',
          icon: 'contrast-outline',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'language',
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'English (US)',
          type: 'navigate',
          onPress: () => Alert.alert('Language', 'Select language'),
        },
        {
          id: 'font',
          icon: 'text-outline',
          title: 'Font Size',
          subtitle: 'Medium',
          type: 'navigate',
          onPress: () => Alert.alert('Font', 'Adjust font size'),
        },
      ] as SettingItem[]
    },
    {
      title: 'Support & About',
      icon: 'help-circle-outline',
      items: [
        {
          id: 'help',
          icon: 'help-outline',
          title: 'Help Center',
          subtitle: 'Get support and documentation',
          type: 'navigate',
          onPress: () => Alert.alert('Help', 'Open help center'),
        },
        {
          id: 'feedback',
          icon: 'chatbubble-outline',
          title: 'Send Feedback',
          subtitle: 'Share your thoughts with us',
          type: 'navigate',
          onPress: () => Alert.alert('Feedback', 'Send feedback'),
        },
        {
          id: 'version',
          icon: 'information-circle-outline',
          title: 'App Version',
          subtitle: 'RailFit Mobile v2.1.0',
          type: 'value',
        },
        {
          id: 'terms',
          icon: 'document-text-outline',
          title: 'Terms & Privacy',
          subtitle: 'Legal information',
          type: 'navigate',
          onPress: () => Alert.alert('Terms', 'View terms and privacy policy'),
        },
      ] as SettingItem[]
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const getItemColor = () => {
      if (item.color) return item.color;
      if (item.id === 'logout') return '#ef4444';
      return '#6b7280';
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.type === 'action' && item.id === 'logout' && styles.dangerItem
        ]}
        onPress={item.onPress}
        disabled={item.type === 'value'}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${getItemColor()}15` }]}>
            <Ionicons name={item.icon as any} size={20} color={getItemColor()} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              item.id === 'logout' && styles.dangerText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={item.value ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#d1d5db"
            />
          )}
          
          {(item.type === 'navigate' || item.type === 'value') && (
            <Ionicons 
              name={item.type === 'navigate' ? "chevron-forward" : "information-circle-outline"} 
              size={16} 
              color="#9ca3af" 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: `#3b82f615` }]}>
            <Ionicons name={section.icon as any} size={18} color="#3b82f6" />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            Alert.alert('Signed Out', 'You have been signed out successfully');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your app experience{'\n'}and manage preferences
            </Text>
          </View>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>JD</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@railwayauthority.gov</Text>
              <View style={styles.profileBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                <Text style={styles.profileBadgeText}>Inspector Level 2</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        <View style={styles.sectionsContainer}>
          {settingSections.map(renderSection)}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleLogout}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#ef444415' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>
                    Sign Out
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            RailFit Mobile v2.1.0 • Build 2024.01.15
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 Railway Authority. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    fontWeight: '400',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dangerItem: {
    borderBottomColor: 'transparent',
  },
  dangerText: {
    color: '#ef4444',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '400',
  },
});

export default SettingsScreen;