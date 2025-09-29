import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  isActive?: boolean;
}

interface SharedSidebarProps {
  visible: boolean;
  onClose: () => void;
  currentScreen: string;
}

const SharedSidebar: React.FC<SharedSidebarProps> = ({ visible, onClose, currentScreen }) => {
  const navigation = useNavigation();
  const [sidebarAnimation] = useState(new Animated.Value(-width * 0.75));

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
    { id: 'assets', title: 'Assets', icon: 'inventory', screen: 'Assets' },
    { id: 'inspections', title: 'Inspections', icon: 'search', screen: 'Inspections' },
    { id: 'analytics', title: 'Analytics', icon: 'analytics', screen: 'Analytics' },
    { id: 'alerts', title: 'Alerts', icon: 'notifications', screen: 'Alerts' },
    { id: 'settings', title: 'Settings', icon: 'settings', screen: 'Settings' },
  ].map(item => ({
    ...item,
    isActive: item.screen === currentScreen
  }));

  React.useEffect(() => {
    const toValue = visible ? 0 : -width * 0.75;
    
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const navigateToScreen = (screenName: string) => {
    onClose();
    if (screenName !== currentScreen) {
      navigation.navigate(screenName as never);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sidebarOverlay}>
        <TouchableOpacity 
          style={styles.sidebarBackdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.sidebarContainer,
            { transform: [{ translateX: sidebarAnimation }] }
          ]}
        >
          {/* Sidebar Header */}
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🚄</Text>
              <Text style={styles.logoTitle}>RailFIT</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>SA</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userRole}>System Administrator</Text>
              <Text style={styles.userEmail}>admin@railfit.com</Text>
            </View>
          </View>

          {/* Navigation Items */}
          <ScrollView style={styles.sidebarContent}>
            {sidebarItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidebarItem,
                  item.isActive && styles.sidebarItemActive
                ]}
                onPress={() => navigateToScreen(item.screen)}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  color={item.isActive ? '#3b82f6' : '#6b7280'} 
                />
                <Text style={[
                  styles.sidebarItemText,
                  item.isActive && styles.sidebarItemTextActive
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    width: width * 0.75,
    backgroundColor: '#ffffff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    marginRight: 8,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: '#eff6ff',
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default SharedSidebar;