import { useState, useEffect, useCallback } from 'react';
import OfflineStorageService, { Asset, Inspection } from '../services/OfflineStorageService';

interface UseOfflineStorageReturn {
  // Assets
  assets: Asset[];
  isLoadingAssets: boolean;
  refreshAssets: () => Promise<void>;
  getAssetById: (id: string) => Promise<Asset | null>;
  updateAsset: (asset: Asset) => Promise<void>;
  
  // Inspections
  saveInspection: (inspection: Omit<Inspection, 'id' | 'synced'>) => Promise<string>;
  getInspectionHistory: (assetId?: string) => Promise<Inspection[]>;
  pendingInspections: Inspection[];
  
  // Cache Status
  cacheStatus: {
    assetCount: number;
    pendingInspections: number;
    lastUpdate: Date | null;
    isOnline: boolean;
  };
  
  // Utility
  isOnline: boolean;
  syncPendingData: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useOfflineStorage = (): UseOfflineStorageReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [pendingInspections, setPendingInspections] = useState<Inspection[]>([]);
  const [cacheStatus, setCacheStatus] = useState({
    assetCount: 0,
    pendingInspections: 0,
    lastUpdate: null as Date | null,
    isOnline: true,
  });
  const [isOnline, setIsOnline] = useState(true);

  const storageService = OfflineStorageService.getInstance();

  // Load initial data
  useEffect(() => {
    loadAssets();
    loadPendingInspections();
    updateCacheStatus();

    // Set up network status listener
    const updateOnlineStatus = () => {
      const online = storageService.isNetworkAvailable();
      setIsOnline(online);
      updateCacheStatus();
    };

    // Check network status periodically
    const interval = setInterval(updateOnlineStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      const cachedAssets = await storageService.getCachedAssets();
      setAssets(cachedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [storageService]);

  const loadPendingInspections = useCallback(async () => {
    try {
      const inspections = await storageService.getPendingInspections();
      setPendingInspections(inspections);
    } catch (error) {
      console.error('Error loading pending inspections:', error);
    }
  }, [storageService]);

  const updateCacheStatus = useCallback(async () => {
    try {
      const status = await storageService.getCacheStatus();
      setCacheStatus(status);
      setIsOnline(status.isOnline);
    } catch (error) {
      console.error('Error updating cache status:', error);
    }
  }, [storageService]);

  const refreshAssets = useCallback(async () => {
    await loadAssets();
    await updateCacheStatus();
  }, [loadAssets, updateCacheStatus]);

  const getAssetById = useCallback(async (id: string): Promise<Asset | null> => {
    return await storageService.getAssetById(id);
  }, [storageService]);

  const updateAsset = useCallback(async (asset: Asset) => {
    await storageService.updateAssetCache(asset);
    await refreshAssets();
  }, [storageService, refreshAssets]);

  const saveInspection = useCallback(async (inspection: Omit<Inspection, 'id' | 'synced'>): Promise<string> => {
    const inspectionId = await storageService.saveInspection(inspection);
    await loadPendingInspections();
    await updateCacheStatus();
    return inspectionId;
  }, [storageService, loadPendingInspections, updateCacheStatus]);

  const getInspectionHistory = useCallback(async (assetId?: string): Promise<Inspection[]> => {
    return await storageService.getInspectionHistory(assetId);
  }, [storageService]);

  const syncPendingData = useCallback(async () => {
    await storageService.syncPendingData();
    await loadPendingInspections();
    await updateCacheStatus();
  }, [storageService, loadPendingInspections, updateCacheStatus]);

  const clearCache = useCallback(async () => {
    await storageService.clearCache();
    await refreshAssets();
    await loadPendingInspections();
    await updateCacheStatus();
  }, [storageService, refreshAssets, loadPendingInspections, updateCacheStatus]);

  return {
    assets,
    isLoadingAssets,
    refreshAssets,
    getAssetById,
    updateAsset,
    saveInspection,
    getInspectionHistory,
    pendingInspections,
    cacheStatus,
    isOnline,
    syncPendingData,
    clearCache,
  };
};

export default useOfflineStorage;