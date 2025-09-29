import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  requestMultiple,
  openSettings,
  PermissionStatus,
} from 'react-native-permissions';

import PermissionManager from './src/components/PermissionManager';
import CameraScreen from './src/screens/CameraScreen';
import FileUploadScreen from './src/screens/FileUploadScreen';
import LocationScreen from './src/screens/LocationScreen';

interface PermissionsState {
  camera: PermissionStatus;
  location: PermissionStatus;
  storage: PermissionStatus;
}

const App = (): React.JSX.Element => {
  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: RESULTS.UNAVAILABLE,
    location: RESULTS.UNAVAILABLE,
    storage: RESULTS.UNAVAILABLE,
  });
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');

  const requestPermissions = async () => {
    try {
      const permissionsToRequest = Platform.select({
        android: [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ],
        ios: [
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
        ],
      });

      if (permissionsToRequest) {
        const result = await requestMultiple(permissionsToRequest);
        
        const newPermissions: PermissionsState = {
          camera: Platform.select({
            android: result[PERMISSIONS.ANDROID.CAMERA],
            ios: result[PERMISSIONS.IOS.CAMERA],
          }) || RESULTS.UNAVAILABLE,
          location: Platform.select({
            android: result[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
            ios: result[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
          }) || RESULTS.UNAVAILABLE,
          storage: Platform.select({
            android: result[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
            ios: result[PERMISSIONS.IOS.PHOTO_LIBRARY],
          }) || RESULTS.UNAVAILABLE,
        };

        setPermissions(newPermissions);
        
        const allGranted = Object.values(newPermissions).every(
          status => status === RESULTS.GRANTED
        );
        
        setAllPermissionsGranted(allGranted);
        
        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'RailFit needs camera, location, and storage permissions to function properly. Please grant all permissions.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: openSettings},
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'camera':
        return <CameraScreen />;
      case 'upload':
        return <FileUploadScreen />;
      case 'location':
        return <LocationScreen />;
      default:
        return (
          <View style={styles.container}>
            <Text style={styles.title}>🚂 RailFit Mobile</Text>
            <Text style={styles.subtitle}>Railway Asset Management System</Text>
            
            <PermissionManager 
              permissions={permissions}
              onRequestPermissions={requestPermissions}
            />
            
            {allPermissionsGranted && (
              <View style={styles.actionContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCurrentScreen('camera')}>
                  <Text style={styles.actionButtonText}>📷 Inspect Asset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCurrentScreen('upload')}>
                  <Text style={styles.actionButtonText}>📁 Upload Files</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCurrentScreen('location')}>
                  <Text style={styles.actionButtonText}>📍 Current Location</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        {renderScreen()}
        
        {currentScreen !== 'home' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  actionContainer: {
    marginTop: 30,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#64748b',
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;