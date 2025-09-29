import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  lastInspected: string;
  status: 'operational' | 'maintenance' | 'critical';
  vendor?: {
    name: string;
    contact: string;
    email: string;
  };
  qrCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Inspection {
  id: string;
  assetId: string;
  inspectorId: string;
  timestamp: string;
  status: 'operational' | 'maintenance' | 'critical';
  notes: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  synced: boolean;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private isOnline: boolean = true;

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        this.syncPendingData();
      }
    });
  }

  // Assets Management
  async cacheAssets(assets: Asset[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_assets', JSON.stringify(assets));
      await AsyncStorage.setItem('assets_cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching assets:', error);
    }
  }

  async getCachedAssets(): Promise<Asset[]> {
    try {
      const cachedAssets = await AsyncStorage.getItem('cached_assets');
      return cachedAssets ? JSON.parse(cachedAssets) : [];
    } catch (error) {
      console.error('Error retrieving cached assets:', error);
      return [];
    }
  }

  async getAssetById(assetId: string): Promise<Asset | null> {
    try {
      const assets = await this.getCachedAssets();
      return assets.find(asset => asset.id === assetId) || null;
    } catch (error) {
      console.error('Error retrieving asset by ID:', error);
      return null;
    }
  }

  async updateAssetCache(updatedAsset: Asset): Promise<void> {
    try {
      const assets = await this.getCachedAssets();
      const index = assets.findIndex(asset => asset.id === updatedAsset.id);
      
      if (index !== -1) {
        assets[index] = updatedAsset;
      } else {
        assets.push(updatedAsset);
      }
      
      await this.cacheAssets(assets);
    } catch (error) {
      console.error('Error updating asset cache:', error);
    }
  }

  // Inspections Management
  async saveInspection(inspection: Omit<Inspection, 'id' | 'synced'>): Promise<string> {
    try {
      const inspectionId = `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newInspection: Inspection = {
        ...inspection,
        id: inspectionId,
        synced: this.isOnline,
      };

      const pendingInspections = await this.getPendingInspections();
      pendingInspections.push(newInspection);
      
      await AsyncStorage.setItem('pending_inspections', JSON.stringify(pendingInspections));

      // If online, attempt to sync immediately
      if (this.isOnline) {
        this.syncInspection(newInspection);
      }

      return inspectionId;
    } catch (error) {
      console.error('Error saving inspection:', error);
      throw error;
    }
  }

  async getPendingInspections(): Promise<Inspection[]> {
    try {
      const pending = await AsyncStorage.getItem('pending_inspections');
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Error retrieving pending inspections:', error);
      return [];
    }
  }

  async getInspectionHistory(assetId?: string): Promise<Inspection[]> {
    try {
      const inspections = await this.getPendingInspections();
      return assetId 
        ? inspections.filter(inspection => inspection.assetId === assetId)
        : inspections;
    } catch (error) {
      console.error('Error retrieving inspection history:', error);
      return [];
    }
  }

  async markInspectionSynced(inspectionId: string): Promise<void> {
    try {
      const inspections = await this.getPendingInspections();
      const inspection = inspections.find(i => i.id === inspectionId);
      
      if (inspection) {
        inspection.synced = true;
        await AsyncStorage.setItem('pending_inspections', JSON.stringify(inspections));
      }
    } catch (error) {
      console.error('Error marking inspection as synced:', error);
    }
  }

  // Sync Operations
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const pendingInspections = await this.getPendingInspections();
      const unsyncedInspections = pendingInspections.filter(i => !i.synced);

      for (const inspection of unsyncedInspections) {
        await this.syncInspection(inspection);
      }
    } catch (error) {
      console.error('Error syncing pending data:', error);
    }
  }

  private async syncInspection(inspection: Inspection): Promise<void> {
    try {
      // Simulate API call - replace with actual backend endpoint
      console.log('Syncing inspection:', inspection.id);
      
      // For now, just mark as synced
      // In real implementation, make HTTP request to backend
      await this.markInspectionSynced(inspection.id);
      
      console.log('Inspection synced successfully:', inspection.id);
    } catch (error) {
      console.error('Error syncing inspection:', error);
    }
  }

  // Cache Management
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'cached_assets',
        'assets_cache_timestamp',
        'pending_inspections'
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheStatus(): Promise<{
    assetCount: number;
    pendingInspections: number;
    lastUpdate: Date | null;
    isOnline: boolean;
  }> {
    try {
      const assets = await this.getCachedAssets();
      const inspections = await this.getPendingInspections();
      const timestamp = await AsyncStorage.getItem('assets_cache_timestamp');
      
      return {
        assetCount: assets.length,
        pendingInspections: inspections.filter(i => !i.synced).length,
        lastUpdate: timestamp ? new Date(parseInt(timestamp)) : null,
        isOnline: this.isOnline
      };
    } catch (error) {
      console.error('Error getting cache status:', error);
      return {
        assetCount: 0,
        pendingInspections: 0,
        lastUpdate: null,
        isOnline: this.isOnline
      };
    }
  }

  // Utility Methods
  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  async isCacheStale(maxAgeHours: number = 24): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem('assets_cache_timestamp');
      if (!timestamp) return true;
      
      const cacheAge = Date.now() - parseInt(timestamp);
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      
      return cacheAge > maxAge;
    } catch (error) {
      console.error('Error checking cache staleness:', error);
      return true;
    }
  }
}

export default OfflineStorageService;