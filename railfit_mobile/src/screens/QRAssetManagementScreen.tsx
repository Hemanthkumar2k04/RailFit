import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-native-qrcode-svg';
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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import SimpleQRScanner from '../components/SimpleQRScanner';
import SharedSidebar from '../components/SharedSidebar';
import { useSidebar } from '../hooks/useSidebar';

const { width } = Dimensions.get('window');

// Asset types and options
const assetTypes = [
  'Elastic Rail Clip',
  'Rail Pad',
  'Liner',
  'Sleeper'
];

const assetTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Elastic Rail Clip', label: 'Elastic Rail Clip' },
  { value: 'Rail Pad', label: 'Rail Pad' },
  { value: 'Liner', label: 'Liner' },
  { value: 'Sleeper', label: 'Sleeper' }
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'retired', label: 'Retired' },
  { value: 'not_installed', label: 'Not Installed' }
];

const conditionOptions = [
  { value: '', label: 'All Conditions' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'ok', label: 'OK' },
  { value: 'critical', label: 'Critical' }
];

interface Asset {
  asset_id: string;
  type: string;
  location: string;
  health_score?: number;
  status: string;
  condition: string;
  install_date?: string;
  vendor_id?: string;
  created_at: string;
  updated_at: string;
  qr_code?: string;
  description?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  maintenance_schedule?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_cost?: number;
  depreciation_rate?: number;
  warranty_expiry?: string;
  technical_specs?: string;
}

const mockAssets: Asset[] = [
  {
    asset_id: 'd23e0996',
    type: 'Rail Pad',
    location: 'Visitor Center XX-34',
    status: 'active',
    condition: 'excellent',
    health_score: 95,
    install_date: '2024-03-12',
    next_maintenance: '2024-04-12',
    created_at: '2024-01-01',
    updated_at: '2024-03-12',
    serial_number: 'RP-0996',
    manufacturer: 'Railway Corp',
    description: 'High-grade rail pad for visitor center section',
    qr_code: 'QR-d23e0996',
    model: 'RP-2024-HD',
    vendor_id: 'VENDOR-001',
    maintenance_schedule: 'Quarterly',
    last_maintenance: '2024-01-12',
    purchase_cost: 150.00,
    warranty_expiry: '2026-03-12',
    technical_specs: 'Load capacity: 25 tons, Temperature range: -40°C to +70°C'
  },
  {
    asset_id: '576bdd49',
    type: 'Rail Pad',
    location: 'First Aid Point TT',
    status: 'active',
    condition: 'excellent',
    health_score: 92,
    install_date: '2024-02-15',
    next_maintenance: '2024-03-15',
    created_at: '2024-01-01',
    updated_at: '2024-02-15',
    serial_number: 'RP-dd49',
    manufacturer: 'Railway Corp',
    description: 'Rail pad at first aid point',
    qr_code: 'QR-576bdd49',
    model: 'RP-2024-STD',
    vendor_id: 'VENDOR-002',
    maintenance_schedule: 'Bi-annual',
    last_maintenance: '2024-02-01',
    purchase_cost: 120.00,
    warranty_expiry: '2026-02-15',
    technical_specs: 'Load capacity: 20 tons, Temperature range: -30°C to +60°C'
  },
  {
    asset_id: 'a45f8821',
    type: 'Elastic Rail Clip',
    location: 'Platform 2-A',
    status: 'under_maintenance',
    condition: 'good',
    health_score: 78,
    install_date: '2024-01-10',
    next_maintenance: '2024-02-10',
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
    serial_number: 'ERC-8821',
    manufacturer: 'Clip Systems Ltd',
    description: 'Elastic rail clip for platform section',
    qr_code: 'QR-a45f8821',
    model: 'ERC-2024-PRO',
    vendor_id: 'VENDOR-003',
    maintenance_schedule: 'Monthly',
    last_maintenance: '2024-01-01',
    purchase_cost: 85.00,
    warranty_expiry: '2025-01-10',
    technical_specs: 'Tensile strength: 50kN, Operating temperature: -20°C to +50°C'
  },
  {
    asset_id: 'c67d1234',
    type: 'Sleeper',
    location: 'Junction B-12',
    status: 'active',
    condition: 'critical',
    health_score: 45,
    install_date: '2023-12-01',
    next_maintenance: '2024-01-01',
    created_at: '2023-12-01',
    updated_at: '2024-01-01',
    serial_number: 'SLP-1234',
    manufacturer: 'Concrete Works',
    description: 'Concrete sleeper at junction',
    qr_code: 'QR-c67d1234',
    model: 'SLP-2023-CON',
    vendor_id: 'VENDOR-004',
    maintenance_schedule: 'Annual',
    last_maintenance: '2023-12-01',
    purchase_cost: 200.00,
    warranty_expiry: '2028-12-01',
    technical_specs: 'Load capacity: 40 tons, Concrete grade: M40, Length: 2.6m'
  },
  {
    asset_id: 'e89b5566',
    type: 'Liner',
    location: 'Tunnel Section C',
    status: 'active',
    condition: 'critical',
    health_score: 38,
    install_date: '2023-11-15',
    next_maintenance: '2023-12-15',
    created_at: '2023-11-15',
    updated_at: '2023-12-15',
    serial_number: 'LNR-5566',
    manufacturer: 'Tunnel Tech',
    description: 'Tunnel liner section C'
  }
];

