import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InteractiveMenu, { InteractiveMenuItem } from '../components/ui/InteractiveMenu';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

// Custom menu items for railway management
const railwayMenuItems: InteractiveMenuItem[] = [
  { 
    label: 'Dashboard', 
    icon: 'home',
    onPress: () => console.log('Dashboard pressed')
  },
  { 
    label: 'Assets', 
    icon: 'cube',
    onPress: () => console.log('Assets pressed')
  },
  { 
    label: 'Scan', 
    icon: 'qr-code',
    onPress: () => console.log('Scan pressed')
  },
  { 
    label: 'Reports', 
    icon: 'document-text',
    onPress: () => console.log('Reports pressed')
  },
  { 
    label: 'Settings', 
    icon: 'settings',
    onPress: () => console.log('Settings pressed')
  },
];

const inspectionMenuItems: InteractiveMenuItem[] = [
  { label: 'Schedule', icon: 'calendar' },
  { label: 'Track', icon: 'train' },
  { label: 'Safety', icon: 'shield-checkmark' },
  { label: 'Alerts', icon: 'warning' },
];

export default function InteractiveMenuDemo({ navigation }: any) {
  const handleMenuPress = (index: number, item: InteractiveMenuItem) => {
    console.log(`Menu item pressed: ${item.label} at index ${index}`);
    
    // Navigate based on selection
    switch (item.label) {
      case 'Dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'Assets':
        navigation.navigate('Assets');
        break;
      case 'Scan':
        navigation.navigate('Scan');
        break;
      case 'Settings':
        navigation.navigate('Settings');
        break;
      default:
        console.log(`Navigation for ${item.label} not implemented`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Simplified Header */}
        <View style={styles.simpleHeader}>
          <Text style={styles.simpleHeaderTitle}>Interactive Menu Demo</Text>
        </View>

        <View style={styles.content}>
          {/* Demo Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Railway Management Menu</Text>
            <Text style={styles.sectionDescription}>
              Custom menu with railway-specific icons and animations
            </Text>
            <View style={styles.menuContainer}>
              <InteractiveMenu
                items={railwayMenuItems}
                accentColor={Colors.accent}
                onItemPress={handleMenuPress}
              />
            </View>
          </View>

          {/* Demo Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Menu</Text>
            <Text style={styles.sectionDescription}>
              Compact menu for inspection workflows
            </Text>
            <View style={styles.menuContainer}>
              <InteractiveMenu
                items={inspectionMenuItems}
                accentColor={Colors.secondary}
                onItemPress={(index, item) => console.log(`Inspection: ${item.label}`)}
              />
            </View>
          </View>

          {/* Demo Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Default Menu</Text>
            <Text style={styles.sectionDescription}>
              Default configuration with primary color accent
            </Text>
            <View style={styles.menuContainer}>
              <InteractiveMenu
                accentColor={Colors.primary}
              />
            </View>
          </View>

          {/* Features List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresList}>
              <FeatureItem 
                icon="✨" 
                title="Smooth Animations" 
                description="Spring-based animations with bounce effects"
              />
              <FeatureItem 
                icon="🎯" 
                title="Interactive States" 
                description="Visual feedback with scale and color transitions"
              />
              <FeatureItem 
                icon="📱" 
                title="React Native Native" 
                description="Built specifically for React Native performance"
              />
              <FeatureItem 
                icon="🎨" 
                title="Customizable" 
                description="Custom colors, icons, and callback functions"
              />
              <FeatureItem 
                icon="📐" 
                title="Responsive" 
                description="Adapts to different screen sizes automatically"
              />
              <FeatureItem 
                icon="⚡" 
                title="Performant" 
                description="Uses native driver for 60fps animations"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string; 
}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 20,
  },
  simpleHeader: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  simpleHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerTitle: {
    ...Typography.textStyles.h1,
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.textStyles.body,
    color: Colors.surface,
    opacity: 0.8,
  },
  content: {
    padding: Spacing.base,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.textStyles.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.textStyles.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    overflow: 'hidden',
    ...Spacing.shadow.md,
    shadowColor: Colors.shadowColor,
  },
  featuresList: {
    gap: Spacing.base,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: Spacing.borderRadius.md,
    ...Spacing.shadow.sm,
    shadowColor: Colors.shadowColor,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.base,
    width: 32,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.textStyles.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.textStyles.bodySmall,
    color: Colors.textSecondary,
  },
});