// src/services/api.ts
import { supabase } from '../lib/supabase';

export const API_BASE_URL = "http://localhost:5000";

export interface SupabaseAsset {
  id: string;
  item_id: string;
  name: string;
  category: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  warranty_end: string;
  last_inspection: string;
  predictive_score: number;
  qr_code: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  warrantyExpiry: Date;
  lastMaintenance: Date;
  predictiveScore: number;
  qrCode: string;
}

export interface MaintenanceLog {
  id: string;
  asset_id: string;
  maintenance_type: string;
  description: string;
  performed_by: string;
  performed_at: string;
  cost: number;
  next_due_date: string;
}

export interface Alert {
  id: string;
  asset_id: string;
  alert_type: 'critical' | 'warranty' | 'predictive' | 'maintenance';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  created_at: string;
}

// Transform Supabase data to frontend format
export const transformAsset = (supabaseAsset: SupabaseAsset): Asset => {
  // Apply AI-powered status logic
  let finalStatus = supabaseAsset.status;
  
  const today = new Date();
  const warrantyEnd = new Date(supabaseAsset.warranty_end);
  const lastInspection = new Date(supabaseAsset.last_inspection);
  const daysSinceInspection = Math.ceil((today.getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24));
  const daysToWarrantyEnd = Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // AI logic for status determination
  if (today > warrantyEnd || daysSinceInspection > 365) {
    finalStatus = 'critical';
  } else if (supabaseAsset.predictive_score < 40) {
    finalStatus = 'critical';
  } else if (supabaseAsset.predictive_score < 70 || daysToWarrantyEnd <= 30) {
    finalStatus = 'warning';
  }

  return {
    id: supabaseAsset.id,
    name: supabaseAsset.name,
    category: supabaseAsset.category,
    location: supabaseAsset.location,
    status: finalStatus,
    warrantyExpiry: new Date(supabaseAsset.warranty_end),
    lastMaintenance: new Date(supabaseAsset.last_inspection),
    predictiveScore: supabaseAsset.predictive_score,
    qrCode: supabaseAsset.qr_code
  };
};

export class ApiService {
  static async fetchAllAssets(): Promise<Asset[]> {
    const response = await fetch(`${API_BASE_URL}/api/components`);
    const data = await response.json();
    // Transform data as needed
    return data.database_components.map(transformAsset);
  }

  static async fetchAssetById(itemId: string): Promise<Asset> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Asset not found');
        }
        throw error;
      }

      return transformAsset(data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  }

  static async fetchAssetByQRCode(qrCode: string): Promise<Asset> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('qr_code', qrCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Asset not found');
        }
        throw error;
      }

      return transformAsset(data);
    } catch (error) {
      console.error('Error fetching asset by QR code:', error);
      throw error;
    }
  }

  static async updateAssetStatus(assetId: string, status: string, predictiveScore?: number): Promise<void> {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (predictiveScore !== undefined) {
        updateData.predictive_score = predictiveScore;
      }

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', assetId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  static async createMaintenanceLog(log: Omit<MaintenanceLog, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .insert([log]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      throw error;
    }
  }

  static async fetchMaintenanceLogs(assetId?: string): Promise<MaintenanceLog[]> {
    try {
      let query = supabase
        .from('maintenance_logs')
        .select('*')
        .order('performed_at', { ascending: false });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      throw error;
    }
  }

  static async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert([alert]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  static async fetchActiveAlerts(): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  static async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  // Health check for Supabase connection
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === "ok";
    } catch (error) {
      console.error('Flask health check failed:', error);
      return false;
    }
  }

  // Generate AI-powered alerts based on asset data
  static async generateAIAlerts(): Promise<void> {
    try {
      const assets = await this.fetchAllAssets();
      
      for (const asset of assets) {
        const today = new Date();
        const warrantyEnd = asset.warrantyExpiry;
        const lastMaintenance = asset.lastMaintenance;
        const daysSinceInspection = Math.ceil((today.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
        const daysToWarrantyEnd = Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check for warranty expiration
        if (daysToWarrantyEnd <= 30 && daysToWarrantyEnd > 0) {
          await this.createAlert({
            asset_id: asset.id,
            alert_type: 'warranty',
            title: 'Warranty Expiring Soon',
            message: `${asset.name} warranty expires in ${daysToWarrantyEnd} days`,
            severity: daysToWarrantyEnd <= 7 ? 'critical' : 'high',
            is_resolved: false
          });
        }

        // Check for overdue inspections
        if (daysSinceInspection > 365) {
          await this.createAlert({
            asset_id: asset.id,
            alert_type: 'maintenance',
            title: 'Inspection Overdue',
            message: `${asset.name} inspection is ${daysSinceInspection - 365} days overdue`,
            severity: 'critical',
            is_resolved: false
          });
        }

        // Check for predictive maintenance
        if (asset.predictiveScore < 50) {
          await this.createAlert({
            asset_id: asset.id,
            alert_type: 'predictive',
            title: 'Predictive Maintenance Alert',
            message: `AI predicts ${asset.name} may fail within 30 days (${asset.predictiveScore}% health)`,
            severity: asset.predictiveScore < 30 ? 'critical' : 'high',
            is_resolved: false
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI alerts:', error);
      throw error;
    }
  }
}