export default function AssetsScreen() {
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAsset, setQRAsset] = useState<Asset | null>(null);
  const [showQRData, setShowQRData] = useState(false);
  const [qrFormat, setQrFormat] = useState<'json' | 'sql'>('json');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    condition: ''
  });
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  
  // New Asset Form State
  const [newAssetForm, setNewAssetForm] = useState({
    asset_id: '',
    type: '',
    location: '',
    serial_number: '',
    manufacturer: '',
    model: '',
    description: '',
    status: 'not_installed' as const,
    condition: 'excellent' as const,
    health_score: 100
  });

  useEffect(() => {
    filterAssets();
  }, [searchQuery, selectedFilter, filters, assets]);

  const filterAssets = () => {
    let filtered = assets;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        asset =>
          (asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          asset.asset_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter dropdowns
    if (filters.type) {
      filtered = filtered.filter(asset => asset.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }
    if (filters.condition) {
      filtered = filtered.filter(asset => asset.condition === filters.condition);
    }

    setFilteredAssets(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleQRScanSuccess = (scanResult: any) => {
    setShowQRScanner(false);
    
    // Find the asset based on the scanned QR code
    const foundAsset = assets.find(asset => 
      asset.asset_id === scanResult.qrData || 
      asset.qr_code === scanResult.qrData
    );

    if (foundAsset) {
      setScannedAsset(foundAsset);
      setSelectedAsset(foundAsset);
      setModalVisible(true);
      
      Alert.alert(
        'Asset Found',
        `Successfully scanned: ${foundAsset.type}\nLocation: ${foundAsset.location}\nStatus: ${foundAsset.status.toUpperCase()}`,
        [{ text: 'View Details', onPress: () => setModalVisible(true) }]
      );
    } else {
      Alert.alert(
        'Asset Not Found',
        `No asset found with QR code: ${scanResult.qrData}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleQRScanCancel = () => {
    setShowQRScanner(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'under_maintenance': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'retired': return '#6b7280';
      case 'not_installed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'ok': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHealthScoreColor = (score?: number) => {
    if (!score) return '#6b7280';
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMaintenanceUrgencyColor = (dateString: string) => {
    const maintenanceDate = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntil < 0) return '#ef4444'; // Overdue
    if (daysUntil <= 7) return '#f97316'; // Due soon
    if (daysUntil <= 30) return '#f59e0b'; // Due within month
    return '#10b981'; // Good
  };

  const getWarrantyStatusColor = (dateString: string) => {
    const warrantyDate = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((warrantyDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntil < 0) return '#ef4444'; // Expired
    if (daysUntil <= 90) return '#f97316'; // Expiring soon
    return '#10b981'; // Valid
  };

  const handleAssetPress = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalVisible(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalVisible(true);
  };

  const handleShowQRCode = (asset: Asset) => {
    setQRAsset(asset);
    setShowQRModal(true);
    setShowQRData(false);
    setQrFormat('json');
  };

  const qrCodeRef = useRef<any>(null);

  const generateQRCodeImage = async (asset: Asset): Promise<string> => {
    try {
      // We'll capture the QR code from the modal when it's visible
      if (!qrCodeRef.current) {
        throw new Error('QR Code not ready for capture');
      }
      
      // Capture the QR code as image
      const uri = await captureRef(qrCodeRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });
      
      // Create a permanent file
      const fileName = `QR_${asset.asset_id}_${Date.now()}.png`;
      const documentDir = Paths.document.uri;
      const permanentUri = `${documentDir}${fileName}`;
      
      // Copy to permanent location
      await FileSystem.copyAsync({
        from: uri,
        to: permanentUri
      });
      
      return permanentUri;
    } catch (error) {
      console.error('Error generating QR code image:', error);
      throw error;
    }
  };

  const handleDownloadAsset = async (asset: Asset) => {
    try {
      Alert.alert(
        'Download QR Code',
        `Download QR code for ${asset.asset_id}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const fileUri = await generateQRCodeImage(asset);
                
                // Share the file
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: `QR Code for ${asset.asset_id}`
                  });
                  
                  Alert.alert(
                    'Success', 
                    `QR code downloaded for ${asset.asset_id}!\\n\\nThe file contains the QR data that can be used to generate the QR image.`
                  );
                } else {
                  Alert.alert('Success', `QR code data saved for ${asset.asset_id}`);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to download QR code');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', 'Failed to download QR code');
    }
  };

  const handleAddNewAsset = () => {
    // Generate new asset ID
    const newId = `AS-${Date.now().toString().slice(-6)}`;
    setNewAssetForm({
      asset_id: newId,
      type: '',
      location: '',
      serial_number: '',
      manufacturer: '',
      model: '',
      description: '',
      status: 'not_installed',
      condition: 'excellent',
      health_score: 100
    });
    setShowAddAssetModal(true);
  };

  const saveNewAsset = () => {
    // Validate required fields
    if (!newAssetForm.type || !newAssetForm.location) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Asset Type and Location)');
      return;
    }

    // Create new asset object
    const newAsset: Asset = {
      asset_id: newAssetForm.asset_id,
      type: newAssetForm.type,
      location: newAssetForm.location,
      status: newAssetForm.status,
      condition: newAssetForm.condition,
      health_score: newAssetForm.health_score,
      install_date: new Date().toISOString().split('T')[0],
      next_maintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months from now
      last_maintenance: undefined,
      serial_number: newAssetForm.serial_number || undefined,
      manufacturer: newAssetForm.manufacturer || undefined,
      model: newAssetForm.model || undefined,
      description: newAssetForm.description || undefined,
      vendor_id: 'V001', // Default vendor
      purchase_cost: 0,
      warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year warranty
      technical_specs: 'Standard specifications',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to assets list
    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);
    
    // Update filtered assets - using filterAssets() function that exists
    setAssets(updatedAssets);
    filterAssets();
    
    // Close modal and show success
    setShowAddAssetModal(false);
    Alert.alert('Success', `Asset ${newAsset.asset_id} has been created successfully!`);
  };

  const handleBulkImport = async () => {
    try {
      Alert.alert(
        'Bulk Import Assets',
        'Choose an option to import asset data. You can download a template or simulate importing sample data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download Template',
            onPress: async () => {
              try {
                const csvTemplate = `asset_id,type,location,status,condition,health_score,description,serial_number,manufacturer,model,vendor_id,purchase_cost\nAST-NEW-001,Rail Pad,Platform A,active,excellent,95,High-grade rail pad for platform,RP-001,Railway Corp,RP-2024-HD,V001,2500\nAST-NEW-002,Elastic Rail Clip,Junction B,active,good,85,Standard rail clip for junction,ERC-002,Clip Systems,ERC-2024-STD,V002,1200\nAST-NEW-003,Liner,Track Section C,not_installed,excellent,100,Protective liner for track section,LN-003,Track Solutions,LN-2024-PRO,V003,800\nAST-NEW-004,Sleeper,Bridge D,active,fair,70,Concrete sleeper for bridge,SL-004,Bridge Corp,SL-2024-CON,V001,5000`;
                
                const templateUri = Paths.cache.uri + `bulk_import_template_${Date.now()}.csv`;
                await FileSystem.writeAsStringAsync(templateUri, csvTemplate);
                
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(templateUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Asset Import Template'
                  });
                }
                
                Alert.alert('Template Downloaded', 'CSV template downloaded with sample data! Fill it with your asset data.');
              } catch (error) {
                Alert.alert('Error', 'Failed to download template');
              }
            }
          },
          {
            text: 'Import Sample Data',
            onPress: async () => {
              try {
                // Simulate importing sample assets
                const sampleAssets: Asset[] = [
                  {
                    asset_id: `AST-IMP-${Date.now()}-001`,
                    type: 'Rail Pad',
                    location: 'Imported Platform A',
                    status: 'active',
                    condition: 'excellent',
                    health_score: 95,
                    install_date: new Date().toISOString().split('T')[0],
                    next_maintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    last_maintenance: undefined,
                    serial_number: 'RP-IMP-001',
                    manufacturer: 'Railway Corp',
                    model: 'RP-2024-HD',
                    description: 'Imported high-grade rail pad',
                    vendor_id: 'V001',
                    purchase_cost: 2500,
                    warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    technical_specs: 'High-grade specifications',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    asset_id: `AST-IMP-${Date.now()}-002`,
                    type: 'Elastic Rail Clip',
                    location: 'Imported Junction B',
                    status: 'active',
                    condition: 'good',
                    health_score: 85,
                    install_date: new Date().toISOString().split('T')[0],
                    next_maintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    last_maintenance: undefined,
                    serial_number: 'ERC-IMP-002',
                    manufacturer: 'Clip Systems',
                    model: 'ERC-2024-STD',
                    description: 'Imported standard rail clip',
                    vendor_id: 'V002',
                    purchase_cost: 1200,
                    warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    technical_specs: 'Standard specifications',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                ];

                const updatedAssets = [...assets, ...sampleAssets];
                setAssets(updatedAssets);
                setAssets(updatedAssets);
                // Trigger re-filtering
                filterAssets();
                
                Alert.alert('Import Complete', `Successfully imported ${sampleAssets.length} sample assets!`);
              } catch (error) {
                Alert.alert('Error', 'Failed to import sample data');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in bulk import:', error);
      Alert.alert('Error', 'Failed to initiate bulk import');
    }
  };

  const handleGenerateReports = async () => {
    try {
      Alert.alert(
        'Generate Reports',
        'Choose the type of report you want to generate:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Summary Report',
            onPress: async () => {
              const totalAssets = assets.length;
              const activeAssets = assets.filter(a => a.status === 'active').length;
              const maintenanceAssets = assets.filter(a => a.status === 'under_maintenance').length;
              const retiredAssets = assets.filter(a => a.status === 'retired').length;
              const notInstalledAssets = assets.filter(a => a.status === 'not_installed').length;
              
              const excellentAssets = assets.filter(a => a.condition === 'excellent').length;
              const goodAssets = assets.filter(a => a.condition === 'good').length;
              const fairAssets = assets.filter(a => a.condition === 'fair').length;
              const criticalAssets = assets.filter(a => a.condition === 'critical').length;
              
              const avgHealthScore = totalAssets > 0 ? (assets.reduce((sum, a) => sum + (a.health_score || 0), 0) / totalAssets).toFixed(1) : '0';
              const totalValue = assets.reduce((sum, a) => sum + (a.purchase_cost || 0), 0);
              
              const assetsByType = assetTypes.map(type => ({
                type,
                count: assets.filter(a => a.type === type).length,
                avgHealth: assets.filter(a => a.type === type).length > 0 
                  ? (assets.filter(a => a.type === type).reduce((sum, a) => sum + (a.health_score || 0), 0) / assets.filter(a => a.type === type).length).toFixed(1)
                  : '0'
              }));
              
              const reportContent = `COMPREHENSIVE RAILWAY ASSET MANAGEMENT REPORT
Generated: ${new Date().toLocaleString()}
Report ID: RPT-${Date.now()}

${'='.repeat(60)}
EXECUTIVE SUMMARY
${'='.repeat(60)}
Total Assets: ${totalAssets}
Total Asset Value: $${totalValue.toLocaleString()}
Average Health Score: ${avgHealthScore}%

${'='.repeat(60)}
ASSET STATUS BREAKDOWN
${'='.repeat(60)}
Active: ${activeAssets} (${(activeAssets/totalAssets*100).toFixed(1)}%)
Under Maintenance: ${maintenanceAssets} (${(maintenanceAssets/totalAssets*100).toFixed(1)}%)
Retired: ${retiredAssets} (${(retiredAssets/totalAssets*100).toFixed(1)}%)
Not Installed: ${notInstalledAssets} (${(notInstalledAssets/totalAssets*100).toFixed(1)}%)

${'='.repeat(60)}
CONDITION ANALYSIS
${'='.repeat(60)}
Excellent: ${excellentAssets} (${(excellentAssets/totalAssets*100).toFixed(1)}%)
Good: ${goodAssets} (${(goodAssets/totalAssets*100).toFixed(1)}%)
Fair: ${fairAssets} (${(fairAssets/totalAssets*100).toFixed(1)}%)
Critical: ${criticalAssets} (${(criticalAssets/totalAssets*100).toFixed(1)}%)

${'='.repeat(60)}
ASSET TYPE ANALYSIS
${'='.repeat(60)}
${assetsByType.map(item => `${item.type}: ${item.count} assets (Avg Health: ${item.avgHealth}%)`).join('\n')}

${'='.repeat(60)}
CRITICAL ASSETS REQUIRING ATTENTION
${'='.repeat(60)}
${criticalAssets > 0 ? assets.filter(a => a.condition === 'critical').map(asset => 
                `- ${asset.asset_id} (${asset.type})
  Location: ${asset.location}
  Health Score: ${asset.health_score}%
  Last Maintenance: ${asset.last_maintenance || 'Never'}
`).join('\n') : 'No critical assets found - All assets in good condition!'}

${'='.repeat(60)}
MAINTENANCE SCHEDULE (Next 30 Days)
${'='.repeat(60)}
${assets.filter(a => a.next_maintenance).filter(a => {
                const nextMaintenance = new Date(a.next_maintenance!);
                const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return nextMaintenance <= thirtyDaysFromNow;
              }).map(asset => 
                `- ${asset.asset_id} (${asset.type}) - ${asset.next_maintenance}`
              ).join('\n') || 'No maintenance scheduled in the next 30 days'}

Report generated by RailFit Asset Management System
© 2024 Railway Asset Management Solutions`;
              
              const reportFileName = `Comprehensive_Asset_Report_${new Date().toISOString().split('T')[0]}.txt`;
              const reportUri = Paths.cache.uri + reportFileName;
              await FileSystem.writeAsStringAsync(reportUri, reportContent);
              
              Alert.alert(
                'Report Generated',
                `Comprehensive report created analyzing ${totalAssets} assets.`,
                [
                  { text: 'Share Report', onPress: async () => {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(reportUri, {
                        mimeType: 'text/plain',
                        dialogTitle: 'Comprehensive Railway Asset Report'
                      });
                    }
                  }},
                  { text: 'OK' }
                ]
              );
            }
          },
          {
            text: 'Maintenance Report',
            onPress: async () => {
              const maintenanceDue = assets.filter(a => {
                if (!a.next_maintenance) return false;
                const nextMaintenance = new Date(a.next_maintenance);
                const today = new Date();
                return nextMaintenance <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Due within 7 days
              });
              
              const overdueMaintenance = assets.filter(a => {
                if (!a.next_maintenance) return false;
                const nextMaintenance = new Date(a.next_maintenance);
                return nextMaintenance < new Date();
              });
              
              const maintenanceContent = `MAINTENANCE SCHEDULE REPORT
Generated: ${new Date().toLocaleString()}

${'='.repeat(50)}
OVERDUE MAINTENANCE (${overdueMaintenance.length} assets)
${'='.repeat(50)}
${overdueMaintenance.map(asset => 
                `${asset.asset_id} - ${asset.type}
Location: ${asset.location}
Due Date: ${asset.next_maintenance}
Health Score: ${asset.health_score}%
Days Overdue: ${Math.ceil((new Date().getTime() - new Date(asset.next_maintenance!).getTime()) / (1000 * 60 * 60 * 24))}
`).join('\n') || 'No overdue maintenance!'}

${'='.repeat(50)}
UPCOMING MAINTENANCE (Next 7 Days - ${maintenanceDue.length} assets)
${'='.repeat(50)}
${maintenanceDue.map(asset => 
                `${asset.asset_id} - ${asset.type}
Location: ${asset.location}
Scheduled: ${asset.next_maintenance}
Health Score: ${asset.health_score}%
`).join('\n') || 'No maintenance due in the next 7 days!'}`;
              
              const maintenanceFileName = `Maintenance_Report_${new Date().toISOString().split('T')[0]}.txt`;
              const maintenanceUri = Paths.cache.uri + maintenanceFileName;
              await FileSystem.writeAsStringAsync(maintenanceUri, maintenanceContent);
              
              Alert.alert(
                'Maintenance Report Generated',
                `Found ${overdueMaintenance.length} overdue and ${maintenanceDue.length} upcoming maintenance items.`,
                [
                  { text: 'Share Report', onPress: async () => {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(maintenanceUri, {
                        mimeType: 'text/plain',
                        dialogTitle: 'Maintenance Schedule Report'
                      });
                    }
                  }},
                  { text: 'OK' }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Asset Data',
        `Export ${assets.length} assets in your preferred format.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export as CSV',
            onPress: async () => {
              try {
                const headers = [
                  'asset_id', 'type', 'location', 'status', 'condition', 'health_score',
                  'install_date', 'next_maintenance', 'last_maintenance', 'serial_number', 
                  'manufacturer', 'model', 'description', 'technical_specs', 'purchase_cost',
                  'warranty_expiry', 'vendor_id', 'certifications'
                ];
                
                const csvContent = [
                  headers.join(','),
                  ...assets.map(asset => headers.map(header => {
                    let value = asset[header as keyof Asset];
                    if (Array.isArray(value)) {
                      value = value.join('; ');
                    }
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                      value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                  }).join(','))
                ].join('\n');
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                const csvFileName = `RailFit_Assets_Export_${timestamp}_${assets.length}records.csv`;
                const csvUri = Paths.cache.uri + csvFileName;
                await FileSystem.writeAsStringAsync(csvUri, csvContent);
                
                Alert.alert(
                  'CSV Export Complete',
                  `Successfully exported ${assets.length} assets to CSV format.`,
                  [
                    {
                      text: 'Share File',
                      onPress: async () => {
                        if (await Sharing.isAvailableAsync()) {
                          await Sharing.shareAsync(csvUri, {
                            mimeType: 'text/csv',
                            dialogTitle: 'RailFit Asset Data Export'
                          });
                        }
                      }
                    },
                    { text: 'OK' }
                  ]
                );
                
              } catch (error) {
                console.error('CSV Export Error:', error);
                Alert.alert('Export Error', 'Failed to export CSV data. Please try again.');
              }
            }
          },
          {
            text: 'Export as JSON',
            onPress: async () => {
              try {
                const exportData = {
                  export_info: {
                    timestamp: new Date().toISOString(),
                    total_assets: assets.length,
                    exported_by: 'RailFit Mobile App v1.0',
                    format: 'JSON'
                  },
                  assets: assets.map(asset => ({
                    ...asset,
                    export_timestamp: new Date().toISOString()
                  }))
                };
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                const jsonFileName = `RailFit_Assets_Export_${timestamp}_${assets.length}records.json`;
                const jsonUri = Paths.cache.uri + jsonFileName;
                
                await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(exportData, null, 2));
                
                Alert.alert(
                  'JSON Export Complete',
                  `Successfully exported ${assets.length} assets to JSON format with metadata.`,
                  [
                    {
                      text: 'Share File',
                      onPress: async () => {
                        if (await Sharing.isAvailableAsync()) {
                          await Sharing.shareAsync(jsonUri, {
                            mimeType: 'application/json',
                            dialogTitle: 'RailFit Asset Data Export (JSON)'
                          });
                        }
                      }
                    },
                    { text: 'OK' }
                  ]
                );
                
              } catch (error) {
                console.error('JSON Export Error:', error);
                Alert.alert('Export Error', 'Failed to export JSON data. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in export data:', error);
      Alert.alert('Error', 'Failed to initiate data export');
    }
  };

  const buildAssetJSON = (asset: Asset) => {
    const core: Record<string, any> = {
      asset_id: asset.asset_id,
      type: asset.type,
      location: asset.location,
      status: asset.status,
      condition: asset.condition,
      health_score: asset.health_score,
      install_date: asset.install_date,
      next_maintenance: asset.next_maintenance,
      last_maintenance: asset.last_maintenance,
      predicted_rul_days: asset.health_score ? Math.max(0, (asset.health_score || 0) * 2) : undefined,
      serial_number: asset.serial_number,
      manufacturer: asset.manufacturer,
      model: asset.model,
      vendor_id: asset.vendor_id,
      warranty_expiry: asset.warranty_expiry,
      qr_version: '1.0'
    };
    Object.keys(core).forEach(k => core[k] === undefined && delete core[k]);
    return core;
  };

  const buildAssetSQL = (asset: Asset) => {
    const json = buildAssetJSON(asset);
    const columns = Object.keys(json).map(k => `\`${k}\``).join(', ');
    const values = Object.values(json).map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'number') return v.toString();
      return `'${String(v).replace(/'/g, "''")}'`;
    }).join(', ');
    return `INSERT INTO assets (${columns}) VALUES (${values});`;
  };

  const toggleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedAssets(prev =>
      prev.length === filteredAssets.length
        ? []
        : filteredAssets.map(asset => asset.asset_id)
    );
  };

  // Calculate metrics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceQueue = assets.filter(a => a.status === 'under_maintenance').length;
  const criticalAlerts = assets.filter(a => a.condition === 'critical').length;

  const MetricCard = ({ title, value, subtitle, color, icon }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: string;
  }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricContent}>
        <View style={styles.metricTextContainer}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.metricIcon}>{icon}</Text>
      </View>
    </View>
  );

  // Column width definitions for better alignment
  const columnWidths = {
    checkbox: 50,
    assetId: 80,
    type: 70,
    location: 100,
    healthScore: 60,
    condition: 70,
    status: 60,
    installDate: 80,
    actions: 120
  };

  const AssetTableRow = ({ asset, isSelected, onToggle }: {
    asset: Asset;
    isSelected: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity style={styles.tableRow} onPress={() => handleAssetPress(asset)}>
      <View style={[styles.tableCell, { width: columnWidths.checkbox }]}>
        <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={18} 
            color={isSelected ? "#3b82f6" : "#6b7280"} 
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.tableCell, styles.assetIdCell, { width: columnWidths.assetId }]}>
        <Text style={styles.assetIdText} numberOfLines={1} ellipsizeMode="tail">
          {asset.asset_id}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.type }]}>
        <Text style={styles.tableCellText} numberOfLines={1} ellipsizeMode="tail">
          {asset.type}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.location }]}>
        <Text style={styles.tableCellText} numberOfLines={2} ellipsizeMode="tail">
          {asset.location}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.healthScore }]}>
        <View style={[styles.healthScoreBadge, { backgroundColor: getHealthScoreColor(asset.health_score) }]}>
          <Text style={styles.healthScoreText}>{asset.health_score || 'N/A'}</Text>
        </View>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.condition }]}>
        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(asset.condition) }]}>
          <Text style={styles.conditionText} numberOfLines={1} ellipsizeMode="tail">
            {asset.condition}
          </Text>
        </View>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.status }]}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) }]}>
          <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
            {asset.status}
          </Text>
        </View>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.installDate }]}>
        <Text style={styles.tableCellText} numberOfLines={1} ellipsizeMode="tail">
          {formatDate(asset.install_date)}
        </Text>
      </View>
      <View style={[styles.tableCell, { width: columnWidths.actions }]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewAsset(asset)}
          >
            <Ionicons name="eye" size={14} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShowQRCode(asset)}
          >
            <Ionicons name="qr-code" size={14} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDownloadAsset(asset)}
          >
            <Ionicons name="download" size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>QR Asset Management</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Comprehensive railway infrastructure asset tracking and management</Text>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={handleAddNewAsset}
            >
              <Ionicons name="add" size={16} color="#ffffff" />
              <Text style={styles.primaryActionButtonText}>Add New Asset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.qrScannerButton}
              onPress={() => setShowQRScanner(true)}
            >
              <Ionicons name="qr-code" size={16} color="#ffffff" />
              <Text style={styles.qrScannerButtonText}>Scan QR</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.secondaryActionsContainer}>
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={handleBulkImport}
              >
                <Ionicons name="cloud-upload" size={16} color="#6b7280" />
                <Text style={styles.secondaryActionButtonText}>Bulk Import</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={handleGenerateReports}
              >
                <Ionicons name="document-text" size={16} color="#6b7280" />
                <Text style={styles.secondaryActionButtonText}>Generate Reports</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={handleExportData}
              >
                <Ionicons name="download" size={16} color="#6b7280" />
                <Text style={styles.secondaryActionButtonText}>Export Data</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Total Assets"
            value={totalAssets}
            subtitle="Real-time count"
            color="#3b82f6"
            icon="📦"
          />
          <MetricCard
            title="Active Assets"
            value={activeAssets}
            subtitle="Operational status"
            color="#10b981"
            icon="✅"
          />
          <MetricCard
            title="Maintenance Queue"
            value={maintenanceQueue}
            subtitle="Pending maintenance"
            color="#f59e0b"
            icon="🔧"
          />
          <MetricCard
            title="Critical Alerts"
            value={criticalAlerts}
            subtitle="Immediate attention"
            color="#ef4444"
            icon="⚠️"
          />
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search assets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Dropdowns */}
          <View style={styles.filtersRow}>
            <TouchableOpacity 
              style={styles.filterDropdown}
              onPress={() => {
                Alert.alert(
                  'Filter by Type',
                  'Select asset type to filter',
                  [
                    { text: 'All Types', onPress: () => setFilters({ ...filters, type: '' }) },
                    ...assetTypeOptions.filter(opt => opt.value).map(option => ({
                      text: option.label,
                      onPress: () => setFilters({ ...filters, type: option.value })
                    }))
                  ]
                );
              }}
            >
              <Text style={styles.filterLabel}>
                {filters.type ? assetTypeOptions.find(opt => opt.value === filters.type)?.label : 'All Types'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterDropdown}
              onPress={() => {
                Alert.alert(
                  'Filter by Status',
                  'Select status to filter',
                  [
                    { text: 'All Status', onPress: () => setFilters({ ...filters, status: '' }) },
                    ...statusOptions.filter(opt => opt.value).map(option => ({
                      text: option.label,
                      onPress: () => setFilters({ ...filters, status: option.value })
                    }))
                  ]
                );
              }}
            >
              <Text style={styles.filterLabel}>
                {filters.status ? statusOptions.find(opt => opt.value === filters.status)?.label : 'All Status'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterDropdown}
              onPress={() => {
                Alert.alert(
                  'Filter by Condition',
                  'Select condition to filter',
                  [
                    { text: 'All Conditions', onPress: () => setFilters({ ...filters, condition: '' }) },
                    ...conditionOptions.filter(opt => opt.value).map(option => ({
                      text: option.label,
                      onPress: () => setFilters({ ...filters, condition: option.value })
                    }))
                  ]
                );
              }}
            >
              <Text style={styles.filterLabel}>
                {filters.condition ? conditionOptions.find(opt => opt.value === filters.condition)?.label : 'All Conditions'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Active Filters Indicator */}
          {(filters.type || filters.status || filters.condition) && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersText}>
                Filters active: {[filters.type, filters.status, filters.condition].filter(Boolean).length}
              </Text>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => setFilters({ type: '', status: '', condition: '' })}
              >
                <Ionicons name="close" size={16} color="#ef4444" />
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bulk Actions */}
          {selectedAssets.length > 0 && (
            <View style={styles.bulkActionsContainer}>
              <Text style={styles.bulkActionsText}>{selectedAssets.length} selected</Text>
              <TouchableOpacity 
                style={styles.bulkActionButton}
                onPress={async () => {
                  try {
                    const selectedAssetsList = assets.filter(asset => selectedAssets.includes(asset.asset_id));
                    
                    if (selectedAssetsList.length === 0) {
                      Alert.alert('Error', 'No assets selected');
                      return;
                    }
                    
                    Alert.alert(
                      'Download QR Codes',
                      `Download QR codes for ${selectedAssets.length} selected assets?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Download',
                          onPress: async () => {
                            try {
                              // Create a folder for the QR codes
                              const folderName = `QR_Codes_${Date.now()}`;
                              const documentDir = Paths.document.uri;
                              const folderUri = `${documentDir}${folderName}/`;
                              await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
                              
                              // Generate QR data files for each selected asset
                              const filePromises = selectedAssetsList.map(async (asset) => {
                                const qrData = buildAssetJSON(asset);
                                const fileName = `QR_${asset.asset_id}.txt`;
                                const fileUri = `${folderUri}${fileName}`;
                                const fileContent = `QR CODE DATA FOR ASSET: ${asset.asset_id}\n\nAsset Type: ${asset.type}\nLocation: ${asset.location}\nStatus: ${asset.status}\n\nQR Data (JSON format):\n${JSON.stringify(qrData, null, 2)}`;
                                await FileSystem.writeAsStringAsync(fileUri, fileContent);
                                return fileName;
                              });
                              
                              await Promise.all(filePromises);
                              
                              // Create a manifest file
                              const manifestData = {
                                generated_at: new Date().toISOString(),
                                total_assets: selectedAssetsList.length,
                                assets: selectedAssetsList.map(asset => ({
                                  asset_id: asset.asset_id,
                                  type: asset.type,
                                  location: asset.location,
                                  qr_file: `QR_${asset.asset_id}.json`
                                }))
                              };
                              
                              await FileSystem.writeAsStringAsync(
                                `${folderUri}manifest.json`,
                                JSON.stringify(manifestData, null, 2)
                              );
                              
                              // Share the folder (Note: mobile doesn't support zip natively, so sharing folder)
                              if (await Sharing.isAvailableAsync()) {
                                await Sharing.shareAsync(folderUri, {
                                  dialogTitle: `QR Codes for ${selectedAssets.length} assets`
                                });
                              }
                              
                              Alert.alert(
                                'Success', 
                                `QR codes generated for ${selectedAssets.length} assets!\n\nFiles saved to: ${folderName}`
                              );
                              
                            } catch (error) {
                              console.error('Error generating bulk QR codes:', error);
                              Alert.alert('Error', 'Failed to generate QR codes');
                            }
                          }
                        }
                      ]
                    );
                  } catch (error) {
                    console.error('Error in bulk download:', error);
                    Alert.alert('Error', 'Failed to initiate bulk download');
                  }
                }}
              >
                <Ionicons name="download" size={16} color="#3b82f6" />
                <Text style={styles.bulkActionButtonText}>Download QR Codes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Table Header */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScrollView}>
            <View style={styles.tableContent}>
              <View style={styles.tableHeader}>
            <View style={[styles.tableHeaderCell, { width: columnWidths.checkbox }]}>
              <TouchableOpacity onPress={toggleSelectAll} style={styles.checkbox}>
                <Ionicons 
                  name={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0 ? "checkbox" : "square-outline"} 
                  size={18} 
                  color={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0 ? "#3b82f6" : "#6b7280"} 
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.assetId }]}>
              <Text style={styles.tableHeaderText}>Asset ID</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.type }]}>
              <Text style={styles.tableHeaderText}>Type</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.location }]}>
              <Text style={styles.tableHeaderText}>Location</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.healthScore }]}>
              <Text style={styles.tableHeaderText}>Health</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.condition }]}>
              <Text style={styles.tableHeaderText}>Condition</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.status }]}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.installDate }]}>
              <Text style={styles.tableHeaderText}>Install</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: columnWidths.actions }]}>
              <Text style={styles.tableHeaderText}>Actions</Text>
            </View>
          </View>

          {/* Table Data */}
          <FlatList
            data={filteredAssets}
            keyExtractor={(item) => item.asset_id}
            renderItem={({ item }) => (
              <AssetTableRow
                asset={item}
                isSelected={selectedAssets.includes(item.asset_id)}
                onToggle={() => toggleSelectAsset(item.asset_id)}
              />
            )}
            scrollEnabled={false}
          />

              {/* Pagination */}
              <View style={styles.paginationContainer}>
                <Text style={styles.paginationText}>
                  Showing 1 to {filteredAssets.length} of {filteredAssets.length} assets
                </Text>
                <View style={styles.paginationButtons}>
                  <TouchableOpacity style={styles.paginationButton} disabled>
                    <Ionicons name="chevron-back" size={16} color="#9ca3af" />
                    <Text style={styles.paginationButtonTextDisabled}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.paginationButton, styles.paginationButtonActive]}>
                    <Text style={styles.paginationButtonTextActive}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.paginationButton} disabled>
                    <Text style={styles.paginationButtonTextDisabled}>Next</Text>
                    <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* QR Code Scanner Modal */}
        <Modal
          visible={showQRScanner}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SimpleQRScanner
            onScanSuccess={handleQRScanSuccess}
            onCancel={handleQRScanCancel}
          />
        </Modal>

        {/* Asset Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedAsset && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Asset Details</Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalBody}>
                    <View style={styles.modalAssetIdContainer}>
                      <Text style={styles.modalAssetId}>ID: {selectedAsset.asset_id}</Text>
                      {scannedAsset && scannedAsset.asset_id === selectedAsset.asset_id && (
                        <View style={styles.qrScanIndicator}>
                          <Ionicons name="qr-code" size={16} color="#10b981" />
                          <Text style={styles.qrScanText}>QR Scanned</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>📋 Asset Information</Text>
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Type:</Text>
                        <Text style={styles.modalValue}>{selectedAsset.type}</Text>
                      </View>
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Location:</Text>
                        <Text style={styles.modalValue}>{selectedAsset.location}</Text>
                      </View>
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Status:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedAsset.status) }]}>
                          <Text style={styles.statusText}>{selectedAsset.status}</Text>
                        </View>
                      </View>
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Health Score:</Text>
                        <Text style={[styles.modalValue, { color: getHealthScoreColor(selectedAsset.health_score || 0) }]}>
                          {selectedAsset.health_score || 'N/A'}%
                        </Text>
                      </View>
                      <View style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Condition:</Text>
                        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(selectedAsset.condition) }]}>
                          <Text style={styles.conditionText}>{selectedAsset.condition}</Text>
                        </View>
                      </View>
                      {selectedAsset.qr_code && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>QR Code:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.qr_code}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>🔧 Technical Details</Text>
                      {selectedAsset.serial_number && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Serial Number:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.serial_number}</Text>
                        </View>
                      )}
                      {selectedAsset.model && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Model:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.model}</Text>
                        </View>
                      )}
                      {selectedAsset.manufacturer && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Manufacturer:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.manufacturer}</Text>
                        </View>
                      )}
                      {selectedAsset.technical_specs && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Specifications:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.technical_specs}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>📅 Maintenance Information</Text>
                      {selectedAsset.install_date && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Install Date:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.install_date}</Text>
                        </View>
                      )}
                      {selectedAsset.last_maintenance && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Last Maintenance:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.last_maintenance}</Text>
                        </View>
                      )}
                      {selectedAsset.next_maintenance && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Next Maintenance:</Text>
                          <Text style={[styles.modalValue, { color: getMaintenanceUrgencyColor(selectedAsset.next_maintenance) }]}>
                            {selectedAsset.next_maintenance}
                          </Text>
                        </View>
                      )}
                      {selectedAsset.maintenance_schedule && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Schedule:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.maintenance_schedule}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>💰 Financial Information</Text>
                      {selectedAsset.purchase_cost && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Purchase Cost:</Text>
                          <Text style={styles.modalValue}>${selectedAsset.purchase_cost.toFixed(2)}</Text>
                        </View>
                      )}
                      {selectedAsset.warranty_expiry && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Warranty Expiry:</Text>
                          <Text style={[styles.modalValue, { color: getWarrantyStatusColor(selectedAsset.warranty_expiry) }]}>
                            {selectedAsset.warranty_expiry}
                          </Text>
                        </View>
                      )}
                      {selectedAsset.vendor_id && (
                        <View style={styles.modalItem}>
                          <Text style={styles.modalLabel}>Vendor ID:</Text>
                          <Text style={styles.modalValue}>{selectedAsset.vendor_id}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalActionButtons}>
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={() => {
                          setEditingAsset(selectedAsset);
                          setEditForm({ ...selectedAsset });
                          setModalVisible(false);
                          setShowEditAssetModal(true);
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color="#3b82f6" />
                        <Text style={styles.modalActionButtonText}>Edit Asset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={() => {
                          Alert.alert('Schedule Maintenance', `Maintenance scheduling for ${selectedAsset.asset_id}:\n\nNext maintenance: ${selectedAsset.next_maintenance || 'Not scheduled'}\nSchedule: ${selectedAsset.maintenance_schedule || 'Not defined'}`);
                        }}
                      >
                        <Ionicons name="construct-outline" size={20} color="#f59e0b" />
                        <Text style={styles.modalActionButtonText}>Schedule Maintenance</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={() => {
                          setModalVisible(false);
                          handleShowQRCode(selectedAsset);
                        }}
                      >
                        <Ionicons name="qr-code-outline" size={20} color="#7c3aed" />
                        <Text style={styles.modalActionButtonText}>View QR Code</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* QR Code Display Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showQRModal}
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {qrAsset && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>QR Code - {qrAsset.asset_id}</Text>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setShowQRModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.qrScroll} contentContainerStyle={styles.qrScrollContent}>
                    <View style={styles.qrCodeContainer}>
                      <View style={styles.qrCodeWrapper} ref={qrCodeRef}>
                        <QRCode
                          value={JSON.stringify(buildAssetJSON(qrAsset))}
                          size={220}
                          backgroundColor="#ffffff"
                          color="#000000"
                        />
                      </View>
                      <View style={styles.qrButtonsRow}>
                        <TouchableOpacity
                          style={styles.smallBtn}
                          onPress={() => setQrFormat(qrFormat === 'json' ? 'sql' : 'json')}
                        >
                          <Ionicons name="swap-horizontal" size={16} color="#374151" />
                          <Text style={styles.smallBtnText}>{qrFormat === 'json' ? 'Show SQL' : 'Show JSON'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallBtn}
                          onPress={() => setShowQRData(!showQRData)}
                        >
                          <Ionicons name={showQRData ? 'eye-off' : 'eye'} size={16} color="#374151" />
                          <Text style={styles.smallBtnText}>{showQRData ? 'Hide Data' : 'Show Data'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]}
                          onPress={() => handleDownloadAsset(qrAsset)}
                        >
                          <Ionicons name="download" size={16} color="#ffffff" />
                          <Text style={[styles.smallBtnText, { color: '#ffffff' }]}>Download</Text>
                        </TouchableOpacity>
                      </View>
                      {showQRData && (
                        <View style={styles.qrDataBlock}>
                          {qrFormat === 'json' ? (
                            <Text style={styles.codeBlock}>{JSON.stringify(buildAssetJSON(qrAsset), null, 2)}</Text>
                          ) : (
                            <Text style={styles.codeBlock}>{buildAssetSQL(qrAsset)}</Text>
                          )}
                        </View>
                      )}
                      <View style={styles.qrMetaData}>
                        <Text style={styles.qrMetaTitle}>QR Code Data</Text>
                        <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Asset ID:</Text><Text style={styles.metaValue}>{qrAsset.asset_id}</Text></View>
                        <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Type:</Text><Text style={styles.metaValue}>{qrAsset.type}</Text></View>
                        <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Location:</Text><Text style={styles.metaValue}>{qrAsset.location}</Text></View>
                        <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Status:</Text><Text style={styles.metaValue}>{qrAsset.status}</Text></View>
                        <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Health Score:</Text><Text style={styles.metaValue}>{qrAsset.health_score || 'N/A'}</Text></View>
                        {qrAsset.next_maintenance && (
                          <View style={styles.qrMetaRow}><Text style={styles.metaLabel}>Next Maint:</Text><Text style={styles.metaValue}>{qrAsset.next_maintenance}</Text></View>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Add New Asset Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAddAssetModal}
          onRequestClose={() => setShowAddAssetModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Asset</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.addAssetForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Asset ID *</Text>
                  <View style={styles.formInput}>
                    <Text style={styles.formInputValue}>Auto-generated: {newAssetForm.asset_id}</Text>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Asset Type *</Text>
                  <TouchableOpacity 
                    style={styles.formDropdown}
                    onPress={() => {
                      Alert.alert(
                        'Select Asset Type',
                        'Choose the type of asset:',
                        [
                          ...assetTypes.map(type => ({
                            text: type,
                            onPress: () => setNewAssetForm({...newAssetForm, type})
                          })),
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.formDropdownText, newAssetForm.type ? {color: '#1f2937'} : {}]}>
                      {newAssetForm.type || 'Select Asset Type'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter location (e.g., Platform A, Track Section 5)"
                    value={newAssetForm.location}
                    onChangeText={(text) => setNewAssetForm({...newAssetForm, location: text})}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Serial Number</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter serial number"
                    value={newAssetForm.serial_number}
                    onChangeText={(text) => setNewAssetForm({...newAssetForm, serial_number: text})}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Manufacturer</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter manufacturer name"
                    value={newAssetForm.manufacturer}
                    onChangeText={(text) => setNewAssetForm({...newAssetForm, manufacturer: text})}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Model</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter model number/name"
                    value={newAssetForm.model}
                    onChangeText={(text) => setNewAssetForm({...newAssetForm, model: text})}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Enter detailed description of the asset"
                    value={newAssetForm.description}
                    onChangeText={(text) => setNewAssetForm({...newAssetForm, description: text})}
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalActionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Text style={[styles.modalActionButtonText, { color: '#ffffff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalActionButton, { 
                    backgroundColor: (newAssetForm.type && newAssetForm.location) ? '#3b82f6' : '#9ca3af' 
                  }]}
                  onPress={saveNewAsset}
                  disabled={!(newAssetForm.type && newAssetForm.location)}
                >
                  <Text style={[styles.modalActionButtonText, { color: '#ffffff' }]}>Save Asset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Asset Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEditAssetModal}
          onRequestClose={() => setShowEditAssetModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Asset - {editingAsset?.asset_id}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowEditAssetModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.addAssetForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Asset Type *</Text>
                  <View style={styles.formPickerContainer}>
                    {assetTypeOptions.filter(option => option.value !== '').map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.formPickerOption,
                          editForm.type === option.value && styles.formPickerOptionSelected
                        ]}
                        onPress={() => setEditForm({ ...editForm, type: option.value })}
                      >
                        <Text style={[
                          styles.formPickerOptionText,
                          editForm.type === option.value && styles.formPickerOptionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location *</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter location"
                    value={editForm.location || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Serial Number</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter serial number"
                    value={editForm.serial_number || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, serial_number: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Manufacturer</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter manufacturer"
                    value={editForm.manufacturer || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, manufacturer: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Model</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter model"
                    value={editForm.model || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, model: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Status</Text>
                  <View style={styles.formPickerContainer}>
                    {statusOptions.filter(option => option.value !== '').map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.formPickerOption,
                          editForm.status === option.value && styles.formPickerOptionSelected
                        ]}
                        onPress={() => setEditForm({ ...editForm, status: option.value })}
                      >
                        <Text style={[
                          styles.formPickerOptionText,
                          editForm.status === option.value && styles.formPickerOptionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Condition</Text>
                  <View style={styles.formPickerContainer}>
                    {conditionOptions.filter(option => option.value !== '').map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.formPickerOption,
                          editForm.condition === option.value && styles.formPickerOptionSelected
                        ]}
                        onPress={() => setEditForm({ ...editForm, condition: option.value })}
                      >
                        <Text style={[
                          styles.formPickerOptionText,
                          editForm.condition === option.value && styles.formPickerOptionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Health Score (0-100)</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter health score"
                    value={editForm.health_score?.toString() || ''}
                    onChangeText={(text) => {
                      const score = parseInt(text) || 0;
                      if (score >= 0 && score <= 100) {
                        setEditForm({ ...editForm, health_score: score });
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formTextInput, { height: 80 }]}
                    placeholder="Enter description"
                    value={editForm.description || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Technical Specifications</Text>
                  <TextInput
                    style={[styles.formTextInput, { height: 80 }]}
                    placeholder="Enter technical specifications"
                    value={editForm.technical_specs || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, technical_specs: text })}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Purchase Cost</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter purchase cost"
                    value={editForm.purchase_cost?.toString() || ''}
                    onChangeText={(text) => {
                      const cost = parseFloat(text) || 0;
                      setEditForm({ ...editForm, purchase_cost: cost });
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Install Date</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="YYYY-MM-DD"
                    value={editForm.install_date || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, install_date: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Next Maintenance</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="YYYY-MM-DD"
                    value={editForm.next_maintenance || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, next_maintenance: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Maintenance Schedule</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="e.g., Monthly, Quarterly, Annual"
                    value={editForm.maintenance_schedule || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, maintenance_schedule: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Warranty Expiry</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="YYYY-MM-DD"
                    value={editForm.warranty_expiry || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, warranty_expiry: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Vendor ID</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="Enter vendor ID"
                    value={editForm.vendor_id || ''}
                    onChangeText={(text) => setEditForm({ ...editForm, vendor_id: text })}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalActionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => setShowEditAssetModal(false)}
                >
                  <Text style={[styles.modalActionButtonText, { color: '#ffffff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalActionButton, { backgroundColor: '#10b981' }]}
                  onPress={() => {
                    if (!editForm.type || !editForm.location) {
                      Alert.alert('Error', 'Please fill in required fields (Type and Location)');
                      return;
                    }

                    // Update the asset in the assets array
                    const updatedAssets = assets.map(asset => 
                      asset.asset_id === editingAsset?.asset_id 
                        ? { ...asset, ...editForm, updated_at: new Date().toISOString() }
                        : asset
                    );
                    setAssets(updatedAssets);
                    
                    Alert.alert('Success', `Asset ${editingAsset?.asset_id} has been updated successfully!`);
                    setShowEditAssetModal(false);
                    setEditForm({});
                    setEditingAsset(null);
                  }}
                >
                  <Text style={[styles.modalActionButtonText, { color: '#ffffff' }]}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Assets"
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
  topHeader: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    marginBottom: 16,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  primaryActionButton: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  qrScannerButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  qrScannerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    gap: 6,
  },
  secondaryActionButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
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
  },
  metricIcon: {
    fontSize: 20,
  },
  searchFilterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  searchButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bulkActionsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bulkActionButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableScrollView: {
    flex: 1,
  },
  tableContent: {
    minWidth: 640, // Minimum width to ensure proper column spacing
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    minHeight: 50,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  assetIdCell: {
    alignItems: 'flex-start',
  },
  assetIdText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  tableCellText: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 12,
    flexWrap: 'wrap',
  },
  checkbox: {
    padding: 4,
  },
  healthScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScoreText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  actionButtonText: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  paginationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 2,
  },
  paginationButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  paginationButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  paginationButtonTextActive: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
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
    maxHeight: '85%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalAssetId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 24,
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 40,
  },
  modalLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  modalValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  qrScanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  qrScanText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 4,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalActionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  qrCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  addAssetForm: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    justifyContent: 'center',
  },
  formInputPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  formInputValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  formDropdown: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formDropdownText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalAssetIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  qrScroll: { maxHeight: '85%' },
  qrScrollContent: { padding: 20 },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  qrButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  smallBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  qrDataBlock: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeBlock: {
    fontSize: 11,
    color: '#f8fafc',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  qrMetaData: { width: '100%', marginTop: 4 },
  qrMetaTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, color: '#111827' },
  qrMetaRow: { flexDirection: 'row', marginBottom: 6 },
  metaLabel: { width: 110, fontSize: 12, fontWeight: '600', color: '#374151' },
  metaValue: { flex: 1, fontSize: 12, color: '#111827' },
  // Edit Asset Form Styles
  formTextInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  formPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  formPickerOption: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  formPickerOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  formPickerOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  formPickerOptionTextSelected: {
    color: '#ffffff',
  },
  // Active Filters Styles
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 8,
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearFiltersText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 4,
  },
});