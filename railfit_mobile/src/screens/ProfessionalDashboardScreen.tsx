import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddAssetModal from '../components/AddAssetModal';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation?: any;
}

interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color: string;
  icon: string;
  actionText?: string;
}

interface HealthDistribution {
  excellent: number;
  good: number;
  ok: number;
  critical: number;
}

interface ZoneStatus {
  name: string;
  status: 'Online' | 'Offline';
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const metricCards: MetricCardData[] = [
    {
      title: 'Total Assets',
      value: '51',
      trend: '+127 this quarter',
      color: '#3b82f6',
      icon: '🏆',
    },
    {
      title: 'Installed Assets',
      value: '51',
      subtitle: '100% Active',
      color: '#10b981',
      icon: '🟢',
    },
    {
      title: 'Maintenance Queue',
      value: '3',
      subtitle: '5.9% of fleet',
      color: '#f59e0b',
      icon: '⚠️',
    },
    {
      title: 'Critical Assets',
      value: '2',
      actionText: 'Immediate Action Required',
      color: '#ef4444',
      icon: '🔴',
    },
  ];

  const healthDistribution: HealthDistribution = {
    excellent: 12,
    good: 25,
    ok: 12,
    critical: 2,
  };

  const totalAssets = healthDistribution.excellent + healthDistribution.good + healthDistribution.ok + healthDistribution.critical;

  const zoneStatuses: ZoneStatus[] = [
    { name: 'Central Railway', status: 'Online' },
    { name: 'Western Railway', status: 'Online' },
    { name: 'Eastern Railway', status: 'Online' },
    { name: 'Southern Railway', status: 'Online' },
  ];

  const handleAddAsset = (assetData: any) => {
    Alert.alert(
      'Asset Added',
      `Asset "${assetData.assetType}" has been successfully added to the system.`,
      [{ text: 'OK' }]
    );
    // Here you would typically call an API to save the asset
    console.log('New Asset:', assetData);
  };

  const renderMetricCard = (metric: MetricCardData, index: number) => (
    <View key={index} style={[styles.metricCard, { borderLeftColor: metric.color }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{metric.title}</Text>
        <Text style={styles.metricIcon}>{metric.icon}</Text>
      </View>
      
      <Text style={styles.metricValue}>{metric.value}</Text>
      
      {metric.trend && (
        <Text style={[styles.metricTrend, { color: '#10b981' }]}>
          📈 {metric.trend}
        </Text>
      )}
      
      {metric.subtitle && (
        <View style={styles.metricSubtitleContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: metric.color }]} />
          </View>
          <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
        </View>
      )}
      
      {metric.actionText && (
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>{metric.actionText}</Text>
        </View>
      )}
    </View>
  );

  const renderHealthBar = () => {
    const excellentPercent = (healthDistribution.excellent / totalAssets) * 100;
    const goodPercent = (healthDistribution.good / totalAssets) * 100;
    const okPercent = (healthDistribution.ok / totalAssets) * 100;
    const criticalPercent = (healthDistribution.critical / totalAssets) * 100;

    return (
      <View style={styles.healthBarContainer}>
        <View style={styles.healthBar}>
          <View style={[styles.healthSegment, { 
            width: `${excellentPercent}%`, 
            backgroundColor: '#10b981' 
          }]} />
          <View style={[styles.healthSegment, { 
            width: `${goodPercent}%`, 
            backgroundColor: '#94a3b8' 
          }]} />
          <View style={[styles.healthSegment, { 
            width: `${okPercent}%`, 
            backgroundColor: '#f59e0b' 
          }]} />
          <View style={[styles.healthSegment, { 
            width: `${criticalPercent}%`, 
            backgroundColor: '#ef4444' 
          }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>RailFIT Dashboard</Text>
              <Text style={styles.headerSubtitle}>Railway Asset Management & Predictive Analytics</Text>
            </View>
            <TouchableOpacity style={styles.userAvatar}>
              <Text style={styles.avatarText}>SA</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.lastUpdated}>Last updated: {formatTime(lastUpdated)}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metric Cards */}
        <View style={styles.metricsContainer}>
          {metricCards.map((metric, index) => renderMetricCard(metric, index))}
        </View>

        {/* Asset Health Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Asset Health Distribution</Text>
          </View>
          
          {renderHealthBar()}
          
          <View style={styles.healthLegend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendLabel}>Excellent</Text>
                <Text style={styles.legendValue}>{healthDistribution.excellent}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
                <Text style={styles.legendLabel}>Good</Text>
                <Text style={styles.legendValue}>{healthDistribution.good}</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendLabel}>Ok</Text>
                <Text style={styles.legendValue}>{healthDistribution.ok}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendLabel}>Critical</Text>
                <Text style={styles.legendValue}>{healthDistribution.critical}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Monitoring */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 System Monitoring</Text>
          </View>
          
          <View style={styles.monitoringGrid}>
            <View style={styles.monitoringCard}>
              <Text style={styles.monitoringValue}>99.25%</Text>
              <Text style={styles.monitoringLabel}>System Uptime</Text>
              <View style={styles.monitoringIndicator} />
            </View>
            <View style={styles.monitoringCard}>
              <Text style={styles.monitoringValue}>2.4s</Text>
              <Text style={styles.monitoringLabel}>Avg Response Time</Text>
              <Text style={styles.monitoringStatus}>Normal</Text>
            </View>
          </View>
        </View>

        {/* Zone Status */}
        <View style={styles.section}>
          <Text style={styles.zoneTitle}>Zone Status</Text>
          
          {zoneStatuses.map((zone, index) => (
            <View key={index} style={styles.zoneItem}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <View style={styles.zoneStatus}>
                <View style={[styles.statusDot, { 
                  backgroundColor: zone.status === 'Online' ? '#10b981' : '#ef4444' 
                }]} />
                <Text style={[styles.statusText, {
                  color: zone.status === 'Online' ? '#10b981' : '#ef4444'
                }]}>{zone.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddAssetModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Asset Modal */}
      <AddAssetModal
        visible={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onSubmit={handleAddAsset}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#64748b',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  refreshText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  // Metrics Container
  metricsContainer: {
    padding: 20,
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  metricIcon: {
    fontSize: 24,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  metricTrend: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  metricSubtitleContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  actionBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Health Distribution
  healthBarContainer: {
    marginBottom: 20,
  },
  healthBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  healthSegment: {
    height: '100%',
  },
  healthLegend: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  // System Monitoring
  monitoringGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  monitoringCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  monitoringValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  monitoringLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  monitoringIndicator: {
    height: 3,
    backgroundColor: '#1e293b',
    width: 30,
    borderRadius: 2,
  },
  monitoringStatus: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Zone Status
  zoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  zoneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
});

export default DashboardScreen;