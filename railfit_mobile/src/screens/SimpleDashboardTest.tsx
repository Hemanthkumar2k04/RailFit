import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardScreenProps {
  navigation?: any;
}

const SimpleDashboardTest: React.FC<DashboardScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🚄 RailFIT Dashboard</Text>
        <Text style={styles.subtitle}>Railway Asset Management System</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>51</Text>
            <Text style={styles.statLabel}>Total Assets</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
        </View>
        
        <View style={styles.healthContainer}>
          <Text style={styles.sectionTitle}>Asset Health Overview</Text>
          <View style={styles.healthBar}>
            <View style={[styles.healthSegment, { backgroundColor: '#10b981', flex: 0.6 }]} />
            <View style={[styles.healthSegment, { backgroundColor: '#f59e0b', flex: 0.3 }]} />
            <View style={[styles.healthSegment, { backgroundColor: '#ef4444', flex: 0.1 }]} />
          </View>
          <View style={styles.healthLabels}>
            <Text style={styles.healthLabel}>✅ Good (60%)</Text>
            <Text style={styles.healthLabel}>⚠️ Warning (30%)</Text>
            <Text style={styles.healthLabel}>🚨 Critical (10%)</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  healthContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  healthBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  healthSegment: {
    height: '100%',
  },
  healthLabels: {
    gap: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default SimpleDashboardTest;