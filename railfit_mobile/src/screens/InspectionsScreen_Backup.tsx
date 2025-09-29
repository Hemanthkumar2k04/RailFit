import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SharedSidebar from '../components/SharedSidebar';
import AppHeader from '../components/AppHeader';
import { useSidebar } from '../hooks/useSidebar';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

// Updated interface to match backend API response
interface Inspection {
  inspection_id: string;
  asset_id: string;
  inspector_name: string;
  location: string;
  inspection_date: string;
  inspection_type: string;
  result: 'Defective' | 'Non-Defective' | 'Manual Review';
  confidence_score?: number;
  notes?: string;
  created_at: string;
  // Legacy properties for backward compatibility
  id?: string;
  assetId?: string;
  assetType?: string;
  inspector?: string;
  date?: string;
  timestamp?: string;
  status?: 'defective' | 'non-defective' | 'manual-review';
  aiConfidence?: number;
  defectType?: string;
  description?: string;
  findings?: string[];
  inspectionType?: 'ai-assisted' | 'manual';
}

// Mock data removed - now using real API data

export default function InspectionsScreen() {
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, []);

  useEffect(() => {
    filterInspections();
  }, [selectedFilter, inspections]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getInspections({ limit: 50 });
      
      if (response.data) {
        // Transform API data to match component expectations
        const transformedInspections = response.data.map((inspection: any) => ({
          ...inspection,
          // Map API fields to legacy component fields for compatibility
          id: inspection.inspection_id,
          assetId: inspection.asset_id,
          inspector: inspection.inspector_name,
          date: new Date(inspection.inspection_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          timestamp: new Date(inspection.inspection_date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          status: inspection.result?.toLowerCase().replace(' ', '-') as 'defective' | 'non-defective' | 'manual-review',
          aiConfidence: inspection.confidence_score || 0,
          description: inspection.notes,
          inspectionType: inspection.inspection_type === 'AI-Assisted' ? 'ai-assisted' : 'manual',
          assetType: 'Asset', // Default value since not in API
        }));
        
        setInspections(transformedInspections);
      } else if (response.error) {
        setError(response.error);
        // Fallback to empty array on error
        setInspections([]);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setError('Failed to load inspections. Please check your connection.');
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInspections = () => {
    let filtered = inspections;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === selectedFilter);
    }

    setFilteredInspections(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInspections();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'defective': return '#ef4444';
      case 'non-defective': return '#10b981';
      case 'manual-review': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'defective': return 'warning';
      case 'non-defective': return 'checkmark-circle';
      case 'manual-review': return 'document-text';
      default: return 'help-circle';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleInspectionPress = (inspection: Inspection) => {
    console.log('Inspection pressed:', inspection.id);
    setSelectedInspection(inspection);
    setModalVisible(true);
    console.log('Modal should be visible now');
  };

  const handleNewInspection = () => {
    Alert.alert('New Inspection', 'Create a new inspection');
  };

  // Calculate metrics
  const totalInspections = inspections.length;
  const defectiveCount = inspections.filter(i => i.status === 'defective').length;
  const defectRate = totalInspections > 0 ? (defectiveCount / totalInspections) * 100 : 0;
  const avgConfidence = totalInspections > 0 
    ? inspections.reduce((sum, i) => sum + (i.aiConfidence || 0), 0) / totalInspections 
    : 0;
  const passRate = totalInspections > 0 
    ? ((totalInspections - defectiveCount) / totalInspections) * 100 
    : 0;

  const statusCounts = {
    all: inspections.length,
    defective: inspections.filter(i => i.status === 'defective').length,
    'non-defective': inspections.filter(i => i.status === 'non-defective').length,
    'manual-review': inspections.filter(i => i.status === 'manual-review').length,
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

  const InspectionCard = ({ inspection }: { inspection: Inspection }) => (
    <TouchableOpacity
      style={styles.inspectionCard}
      onPress={() => handleInspectionPress(inspection)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTopRow}>
          <Text style={styles.assetId}>{(inspection.id || inspection.inspection_id || '').substring(0, 18)}...</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(inspection.status || 'unknown') }]}>
            <Ionicons name={getStatusIcon(inspection.status || 'unknown') as any} size={12} color="#ffffff" />
            <Text style={styles.statusText}>
              {inspection.status === 'manual-review' ? 'Manual Review' : 
               inspection.status === 'non-defective' ? 'Non-Defective' : 'Defective'}
            </Text>
          </View>
        </View>
        <Text style={styles.assetIdLabel}>{inspection.assetId}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <View style={styles.cardItem}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{inspection.location}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardItem}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{inspection.inspector}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardItem}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.cardItemText}>{inspection.date}, {inspection.timestamp}</Text>
          </View>
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>AI Confidence</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceBarFill, 
                { 
                  width: `${inspection.aiConfidence || 0}%`,
                  backgroundColor: getConfidenceColor(inspection.aiConfidence || 0)
                }
              ]} 
            />
          </View>
          <Text style={[styles.confidenceValue, { color: getConfidenceColor(inspection.aiConfidence || 0) }]}>
            {inspection.aiConfidence || 0}%
          </Text>
        </View>

        {inspection.defectType && (
          <View style={styles.defectContainer}>
            <Text style={styles.defectText}>{inspection.defectType}</Text>
          </View>
        )}

        <View style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const InspectionDetailModal = () => {
    console.log('Modal render - visible:', modalVisible, 'selectedInspection:', selectedInspection?.id);
    
    if (!modalVisible || !selectedInspection) {
      return null;
    }
    
    return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedInspection ? (
            <>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Inspection Details</Text>
                  <Text style={styles.modalAssetId}>{selectedInspection.id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody} 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Asset Information</Text>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Asset ID:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.assetId}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Type:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.assetType}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.location}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Inspection Details</Text>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Inspector:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.inspector}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.date}</Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Time:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.timestamp}</Text>
                  </View>
                  <View style={styles.modalItemStatus}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedInspection.status || 'unknown') }]}>
                      <Ionicons name={getStatusIcon(selectedInspection.status || 'unknown') as any} size={14} color="#ffffff" />
                      <Text style={styles.modalStatusText}>
                        {selectedInspection.status === 'manual-review' ? 'Manual Review' : 
                         selectedInspection.status === 'non-defective' ? 'Non-Defective' : 'Defective'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>AI Confidence:</Text>
                    <Text style={[styles.modalValue, { color: getConfidenceColor(selectedInspection.aiConfidence || 0) }]}>
                      {selectedInspection.aiConfidence || 0}%
                    </Text>
                  </View>
                  <View style={styles.modalItem}>
                    <Text style={styles.modalLabel}>Type:</Text>
                    <Text style={styles.modalValue}>{selectedInspection.inspectionType}</Text>
                  </View>
                  {selectedInspection.description && (
                    <View style={styles.modalItemMultiline}>
                      <Text style={styles.modalLabel}>Description:</Text>
                      <Text style={styles.modalValueMultiline}>{selectedInspection.description}</Text>
                    </View>
                  )}
                </View>

                {selectedInspection.defectType && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Defect Information</Text>
                    <View style={styles.modalItemMultiline}>
                      <Text style={styles.modalLabel}>Defect Type:</Text>
                      <Text style={styles.modalValueMultiline}>{selectedInspection.defectType}</Text>
                    </View>
                  </View>
                )}

                {selectedInspection.findings && selectedInspection.findings.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Findings</Text>
                    {selectedInspection.findings.map((finding, index) => (
                      <View key={index} style={styles.findingItem}>
                        <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                        <Text style={styles.findingText}>{finding}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="document-text" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>View Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="create" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          ) : (
            <View style={{ padding: 20 }}>
              <Text>No inspection selected</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Rail Inspections</Text>
            <Text style={styles.headerSubtitle}>AI-powered defect detection and inspection management</Text>
          </View>
          <TouchableOpacity style={styles.newInspectionButton} onPress={handleNewInspection}>
            <Ionicons name="camera" size={16} color="#ffffff" />
            <Text style={styles.newInspectionButtonText}>New Inspection</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.newInspectionButton, { backgroundColor: '#ef4444', marginLeft: 8 }]} 
            onPress={() => {
              console.log('Test modal button pressed');
              if (inspections.length > 0) {
                setSelectedInspection(inspections[0]);
              }
              setModalVisible(true);
              console.log('Modal visible:', modalVisible, 'Selected:', selectedInspection);
            }}
          >
            <Text style={styles.newInspectionButtonText}>Test Modal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Inspections"
          value={totalInspections.toString()}
          subtitle="12 defects found"
          icon="📈"
          borderColor="#3b82f6"
          trend="+20 this week"
        />
        <MetricCard
          title="Defect Rate"
          value={`${defectRate.toFixed(1)}%`}
          subtitle="12 defects found"
          icon="⚠️"
          borderColor="#ef4444"
        />
        <MetricCard
          title="AI Confidence"
          value={`${avgConfidence.toFixed(0)}%`}
          subtitle="Average AI accuracy"
          icon="✅"
          borderColor="#10b981"
        />
        <MetricCard
          title="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          subtitle="6 passed inspections"
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
          <FilterTab title="All Inspections" value="all" count={statusCounts.all} />
          <FilterTab title="Defective" value="defective" count={statusCounts.defective} />
          <FilterTab title="Non-Defective" value="non-defective" count={statusCounts['non-defective']} />
          <FilterTab title="Manual Review" value="manual-review" count={statusCounts['manual-review']} />
        </ScrollView>
      </View>

      {/* Inspection List */}
      <ScrollView
        style={styles.inspectionList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading inspections...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Error Loading Inspections</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchInspections}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!loading && !error && filteredInspections.map((inspection) => (
          <InspectionCard key={inspection.id || inspection.inspection_id} inspection={inspection} />
        ))}
        
        {!loading && !error && filteredInspections.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No inspections found</Text>
            <Text style={styles.emptyStateText}>
              {inspections.length === 0 
                ? 'No inspections available. Create your first inspection.'
                : 'Try adjusting your filter criteria'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <InspectionDetailModal />
      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Inspections"
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
  newInspectionButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  newInspectionButtonText: {
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
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
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
  inspectionList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inspectionCard: {
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
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  assetId: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
    flex: 1,
  },
  assetIdLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  cardRow: {
    marginBottom: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardItemText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 80,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  defectContainer: {
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    marginBottom: 8,
  },
  defectText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
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
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '90%',
    minHeight: '60%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalAssetId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
  },
  modalScrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
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
  modalItemMultiline: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalValueMultiline: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 20,
  },
  modalItemStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modalStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  findingText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});