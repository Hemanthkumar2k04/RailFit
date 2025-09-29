import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

interface LoginScreenProps {
  onLogin: (userType: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin('custom');
    }, 1000);
  };

  const handleDemoLogin = (userType: string) => {
    setIsLoading(true);
    
    // Simulate demo login
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userType);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🚂</Text>
            <Text style={styles.logoText}>
              Rail<Text style={styles.logoAccent}>FIT</Text>
            </Text>
          </View>
        </View>

        {/* Main Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.title}>Railway Inspector Login</Text>
          <Text style={styles.subtitle}>Access RailFIT Asset Management System</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, emailError ? styles.textInputError : null]}
              placeholder="Enter your email address"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.textInput, passwordError ? styles.textInputError : null]}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Demo Accounts Section */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>DEMO ACCOUNTS</Text>
            
            {/* Admin Demo Account */}
            <TouchableOpacity
              style={styles.demoAccount}
              onPress={() => handleDemoLogin('admin')}
              disabled={isLoading}
            >
              <View style={styles.demoAccountLeft}>
                <Text style={styles.demoAccountTitle}>Admin</Text>
                <Text style={styles.demoAccountSubtitle}>System Administrator</Text>
              </View>
              <Text style={styles.clickToUse}>Click to use</Text>
            </TouchableOpacity>

            {/* Manager Demo Account */}
            <TouchableOpacity
              style={styles.demoAccount}
              onPress={() => handleDemoLogin('manager')}
              disabled={isLoading}
            >
              <View style={styles.demoAccountLeft}>
                <Text style={styles.demoAccountTitle}>Manager</Text>
                <Text style={styles.demoAccountSubtitle}>Operations Manager</Text>
              </View>
              <Text style={styles.clickToUse}>Click to use</Text>
            </TouchableOpacity>

            {/* Inspector Demo Account */}
            <TouchableOpacity
              style={styles.demoAccount}
              onPress={() => handleDemoLogin('inspector')}
              disabled={isLoading}
            >
              <View style={styles.demoAccountLeft}>
                <Text style={styles.demoAccountTitle}>Inspector</Text>
                <Text style={styles.demoAccountSubtitle}>Field Inspector</Text>
              </View>
              <Text style={styles.clickToUse}>Click to use</Text>
            </TouchableOpacity>

            {/* Demo Password Info */}
            <Text style={styles.demoPassword}>Demo password: railway123</Text>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => Alert.alert('Info', 'Registration coming soon!')}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#2563eb',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontWeight: '400',
  },
  signInButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoSection: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  demoAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  demoAccountLeft: {
    flex: 1,
  },
  demoAccountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  demoAccountSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  clickToUse: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  demoPassword: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  textInputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default LoginScreen;