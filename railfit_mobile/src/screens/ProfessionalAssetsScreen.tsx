import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FilterDropdown from '../components/FilterDropdown';
import QRCodeModal from '../components/QRCodeModal';
import AssetDetailsModal from '../components/AssetDetailsModal';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface Asset {
  id: string;
  type: string;
  location: string;
  healthScore: number;
  condition: 'Excellent' | 'Good' | 'Ok' | 'Critical';
  status: 'Active' | 'Inactive' | 'Maintenance';
  installDate: string;
}

interface AssetSummary {
  totalAssets: number;
  activeAssets: number;
  maintenanceQueue: number;
  criticalAlerts: number;
}

const AssetsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<any>(null);
  const [assetDetailsVisible, setAssetDetailsVisible] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<any>(null);

  const typeOptions = ['All Types', 'Rail Pad', 'Liner', 'Sleeper', 'Elastic Rail Clip'];
  const statusOptions = ['All Status', 'Active', 'Inactive', 'Maintenance'];
  const conditionOptions = ['All Conditions', 'Excellent', 'Good', 'Ok', 'Critical'];

  const summary: AssetSummary = {
    totalAssets: 51,
    activeAssets: 48,
    maintenanceQueue: 3,
    criticalAlerts: 2,
  };

  const mockAssets: Asset[] = [
    { id: 'd23e0996', type: 'Rail Pad', location: 'Visitor Center XX-34', healthScore: 95, condition: 'Excellent', status: 'Active', installDate: '12/03/2024' },
    { id: '576bddc9', type: 'Rail Pad', location: 'First Aid Point TT', healthScore: 92, condition: 'Excellent', status: 'Active', installDate: '15/02/2024' },
    { id: 'bf46b3b8', type: 'Rail Pad', location: 'Buffer Zone LL-56', healthScore: 94, condition: 'Excellent', status: 'Active', installDate: '05/12/2023' },
    { id: '92226516', type: 'Rail Pad', location: 'Equipment Shed HH', healthScore: 90, condition: 'Excellent', status: 'Active', installDate: '22/11/2023' },
    { id: '1c31bf63', type: 'Liner', location: 'Signal Bridge EE', healthScore: 92, condition: 'Excellent', status: 'Active', installDate: '28/05/2022' },
    { id: '741dcc03', type: 'Rail Pad', location: 'Test Track Z-78', healthScore: 91, condition: 'Excellent', status: 'Active', installDate: '18/09/2023' },
    { id: '4079c4ff', type: 'Rail Pad', location: 'Inspection Point V', healthScore: 96, condition: 'Excellent', status: 'Active', installDate: '15/08/2023' },
    { id: '78fef53c', type: 'Liner', location: 'Switching Yard S-67', healthScore: 94, condition: 'Excellent', status: 'Active', installDate: '14/08/2022' },
    { id: 'a599c35b', type: 'Rail Pad', location: 'Express Line N-78', healthScore: 93, condition: 'Excellent', status: 'Active', installDate: '12/06/2023' },
    { id: 'bc46487f', type: 'Liner', location: 'Tunnel Section K-12', healthScore: 91, condition: 'Excellent', status: 'Active', installDate: '25/10/2022' },
    { id: '634d079d', type: 'Rail Pad', location: 'Maintenance Yard F', healthScore: 95, condition: 'Excellent', status: 'Active', installDate: '18/04/2023' },
    { id: 'a1933210', type: 'Rail Pad', location: 'Junction Point B-12', healthScore: 92, condition: 'Excellent', status: 'Active', installDate: '20/02/2023' },
    { id: '3bb74dc1', type: 'Sleeper', location: 'Archive Building ZZ-56', healthScore: 84, condition: 'Good', status: 'Active', installDate: '15/11/2023' },
    { id: 'bec45a5f', type: 'Elastic Rail Clip', location: 'Security Gate WW-12', healthScore: 88, condition: 'Good', status: 'Active', installDate: '25/01/2024' },
    { id: '4b6921b0', type: 'Sleeper', location: 'Weather Station VV-89', healthScore: 73, condition: 'Ok', status: 'Active', installDate: '30/10/2023' },
    { id: '11c2ab0b', type: 'Liner', location: 'Communication Tower UU', healthScore: 81, condition: 'Good', status: 'Active', installDate: '20/01/2022' },
    { id: '7d34a493', type: 'Elastic Rail Clip', location: 'Fire Station SS-67', healthScore: 78, condition: 'Good', status: 'Active', installDate: '18/12/2023' },
    { id: '453efe30', type: 'Sleeper', location: 'Monitoring Station RR', healthScore: 86, condition: 'Good', status: 'Active', installDate: '25/09/2023' },
    { id: 'afc01960', type: 'Liner', location: 'Cable Duct QQ-45', healthScore: 75, condition: 'Good', status: 'Active', installDate: '14/02/2022' },
    { id: 'fdd9838a', type: 'Rail Pad', location: 'Emergency Exit PP-23', healthScore: 89, condition: 'Good', status: 'Active', installDate: '08/01/2024' },
  ];

  const itemsPerPage = 20;
  const totalPages = Math.ceil(mockAssets.length / itemsPerPage);

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All Types' || asset.type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || asset.status === selectedStatus;
    const matchesCondition = selectedCondition === 'All Conditions' || asset.condition === selectedCondition;
    
    return matchesSearch && matchesType && matchesStatus && matchesCondition;
  });

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#94a3b8';
      case 'Ok': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#94a3b8';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === paginatedAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(paginatedAssets.map(asset => asset.id));
    }
  };

  const handleViewQR = (asset: Asset) => {
    const qrAssetData = {
      id: asset.id,
      type: asset.type,
      location: asset.location,
      status: asset.status,
      healthScore: asset.healthScore,
      predictedRUL: 120, // Mock data
      lastInspection: '2024-08-15',
      nextMaintenance: '2024-11-15',
      qrVersion: '1.0',
    };
    setSelectedAssetForQR(qrAssetData);
    setQrModalVisible(true);
  };

  const handleViewAsset = (asset: Asset) => {
    const assetDetailsData = {
      id: asset.id,
      type: asset.type,
      location: asset.location,
      status: asset.status,
      healthScore: asset.healthScore,
      condition: asset.condition,
      installDate: asset.installDate,
      lastInspection: '2024-08-15',
      nextMaintenance: '2024-11-15',
      vendor: {
        name: 'TrackMaster Corp',
        id: '1c52948-af6ae-4234-864f-4f4bb4816410',
        email: 'sales@trackmaster.com',
        phone: '+1 555-0192',
        address: '456 Track Street, Metro City',
        status: 'Active',
      },
      specifications: {
        model: 'Express-Pro',
        serialNumber: 'RP-984',
        manufacturer: 'PadTech',
        description: 'High-speed rail pad for express train operations',
      },
    };
    setSelectedAssetForDetails(assetDetailsData);
    setAssetDetailsVisible(true);
  };

  const renderSummaryCard = (title: string, value: number, subtitle: string, color: string, icon: string) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryIcon}>{icon}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  );

  const renderAssetRow = ({ item }: { item: Asset }) => (
    <View style={styles.assetRow}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleSelectAsset(item.id)}
      >
        <View style={[styles.checkboxInner, selectedAssets.includes(item.id) && styles.checkboxSelected]}>
          {selectedAssets.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <Text style={styles.assetId}>{item.id}</Text>
      <Text style={styles.assetType}>{item.type}</Text>
      <Text style={styles.assetLocation}>{item.location}</Text>
      
      <View style={styles.healthScoreContainer}>
        <View style={[styles.healthScoreBadge, { backgroundColor: getHealthScoreColor(item.healthScore) }]}>
          <Text style={styles.healthScoreText}>{item.healthScore}</Text>
        </View>
      </View>
      
      <View style={styles.conditionContainer}>
        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) }]}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.installDate}>{item.installDate}</Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewAsset(item)}>
          <Ionicons name="eye-outline" size={16} color="#6b7280" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewQR(item)}>
          <Ionicons name="qr-code-outline" size={16} color="#6b7280" />
          <Text style={styles.actionText}>QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Download', `Downloading ${item.id}`)}>
          <Ionicons name="download-outline" size={16} color="#6b7280" />
          <Text style={styles.actionText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Text style={styles.paginationInfo}>
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
      </Text>
      <View style={styles.paginationControls}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        
        {[...Array(Math.min(3, totalPages))].map((_, index) => {
          const pageNum = index + 1;
          return (
            <TouchableOpacity
              key={pageNum}
              style={[styles.paginationNumber, currentPage === pageNum && styles.paginationNumberActive]}
              onPress={() => setCurrentPage(pageNum)}
            >
              <Text style={[styles.paginationNumberText, currentPage === pageNum && styles.paginationNumberTextActive]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Asset Management</Text>
            <Text style={styles.headerSubtitle}>Comprehensive railway infrastructure asset tracking and management</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add New Asset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkImportButton}>
              <Ionicons name="cloud-upload-outline" size={20} color="#374151" />
              <Text style={styles.bulkImportText}>Bulk Import</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportsButton}>
              <Ionicons name="document-text-outline" size={20} color="#374151" />
              <Text style={styles.reportsText}>Generate Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="download-outline" size={20} color="#374151" />
              <Text style={styles.exportText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { borderLeftColor: '#d1d5db' }]}>
            <View style={styles.summaryCardIcon}>
              <Ionicons name="cube-outline" size={24} color="#9ca3af" />
            </View>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardLabel}>Total Assets</Text>
              <Text style={styles.summaryCardValue}>51</Text>
              <Text style={styles.summaryCardSubtext}>Real-time count</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { borderLeftColor: '#10b981' }]}>
            <View style={styles.summaryCardIcon}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            </View>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardLabel}>Active Assets</Text>
              <Text style={[styles.summaryCardValue, { color: '#10b981' }]}>48</Text>
              <Text style={styles.summaryCardSubtext}>Operational status</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { borderLeftColor: '#f59e0b' }]}>
            <View style={styles.summaryCardIcon}>
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
            </View>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardLabel}>Maintenance Queue</Text>
              <Text style={[styles.summaryCardValue, { color: '#f59e0b' }]}>3</Text>
              <Text style={styles.summaryCardSubtext}>Pending maintenance</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { borderLeftColor: '#ef4444' }]}>
            <View style={styles.summaryCardIcon}>
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            </View>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardLabel}>Critical Alerts</Text>
              <Text style={[styles.summaryCardValue, { color: '#ef4444' }]}>2</Text>
              <Text style={styles.summaryCardSubtext}>Immediate attention</Text>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterSection}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by asset ID, type, location..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filters Row */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
              <FilterDropdown
                label="Status"
                options={statusOptions}
                selectedValue={selectedStatus}
                onSelect={setSelectedStatus}
              />
              <FilterDropdown
                label="Asset Type"
                options={typeOptions}
                selectedValue={selectedType}
                onSelect={setSelectedType}
              />
              <FilterDropdown
                label="Location"
                options={conditionOptions}
                selectedValue={selectedCondition}
                onSelect={setSelectedCondition}
              />
              <TouchableOpacity style={styles.moreFiltersButton}>
                <Ionicons name="options-outline" size={16} color="#6b7280" />
                <Text style={styles.moreFiltersText}>More Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Active Filters */}
          {(selectedStatus !== 'All Status' || selectedType !== 'All Types' || selectedCondition !== 'All Conditions') && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.activeFiltersRow}>
                  {selectedStatus !== 'All Status' && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>Status: {selectedStatus}</Text>
                      <TouchableOpacity onPress={() => setSelectedStatus('All Status')}>
                        <Ionicons name="close" size={14} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedType !== 'All Types' && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>Type: {selectedType}</Text>
                      <TouchableOpacity onPress={() => setSelectedType('All Types')}>
                        <Ionicons name="close" size={14} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedCondition !== 'All Conditions' && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>Location: {selectedCondition}</Text>
                      <TouchableOpacity onPress={() => setSelectedCondition('All Conditions')}>
                        <Ionicons name="close" size={14} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.clearAllFiltersButton}
                    onPress={() => {
                      setSelectedStatus('All Status');
                      setSelectedType('All Types');
                      setSelectedCondition('All Conditions');
                    }}
                  >
                    <Text style={styles.clearAllFiltersText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.tableControlsContainer}>
          <View style={styles.leftControls}>
            
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Text style={styles.viewButtonText}>☰</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
                onPress={() => setViewMode('grid')}
              >
                <Text style={styles.viewButtonText}>⊞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bulk Actions Toolbar */}
        {selectedAssets.length > 0 && (
          <View style={styles.bulkActionsBar}>
            <Text style={styles.bulkActionsText}>
              {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
            </Text>
            <View style={styles.bulkActions}>
              <TouchableOpacity style={styles.bulkActionButton}>
                <Text style={styles.bulkActionText}>Export Selected</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bulkActionButton}>
                <Text style={styles.bulkActionText}>Bulk Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bulkActionButton, styles.bulkActionDanger]}>
                <Text style={[styles.bulkActionText, styles.bulkActionTextDanger]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Table Header */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <TouchableOpacity style={styles.headerCheckbox} onPress={handleSelectAll}>
              <View style={[styles.checkboxInner, selectedAssets.length === paginatedAssets.length && styles.checkboxSelected]}>
                {selectedAssets.length === paginatedAssets.length && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={[styles.columnHeader, { width: 80 }]}>Asset ID</Text>
            <Text style={[styles.columnHeader, { width: 70 }]}>Type</Text>
            <Text style={[styles.columnHeader, { width: 90 }]}>Location</Text>
            <Text style={[styles.columnHeader, { width: 60, textAlign: 'center' }]}>Health</Text>
            <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Condition</Text>
            <Text style={[styles.columnHeader, { width: 70, textAlign: 'center' }]}>Status</Text>
            <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Install Date</Text>
            <Text style={[styles.columnHeader, { flex: 1, textAlign: 'right' }]}>Actions</Text>
          </View>

          {/* Asset Rows */}
          <FlatList
            data={paginatedAssets}
            renderItem={renderAssetRow}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Pagination */}
        {renderPagination()}
      </ScrollView>
      
      {/* QR Code Modal */}
      {selectedAssetForQR && (
        <QRCodeModal
          visible={qrModalVisible}
          onClose={() => {
            setQrModalVisible(false);
            setSelectedAssetForQR(null);
          }}
          assetData={selectedAssetForQR}
        />
      )}

      {/* Asset Details Modal */}
      {selectedAssetForDetails && (
        <AssetDetailsModal
          visible={assetDetailsVisible}
          onClose={() => {
            setAssetDetailsVisible(false);
            setSelectedAssetForDetails(null);
          }}
          onEditAsset={() => {
            Alert.alert('Edit Asset', `Editing asset ${selectedAssetForDetails.id}`);
          }}
          onGenerateQR={() => {
            setAssetDetailsVisible(false);
            setSelectedAssetForQR({
              id: selectedAssetForDetails.id,
              type: selectedAssetForDetails.type,
              location: selectedAssetForDetails.location,
              status: selectedAssetForDetails.status,
              healthScore: selectedAssetForDetails.healthScore,
              predictedRUL: 120,
              lastInspection: '2024-08-15',
              nextMaintenance: '2024-11-15',
              qrVersion: '1.0',
            });
            setQrModalVisible(true);
          }}
          assetData={selectedAssetForDetails}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
    lineHeight: 22,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  bulkImportButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  bulkImportText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  reportsButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  reportsText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  exportText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  actionBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnSecondaryText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  content: {
    flex: 1,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryIcon: {
    fontSize: 18,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -1,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  searchButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },

  viewToggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
  },
  viewButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
  },

  // Table Styles
  tableContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fafbfc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCheckbox: {
    width: 24,
    marginRight: 16,
  },
  columnHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  
  // Asset Row Styles
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    minHeight: 70,
    backgroundColor: '#ffffff',
  },
  checkbox: {
    width: 24,
    marginRight: 16,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  assetId: {
    width: 80,
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  assetType: {
    width: 70,
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  assetLocation: {
    width: 90,
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
    lineHeight: 14,
  },
  healthScoreContainer: {
    width: 60,
    alignItems: 'center',
  },
  healthScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
  },
  healthScoreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  conditionContainer: {
    width: 80,
    alignItems: 'center',
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusContainer: {
    width: 70,
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  installDate: {
    width: 80,
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
    minWidth: 70,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paginationInfo: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paginationButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  paginationNumber: {
    width: 38,
    height: 38,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationNumberActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
    shadowOpacity: 0.15,
  },
  paginationNumberText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  paginationNumberTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Bulk Actions
  bulkActionsBar: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bulkActionsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bulkActionDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  bulkActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bulkActionTextDanger: {
    color: '#fecaca',
  },
  summaryCardIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  summaryCardSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
  },

  // Search and Filter Styles
  searchFilterSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersScrollContent: {
    paddingRight: 20,
  },
  moreFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    gap: 8,
    marginLeft: 8,
  },
  moreFiltersText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  clearAllFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginLeft: 8,
  },
  clearAllFiltersText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tableControlsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControls: {
    flex: 1,
  },
});

export default AssetsScreen;