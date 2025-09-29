import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert as RNAlert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SharedSidebar from '../components/SharedSidebar';
import { useSidebar } from '../hooks/useSidebar';

const { width } = Dimensions.get('window');

interface Alert {
  id: string;
  alertId: string;
  title: string;
  description: string;
  assetName: string;
  assetId: string;
  location: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'safety' | 'maintenance' | 'operational' | 'security' | 'performance';
  timestamp: string;
  date: string;
  time: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'closed';
  assignedTo?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'ai' | 'manual' | 'sensor' | 'system';
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    alertId: 'ALT-2025-001',
    title: 'Track Temperature Anomaly',
    description: 'Elevated temperature detected on main track section - potential rail expansion issue',
    assetName: 'Track Section A-127',
    assetId: 'TRK-A127',
    location: 'Platform 1-2, Main Line',
    severity: 'critical',
    category: 'safety',
    timestamp: '2025-09-22T10:30:00Z',
    date: 'Sep 22, 2025',
    time: '10:30 AM',
    status: 'active',
    priority: 'critical',
    source: 'sensor',
  },
  {
    id: '2',
    alertId: 'ALT-2025-002',
    title: 'Signal Communication Failure',
    description: 'Lost communication with signal control system - manual intervention required',
    assetName: 'Signal Tower ST-45',
    assetId: 'SIG-ST45',
    location: 'Junction B, Control Zone',
    severity: 'critical',
    category: 'operational',
    timestamp: '2025-09-22T09:15:00Z',
    date: 'Sep 22, 2025',
    time: '09:15 AM',
    status: 'acknowledged',
    assignedTo: 'Signal Operations Team',
    acknowledgedAt: '2025-09-22T09:20:00Z',
    priority: 'critical',
    source: 'system',
  },
  {
    id: '3',
    alertId: 'ALT-2025-003',
    title: 'Unauthorized Access Detected',
    description: 'Motion sensor triggered in restricted maintenance area during off-hours',
    assetName: 'Control Room CR-12',
    assetId: 'CTL-CR12',
    location: 'Station Building, Level 2',
    severity: 'warning',
    category: 'security',
    timestamp: '2025-09-21T23:45:00Z',
    date: 'Sep 21, 2025',
    time: '11:45 PM',
    status: 'resolved',
    assignedTo: 'Security Team',
    acknowledgedAt: '2025-09-21T23:50:00Z',
    resolvedAt: '2025-09-22T00:30:00Z',
    notes: 'False alarm - authorized maintenance crew working extended hours',
    priority: 'medium',
    source: 'sensor',
  },
  {
    id: '4',
    alertId: 'ALT-2025-004',
    title: 'Maintenance Schedule Overdue',
    description: 'Bridge structural inspection overdue by 5 days - compliance issue',
    assetName: 'Railway Bridge BR-331',
    assetId: 'BRG-331',
    location: 'Km 45.2, River Crossing',
    severity: 'warning',
    category: 'maintenance',
    timestamp: '2025-09-19T08:00:00Z',
    date: 'Sep 19, 2025',
    time: '08:00 AM',
    status: 'active',
    priority: 'high',
    source: 'system',
  },
  {
    id: '5',
    alertId: 'ALT-2025-005',
    title: 'Power System Voltage Drop',
    description: 'Voltage fluctuation detected in overhead power lines - efficiency concern',
    assetName: 'Power Line PL-North-7',
    assetId: 'PWR-N7',
    location: 'North Section, Mile 12',
    severity: 'info',
    category: 'performance',
    timestamp: '2025-09-22T07:20:00Z',
    date: 'Sep 22, 2025',
    time: '07:20 AM',
    status: 'active',
    priority: 'low',
    source: 'ai',
  },
  {
    id: '6',
    alertId: 'ALT-2025-006',
    title: 'Platform Overcrowding Alert',
    description: 'Passenger density exceeding safe limits during peak hours',
    assetName: 'Platform 3',
    assetId: 'PLT-03',
    location: 'Central Station, Platform 3',
    severity: 'warning',
    category: 'safety',
    timestamp: '2025-09-22T08:45:00Z',
    date: 'Sep 22, 2025',
    time: '08:45 AM',
    status: 'acknowledged',
    assignedTo: 'Station Operations',
    acknowledgedAt: '2025-09-22T08:50:00Z',
    priority: 'high',
    source: 'ai',
  },
];

