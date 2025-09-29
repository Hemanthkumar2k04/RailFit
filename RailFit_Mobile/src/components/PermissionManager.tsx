import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RESULTS, PermissionStatus, openSettings} from 'react-native-permissions';

interface PermissionManagerProps {
  permissions: {
    camera: PermissionStatus;
    location: PermissionStatus;
    storage: PermissionStatus;
  };
  onRequestPermissions: () => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  permissions,
  onRequestPermissions,
}) => {
  const getPermissionStatusText = (status: PermissionStatus): string => {
    switch (status) {
      case RESULTS.GRANTED:
        return '✅ Granted';
      case RESULTS.DENIED:
        return '❌ Denied';
      case RESULTS.BLOCKED:
        return '🚫 Blocked';
      case RESULTS.LIMITED:
        return '⚠️ Limited';
      case RESULTS.UNAVAILABLE:
        return '⚪ Unavailable';
      default:
        return '❓ Unknown';
    }
  };

  const getPermissionStatusColor = (status: PermissionStatus): string => {
    switch (status) {
      case RESULTS.GRANTED:
        return '#10b981';
      case RESULTS.DENIED:
        return '#f59e0b';
      case RESULTS.BLOCKED:
        return '#ef4444';
      case RESULTS.LIMITED:
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const allPermissionsGranted = Object.values(permissions).every(
    status => status === RESULTS.GRANTED
  );

  const handleOpenSettings = () => {
    Alert.alert(
      'Open Settings',
      'To enable permissions, please go to your device settings and manually enable Camera, Location, and Storage permissions for RailFit.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 App Permissions</Text>
      <Text style={styles.subtitle}>
        RailFit requires the following permissions to function properly:
      </Text>

      <View style={styles.permissionsList}>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionName}>📷 Camera Access</Text>
          <Text
            style={[
              styles.permissionStatus,
              {color: getPermissionStatusColor(permissions.camera)},
            ]}>
            {getPermissionStatusText(permissions.camera)}
          </Text>
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionName}>📍 Location Access</Text>
          <Text
            style={[
              styles.permissionStatus,
              {color: getPermissionStatusColor(permissions.location)},
            ]}>
            {getPermissionStatusText(permissions.location)}
          </Text>
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionName}>📁 File Storage</Text>
          <Text
            style={[
              styles.permissionStatus,
              {color: getPermissionStatusColor(permissions.storage)},
            ]}>
            {getPermissionStatusText(permissions.storage)}
          </Text>
        </View>
      </View>

      {!allPermissionsGranted && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={onRequestPermissions}>
            <Text style={styles.requestButtonText}>
              🔄 Request Permissions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleOpenSettings}>
            <Text style={styles.settingsButtonText}>
              ⚙️ Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {allPermissionsGranted && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            🎉 All permissions granted! You can now use all RailFit features.
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Why we need these permissions:</Text>
        <Text style={styles.infoText}>
          • 📷 Camera: Take photos of railway assets for inspection
        </Text>
        <Text style={styles.infoText}>
          • 📍 Location: Tag inspections with GPS coordinates
        </Text>
        <Text style={styles.infoText}>
          • 📁 Storage: Save inspection data and upload files
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionsList: {
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  permissionName: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginBottom: 20,
  },
  successText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default PermissionManager;