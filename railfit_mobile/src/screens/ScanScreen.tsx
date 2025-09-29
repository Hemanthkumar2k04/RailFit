import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCodeScanner from '../components/QRCodeScanner';
import VendorDetailScreen from './VendorDetailScreen';
import Colors from '../constants/Colors';

interface ScanResult {
  qrData: string;
  location: any;
  timestamp: Date;
  assetId?: string;
  vendorId?: string;
}

export default function ScanScreen({ navigation }: any) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);

  const handleScanSuccess = (result: ScanResult) => {
    setScanResult(result);
    setShowVendorDetail(true);
  };

  const handleScanCancel = () => {
    navigation.goBack();
  };

  const handleVendorDetailClose = () => {
    setShowVendorDetail(false);
    setScanResult(null);
    navigation.goBack();
  };

  if (showVendorDetail && scanResult) {
    return (
      <VendorDetailScreen
        assetId={scanResult.assetId}
        vendorId={scanResult.vendorId}
        onClose={handleVendorDetailClose}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <QRCodeScanner
        onScanSuccess={handleScanSuccess}
        onCancel={handleScanCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});