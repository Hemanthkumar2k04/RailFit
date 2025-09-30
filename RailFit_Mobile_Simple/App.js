import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Camera functionality can be added later
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Replace with your actual IP address
const API_BASE_URL = 'http://192.168.1.100:5000'; // Change this to your IP

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('admin@railfit.com');
  const [password, setPassword] = useState('railway123');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password: password,
      });

      if (response.data.access_token) {
        // Store JWT token
        await AsyncStorage.setItem('jwt_token', response.data.access_token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Error', 'Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response) {
        errorMessage = error.response.data.detail || 'Invalid credentials';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>RailFit Mobile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Default credentials:{'\n'}
          Email: admin@railfit.com{'\n'}
          Password: railway123
        </Text>
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_data');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera permission to scan QR codes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleScanQR = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      navigation.navigate('QRScanner');
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.homeContainer}>
        <Text style={styles.title}>Welcome to RailFit</Text>
        
        {userData && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>Name: {userData.name}</Text>
            <Text style={styles.userInfoText}>Email: {userData.email}</Text>
            <Text style={styles.userInfoText}>Role: {userData.role}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleScanQR}>
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const QRScannerScreen = ({ navigation }) => {
  const [scannedData, setScannedData] = useState('');
  
  const simulateQRScan = () => {
    const mockData = `QR_${Date.now()}`;
    setScannedData(mockData);
    Alert.alert(
      'QR Code Scanned (Simulated)',
      `Data: ${mockData}`,
      [
        { text: 'Scan Another', onPress: () => setScannedData('') },
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.scannerContainer}>
      <View style={styles.mockCameraContainer}>
        <Text style={styles.mockCameraText}>📷</Text>
        <Text style={styles.scannerText}>
          QR Scanner Placeholder
        </Text>
        <Text style={styles.scannerSubtext}>
          Camera functionality will be added later
        </Text>
        
        {scannedData ? (
          <View style={styles.resultContainer}>
            <Text style={styles.title}>Last Scanned Data:</Text>
            <Text style={styles.scannedData}>{scannedData}</Text>
          </View>
        ) : null}
        
        <TouchableOpacity
          style={styles.button}
          onPress={simulateQRScan}
        >
          <Text style={styles.buttonText}>Simulate QR Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{ 
            title: 'Scan QR Code',
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mockCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mockCameraText: {
    fontSize: 80,
    marginBottom: 20,
  },
  scannerText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  scannerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scannedData: {
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default App;