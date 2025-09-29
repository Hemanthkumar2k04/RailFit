import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AppHeaderProps {
  title: string;
  onMenuPress: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onMenuPress,
  showBackButton = false,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Icon name="menu" size={24} color="#1f2937" />
        <Text style={styles.menuButtonText}>Menu</Text>
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.headerLogo}>🚄</Text>
          <Text style={styles.headerTitle}>RailFIT</Text>
        </View>
        
        <View style={styles.userSection}>
          <View style={styles.headerUserAvatar}>
            <Text style={styles.headerUserAvatarText}>SA</Text>
          </View>
          <View>
            <Text style={styles.headerUserRole}>System Administrator</Text>
            <Text style={styles.headerUserEmail}>admin@railfit.com</Text>
          </View>
        </View>
      </View>

      {/* Page Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerUserAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerUserRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerUserEmail: {
    fontSize: 10,
    color: '#6b7280',
  },
  titleContainer: {
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});

export default AppHeader;