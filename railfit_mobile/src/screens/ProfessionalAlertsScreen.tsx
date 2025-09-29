import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  timestamp: string;
  assetId?: string;
  location?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Critical Track Defect Detected',
    description: 'Severe crack detected on Track Section A-1, immediate attention required',
    severity: 'critical',
    status: 'active',
    timestamp: '2 hours ago',
    assetId: 'AST-001',
    location: 'Track Section A-1',
  },
  {
    id: '2', 
    title: 'High Vibration Levels',
    description: 'Unusual vibration patterns detected in Rail Pad monitoring',
    severity: 'warning',
    status: 'acknowledged',
    timestamp: '4 hours ago',
    assetId: 'AST-007',
    location: 'Bridge Section B-2',
  },
  {
    id: '3',
    title: 'Maintenance Schedule Updated',
    description: 'Routine maintenance has been rescheduled for next week',
    severity: 'info',
    status: 'resolved',
    timestamp: '1 day ago',
    location: 'Maintenance Yard',
  },
];

const AlertsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');

  const alertStats = {
    criticalAlerts: 3,
    activeWarnings: 8,
    resolvedIssues: 24,
    averageResponseTime: '12min',
    todayAlerts: 5,
    weeklyGrowth: -15,
  };

  const filterTabs = [
    { key: 'all', label: 'All Alerts', count: alertStats.criticalAlerts + alertStats.activeWarnings + alertStats.resolvedIssues },
    { key: 'critical', label: 'Critical', count: alertStats.criticalAlerts },
    { key: 'warning', label: 'Warnings', count: alertStats.activeWarnings },
    { key: 'resolved', label: 'Resolved', count: alertStats.resolvedIssues },
  ];

  const filteredAlerts = mockAlerts.filter(alert => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return alert.severity === 'critical';
    if (activeFilter === 'warning') return alert.severity === 'warning';
    if (activeFilter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'acknowledged': return '#f59e0b';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, color: string, icon: string, trend?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statSubtitle}>{subtitle}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend.startsWith('-') ? "trending-down" : "trending-up"} 
                size={14} 
                color={trend.startsWith('-') ? "#10b981" : "#ef4444"} 
              />
              <Text style={[styles.trendText, { color: trend.startsWith('-') ? "#10b981" : "#ef4444" }]}>
                {trend}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <TouchableOpacity style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertSeverityContainer}>
          <Ionicons 
            name={getSeverityIcon(item.severity) as any} 
            size={20} 
            color={getSeverityColor(item.severity)} 
          />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.alertTimestamp}>{item.timestamp}</Text>
      </View>
      
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertDescription}>{item.description}</Text>
      
      {(item.assetId || item.location) && (
        <View style={styles.alertDetails}>
          {item.assetId && (
            <View style={styles.alertDetailItem}>
              <Ionicons name="cube-outline" size={14} color="#6b7280" />
              <Text style={styles.alertDetailText}>{item.assetId}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.alertDetailItem}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.alertDetailText}>{item.location}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.alertActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={16} color="#6b7280" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        {item.status === 'active' && (
          <TouchableOpacity style={[styles.actionButton, styles.acknowledgeButton]}>
            <Ionicons name="checkmark-outline" size={16} color="#f59e0b" />
            <Text style={[styles.actionText, { color: '#f59e0b' }]}>Acknowledge</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.resolveButton]}>
          <Ionicons name="checkmark-done-outline" size={16} color="#10b981" />
          <Text style={[styles.actionText, { color: '#10b981' }]}>Resolve</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No alerts found</Text>
      <Text style={styles.emptySubtitle}>
        No alerts match the selected filter criteria
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>System Alerts</Text>
            <Text style={styles.headerSubtitle}>
              Real-time monitoring and{'\n'}alert management system
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
            <Text style={styles.settingsText}>Alert Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard(
              'Critical Alerts',
              alertStats.criticalAlerts,
              `${alertStats.todayAlerts} today`,
              '#ef4444',
              'alert-circle-outline'
            )}
            {renderStatCard(
              'Active Warnings',
              alertStats.activeWarnings,
              'Require attention',
              '#f59e0b',
              'warning-outline'
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              'Resolved Issues',
              alertStats.resolvedIssues,
              `${alertStats.weeklyGrowth}% this week`,
              '#10b981',
              'checkmark-circle-outline',
              `${alertStats.weeklyGrowth}% this week`
            )}
            {renderStatCard(
              'Response Time',
              alertStats.averageResponseTime,
              'Average response',
              '#3b82f6',
              'time-outline'
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive,
                  activeFilter === tab.key && tab.key === 'critical' && styles.filterTabCritical,
                  activeFilter === tab.key && tab.key === 'warning' && styles.filterTabWarning,
                  activeFilter === tab.key && tab.key === 'resolved' && styles.filterTabResolved,
                ]}
                onPress={() => setActiveFilter(tab.key as any)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive
                ]}>
                  {tab.label}
                </Text>
                <View style={styles.filterTabBadge}>
                  <Text style={styles.filterTabCount}>{tab.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Alerts List */}
        <View style={styles.alertsContainer}>
          {filteredAlerts.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredAlerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.alertsList}
            />
          )}
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    fontWeight: '400',
  },
  settingsButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  settingsText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: '#e5e7eb',
  },
  filterTabCritical: {
    backgroundColor: '#fecaca',
  },
  filterTabWarning: {
    backgroundColor: '#fef3c7',
  },
  filterTabResolved: {
    backgroundColor: '#bbf7d0',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  filterTabBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterTabCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  alertsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  alertsList: {
    padding: 24,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertSeverityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  alertDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  alertDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertDetailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  acknowledgeButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  resolveButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default AlertsScreen;