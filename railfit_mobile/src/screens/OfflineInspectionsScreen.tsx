import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { Inspection } from '../services/OfflineStorageService';

export default function OfflineInspectionsScreen() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { 
    getInspectionHistory, 
    isOnline, 
    cacheStatus, 
    syncPendingData,
    clearCache 
  } = useOfflineStorage();

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const history = await getInspectionHistory();
      setInspections(history);
    } catch (error) {
      console.error('Error loading inspections:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInspections();
    setIsRefreshing(false);
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setIsSyncing(true);
    try {
      await syncPendingData();
      await loadInspections();
      Alert.alert('Success', 'All pending inspections have been synced.');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync inspections. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data and pending inspections. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              await loadInspections();
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return Colors.success;
      case 'maintenance': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleHeaderTitle}>Offline Inspections</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>
            {cacheStatus.pendingInspections} pending sync • {inspections.length} total
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: isOnline ? Colors.success : Colors.warning }]}>
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, { opacity: isOnline ? 1 : 0.5 }]}
          onPress={handleSync}
          disabled={!isOnline || isSyncing || cacheStatus.pendingInspections === 0}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <Text style={styles.actionButtonText}>
              Sync ({cacheStatus.pendingInspections})
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
          <Text style={styles.clearButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Cache Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>Cache Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{cacheStatus.assetCount}</Text>
              <Text style={styles.statusLabel}>Cached Assets</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{cacheStatus.pendingInspections}</Text>
              <Text style={styles.statusLabel}>Pending Sync</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>
                {cacheStatus.lastUpdate ? formatDate(cacheStatus.lastUpdate.toISOString()) : 'Never'}
              </Text>
              <Text style={styles.statusLabel}>Last Update</Text>
            </View>
          </View>
        </View>

        {/* Inspections List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection History</Text>
          {inspections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No inspections found</Text>
              <Text style={styles.emptyStateSubtext}>
                Perform inspections to see them here
              </Text>
            </View>
          ) : (
            inspections.map((inspection) => (
              <View key={inspection.id} style={styles.inspectionCard}>
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionAsset}>Asset: {inspection.assetId}</Text>
                  <View style={styles.inspectionBadges}>
                    {!inspection.synced && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(inspection.status) }]}>
                      <Text style={styles.statusBadgeText}>{inspection.status}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.inspectionNotes} numberOfLines={2}>
                  {inspection.notes}
                </Text>
                
                <View style={styles.inspectionFooter}>
                  <Text style={styles.inspectionTimestamp}>
                    {formatDate(inspection.timestamp)}
                  </Text>
                  <Text style={styles.inspectionInspector}>
                    Inspector: {inspection.inspectorId}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
    marginBottom: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  inspectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspectionAsset: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  inspectionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  inspectionNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  inspectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionTimestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inspectionInspector: {
    fontSize: 12,
    color: Colors.textLight,
  },
});