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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  
  // Add Asset Form State
  const [formData, setFormData] = useState({
    assetType: '',
    location: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    vendorId: '',
    installDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
  });
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);

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

  const assetTypes = [
    { label: 'Rail', value: 'rail', icon: 'train-outline' },
    { label: 'Fastener', value: 'fastener', icon: 'hardware-chip-outline' },
    { label: 'Sleeper', value: 'sleeper', icon: 'cube-outline' },
    { label: 'Signal', value: 'signal', icon: 'cellular-outline' },
    { label: 'Switch', value: 'switch', icon: 'git-branch-outline' },
    { label: 'Bridge', value: 'bridge', icon: 'bridge-outline' },
    { label: 'Track Equipment', value: 'track_equipment', icon: 'construct-outline' },
    { label: 'Power Equipment', value: 'power_equipment', icon: 'flash-outline' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      assetType: '',
      location: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      vendorId: '',
      installDate: '',
      purchaseCost: '',
      warrantyExpiry: '',
    });
    setSelectedAssetType('');
  };

  const handleAddAsset = () => {
    // Validation
    if (!selectedAssetType || !formData.location || !formData.serialNumber) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (Asset Type, Location, and Serial Number).',
        [{ text: 'OK' }]
      );
      return;
    }

    const assetData = {
      ...formData,
      assetType: selectedAssetType,
    };

    Alert.alert(
      'Asset Added Successfully',
      `Asset "${selectedAssetType}" has been successfully added to the system.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowAddAssetModal(false);
            resetForm();
          }
        }
      ]
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
    <View style={styles.container}>
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

      {/* Professional Add Asset Modal */}
      <Modal
        visible={showAddAssetModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddAssetModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="add-circle" size={28} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Add New Asset</Text>
                  <Text style={styles.modalSubtitle}>Add a new railway asset to the system</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddAssetModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Asset Type Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Asset Information</Text>
                
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    Asset Type <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      selectedAssetType ? styles.dropdownButtonActive : null
                    ]}
                    onPress={() => setShowAssetTypeDropdown(!showAssetTypeDropdown)}
                  >
                    <View style={styles.dropdownContent}>
                      {selectedAssetType ? (
                        <>
                          <Ionicons 
                            name={assetTypes.find(t => t.value === selectedAssetType)?.icon as any} 
                            size={20} 
                            color="#3b82f6" 
                          />
                          <Text style={styles.dropdownSelectedText}>
                            {assetTypes.find(t => t.value === selectedAssetType)?.label}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.dropdownPlaceholder}>Select Asset Type</Text>
                      )}
                    </View>
                    <Ionicons 
                      name={showAssetTypeDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  
                  {showAssetTypeDropdown && (
                    <View style={styles.dropdownMenu}>
                      {assetTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedAssetType(type.value);
                            setShowAssetTypeDropdown(false);
                          }}
                        >
                          <Ionicons name={type.icon as any} size={20} color="#6b7280" />
                          <Text style={styles.dropdownItemText}>{type.label}</Text>
                          {selectedAssetType === type.value && (
                            <Ionicons name="checkmark" size={20} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    Location <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Platform 1, Section A"
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    Serial Number <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Unique serial number"
                    value={formData.serialNumber}
                    onChangeText={(value) => handleInputChange('serialNumber', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Technical Details */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Technical Details</Text>
                
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Model</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Model number/name"
                    value={formData.model}
                    onChangeText={(value) => handleInputChange('model', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Manufacturer</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Manufacturer name"
                    value={formData.manufacturer}
                    onChangeText={(value) => handleInputChange('manufacturer', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Vendor ID</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Vendor identifier"
                    value={formData.vendorId}
                    onChangeText={(value) => handleInputChange('vendorId', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Financial & Warranty */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Financial & Warranty</Text>
                
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Install Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="dd-mm-yyyy"
                    value={formData.installDate}
                    onChangeText={(value) => handleInputChange('installDate', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Purchase Cost</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    value={formData.purchaseCost}
                    onChangeText={(value) => handleInputChange('purchaseCost', value)}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Warranty Expiry</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="dd-mm-yyyy"
                    value={formData.warrantyExpiry}
                    onChangeText={(value) => handleInputChange('warrantyExpiry', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddAssetModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAsset}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Asset</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  modalFooter: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default DashboardScreen;