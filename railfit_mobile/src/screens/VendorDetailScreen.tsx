import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface VendorDetailProps {
  assetId?: string;
  vendorId?: string;
  onClose: () => void;
}

interface VendorInfo {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  certification: string[];
  rating: number;
  totalContracts: number;
  activeContracts: number;
  lastInspection: string;
  nextMaintenance: string;
}

interface AssetInfo {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'operational' | 'maintenance' | 'critical';
  installDate: string;
  lastInspection: string;
  nextInspection: string;
  specifications: Record<string, string>;
  maintenanceHistory: MaintenanceRecord[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'replacement';
  description: string;
  technician: string;
  status: 'completed' | 'pending' | 'in-progress';
  cost?: number;
}

export default function VendorDetailScreen({ assetId, vendorId, onClose }: VendorDetailProps) {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'contact'>('overview');

  useEffect(() => {
    loadData();
  }, [assetId, vendorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      const [vendor, asset] = await Promise.all([
        getVendorInfo(vendorId || 'RailTech Solutions'),
        getAssetInfo(assetId || 'ASSET-001'),
      ]);
      
      setVendorInfo(vendor);
      setAssetInfo(asset);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getVendorInfo = async (vendorId: string): Promise<VendorInfo> => {
    // Simulate API call
    const mockVendors: Record<string, VendorInfo> = {
      'RailTech Solutions': {
        id: 'VENDOR-001',
        name: 'RailTech Solutions',
        contactPerson: 'John Anderson',
        email: 'j.anderson@railtech.com',
        phone: '+1-555-0123',
        address: '123 Railway Ave, Industrial District, City',
        website: 'https://railtech.com',
        certification: ['ISO 9001', 'Railway Safety Certificate', 'Quality Assurance'],
        rating: 4.8,
        totalContracts: 45,
        activeContracts: 12,
        lastInspection: '2024-01-15',
        nextMaintenance: '2024-02-15',
      },
      'SignalWorks Inc': {
        id: 'VENDOR-002',
        name: 'SignalWorks Inc',
        contactPerson: 'Maria Rodriguez',
        email: 'm.rodriguez@signalworks.com',
        phone: '+1-555-0124',
        address: '456 Signal St, Tech Park, City',
        website: 'https://signalworks.com',
        certification: ['Signal Safety Standard', 'ISO 14001', 'Electronics Certification'],
        rating: 4.6,
        totalContracts: 38,
        activeContracts: 8,
        lastInspection: '2024-01-10',
        nextMaintenance: '2024-02-10',
      },
    };

    return mockVendors[vendorId] || mockVendors['RailTech Solutions'];
  };

  const getAssetInfo = async (assetId: string): Promise<AssetInfo> => {
    // Simulate API call
    const mockAssets: Record<string, AssetInfo> = {
      'ASSET-001': {
        id: 'ASSET-001',
        name: 'Track Section A-12',
        type: 'Track Component',
        location: 'Section A, Mile 12.5',
        status: 'operational',
        installDate: '2020-03-15',
        lastInspection: '2024-01-15',
        nextInspection: '2024-03-15',
        specifications: {
          'Material': 'Steel Grade R260',
          'Length': '200 meters',
          'Weight': '60 kg/m',
          'Manufacturer': 'RailTech Solutions',
          'Model': 'RT-260-STD',
          'Installation Team': 'Team Alpha',
        },
        maintenanceHistory: [
          {
            id: 'MAINT-001',
            date: '2024-01-15',
            type: 'routine',
            description: 'Regular safety inspection and bolt tightening',
            technician: 'Mike Johnson',
            status: 'completed',
            cost: 1200,
          },
          {
            id: 'MAINT-002',
            date: '2023-12-10',
            type: 'repair',
            description: 'Rail joint replacement due to wear',
            technician: 'Sarah Wilson',
            status: 'completed',
            cost: 3500,
          },
          {
            id: 'MAINT-003',
            date: '2024-02-20',
            type: 'routine',
            description: 'Quarterly maintenance check',
            technician: 'Mike Johnson',
            status: 'pending',
          },
        ],
      },
    };

    return mockAssets[assetId] || mockAssets['ASSET-001'];
  };

  const handleCall = () => {
    if (vendorInfo?.phone) {
      Linking.openURL(`tel:${vendorInfo.phone}`);
    }
  };

  const handleEmail = () => {
    if (vendorInfo?.email) {
      Linking.openURL(`mailto:${vendorInfo.email}`);
    }
  };

  const handleWebsite = () => {
    if (vendorInfo?.website) {
      Linking.openURL(vendorInfo.website);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'completed':
        return Colors.success;
      case 'maintenance':
      case 'pending':
        return Colors.warning;
      case 'critical':
      case 'in-progress':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={Colors.warning}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Colors.gradientPrimary} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={Colors.surface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{assetInfo?.name}</Text>
          <Text style={styles.headerSubtitle}>{vendorInfo?.name}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assetInfo?.status || '') }]}>
            <Text style={styles.statusText}>{assetInfo?.status?.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'maintenance', 'contact'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.content}>
            {/* Asset Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Asset Information</Text>
              <View style={styles.card}>
                <View style={styles.infoGrid}>
                  <InfoItem label="Asset ID" value={assetInfo?.id} />
                  <InfoItem label="Type" value={assetInfo?.type} />
                  <InfoItem label="Location" value={assetInfo?.location} />
                  <InfoItem label="Install Date" value={assetInfo?.installDate} />
                  <InfoItem label="Last Inspection" value={assetInfo?.lastInspection} />
                  <InfoItem label="Next Inspection" value={assetInfo?.nextInspection} />
                </View>
              </View>
            </View>

            {/* Specifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.card}>
                {Object.entries(assetInfo?.specifications || {}).map(([key, value]) => (
                  <InfoItem key={key} label={key} value={value} />
                ))}
              </View>
            </View>

            {/* Vendor Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vendor Overview</Text>
              <View style={styles.card}>
                <View style={styles.vendorHeader}>
                  <View>
                    <Text style={styles.vendorName}>{vendorInfo?.name}</Text>
                    <View style={styles.ratingContainer}>
                      {renderStars(vendorInfo?.rating || 0)}
                      <Text style={styles.ratingText}>({vendorInfo?.rating}/5.0)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.vendorStats}>
                  <StatItem label="Total Contracts" value={vendorInfo?.totalContracts.toString()} />
                  <StatItem label="Active Contracts" value={vendorInfo?.activeContracts.toString()} />
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'maintenance' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maintenance History</Text>
              {assetInfo?.maintenanceHistory.map((record) => (
                <View key={record.id} style={styles.maintenanceCard}>
                  <View style={styles.maintenanceHeader}>
                    <Text style={styles.maintenanceDate}>{record.date}</Text>
                    <View style={[styles.maintenanceStatus, { backgroundColor: getStatusColor(record.status) }]}>
                      <Text style={styles.maintenanceStatusText}>{record.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.maintenanceType}>{record.type.toUpperCase()}</Text>
                  <Text style={styles.maintenanceDescription}>{record.description}</Text>
                  <View style={styles.maintenanceFooter}>
                    <Text style={styles.maintenanceTechnician}>👨‍🔧 {record.technician}</Text>
                    {record.cost && (
                      <Text style={styles.maintenanceCost}>${record.cost.toLocaleString()}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'contact' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.card}>
                <InfoItem label="Contact Person" value={vendorInfo?.contactPerson} />
                <InfoItem label="Email" value={vendorInfo?.email} />
                <InfoItem label="Phone" value={vendorInfo?.phone} />
                <InfoItem label="Address" value={vendorInfo?.address} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <Ionicons name="call" size={24} color={Colors.primary.main} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                  <Ionicons name="mail" size={24} color={Colors.primary.main} />
                  <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
                {vendorInfo?.website && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
                    <Ionicons name="globe" size={24} color={Colors.primary.main} />
                    <Text style={styles.actionText}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.certificationContainer}>
                {vendorInfo?.certification.map((cert, index) => (
                  <View key={index} style={styles.certificationBadge}>
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const StatItem = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value || '0'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.textStyles.body,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  header: {
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: Spacing.base,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.textStyles.h2,
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.textStyles.body,
    color: Colors.surface,
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  statusText: {
    ...Typography.textStyles.labelSmall,
    color: Colors.surface,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    ...Typography.textStyles.label,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: Spacing.base,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    ...Spacing.shadow.md,
  },
  infoGrid: {
    gap: Spacing.base,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    ...Typography.textStyles.label,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...Typography.textStyles.body,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  vendorName: {
    ...Typography.textStyles.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Typography.textStyles.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  vendorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.textStyles.h2,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.textStyles.caption,
    color: Colors.textSecondary,
  },
  maintenanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Spacing.shadow.sm,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  maintenanceDate: {
    ...Typography.textStyles.label,
    color: Colors.textPrimary,
  },
  maintenanceStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  maintenanceStatusText: {
    ...Typography.textStyles.labelSmall,
    color: Colors.surface,
    fontWeight: '600',
  },
  maintenanceType: {
    ...Typography.textStyles.labelSmall,
    color: Colors.accent.main,
    marginBottom: Spacing.xs,
  },
  maintenanceDescription: {
    ...Typography.textStyles.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  maintenanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceTechnician: {
    ...Typography.textStyles.caption,
    color: Colors.textSecondary,
  },
  maintenanceCost: {
    ...Typography.textStyles.label,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    ...Spacing.shadow.sm,
    minWidth: 80,
  },
  actionText: {
    ...Typography.textStyles.label,
    color: Colors.primary.main,
    marginTop: Spacing.xs,
  },
  certificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  certificationBadge: {
    backgroundColor: Colors.accent.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.full,
  },
  certificationText: {
    ...Typography.textStyles.labelSmall,
    color: Colors.surface,
    fontWeight: '500',
  },
});