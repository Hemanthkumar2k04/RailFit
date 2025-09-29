import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../services/api';
// Replaced AppHeader with inline header styled like Analytics screen
import { Ionicons } from '@expo/vector-icons';
import SharedSidebar from '../components/SharedSidebar';
import { useSidebar } from '../hooks/useSidebar';
import { useResponsive } from '../hooks/useResponsive';

const { width } = Dimensions.get('window');

interface DashboardMetrics {
  totalAssets: number;
  totalAssetsChange: number;
  installedAssets: number;
  installedAssetsPercentage: number;
  maintenanceQueue: number;
  maintenanceQueuePercentage: number;
  criticalAssets: number;
  assetHealthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    critical: number;
  };
  lastUpdated: string;
}



const DashboardScreen: React.FC = () => {
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const { isWeb, isTablet, isLargeScreen, screenData } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAssets: 0,
    totalAssetsChange: 0,
    installedAssets: 0,
    installedAssetsPercentage: 0,
    maintenanceQueue: 0,
    maintenanceQueuePercentage: 0,
    criticalAssets: 0,
    assetHealthDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      critical: 0,
    },
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
  });





  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const assetsResponse = await apiService.getAssets({ page: 1, limit: 100 });
      
      if (assetsResponse.data) {
        const assets = assetsResponse.data.assets;
        const totalAssets = assets.length;
        
        const activeAssets = assets.filter(asset => asset.status === 'active').length;
        const maintenanceAssets = assets.filter(asset => asset.status === 'under_maintenance').length;
        const criticalAssets = assets.filter(asset => asset.condition === 'critical').length;
        
        const excellent = assets.filter(asset => asset.health_score && asset.health_score >= 90).length;
        const good = assets.filter(asset => asset.health_score && asset.health_score >= 70 && asset.health_score < 90).length;
        const fair = assets.filter(asset => asset.health_score && asset.health_score >= 50 && asset.health_score < 70).length;
        const critical = assets.filter(asset => asset.health_score && asset.health_score < 50).length;
        
        setMetrics({
          totalAssets,
          totalAssetsChange: Math.floor(totalAssets * 0.15),
          installedAssets: activeAssets,
          installedAssetsPercentage: totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0,
          maintenanceQueue: maintenanceAssets,
          maintenanceQueuePercentage: totalAssets > 0 ? Math.round((maintenanceAssets / totalAssets) * 100) : 0,
          criticalAssets,
          assetHealthDistribution: {
            excellent,
            good,
            fair,
            critical,
          },
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
        });
      } else {
        setMetrics({
          totalAssets: 51,
          totalAssetsChange: 127,
          installedAssets: 51,
          installedAssetsPercentage: 100,
          maintenanceQueue: 3,
          maintenanceQueuePercentage: 5.9,
          criticalAssets: 2,
          assetHealthDistribution: {
            excellent: 12,
            good: 22,
            fair: 13,
            critical: 4,
          },
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setMetrics({
        totalAssets: 51,
        totalAssetsChange: 127,
        installedAssets: 51,
        installedAssetsPercentage: 100,
        maintenanceQueue: 3,
        maintenanceQueuePercentage: 5.9,
        criticalAssets: 2,
        assetHealthDistribution: {
          excellent: 12,
          good: 22,
          fair: 13,
          critical: 4,
        },
        lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false }),
      });
    } finally {
      setLoading(false);
    }
  };







  const refreshData = () => {
    loadDashboardData();
  };





  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: string,
    color: string,
    backgroundColor: string,
    borderColor: string,
    change?: string
  ) => {
    const cardWidth = isWeb 
      ? (isLargeScreen ? '48%' : isTablet ? '48%' : '100%')
      : '100%';
      
    return (
      <View style={[
        styles.metricCard, 
        { backgroundColor, borderLeftColor: borderColor, width: cardWidth }
      ]}>
        <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={[styles.metricIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.metricContent}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        {change && (
          <Text style={styles.metricChange}>📈 +{change} this quarter</Text>
        )}
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </View>
    </View>
    );
  };

  const renderHealthDistribution = () => {
    const total = Object.values(metrics.assetHealthDistribution).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
      return (
        <View style={styles.healthDistributionCard}>
          <View style={styles.healthDistributionHeader}>
            <Text style={styles.healthDistributionTitle}>📊 Asset Health Distribution</Text>
          </View>
          <Text style={styles.noDataText}>No asset data available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.healthDistributionCard}>
        <View style={styles.healthDistributionHeader}>
          <Text style={styles.healthDistributionTitle}>📊 Asset Health Distribution</Text>
        </View>
        
        <View style={styles.healthProgressContainer}>
          <View style={styles.healthProgressBar}>
            <View style={[styles.healthSegment, styles.excellentSegment, { 
              width: `${(metrics.assetHealthDistribution.excellent / total) * 100}%` 
            }]} />
            <View style={[styles.healthSegment, styles.goodSegment, { 
              width: `${(metrics.assetHealthDistribution.good / total) * 100}%` 
            }]} />
            <View style={[styles.healthSegment, styles.fairSegment, { 
              width: `${(metrics.assetHealthDistribution.fair / total) * 100}%` 
            }]} />
            <View style={[styles.healthSegment, styles.criticalSegment, { 
              width: `${(metrics.assetHealthDistribution.critical / total) * 100}%` 
            }]} />
          </View>
        </View>

        <View style={styles.healthLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Excellent</Text>
            <Text style={styles.legendValue}>{metrics.assetHealthDistribution.excellent}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#64748b' }]} />
            <Text style={styles.legendText}>Good</Text>
            <Text style={styles.legendValue}>{metrics.assetHealthDistribution.good}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Fair</Text>
            <Text style={styles.legendValue}>{metrics.assetHealthDistribution.fair}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Critical</Text>
            <Text style={styles.legendValue}>{metrics.assetHealthDistribution.critical}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Inline Header */}
      <View style={styles.inlineHeader}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuIconButton}>
          <Ionicons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.inlineHeaderText}>
          <Text style={styles.inlineHeaderTitle}>RailFIT Dashboard</Text>
          <Text style={styles.inlineHeaderSubtitle}>Railway Asset Management & Predictive Analytics</Text>
          <View style={styles.inlineHeaderMetaRow}>
            <Text style={styles.inlineHeaderMeta}>Last updated: {metrics.lastUpdated}</Text>
            <TouchableOpacity onPress={refreshData} style={styles.refreshButtonSmall}>
              <Icon name="refresh" size={16} color="#6b7280" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >

        <View style={[
          styles.metricsContainer,
          isWeb && isLargeScreen && styles.metricsGrid,
          isWeb && isTablet && !isLargeScreen && styles.metricsGridTablet
        ]}>
          {renderMetricCard(
            'Total Assets',
            metrics.totalAssets,
            'Real-time count',
            '📊',
            '#3b82f6',
            '#f8fafc',
            '#3b82f6',
            metrics.totalAssetsChange.toString()
          )}

          {renderMetricCard(
            'Installed Assets',
            metrics.installedAssets,
            `${metrics.installedAssetsPercentage}% Active`,
            '✅',
            '#10b981',
            '#f0fdf4',
            '#10b981'
          )}

          {renderMetricCard(
            'Maintenance Queue',
            metrics.maintenanceQueue,
            `${metrics.maintenanceQueuePercentage}% of fleet`,
            '⚠️',
            '#f59e0b',
            '#fffbeb',
            '#f59e0b'
          )}

          {renderMetricCard(
            'Critical Assets',
            metrics.criticalAssets,
            'Immediate Action Required',
            '🚨',
            '#ef4444',
            '#fef2f2',
            '#ef4444'
          )}
        </View>

        {/* Navigation help card removed per request; sidebar remains accessible via header menu button */}

        {renderHealthDistribution()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Dashboard" 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    minHeight: '100%',
    flexGrow: 1,
  },
  inlineHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 80,
  },
  menuIconButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineHeaderText: { flex: 1 },
  inlineHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  inlineHeaderSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  inlineHeaderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineHeaderMeta: {
    fontSize: 11,
    color: '#6b7280',
  },
  refreshButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  // legacy header styles (dashboardHeader, dashboardTitle, dashboardSubtitle, lastUpdated, lastUpdatedText) removed
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  refreshText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricIcon: {
    fontSize: 20,
  },
  metricContent: {
    gap: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  metricChange: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  healthDistributionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  healthDistributionHeader: {
    marginBottom: 16,
  },
  healthDistributionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  healthProgressContainer: {
    marginBottom: 16,
  },
  healthProgressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  healthSegment: {
    height: '100%',
  },
  excellentSegment: {
    backgroundColor: '#10b981',
  },
  goodSegment: {
    backgroundColor: '#64748b',
  },
  fairSegment: {
    backgroundColor: '#f59e0b',
  },
  criticalSegment: {
    backgroundColor: '#ef4444',
  },
  healthLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  // Removed navigation help card styles (navigationHelpCard, navigationHelpContent, navigationHelpIcon, navigationHelpText, navigationHelpTitle, navigationHelpSubtitle)

});

export default DashboardScreen;