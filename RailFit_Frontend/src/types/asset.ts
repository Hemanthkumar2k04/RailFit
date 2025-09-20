// Asset related types and interfaces

export interface Asset {
  assetId: string;
  type: string;
  vendor: string;
  installDate: string;
  location: string;
  warrantyPeriod: number;
  healthScore?: number;
  predictedRUL?: number;
  status: string;
  lastInspection?: string;
  inspectionHistory?: InspectionRecord[];
}

export interface AssetCreate {
  type: string;
  vendor: string;
  installDate: string;
  location: string;
  warrantyPeriod: number;
}

export interface AssetUpdate {
  healthScore?: number;
  status?: string;
}

export interface InspectionRecord {
  date: string;
  result: string;
  score: number;
}

export interface AssetResponse {
  assets: Asset[];
}

export interface CreateAssetResponse {
  assetId: string;
  qrCode: string;
  asset: Asset;
}

// Asset status types
export type AssetStatus = 'active' | 'needs_maintenance' | 'critical' | 'retired';

// Asset types (must match database enum)
export const ASSET_TYPES = [
  'Elastic Rail Clip',
  'Rail Pad',
  'Liner',
  'Sleeper'
] as const;

export type AssetType = typeof ASSET_TYPES[number];