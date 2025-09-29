import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Calculate responsive widths for different screen sizes
const getCardWidth = () => {
  if (Platform.OS === 'web') {
    if (width > 1200) return (width - 120) / 4; // 4 cards on large screens
    if (width > 768) return (width - 96) / 3; // 3 cards on medium screens
    if (width > 480) return (width - 72) / 2; // 2 cards on small screens
  }
  return (width - 56) / 2; // 2 cards on mobile
};

interface AnalyticsData {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  assetId: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  aiPrediction: {
    remainingUsefulLife: number;
    riskScore: number;
    recommendedAction: string;
  };
  metrics: {
    surfaceCracks: number;
    corrosion: number;
    wear: number;
    deformation: number;
  };
}

const mockAnalytics: AnalyticsData[] = [
  {
    id: '1',
    title: 'Critical Rail Wear Analysis',
    description: 'Advanced AI analysis detected significant wear patterns requiring immediate attention',
    timestamp: '2 hours ago',
    assetId: 'RAIL-001-A127',
    location: 'Track Section A-127, KM 45.2',
    riskLevel: 'critical',
    confidence: 94,
    aiPrediction: {
      remainingUsefulLife: 2,
      riskScore: 87,
      recommendedAction: 'Immediate replacement required',
    },
    metrics: {
      surfaceCracks: 18,
      corrosion: 12,
      wear: 85,
      deformation: 15,
    },
  },
  {
    id: '2',
    title: 'Fastener Degradation Pattern',
    description: 'Machine learning model identified progressive fastener loosening trend',
    timestamp: '4 hours ago',
    assetId: 'FAST-045-B203',
    location: 'Junction B-203, Platform 2',
    riskLevel: 'high',
    confidence: 89,
    aiPrediction: {
      remainingUsefulLife: 6,
      riskScore: 72,
      recommendedAction: 'Schedule maintenance within 30 days',
    },
    metrics: {
      surfaceCracks: 8,
      corrosion: 25,
      wear: 45,
      deformation: 12,
    },
  },
  {
    id: '3',
    title: 'Signal Equipment Health Check',
    description: 'Predictive maintenance analysis shows optimal performance with minor concerns',
    timestamp: '6 hours ago',
    assetId: 'SIG-078-C114',
    location: 'Signal Tower C-114, KM 67.8',
    riskLevel: 'medium',
    confidence: 92,
    aiPrediction: {
      remainingUsefulLife: 18,
      riskScore: 45,
      recommendedAction: 'Continue monitoring, routine maintenance in 3 months',
    },
    metrics: {
      surfaceCracks: 2,
      corrosion: 8,
      wear: 22,
      deformation: 3,
    },
  },
];

const ProfessionalAnalyticsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const analyticsStats = {
    totalAnalyses: 147,
    criticalIssues: 8,
    aiConfidence: 91.5,
    predictiveAccuracy: 94.2,
    todayAnalyses: 12,
    weeklyGrowth: 15.3,
    averageRiskScore: 52.8,
    maintenanceSaved: 2.4,
  };

  const filterTabs = [
    { key: 'all', label: 'All Analytics', count: mockAnalytics.length },
    { key: 'critical', label: 'Critical', count: mockAnalytics.filter(a => a.riskLevel === 'critical').length },
    { key: 'high', label: 'High Risk', count: mockAnalytics.filter(a => a.riskLevel === 'high').length },
    { key: 'medium', label: 'Medium', count: mockAnalytics.filter(a => a.riskLevel === 'medium').length },
    { key: 'low', label: 'Low Risk', count: mockAnalytics.filter(a => a.riskLevel === 'low').length },
  ];

  const filteredAnalytics = mockAnalytics.filter(item => {
    if (activeFilter === 'all') return true;
    return item.riskLevel === activeFilter;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, color: string, icon: string, trend?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color, width: getCardWidth() }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statSubtitle}>{subtitle}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend.startsWith('+') ? "trending-up" : "trending-down"} 
                size={12} 
                color={trend.startsWith('+') ? "#10b981" : "#ef4444"} 
              />
              <Text style={[styles.trendText, { color: trend.startsWith('+') ? "#10b981" : "#ef4444" }]}>
                {trend}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderAnalyticsItem = ({ item }: { item: AnalyticsData }) => (
    <TouchableOpacity style={styles.analyticsCard}>
      <View style={styles.analyticsHeader}>
        <View style={styles.riskLevelContainer}>
          <Ionicons 
            name={getRiskIcon(item.riskLevel) as any} 
            size={18} 
            color={getRiskColor(item.riskLevel)} 
          />
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
            <Text style={styles.riskText}>{item.riskLevel}</Text>
          </View>
        </View>
        <Text style={styles.analyticsTimestamp}>{item.timestamp}</Text>
      </View>
      
      <Text style={styles.analyticsTitle}>{item.title}</Text>
      <Text style={styles.analyticsDescription}>{item.description}</Text>
      
      <View style={styles.analyticsDetails}>
        <View style={styles.analyticsDetailRow}>
          <View style={styles.analyticsDetailItem}>
            <Ionicons name="cube-outline" size={14} color="#6b7280" />
            <Text style={styles.analyticsDetailText}>{item.assetId}</Text>
          </View>
          <View style={styles.analyticsDetailItem}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.analyticsDetailText}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>RUL</Text>
            <Text style={[styles.metricValue, { color: getRiskColor(item.riskLevel) }]}>
              {item.aiPrediction.remainingUsefulLife}m
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Risk Score</Text>
            <Text style={[styles.metricValue, { color: getRiskColor(item.riskLevel) }]}>
              {item.aiPrediction.riskScore}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={[styles.metricValue, { color: '#10b981' }]}>
              {item.confidence}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Wear</Text>
            <Text style={[styles.metricValue, { color: '#f59e0b' }]}>
              {item.metrics.wear}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationLabel}>AI Recommendation:</Text>
        <Text style={styles.recommendationText}>{item.aiPrediction.recommendedAction}</Text>
      </View>

      <View style={styles.analyticsActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewAnalyticsDetails(item.id)}>
          <Ionicons name="eye-outline" size={14} color="#6b7280" />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={() => handleGenerateAnalyticsReport(item.id)}>
          <Ionicons name="document-text-outline" size={14} color="#3b82f6" />
          <Text style={[styles.actionText, { color: '#3b82f6' }]}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.scheduleButton]} onPress={handleScheduleAnalysis}>
          <Ionicons name="calendar-outline" size={14} color="#10b981" />
          <Text style={[styles.actionText, { color: '#10b981' }]}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="analytics-outline" size={64} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No analytics found</Text>
      <Text style={styles.emptySubtitle}>
        No analytics match the selected filter criteria
      </Text>
    </View>
  );

  // Handler functions for analytics actions
  const handleViewAnalyticsDetails = (analysisId: string) => {
    // Navigate to detailed analytics view or show modal with comprehensive data
    console.log('Viewing analytics details for:', analysisId);
    // TODO: Navigate to AnalyticsDetailsScreen or show detailed modal
  };

  const handleGenerateAnalyticsReport = (analysisId?: string) => {
    // Generate and download/share analytics report
    console.log('Generating analytics report for:', analysisId || 'all analytics');
    // TODO: Implement report generation logic
  };

  const handleScheduleAnalysis = () => {
    // Open scheduling interface for automated analytics
    console.log('Opening schedule analysis interface');
    // TODO: Navigate to ScheduleAnalysisScreen or show scheduling modal
  };

  const handleNewAnalysis = () => {
    // Start new manual analysis or navigate to analysis creation
    console.log('Starting new analysis');
    // TODO: Navigate to NewAnalysisScreen or show analysis creation modal
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Advanced predictive analytics{'\n'}and intelligent insights
            </Text>
          </View>
          <TouchableOpacity style={styles.newAnalysisButton} onPress={handleNewAnalysis}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={styles.statsContainer}
        >
          {renderStatCard(
            'Total Analyses',
            analyticsStats.totalAnalyses,
            `${analyticsStats.todayAnalyses} today`,
            '#3b82f6',
            'analytics-outline',
            `+${analyticsStats.weeklyGrowth}% this week`
          )}
          {renderStatCard(
            'Critical Issues',
            analyticsStats.criticalIssues,
            'Require attention',
            '#ef4444',
            'alert-circle-outline'
          )}
          {renderStatCard(
            'AI Confidence',
            `${analyticsStats.aiConfidence}%`,
            'Average accuracy',
            '#10b981',
            'checkmark-circle-outline'
          )}
          {renderStatCard(
            'Predictive Accuracy',
            `${analyticsStats.predictiveAccuracy}%`,
            'Model performance',
            '#8b5cf6',
            'trending-up-outline'
          )}
          {renderStatCard(
            'Risk Score',
            analyticsStats.averageRiskScore,
            'Average risk level',
            '#f59e0b',
            'warning-outline'
          )}
          {renderStatCard(
            'Maintenance Saved',
            `${analyticsStats.maintenanceSaved}M`,
            'Cost optimization',
            '#06b6d4',
            'cash-outline'
          )}
        </ScrollView>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive,
                  activeFilter === tab.key && tab.key === 'critical' && styles.filterTabCritical,
                  activeFilter === tab.key && tab.key === 'high' && styles.filterTabHigh,
                  activeFilter === tab.key && tab.key === 'medium' && styles.filterTabMedium,
                  activeFilter === tab.key && tab.key === 'low' && styles.filterTabLow,
                ]}
                onPress={() => setActiveFilter(tab.key as any)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive
                ]}>
                  {tab.label}
                </Text>
                <View style={styles.filterTabBadge}>
                  <Text style={styles.filterTabCount}>{tab.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analytics List */}
        <View style={styles.analyticsContainer}>
          {filteredAnalytics.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredAnalytics}
              renderItem={renderAnalyticsItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.analyticsList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    fontWeight: '400',
  },
  newAnalysisButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  newAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsScrollContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minWidth: Platform.OS === 'web' ? 200 : getCardWidth(),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '400',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: '#e5e7eb',
  },
  filterTabCritical: {
    backgroundColor: '#fecaca',
  },
  filterTabHigh: {
    backgroundColor: '#fef3c7',
  },
  filterTabMedium: {
    backgroundColor: '#dbeafe',
  },
  filterTabLow: {
    backgroundColor: '#bbf7d0',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  filterTabBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterTabCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  analyticsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  analyticsList: {
    padding: 24,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  riskLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  analyticsTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  analyticsDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  analyticsDetails: {
    marginBottom: 16,
  },
  analyticsDetailRow: {
    flexDirection: 'column',
    gap: 8,
  },
  analyticsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analyticsDetailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recommendationLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  analyticsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  reportButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  scheduleButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProfessionalAnalyticsScreen;