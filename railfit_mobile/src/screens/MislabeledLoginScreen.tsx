import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

const demoAccounts = [
  {
    role: 'Admin',
    description: 'System Administrator',
    email: 'admin@railways.com',
    password: 'railway123',
    color: Colors.error,
  },
  {
    role: 'Manager',
    description: 'Operations Manager',
    email: 'manager@railways.com',
    password: 'railway123',
    color: Colors.warning,
  },
  {
    role: 'Inspector',
    description: 'Field Inspector',
    email: 'inspector@railways.com',
    password: 'railway123',
    color: Colors.primary,
  },
];

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLoginError('Please enter a valid email address');
      return;
    }

    setLoginError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        // Navigation will happen automatically due to auth state change
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setLoginError('');
    
    try {
      const success = await login(account.email, account.password);
      if (success) {
        Alert.alert('Demo Login', `Logged in as ${account.role}`);
      } else {
        setLoginError('Demo login failed');
      }
    } catch (error) {
      setLoginError('Demo login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Clean Header */}
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🚂</Text>
              </View>
              <Text style={styles.brandText}>RailFit</Text>
              <Text style={styles.taglineText}>Railway Management System</Text>
            </View>

            {/* Demo Accounts - Clean Design */}
            <View style={styles.demoSection}>
              <Text style={styles.sectionTitle}>Demo Accounts</Text>
              
              {demoAccounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.demoCard}
                  onPress={() => handleDemoLogin(account)}
                  activeOpacity={0.7}
                >
                  <View style={styles.demoContent}>
                    <View style={styles.demoInfo}>
                      <Text style={styles.demoRole}>{account.role}</Text>
                      <Text style={styles.demoEmail}>{account.email}</Text>
                    </View>
                    <View style={styles.demoArrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clean Login Form */}
            <View style={styles.loginContainer}>
              <Text style={styles.formTitle}>Sign In</Text>
              
              {loginError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Footer Links */}
              <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>
                
                <View style={styles.registerContainer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  
  // Clean Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  taglineText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },

  // Demo Section - Clean
  demoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  demoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  demoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  demoInfo: {
    flex: 1,
  },
  demoRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  demoEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  demoArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#475569',
  },

  // Clean Login Form
  loginContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Error Container
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Clean Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 64,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  eyeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Clean Button
  loginButton: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  forgotPassword: {
    marginBottom: 16,
  },
  linkText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
});