import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

export default function OfflineStorageDemo() {
  const [assetId, setAssetId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'operational' | 'maintenance' | 'critical'>('operational');
  
  const { 
    saveInspection, 
    isOnline, 
    cacheStatus, 
    syncPendingData,
    assets,
    isLoadingAssets 
  } = useOfflineStorage();

  const handleSaveInspection = async () => {
    if (!assetId || !location || !notes) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const inspectionId = await saveInspection({
        assetId,
        inspectorId: 'demo_user',
        timestamp: new Date().toISOString(),
        status,
        notes,
        location: {
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Random location around Delhi
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
        },
      });

      const syncStatus = isOnline ? ' (Synced)' : ' (Saved offline)';
      Alert.alert('Success', `Inspection saved with ID: ${inspectionId}${syncStatus}`);
      
      // Clear form
      setAssetId('');
      setLocation('');
      setNotes('');
      setStatus('operational');
    } catch (error) {
      Alert.alert('Error', 'Failed to save inspection');
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    try {
      await syncPendingData();
      Alert.alert('Success', 'All pending data has been synced');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleHeaderTitle}>Offline Storage Demo</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Storage Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Connection:</Text>
            <View style={[styles.statusBadge, { backgroundColor: isOnline ? Colors.success : Colors.warning }]}>
              <Text style={styles.statusBadgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Pending Sync:</Text>
            <Text style={styles.statusValue}>{cacheStatus.pendingInspections}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Cached Assets:</Text>
            <Text style={styles.statusValue}>{cacheStatus.assetCount}</Text>
          </View>
          
          {cacheStatus.pendingInspections > 0 && (
            <TouchableOpacity 
              style={[styles.syncButton, { opacity: isOnline ? 1 : 0.5 }]}
              onPress={handleSync}
              disabled={!isOnline}
            >
              <Text style={styles.syncButtonText}>Sync Pending Data</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Demo Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Test Inspection</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Asset ID (e.g., RAIL_001)"
            value={assetId}
            onChangeText={setAssetId}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location (e.g., Section A-127)"
            value={location}
            onChangeText={setLocation}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Inspection notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          
          <Text style={styles.inputLabel}>Status:</Text>
          <View style={styles.statusButtons}>
            {(['operational', 'maintenance', 'critical'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusButton,
                  status === option && styles.statusButtonActive,
                ]}
                onPress={() => setStatus(option)}
              >
                <Text style={[
                  styles.statusButtonText,
                  status === option && styles.statusButtonTextActive,
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveInspection}>
            <Text style={styles.saveButtonText}>Save Inspection</Text>
          </TouchableOpacity>
        </View>

        {/* Assets List */}
        <View style={styles.assetsCard}>
          <Text style={styles.assetsTitle}>Cached Assets ({assets.length})</Text>
          {isLoadingAssets ? (
            <Text style={styles.loadingText}>Loading assets...</Text>
          ) : assets.length > 0 ? (
            assets.slice(0, 3).map((asset) => (
              <View key={asset.id} style={styles.assetItem}>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetLocation}>{asset.location}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No cached assets</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  simpleHeader: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  simpleHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  syncButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusButtonTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  assetsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  assetItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  assetLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});