export default function AlertsScreen() {
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    filterAlerts();
  }, [selectedFilter, alerts]);

  const filterAlerts = () => {
    let filtered = alerts;

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unresolved') {
        filtered = filtered.filter(alert => alert.status === 'active' || alert.status === 'acknowledged');
      } else if (['critical', 'warning', 'info'].includes(selectedFilter)) {
        filtered = filtered.filter(alert => alert.severity === selectedFilter);
      } else {
        filtered = filtered.filter(alert => alert.status === selectedFilter);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredAlerts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'acknowledged': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return 'shield-checkmark';
      case 'maintenance': return 'construct';
      case 'operational': return 'settings';
      case 'security': return 'lock-closed';
      case 'performance': return 'speedometer';
      default: return 'alert-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleAlertPress = (alert: Alert) => {
    setSelectedAlert(alert);
    setModalVisible(true);
  };

  const handleAcknowledge = (alert: Alert) => {
    RNAlert.alert(
      'Acknowledge Alert',
      `Acknowledge alert "${alert.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: () => {
            setAlerts(prev =>
              prev.map(item =>
                item.id === alert.id
                  ? { 
                      ...item, 
                      status: 'acknowledged' as const, 
                      assignedTo: 'Current User',
                      acknowledgedAt: new Date().toISOString()
                    }
                  : item
              )
            );
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handleResolve = (alert: Alert) => {
    RNAlert.alert(
      'Resolve Alert',
      `Mark alert "${alert.title}" as resolved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setAlerts(prev =>
              prev.map(item =>
                item.id === alert.id
                  ? { 
                      ...item, 
                      status: 'resolved' as const, 
                      resolvedAt: new Date().toISOString(),
                      assignedTo: item.assignedTo || 'Current User'
                    }
                  : item
              )
            );
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handleNewAlert = () => {
    RNAlert.alert('New Alert', 'Create a new alert');
  };

  const handleViewDetails = (alert: Alert) => {
    // Navigate to detailed alert view or show comprehensive information
    console.log('Viewing detailed information for alert:', alert.alertId);
    // TODO: Navigate to AlertDetailsScreen or expand modal with more details
    RNAlert.alert(
      'Alert Details',
      `Full details for ${alert.alertId} would be displayed here. This could include historical data, related assets, maintenance history, and AI analysis.`,
      [{ text: 'OK' }]
    );
  };

  // Calculate metrics
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
  const unresolvedAlerts = alerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length;

  const statusCounts = {
    all: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    unresolved: unresolvedAlerts,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    borderColor,
    trend 
  }: { 
    title: string; 
    value: string; 
    subtitle: string; 
    icon: string; 
    borderColor: string;
    trend?: string;
  }) => (
    <View style={[styles.metricCard, { borderLeftColor: borderColor }]}>
      <View style={styles.metricContent}>
        <View style={styles.metricTextContainer}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {trend && <Text style={styles.metricSubtitle}>{trend}</Text>}
          <Text style={styles.metricDescription}>{subtitle}</Text>
        </View>
        <Text style={styles.metricIcon}>{icon}</Text>
      </View>
    </View>
  );

  const FilterTab = ({ title, value, count }: { title: string; value: string; count: number }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        selectedFilter === value && styles.filterTabActive,
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[
          styles.filterTabText,
          selectedFilter === value && styles.filterTabTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => handleAlertPress(alert)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTopRow}>
          <Text style={styles.alertId}>{alert.alertId}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
            <Ionicons name={getSeverityIcon(alert.severity) as any} size={12} color="#ffffff" />
            <Text style={styles.severityText}>
              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.alertTitle}>{alert.title}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.alertDescription}>{alert.description}</Text>
        
        <View style={styles.assetInfo}>
          <View style={styles.cardRow}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{alert.assetName} ({alert.assetId})</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{alert.location}</Text>
          </View>
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{alert.date}, {alert.time}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name={getCategoryIcon(alert.category) as any} size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
              <Text style={styles.statusText}>
                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(alert.priority) }]}>
              <Text style={styles.priorityText}>
                {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
              </Text>
            </View>
          </View>
          {alert.assignedTo && (
            <Text style={styles.assigneeText}>Assigned to {alert.assignedTo}</Text>
          )}
        </View>
      </View>
      
      <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
    </TouchableOpacity>
  );

  const AlertDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedAlert && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleSection}>
                  <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                  <Text style={styles.modalAlertId}>{selectedAlert.alertId}</Text>
                  <View style={styles.modalBadges}>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedAlert.severity) }]}>
                      <Ionicons name={getSeverityIcon(selectedAlert.severity) as any} size={16} color="#ffffff" />
                      <Text style={styles.badgeText}>{selectedAlert.severity}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedAlert.status) }]}>
                      <Text style={styles.statusText}>{selectedAlert.status}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Alert Details</Text>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Description:</Text>
                    <Text style={styles.modalValue}>{selectedAlert.description}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Asset:</Text>
                    <Text style={styles.modalValue}>{selectedAlert.assetName} ({selectedAlert.assetId})</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedAlert.location}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Category:</Text>
                    <View style={styles.categoryInfo}>
                      <Ionicons name={getCategoryIcon(selectedAlert.category) as any} size={16} color="#6b7280" />
                      <Text style={[styles.modalValue, { marginLeft: 8 }]}>{selectedAlert.category}</Text>
                    </View>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Priority:</Text>
                    <Text style={[styles.modalValue, { color: getPriorityColor(selectedAlert.priority) }]}>
                      {selectedAlert.priority.charAt(0).toUpperCase() + selectedAlert.priority.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Source:</Text>
                    <Text style={styles.modalValue}>{selectedAlert.source.toUpperCase()}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Created:</Text>
                    <Text style={styles.modalValue}>{selectedAlert.date}, {selectedAlert.time}</Text>
                  </View>
                </View>

                {selectedAlert.assignedTo && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Assignment</Text>
                    <View style={styles.modalItem}>
                      <Text style={styles.modalLabel}>Assigned To:</Text>
                      <Text style={styles.modalValue}>{selectedAlert.assignedTo}</Text>
                    </View>
                    {selectedAlert.acknowledgedAt && (
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Acknowledged:</Text>
                        <Text style={styles.modalValue}>{formatDateTime(selectedAlert.acknowledgedAt)}</Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedAlert.resolvedAt && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Resolution</Text>
                    <View style={styles.modalItem}>
                      <Text style={styles.modalLabel}>Resolved At:</Text>
                      <Text style={styles.modalValue}>{formatDateTime(selectedAlert.resolvedAt)}</Text>
                    </View>
                    {selectedAlert.notes && (
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Notes:</Text>
                        <Text style={styles.modalValue}>{selectedAlert.notes}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.modalActions}>
                  {selectedAlert.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acknowledgeAction]}
                      onPress={() => handleAcknowledge(selectedAlert)}
                    >
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
                      <Text style={styles.acknowledgeActionText}>Acknowledge</Text>
                    </TouchableOpacity>
                  )}
                  {(selectedAlert.status === 'active' || selectedAlert.status === 'acknowledged') && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.resolveAction]}
                      onPress={() => handleResolve(selectedAlert)}
                    >
                      <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                      <Text style={styles.resolveActionText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(selectedAlert)}>
                    <Ionicons name="document-text" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1f2937" />
          <Text style={styles.menuButtonText}>Menu</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Alert Management</Text>
            <Text style={styles.headerSubtitle}>Real-time monitoring and alert response system</Text>
          </View>
          <TouchableOpacity style={styles.newAlertButton} onPress={handleNewAlert}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.newAlertButtonText}>New Alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Alerts"
          value={totalAlerts.toString()}
          subtitle="System-wide alerts"
          icon="📊"
          borderColor="#3b82f6"
          trend="+2 today"
        />
        <MetricCard
          title="Critical Alerts"
          value={criticalAlerts.toString()}
          subtitle="Require immediate attention"
          icon="🚨"
          borderColor="#dc2626"
        />
        <MetricCard
          title="Active Alerts"
          value={activeAlerts.toString()}
          subtitle="Unacknowledged alerts"
          icon="🔴"
          borderColor="#ef4444"
        />
        <MetricCard
          title="Resolved Today"
          value={resolvedAlerts.toString()}
          subtitle="Successfully resolved"
          icon="✅"
          borderColor="#10b981"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          <FilterTab title="All Alerts" value="all" count={statusCounts.all} />
          <FilterTab title="Critical" value="critical" count={statusCounts.critical} />
          <FilterTab title="Warning" value="warning" count={statusCounts.warning} />
          <FilterTab title="Info" value="info" count={statusCounts.info} />
          <FilterTab title="Active" value="active" count={statusCounts.active} />
          <FilterTab title="Resolved" value="resolved" count={statusCounts.resolved} />
        </ScrollView>
      </View>

      {/* Alert List */}
      <ScrollView
        style={styles.alertList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        
        {filteredAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No alerts found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filter criteria
            </Text>
          </View>
        )}
      </ScrollView>

      <AlertDetailModal />
      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Alerts"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
    minHeight: '100%',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  newAlertButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  newAlertButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    flex: 1,
    minWidth: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 10,
    color: '#6b7280',
  },
  metricIcon: {
    fontSize: 20,
  },
  filterTabsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterTabsContent: {
    paddingRight: 16,
  },
  filterTab: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  filterTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  alertList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertId: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  alertDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  assetInfo: {
    marginBottom: 12,
  },
  metaInfo: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  cardItemText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  assigneeText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  severityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitleSection: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalAlertId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flex: 1,
  },
  acknowledgeAction: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  resolveAction: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: '500',
  },
  acknowledgeActionText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    fontWeight: '500',
  },
  resolveActionText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    fontWeight: '500',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});