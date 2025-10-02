import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  Code,
} from 'react-native-vision-camera';

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<any>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const device = useCameraDevice('back');

  // Request camera permission using Vision Camera's built-in method
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      console.log('Camera permission status:', status);
      
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        // Always try to request permission first (works for 'not-determined' and first 'denied')
        const newStatus = await Camera.requestCameraPermission();
        console.log('Permission request result:', newStatus);
        
        if (newStatus === 'granted') {
          setHasPermission(true);
        } else {
          // Only show settings alert if permanently denied
          showPermissionDeniedAlert();
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
      Alert.alert(
        'Permission Error',
        'Failed to check camera permission. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'RailFIT Mobile needs camera access to scan QR codes. Please enable camera permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings() 
        },
      ]
    );
  };

  // QR Code scanner using Vision Camera v4 built-in code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes: Code[]) => {
      if (codes.length > 0 && isActive) {
        const code = codes[0];
        const rawData = code.value || 'No data';
        setScannedData(rawData);
        
        // Try to parse JSON data for asset information
        try {
          const parsed = JSON.parse(rawData);
          setAssetData(parsed);
          console.log('Parsed asset data:', parsed);
        } catch (e) {
          // If not JSON, treat as plain text
          setAssetData(null);
          console.log('Plain text data:', rawData);
        }
        
        setIsActive(false); // Pause scanning after successful scan
      }
    },
  });

  const handleRescan = () => {
    setScannedData(null);
    setAssetData(null);
    setIsActive(true);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Helper functions for displaying asset data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'under_maintenance':
        return '#F59E0B';
      case 'retired':
        return '#6B7280';
      case 'not_installed':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getHealthStatus = (healthScore?: number): string => {
    if (!healthScore) return 'Unknown';
    if (healthScore >= 90) return 'Excellent';
    if (healthScore >= 75) return 'Good';
    if (healthScore >= 50) return 'Fair';
    return 'Critical';
  };

  const getHealthColor = (score?: number) => {
    if (!score) return '#6B7280';
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#64748B';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📷 Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            This app requires camera permission to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.button} onPress={checkPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RailFIT Mobile</Text>
        <Text style={styles.headerSubtitle}>
          {scannedData ? 'Scan Complete' : 'Position QR code in frame'}
        </Text>
      </View>

      {/* Camera View */}
      {!scannedData && (
        <View style={styles.cameraContainer}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
            torch={flashEnabled ? 'on' : 'off'}
          />

          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />

            {/* Middle section with scan frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanFrame}>
                {/* Corner markers */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>

            {/* Bottom overlay */}
            <View style={styles.overlayBottom}>
              <Text style={styles.instructionText}>
                Align QR code within the frame
              </Text>
            </View>
          </View>

          {/* Flash Toggle Button */}
          <TouchableOpacity
            style={[styles.flashButton, flashEnabled && styles.flashButtonActive]}
            onPress={toggleFlash}>
            <Text style={styles.flashButtonText}>
              {flashEnabled ? '🔦 ON' : '🔦 OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Asset Detail Modal */}
      <Modal
        visible={!!scannedData}
        transparent={true}
        animationType="slide"
        onRequestClose={handleRescan}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {assetData ? '🏗️ Asset Details' : '📄 Scanned Data'}
                </Text>
                {assetData?.asset_id && (
                  <Text style={styles.modalSubtitle}>ID: {assetData.asset_id}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleRescan}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content - Asset View */}
            {assetData ? (
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Basic Information Card */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>📍 Basic Information</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Type</Text>
                      <Text style={styles.infoValue}>{assetData.type || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>{assetData.location || 'N/A'}</Text>
                    </View>
                    {assetData.region && (
                      <>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Region</Text>
                          <Text style={styles.infoValue}>{assetData.region}</Text>
                        </View>
                      </>
                    )}
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assetData.status) + '20', borderColor: getStatusColor(assetData.status) }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(assetData.status) }]}>
                          {assetData.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    {assetData.install_date && (
                      <>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Install Date</Text>
                          <Text style={styles.infoValue}>{formatDate(assetData.install_date)}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Health & Performance Card */}
                {assetData.health_score !== undefined && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>💚 Health & Performance</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.healthScoreContainer}>
                        <Text style={styles.healthScoreLabel}>Health Score</Text>
                        <Text style={[styles.healthScoreValue, { color: getHealthColor(assetData.health_score) }]}>
                          {assetData.health_score}%
                        </Text>
                        <Text style={[styles.healthStatus, { color: getHealthColor(assetData.health_score) }]}>
                          {getHealthStatus(assetData.health_score)}
                        </Text>
                        <View style={styles.healthBar}>
                          <View style={[styles.healthBarFill, { 
                            width: `${assetData.health_score}%`,
                            backgroundColor: getHealthColor(assetData.health_score)
                          }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Specifications Card */}
                {(assetData.metadata || assetData.model || assetData.serial_number) && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>⚙️ Specifications</Text>
                    <View style={styles.infoCard}>
                      {(assetData.metadata?.model || assetData.model) && (
                        <>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Model</Text>
                            <Text style={styles.infoValue}>{assetData.metadata?.model || assetData.model}</Text>
                          </View>
                          <View style={styles.infoDivider} />
                        </>
                      )}
                      {(assetData.metadata?.serial_number || assetData.serial_number) && (
                        <>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Serial Number</Text>
                            <Text style={[styles.infoValue, styles.monoText]}>
                              {assetData.metadata?.serial_number || assetData.serial_number}
                            </Text>
                          </View>
                          <View style={styles.infoDivider} />
                        </>
                      )}
                      {(assetData.metadata?.manufacturer || assetData.manufacturer) && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Manufacturer</Text>
                          <Text style={styles.infoValue}>
                            {assetData.metadata?.manufacturer || assetData.manufacturer}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Maintenance Card */}
                {(assetData.maintenance_schedule || assetData.metadata?.next_maintenance) && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>🔧 Maintenance</Text>
                    <View style={styles.infoCard}>
                      {assetData.maintenance_schedule && (
                        <>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Schedule</Text>
                            <Text style={styles.infoValue}>{assetData.maintenance_schedule}</Text>
                          </View>
                          <View style={styles.infoDivider} />
                        </>
                      )}
                      {assetData.metadata?.next_maintenance && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Next Maintenance</Text>
                          <Text style={styles.infoValue}>{formatDate(assetData.metadata.next_maintenance)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Timestamps */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>📅 Timeline</Text>
                  <View style={styles.infoCard}>
                    {assetData.created_at && (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Created</Text>
                          <Text style={styles.infoValue}>{formatDate(assetData.created_at)}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                      </>
                    )}
                    {assetData.updated_at && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Updated</Text>
                        <Text style={styles.infoValue}>{formatDate(assetData.updated_at)}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Raw Data Section (Collapsible) */}
                <View style={[styles.infoSection, { marginBottom: 20 }]}>
                  <Text style={styles.sectionTitle}>📋 Raw Data</Text>
                  <View style={styles.rawDataCard}>
                    <ScrollView style={styles.rawDataScroll} nestedScrollEnabled>
                      <Text style={styles.rawDataText} selectable>
                        {JSON.stringify(assetData, null, 2)}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>
            ) : (
              /* Plain Text View */
              <ScrollView style={styles.modalContent}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>📄 Scanned Content</Text>
                  <View style={styles.rawDataCard}>
                    <ScrollView style={styles.rawDataScroll} nestedScrollEnabled>
                      <Text style={styles.rawDataText} selectable>
                        {scannedData}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleRescan}>
                <Text style={styles.modalButtonTextPrimary}>🔄 Scan Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {scannedData ? 'Ready to scan next QR code' : 'Scanning...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 300,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  flashButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  flashButtonActive: {
    backgroundColor: '#fff',
  },
  flashButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    borderWidth: 2,
    borderColor: '#333',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultScroll: {
    maxHeight: 180,
  },
  resultText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#000',
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: '70%',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  healthScoreContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  healthScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  healthBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rawDataCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#374151',
  },
  rawDataScroll: {
    maxHeight: 180,
  },
  rawDataText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonSecondary: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
