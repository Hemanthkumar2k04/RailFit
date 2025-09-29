import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const LocationScreen: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      setLocationPermission(result === RESULTS.GRANTED);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      const granted = result === RESULTS.GRANTED;
      setLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get current location.',
          [{text: 'OK'}]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = () => {
    if (!locationPermission) {
      Alert.alert(
        'Permission Required',
        'Location permission is needed to get current location.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Request Permission',
            onPress: async () => {
              const granted = await requestLocationPermission();
              if (granted) {
                getCurrentLocation();
              }
            },
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLoading(false);
        
        let errorMessage = 'Failed to get location. ';
        switch (error.code) {
          case 1:
            errorMessage += 'Location permission denied.';
            break;
          case 2:
            errorMessage += 'Location unavailable.';
            break;
          case 3:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
        }
        
        Alert.alert('Location Error', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const formatCoordinate = (coordinate: number, type: 'lat' | 'lng'): string => {
    const direction = type === 'lat' 
      ? (coordinate >= 0 ? 'N' : 'S')
      : (coordinate >= 0 ? 'E' : 'W');
    
    return `${Math.abs(coordinate).toFixed(6)}° ${direction}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const copyCoordinates = () => {
    if (!location) return;
    
    const coordinates = `${location.latitude}, ${location.longitude}`;
    // Note: In a real app, you'd use Clipboard from @react-native-clipboard/clipboard
    Alert.alert(
      'Coordinates Copied',
      `Coordinates: ${coordinates}\n\nNote: In a real app, this would be copied to clipboard.`,
      [{text: 'OK'}]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Services</Text>
      <Text style={styles.subtitle}>
        Get current GPS coordinates for precise asset location tagging
      </Text>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.locationButtonText}>📍 Get Current Location</Text>
        )}
      </TouchableOpacity>

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <Text style={styles.coordinateValue}>
              {formatCoordinate(location.latitude, 'lat')}
            </Text>
          </View>
          
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <Text style={styles.coordinateValue}>
              {formatCoordinate(location.longitude, 'lng')}
            </Text>
          </View>
          
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Accuracy:</Text>
            <Text style={styles.coordinateValue}>±{location.accuracy.toFixed(1)}m</Text>
          </View>
          
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>Timestamp:</Text>
            <Text style={styles.coordinateValue}>
              {formatTimestamp(location.timestamp)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyCoordinates}>
            <Text style={styles.copyButtonText}>📋 Copy Coordinates</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🗺️ Location Usage:</Text>
        <Text style={styles.infoText}>
          • GPS coordinates are attached to asset inspections
        </Text>
        <Text style={styles.infoText}>
          • Location helps track asset distribution
        </Text>
        <Text style={styles.infoText}>
          • Enables route optimization for maintenance
        </Text>
        <Text style={styles.infoText}>
          • Supports geofencing and proximity alerts
        </Text>
      </View>

      {!locationPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            ⚠️ Location permission is not granted. Please enable location access to use this feature.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}>
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  locationButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 56,
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 30,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  permissionContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginTop: 20,
  },
  permissionText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationScreen;