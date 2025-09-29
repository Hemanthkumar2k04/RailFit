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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationProp } from '@react-navigation/native';

interface RegisterScreenProps {
  navigation: NavigationProp<any>;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  employeeId: string;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    employeeId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateForm = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!form.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!form.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!form.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!form.department.trim()) {
      Alert.alert('Error', 'Department is required');
      return false;
    }
    if (!form.employeeId.trim()) {
      Alert.alert('Error', 'Employee ID is required');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Account created successfully! Please wait for admin approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry = false,
    showPasswordToggle = false,
    showPassword: showPasswordProp,
    onTogglePassword,
    keyboardType = 'default',
    autoCapitalize = 'none',
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    keyboardType?: 'default' | 'email-address' | 'numeric';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, showPasswordToggle && styles.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !showPasswordProp}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={onTogglePassword}
          >
            <Ionicons
              name={showPasswordProp ? 'eye-off' : 'eye'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join RailFit Management System</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <InputField
                    label="First Name"
                    value={form.firstName}
                    onChangeText={(text) => updateForm('firstName', text)}
                    placeholder="Enter first name"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.nameInput}>
                  <InputField
                    label="Last Name"
                    value={form.lastName}
                    onChangeText={(text) => updateForm('lastName', text)}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <InputField
                label="Email Address"
                value={form.email}
                onChangeText={(text) => updateForm('email', text)}
                placeholder="Enter email address"
                keyboardType="email-address"
              />

              <InputField
                label="Department"
                value={form.department}
                onChangeText={(text) => updateForm('department', text)}
                placeholder="e.g., Operations, Maintenance, Safety"
                autoCapitalize="words"
              />

              <InputField
                label="Employee ID"
                value={form.employeeId}
                onChangeText={(text) => updateForm('employeeId', text)}
                placeholder="Enter employee ID"
              />

              <InputField
                label="Password"
                value={form.password}
                onChangeText={(text) => updateForm('password', text)}
                placeholder="Enter password"
                secureTextEntry
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <InputField
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(text) => updateForm('confirmPassword', text)}
                placeholder="Confirm password"
                secureTextEntry
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#2563eb', '#1d4ed8']}
                  style={styles.registerButtonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.registerButtonText}>Creating Account...</Text>
                  ) : (
                    <>
                      <Ionicons name="person-add" size={20} color="#ffffff" />
                      <Text style={styles.registerButtonText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLinkButton}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nameRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 8,
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
  inputWrapper: {
    position: 'relative',
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
  inputWithIcon: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  loginLinkButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});