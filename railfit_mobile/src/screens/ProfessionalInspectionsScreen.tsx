import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Inspection {
  id: string;
  assetId: string;
  location: string;
  type: string;
  status: 'defective' | 'non-defective' | 'manual-review';
  date: string;
  aiConfidence: number;
  inspector: string;
}

const mockInspections: Inspection[] = [
  {
    id: '1',
    assetId: 'AST-001',
    location: 'Track Section A-1',
    type: 'Visual Inspection',
    status: 'defective',
    date: '2024-09-29',
    aiConfidence: 85,
    inspector: 'System Administrator',
  },
  // Add more mock data as needed
];

const InspectionsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'defective' | 'non-defective' | 'manual-review'>('all');
  const [newInspectionVisible, setNewInspectionVisible] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    assetId: '',
    location: '',
    inspectionType: 'Visual Inspection',
    notes: '',
    image: null,
  });

  const inspectionStats = {
    totalInspections: 22,
    defectRate: 54.5,
    aiConfidence: 77,
    passRate: 45.5,
    weeklyGrowth: 11,
    defectsFound: 12,
  };

  const filterTabs = [
    { key: 'all', label: 'All Inspections', count: inspectionStats.totalInspections },
    { key: 'defective', label: 'Defective', count: inspectionStats.defectsFound },
    { key: 'non-defective', label: 'Non-Defective', count: 8 },
    { key: 'manual-review', label: 'Manual Review', count: 2 },
  ];

  const inspectionTypes = [
    'Visual Inspection',
    'Ultrasonic Testing',
    'Magnetic Particle Testing',
    'Eddy Current Testing',
    'Radiographic Testing',
  ];

  const filteredInspections = mockInspections.filter(inspection => {
    if (activeFilter === 'all') return true;
    return inspection.status === activeFilter;
  });

  const handleCreateInspection = () => {
    // Handle inspection creation
    console.log('Creating inspection:', inspectionForm);
    setNewInspectionVisible(false);
    setInspectionForm({
      assetId: '',
      location: '',
      inspectionType: 'Visual Inspection',
      notes: '',
      image: null,
    });
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, color: string, icon: string, trend?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statSubtitle}>{subtitle}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={14} color="#10b981" />
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = (filterType: string) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="camera-outline" size={64} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No inspections found</Text>
      <Text style={styles.emptySubtitle}>
        No inspections match the "{filterType}" filter
      </Text>
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={() => setActiveFilter('all')}
      >
        <Text style={styles.viewAllText}>View all inspections</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Rail Inspections</Text>
            <Text style={styles.headerSubtitle}>
              AI-powered defect detection{'\n'}and inspection management
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.newInspectionButton}
            onPress={() => setNewInspectionVisible(true)}
          >
            <Ionicons name="camera-outline" size={20} color="#ffffff" />
            <Text style={styles.newInspectionText}>New Inspection</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard(
              'Total Inspections',
              inspectionStats.totalInspections,
              `+${inspectionStats.weeklyGrowth} this week`,
              '#6b7280',
              'list-outline',
              `+${inspectionStats.weeklyGrowth} this week`
            )}
            {renderStatCard(
              'Defect Rate',
              `${inspectionStats.defectRate}%`,
              `${inspectionStats.defectsFound} defects found`,
              '#ef4444',
              'warning-outline'
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              'AI Confidence',
              `${inspectionStats.aiConfidence}%`,
              'Average AI accuracy',
              '#10b981',
              'checkmark-circle-outline'
            )}
            {renderStatCard(
              'Pass Rate',
              `${inspectionStats.passRate}%`,
              `${inspectionStats.totalInspections - inspectionStats.defectsFound} passed inspections`,
              '#10b981',
              'checkmark-circle-outline'
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
                  activeFilter === tab.key && tab.key === 'defective' && styles.filterTabDefective,
                  activeFilter === tab.key && tab.key === 'non-defective' && styles.filterTabNonDefective,
                  activeFilter === tab.key && tab.key === 'manual-review' && styles.filterTabManualReview,
                ]}
                onPress={() => setActiveFilter(tab.key as any)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inspections List */}
        <View style={styles.inspectionsContainer}>
          {filteredInspections.length === 0 ? (
            renderEmptyState(activeFilter)
          ) : (
            <View style={styles.inspectionsList}>
              {filteredInspections.map((inspection) => (
                <View key={inspection.id} style={styles.inspectionCard}>
                  {/* Render inspection cards here */}
                  <Text style={styles.inspectionId}>{inspection.assetId}</Text>
                  <Text style={styles.inspectionLocation}>{inspection.location}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* New Inspection Modal */}
      <Modal
        visible={newInspectionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNewInspectionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Inspection</Text>
              <Text style={styles.modalSubtitle}>Create a new rail component inspection</Text>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Asset ID Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Asset ID</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., AST-001"
                  placeholderTextColor="#9ca3af"
                  value={inspectionForm.assetId}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, assetId: text})}
                />
              </View>

              {/* Location Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Track Section A-1"
                  placeholderTextColor="#9ca3af"
                  value={inspectionForm.location}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, location: text})}
                />
              </View>

              {/* Inspection Type Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Inspection Type</Text>
                <TouchableOpacity style={styles.dropdownInput}>
                  <Text style={styles.dropdownText}>{inspectionForm.inspectionType}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Image Upload */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Upload Image (Optional)</Text>
                <TouchableOpacity style={styles.imageUploadArea}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
                  <Text style={styles.imageUploadText}>Click to upload image</Text>
                  <Text style={styles.imageUploadSubtext}>AI analysis available with image</Text>
                </TouchableOpacity>
              </View>

              {/* Notes Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  placeholder="Add any additional observations..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  value={inspectionForm.notes}
                  onChangeText={(text) => setInspectionForm({...inspectionForm, notes: text})}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setNewInspectionVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateInspection}
              >
                <Ionicons name="camera-outline" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Create Inspection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  newInspectionButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  newInspectionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#f9fafb',
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
    color: '#10b981',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#e5e7eb',
  },
  filterTabDefective: {
    backgroundColor: '#fecaca',
  },
  filterTabNonDefective: {
    backgroundColor: '#bbf7d0',
  },
  filterTabManualReview: {
    backgroundColor: '#fef3c7',
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
  inspectionsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  inspectionsList: {
    padding: 24,
  },
  inspectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inspectionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  inspectionLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
    marginBottom: 24,
  },
  viewAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 12,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InspectionsScreen;