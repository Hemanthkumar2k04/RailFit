import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  assetData: {
    asset_id: string;
    id: string;
    type: string;
    location: string;
    status: string;
    healthScore: number;
    predicted_rul_days: number;
    lastInspection: string;
    nextMaintenance: string;
    qrVersion: string;
    generated_at: string;
    sqlData?: {
      table: string;
      query: string;
      fields: any;
    };
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QRCodeModal: React.FC<QRCodeModalProps> = ({ visible, onClose, assetData }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'sql' | 'json'>('qr');
  
  const jsonData = {
    asset_id: assetData.asset_id,
    type: assetData.type,
    location: assetData.location,
    status: assetData.status,
    health_score: assetData.healthScore,
    predicted_rul_days: assetData.predicted_rul_days,
    last_inspection: assetData.lastInspection,
    next_maintenance: assetData.nextMaintenance,
    generated_at: assetData.generated_at,
    qr_version: assetData.qrVersion
  };

  const qrCodeData = JSON.stringify(jsonData);

  const handleDownloadPNG = () => {
    // In a real app, you'd implement PNG download functionality
    console.log('Download PNG');
  };

  const handleDownloadSVG = () => {
    // In a real app, you'd implement SVG download functionality
    console.log('Download SVG');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const sqlQuery = assetData.sqlData?.query || `SELECT * FROM assets WHERE asset_id = '${assetData.asset_id}'`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="qr-code" size={20} color="#374151" />
              </View>
              <Text style={styles.headerTitle}>Asset QR Code & Data</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
              onPress={() => setActiveTab('qr')}
            >
              <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'sql' && styles.activeTab]}
              onPress={() => setActiveTab('sql')}
            >
              <Text style={[styles.tabText, activeTab === 'sql' && styles.activeTabText]}>SQL Data</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'json' && styles.activeTab]}
              onPress={() => setActiveTab('json')}
            >
              <Text style={[styles.tabText, activeTab === 'json' && styles.activeTabText]}>JSON Data</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'qr' && (
              <>
                {/* QR Code Display */}
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCodeWrapper}>
                    <QRCode
                      value={qrCodeData}
                      size={200}
                      color="#000000"
                      backgroundColor="#ffffff"
                    />
                  </View>
                </View>

                {/* Download Buttons */}
                <View style={styles.downloadContainer}>
                  <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPNG}>
                    <Ionicons name="download-outline" size={16} color="#3b82f6" />
                    <Text style={styles.downloadButtonText}>Download PNG</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadSVG}>
                    <Ionicons name="download-outline" size={16} color="#3b82f6" />
                    <Text style={styles.downloadButtonText}>Download SVG</Text>
                  </TouchableOpacity>
                </View>

                {/* Asset Data Section */}
                <View style={styles.dataSection}>
                  <View style={styles.dataSectionHeader}>
                    <Ionicons name="eye-outline" size={16} color="#6b7280" />
                    <Text style={styles.dataSectionTitle}>Asset Information</Text>
                  </View>

                  <View style={styles.dataGrid}>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Asset ID:</Text>
                      <Text style={styles.dataValue}>{assetData.asset_id}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Type:</Text>
                      <Text style={styles.dataValue}>{assetData.type}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Location:</Text>
                      <Text style={styles.dataValue}>{assetData.location}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assetData.status) }]}>
                        <Text style={styles.statusText}>{assetData.status}</Text>
                      </View>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Health Score:</Text>
                      <Text style={styles.dataValue}>{assetData.healthScore}%</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Predicted RUL:</Text>
                      <Text style={styles.dataValue}>{assetData.predicted_rul_days} days</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Last Inspection:</Text>
                      <Text style={styles.dataValue}>{assetData.lastInspection}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Next Maintenance:</Text>
                      <Text style={styles.dataValue}>{assetData.nextMaintenance}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'sql' && (
              <View style={styles.dataSection}>
                <View style={styles.dataSectionHeader}>
                  <Ionicons name="server-outline" size={16} color="#6b7280" />
                  <Text style={styles.dataSectionTitle}>SQL Data Structure</Text>
                </View>
                
                <View style={styles.sqlContainer}>
                  <Text style={styles.sqlLabel}>Table: {assetData.sqlData?.table || 'assets'}</Text>
                  
                  <Text style={styles.sqlLabel}>Query:</Text>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{sqlQuery}</Text>
                  </View>
                  
                  <Text style={styles.sqlLabel}>Field Mappings:</Text>
                  <View style={styles.fieldMappings}>
                    {Object.entries(jsonData).map(([key, value]) => (
                      <View key={key} style={styles.fieldRow}>
                        <Text style={styles.fieldKey}>{key}:</Text>
                        <Text style={styles.fieldValue}>{String(value)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'json' && (
              <View style={styles.dataSection}>
                <View style={styles.dataSectionHeader}>
                  <Ionicons name="code-outline" size={16} color="#6b7280" />
                  <Text style={styles.dataSectionTitle}>JSON Data Format</Text>
                </View>
                
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>
                    {JSON.stringify(jsonData, null, 2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: Math.min(screenWidth - 40, 500),
    maxHeight: screenHeight * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 32,
  },
  qrCodeWrapper: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 6,
    gap: 8,
  },
  downloadButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  dataSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dataSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dataSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dataGrid: {
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  // SQL and JSON styles
  sqlContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  sqlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 16,
  },
  fieldMappings: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fieldKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  fieldValue: {
    fontSize: 12,
    color: '#6b7280',
    flex: 2,
    textAlign: 'right',
  },
});

export default QRCodeModal;