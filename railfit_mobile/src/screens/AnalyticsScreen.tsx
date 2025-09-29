import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import SharedSidebar from '../components/SharedSidebar';
import { useSidebar } from '../hooks/useSidebar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WearAnalysis {
  analysisId: string;
  id: string;
  image: string;
  thumbnail: string;
  timestamp: string;
  processingStatus: 'processing' | 'completed' | 'failed';
  assetInfo: {
    assetId: string;
    assetType: 'rail' | 'fastener' | 'sleeper' | 'signal' | 'switch' | 'bridge';
    assetName: string;
    manufacturer: string;
    installationDate: string;
    specifications: string;
  };
  physicalCondition: {
    surfaceCracks: number; // 0-100%
    deformation: number; // 0-100%
    corrosion: number; // 0-100%
    wear: number; // 0-100%
    colorTexture: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    looseFit: boolean;
    visualDefects: string[];
    measurementAccuracy: number;
  };
  operationalParams: {
    age: number; // months since supply
    loadCycles: number;
    dailyTraffic: number;
    trackCategory: 'A' | 'B' | 'C' | 'D' | 'E';
    speedLimit: number;
    vibrationLevel: 'low' | 'medium' | 'high' | 'extreme';
    loadClass: 'light' | 'medium' | 'heavy' | 'super-heavy';
  };
  environmentalContext: {
    location: string;
    section: string;
    kilometer: number;
    weatherPattern: 'dry' | 'wet' | 'mixed' | 'extreme';
    soilCondition: 'stable' | 'soft' | 'rocky' | 'unstable';
    temperature: number;
    humidity: number;
    exposureLevel: 'indoor' | 'covered' | 'outdoor' | 'extreme';
  };
  historicalData: {
    lastInspection: string;
    daysSinceInspection: number;
    previousDefects: string[];
    maintenanceHistory: {
      date: string;
      type: string;
      description: string;
    }[];
    performanceTrend: 'improving' | 'stable' | 'declining' | 'critical';
  };
  aiPrediction: {
    remainingUsefulLife: number; // months
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number; // 0-100
    recommendedAction: string;
    confidence: number; // 0-100%
    modelVersion: string;
    analysisType: 'visual' | 'thermal' | 'ultrasonic' | 'multi-modal';
    defectProbability: {
      cracks: number;
      corrosion: number;
      wear: number;
      loosening: number;
    };
    maintenanceSchedule: {
      immediate: string[];
      shortTerm: string[]; // 1-3 months
      mediumTerm: string[]; // 3-12 months
      longTerm: string[]; // 12+ months
    };
  };
  qualityMetrics: {
    imageQuality: number;
    analysisAccuracy: number;
    processingTime: number;
    dataCompleteness: number;
  };
}

export default function AnalyticsScreen() {
  const { sidebarVisible, toggleSidebar, closeSidebar } = useSidebar();
  const [analyses, setAnalyses] = useState<WearAnalysis[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  
  // Offline storage hook
  const { 
    saveInspection, 
    isOnline, 
    cacheStatus, 
    syncPendingData 
  } = useOfflineStorage();

  useEffect(() => {
    // Load comprehensive sample analyses
    setAnalyses([
      {
        analysisId: 'ANL-2025-001',
        id: '1',
        image: 'sample_rail_1.jpg',
        thumbnail: 'thumb_rail_1.jpg',
        timestamp: '2025-09-22T10:30:00Z',
        processingStatus: 'completed',
        assetInfo: {
          assetId: 'RAIL-001-A127',
          assetType: 'rail',
          assetName: 'Main Line Rail Section A-127',
          manufacturer: 'Tata Steel',
          installationDate: '2021-03-15',
          specifications: 'UIC 60 kg/m steel rail',
        },
        physicalCondition: {
          surfaceCracks: 15,
          deformation: 5,
          corrosion: 12,
          wear: 18,
          colorTexture: 'fair',
          looseFit: false,
          visualDefects: ['Minor surface wear', 'Color fading'],
          measurementAccuracy: 92,
        },
        operationalParams: {
          age: 48,
          loadCycles: 320000,
          dailyTraffic: 120,
          trackCategory: 'A',
          speedLimit: 160,
          vibrationLevel: 'medium',
          loadClass: 'heavy',
        },
        environmentalContext: {
          location: 'Section A-127',
          section: 'Main Line',
          kilometer: 127.5,
          weatherPattern: 'mixed',
          soilCondition: 'stable',
          temperature: 32,
          humidity: 65,
          exposureLevel: 'outdoor',
        },
        historicalData: {
          lastInspection: '2025-08-15',
          daysSinceInspection: 38,
          previousDefects: ['Minor surface wear', 'Color fading'],
          maintenanceHistory: [
            { date: '2025-06-01', type: 'Lubrication', description: 'Rail joint lubrication' },
            { date: '2025-03-15', type: 'Grinding', description: 'Rail head grinding' },
          ],
          performanceTrend: 'declining',
        },
        aiPrediction: {
          remainingUsefulLife: 18,
          riskLevel: 'medium',
          riskScore: 65,
          recommendedAction: 'Schedule rail grinding within 6 months',
          confidence: 87,
          modelVersion: 'RailAI-v2.3',
          analysisType: 'visual',
          defectProbability: {
            cracks: 25,
            corrosion: 18,
            wear: 35,
            loosening: 8,
          },
          maintenanceSchedule: {
            immediate: [],
            shortTerm: ['Rail grinding', 'Joint inspection'],
            mediumTerm: ['Section replacement assessment'],
            longTerm: ['Complete rail renewal'],
          },
        },
        qualityMetrics: {
          imageQuality: 94,
          analysisAccuracy: 87,
          processingTime: 2.3,
          dataCompleteness: 96,
        },
      },
      {
        analysisId: 'ANL-2025-002',
        id: '2',
        image: 'sample_fastener_1.jpg',
        thumbnail: 'thumb_fastener_1.jpg',
        timestamp: '2025-09-22T09:15:00Z',
        processingStatus: 'completed',
        assetInfo: {
          assetId: 'FAST-002-B089',
          assetType: 'fastener',
          assetName: 'Rail Fastener Clip B-089',
          manufacturer: 'Pandrol',
          installationDate: '2022-01-20',
          specifications: 'Pandrol e-Clip system',
        },
        physicalCondition: {
          surfaceCracks: 8,
          deformation: 12,
          corrosion: 22,
          wear: 28,
          colorTexture: 'good',
          looseFit: true,
          visualDefects: ['Corrosion spots', 'Loose fitting'],
          measurementAccuracy: 89,
        },
        operationalParams: {
          age: 32,
          loadCycles: 180000,
          dailyTraffic: 85,
          trackCategory: 'B',
          speedLimit: 120,
          vibrationLevel: 'high',
          loadClass: 'medium',
        },
        environmentalContext: {
          location: 'Section B-089',
          section: 'Branch Line',
          kilometer: 89.2,
          weatherPattern: 'wet',
          soilCondition: 'soft',
          temperature: 28,
          humidity: 78,
          exposureLevel: 'outdoor',
        },
        historicalData: {
          lastInspection: '2025-07-20',
          daysSinceInspection: 63,
          previousDefects: ['Slight corrosion', 'Normal wear'],
          maintenanceHistory: [
            { date: '2025-05-10', type: 'Tightening', description: 'Fastener clip tightening' },
            { date: '2025-02-28', type: 'Cleaning', description: 'Corrosion removal and coating' },
          ],
          performanceTrend: 'declining',
        },
        aiPrediction: {
          remainingUsefulLife: 8,
          riskLevel: 'high',
          riskScore: 78,
          recommendedAction: 'Replace fastener within 2 months',
          confidence: 92,
          modelVersion: 'FastenerAI-v1.8',
          analysisType: 'visual',
          defectProbability: {
            cracks: 15,
            corrosion: 45,
            wear: 38,
            loosening: 62,
          },
          maintenanceSchedule: {
            immediate: ['Tighten fastener', 'Apply anti-corrosion coating'],
            shortTerm: ['Replace fastener clip'],
            mediumTerm: ['Inspect adjacent fasteners'],
            longTerm: ['Section fastener renewal'],
          },
        },
        qualityMetrics: {
          imageQuality: 91,
          analysisAccuracy: 92,
          processingTime: 1.8,
          dataCompleteness: 94,
        },
      },
      {
        analysisId: 'ANL-2025-003',
        id: '3',
        image: 'sample_signal_1.jpg',
        thumbnail: 'thumb_signal_1.jpg',
        timestamp: '2025-09-22T08:45:00Z',
        processingStatus: 'completed',
        assetInfo: {
          assetId: 'SIG-003-C156',
          assetType: 'signal',
          assetName: 'Color Light Signal C-156',
          manufacturer: 'Siemens',
          installationDate: '2020-11-08',
          specifications: 'LED Color Light Signal System',
        },
        physicalCondition: {
          surfaceCracks: 3,
          deformation: 1,
          corrosion: 8,
          wear: 12,
          colorTexture: 'excellent',
          looseFit: false,
          visualDefects: ['Lens scratches'],
          measurementAccuracy: 97,
        },
        operationalParams: {
          age: 58,
          loadCycles: 450000,
          dailyTraffic: 200,
          trackCategory: 'A',
          speedLimit: 180,
          vibrationLevel: 'low',
          loadClass: 'light',
        },
        environmentalContext: {
          location: 'Signal Post C-156',
          section: 'Main Corridor',
          kilometer: 156.8,
          weatherPattern: 'dry',
          soilCondition: 'stable',
          temperature: 35,
          humidity: 45,
          exposureLevel: 'outdoor',
        },
        historicalData: {
          lastInspection: '2025-08-01',
          daysSinceInspection: 52,
          previousDefects: ['Minor lens wear'],
          maintenanceHistory: [
            { date: '2025-04-15', type: 'Lens cleaning', description: 'Signal lens maintenance' },
            { date: '2025-01-10', type: 'Calibration', description: 'Signal timing calibration' },
          ],
          performanceTrend: 'stable',
        },
        aiPrediction: {
          remainingUsefulLife: 36,
          riskLevel: 'low',
          riskScore: 25,
          recommendedAction: 'Continue regular monitoring',
          confidence: 95,
          modelVersion: 'SignalAI-v3.1',
          analysisType: 'visual',
          defectProbability: {
            cracks: 5,
            corrosion: 12,
            wear: 18,
            loosening: 3,
          },
          maintenanceSchedule: {
            immediate: [],
            shortTerm: ['Lens cleaning'],
            mediumTerm: ['LED replacement assessment'],
            longTerm: ['Signal system upgrade'],
          },
        },
        qualityMetrics: {
          imageQuality: 98,
          analysisAccuracy: 95,
          processingTime: 1.2,
          dataCompleteness: 99,
        },
      },
    ]);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAnalysisModal(true);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAnalysisModal(true);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !locationInput) {
      Alert.alert('Error', 'Please provide image and location');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newAnalysis: WearAnalysis = {
      analysisId: `ANL-2025-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      id: Date.now().toString(),
      image: selectedImage,
      thumbnail: selectedImage,
      timestamp: new Date().toISOString(),
      processingStatus: 'completed',
      assetInfo: {
        assetId: `ASSET-${locationInput.replace(/\s+/g, '-').toUpperCase()}`,
        assetType: 'rail',
        assetName: `Railway Asset - ${locationInput}`,
        manufacturer: 'Unknown',
        installationDate: '2020-01-01',
        specifications: 'Standard railway component',
      },
      physicalCondition: {
        surfaceCracks: Math.floor(Math.random() * 30),
        deformation: Math.floor(Math.random() * 20),
        corrosion: Math.floor(Math.random() * 25),
        wear: Math.floor(Math.random() * 40),
        colorTexture: ['excellent', 'good', 'fair', 'poor', 'critical'][Math.floor(Math.random() * 5)] as any,
        looseFit: Math.random() > 0.7,
        visualDefects: ['Surface wear', 'Minor scratches', 'Color variation'],
        measurementAccuracy: Math.floor(Math.random() * 20) + 80,
      },
      operationalParams: {
        age: Math.floor(Math.random() * 60) + 12,
        loadCycles: Math.floor(Math.random() * 500000) + 100000,
        dailyTraffic: Math.floor(Math.random() * 150) + 50,
        trackCategory: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)] as any,
        speedLimit: Math.floor(Math.random() * 100) + 80,
        vibrationLevel: ['low', 'medium', 'high', 'extreme'][Math.floor(Math.random() * 4)] as any,
        loadClass: ['light', 'medium', 'heavy', 'super-heavy'][Math.floor(Math.random() * 4)] as any,
      },
      environmentalContext: {
        location: locationInput,
        section: 'Auto-detected',
        kilometer: Math.floor(Math.random() * 200) + 1,
        weatherPattern: ['dry', 'wet', 'mixed', 'extreme'][Math.floor(Math.random() * 4)] as any,
        soilCondition: ['stable', 'soft', 'rocky', 'unstable'][Math.floor(Math.random() * 4)] as any,
        temperature: Math.floor(Math.random() * 20) + 20,
        humidity: Math.floor(Math.random() * 40) + 40,
        exposureLevel: ['indoor', 'covered', 'outdoor', 'extreme'][Math.floor(Math.random() * 4)] as any,
      },
      historicalData: {
        lastInspection: '2025-08-15',
        daysSinceInspection: Math.floor(Math.random() * 90) + 1,
        previousDefects: ['Surface wear', 'Color fading', 'Minor cracks'],
        maintenanceHistory: [
          { date: '2025-06-01', type: 'Routine', description: 'Regular maintenance check' },
          { date: '2025-03-15', type: 'Repair', description: 'Minor repair work' },
        ],
        performanceTrend: ['improving', 'stable', 'declining', 'critical'][Math.floor(Math.random() * 4)] as any,
      },
      aiPrediction: {
        remainingUsefulLife: Math.floor(Math.random() * 36) + 6,
        riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        riskScore: Math.floor(Math.random() * 100),
        recommendedAction: 'Schedule maintenance within next inspection cycle',
        confidence: Math.floor(Math.random() * 20) + 80,
        modelVersion: 'RailAI-v2.3',
        analysisType: 'visual',
        defectProbability: {
          cracks: Math.floor(Math.random() * 50),
          corrosion: Math.floor(Math.random() * 40),
          wear: Math.floor(Math.random() * 60),
          loosening: Math.floor(Math.random() * 30),
        },
        maintenanceSchedule: {
          immediate: [],
          shortTerm: ['Visual inspection', 'Cleaning'],
          mediumTerm: ['Detailed assessment'],
          longTerm: ['Replacement consideration'],
        },
      },
      qualityMetrics: {
        imageQuality: Math.floor(Math.random() * 20) + 80,
        analysisAccuracy: Math.floor(Math.random() * 20) + 80,
        processingTime: Math.random() * 3 + 1,
        dataCompleteness: Math.floor(Math.random() * 20) + 80,
      },
    };

    setAnalyses(prev => [newAnalysis, ...prev]);
    
    // Save to offline storage
    try {
      await saveInspection({
        assetId: `asset_${locationInput.replace(/\s+/g, '_')}`,
        inspectorId: 'current_user', // Replace with actual user ID
        timestamp: newAnalysis.timestamp,
        status: newAnalysis.aiPrediction.riskLevel === 'critical' ? 'critical' : 
               newAnalysis.aiPrediction.riskLevel === 'high' ? 'maintenance' : 'operational',
        notes: `AI Analysis: ${newAnalysis.aiPrediction.recommendedAction}. Confidence: ${newAnalysis.aiPrediction.confidence}%. Surface cracks: ${newAnalysis.physicalCondition.surfaceCracks}%, Corrosion: ${newAnalysis.physicalCondition.corrosion}%`,
        location: {
          latitude: 0, // Replace with actual GPS coordinates
          longitude: 0,
        },
      });
    } catch (error) {
      console.error('Error saving analysis to offline storage:', error);
    }
    
    setIsAnalyzing(false);
    setShowAnalysisModal(false);
    setSelectedImage(null);
    setLocationInput('');

    const syncStatus = isOnline ? '' : ' (Saved offline - will sync when online)';
    Alert.alert(
      'Analysis Complete', 
      `Remaining Useful Life: ${newAnalysis.aiPrediction.remainingUsefulLife} months\nRisk Level: ${newAnalysis.aiPrediction.riskLevel}${syncStatus}`
    );
  };

  // Calculate dashboard metrics
  const totalAnalyses = analyses.length;
  const criticalPredictions = analyses.filter(a => a.aiPrediction.riskLevel === 'critical').length;
  const highRiskAnalyses = analyses.filter(a => a.aiPrediction.riskLevel === 'high').length;
  const averageHealthScore = Math.round(
    analyses.reduce((sum, a) => sum + (100 - a.aiPrediction.riskScore), 0) / (analyses.length || 1)
  );
  const averageAccuracy = Math.round(
    analyses.reduce((sum, a) => sum + a.aiPrediction.confidence, 0) / (analyses.length || 1)
  );

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>('all');

  // Filter analyses based on active filter
  const filteredAnalyses = analyses.filter(analysis => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return analysis.aiPrediction.riskLevel === 'critical';
    if (activeFilter === 'high') return analysis.aiPrediction.riskLevel === 'high';
    if (activeFilter === 'medium') return analysis.aiPrediction.riskLevel === 'medium';
    if (activeFilter === 'low') return analysis.aiPrediction.riskLevel === 'low';
    return true;
  }).filter(analysis => {
    if (selectedEquipmentType === 'all') return true;
    return analysis.assetInfo.assetType === selectedEquipmentType;
  });

  // MetricCard component
  const MetricCard = ({ title, value, subtitle, description, icon, borderColor }: {
    title: string;
    value: string | number;
    subtitle?: string;
    description?: string;
    icon: string;
    borderColor: string;
  }) => (
    <View style={[styles.metricCard, { borderLeftColor: borderColor }]}>
      <View style={styles.metricContent}>
        <View style={styles.metricTextContainer}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
          {description && <Text style={styles.metricDescription}>{description}</Text>}
        </View>
        <Text style={[styles.metricIcon, { color: borderColor }]}>{icon}</Text>
      </View>
    </View>
  );

  // FilterTab component
  const FilterTab = ({ label, isActive, onPress }: {
    label: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterTab, isActive && styles.filterTabActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // AnalyticsCard component
  const AnalyticsCard = ({ analysis }: { analysis: WearAnalysis }) => {
    const getRiskColor = (risk: string) => {
      switch (risk) {
        case 'low': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'high': return '#f97316';
        case 'critical': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getAssetIcon = (type: string) => {
      switch (type) {
        case 'rail': return '🛤️';
        case 'fastener': return '🔗';
        case 'sleeper': return '🪵';
        case 'signal': return '🚦';
        case 'switch': return '🔀';
        case 'bridge': return '🌉';
        default: return '⚙️';
      }
    };

    return (
      <TouchableOpacity style={styles.analyticsCard}>
        <View style={[styles.severityIndicator, { backgroundColor: getRiskColor(analysis.aiPrediction.riskLevel) }]} />
        
        <View style={styles.cardHeader}>
          <View style={styles.cardTopRow}>
            <Text style={styles.analysisId}>{analysis.analysisId}</Text>
            <View style={styles.processingStatus}>
              <View style={[styles.statusDot, { backgroundColor: analysis.processingStatus === 'completed' ? '#10b981' : '#f59e0b' }]} />
              <Text style={styles.statusText}>{analysis.processingStatus}</Text>
            </View>
          </View>
          <Text style={styles.assetTitle}>{analysis.assetInfo.assetName}</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(analysis.aiPrediction.riskLevel) }]}>
            <Text style={styles.riskText}>{analysis.aiPrediction.riskLevel.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.assetInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.assetIcon}>{getAssetIcon(analysis.assetInfo.assetType)}</Text>
              <Text style={styles.cardItemText}>
                <Text style={styles.labelText}>Asset:</Text> {analysis.assetInfo.assetId}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardItemText}>
                <Text style={styles.labelText}>Location:</Text> {analysis.environmentalContext.section} - KM {analysis.environmentalContext.kilometer}
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>RUL</Text>
              <Text style={styles.metricValueText}>{analysis.aiPrediction.remainingUsefulLife}mo</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Risk Score</Text>
              <Text style={styles.metricValueText}>{analysis.aiPrediction.riskScore}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValueText}>{analysis.aiPrediction.confidence}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Wear Level</Text>
              <Text style={styles.metricValueText}>{analysis.physicalCondition.wear}%</Text>
            </View>
          </View>

          <Text style={styles.recommendation}>{analysis.aiPrediction.recommendedAction}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.timestampInfo}>
            <Text style={styles.timestampText}>
              {new Date(analysis.timestamp).toLocaleDateString()} • {analysis.aiPrediction.modelVersion}
            </Text>
          </View>
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>Quality: {analysis.qualityMetrics.analysisAccuracy}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>AI Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>Railway Asset Condition Analysis & Predictions</Text>
          </View>
          <TouchableOpacity style={styles.newAnalysisButton}>
            <Text style={styles.newAnalysisIcon}>🔬</Text>
            <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Dashboard */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Analyses"
          value={totalAnalyses}
          subtitle="+12% from last month"
          description="All completed analyses"
          icon="📊"
          borderColor="#3b82f6"
        />
        <MetricCard
          title="Critical Predictions"
          value={criticalPredictions}
          subtitle={criticalPredictions > 0 ? "Requires attention" : "All systems stable"}
          description="High-risk equipment"
          icon="⚠️"
          borderColor="#ef4444"
        />
        <MetricCard
          title="Equipment Health"
          value={`${averageHealthScore}%`}
          subtitle="Above average"
          description="Overall condition score"
          icon="💚"
          borderColor="#10b981"
        />
        <MetricCard
          title="AI Accuracy"
          value={`${averageAccuracy}%`}
          subtitle="Model performance"
          description="Prediction confidence"
          icon="🎯"
          borderColor="#8b5cf6"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsContent}>
          <FilterTab label="All Analyses" isActive={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
          <FilterTab label="Critical" isActive={activeFilter === 'critical'} onPress={() => setActiveFilter('critical')} />
          <FilterTab label="High Risk" isActive={activeFilter === 'high'} onPress={() => setActiveFilter('high')} />
          <FilterTab label="Medium Risk" isActive={activeFilter === 'medium'} onPress={() => setActiveFilter('medium')} />
          <FilterTab label="Low Risk" isActive={activeFilter === 'low'} onPress={() => setActiveFilter('low')} />
        </ScrollView>
      </View>

      {/* Analytics List */}
      <ScrollView 
        style={styles.analyticsList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {filteredAnalyses.length > 0 ? (
          filteredAnalyses.map((analysis) => (
            <AnalyticsCard key={analysis.id} analysis={analysis} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No Analyses Found</Text>
            <Text style={styles.emptyStateText}>
              No analyses match the current filter criteria.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Capture Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {/* Analysis Modal */}
      <Modal visible={showAnalysisModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Image Analysis</Text>
            
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}

            <TextInput
              style={styles.locationInput}
              placeholder="Enter location (e.g., Section A-127)"
              value={locationInput}
              onChangeText={setLocationInput}
            />

            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color={Colors.primary.main} />
                <Text style={styles.analyzingText}>Analyzing image with AI...</Text>
                <Text style={styles.analyzingSubtext}>Detecting wear patterns, corrosion, and predicting RUL</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowAnalysisModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.analyzeButton]} 
                  onPress={analyzeImage}
                >
                  <Text style={styles.analyzeButtonText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <SharedSidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
        currentScreen="Analytics"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
    minHeight: '100%',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
  newAnalysisIcon: {
    fontSize: 16,
  },
  newAnalysisButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    flex: 1,
    minWidth: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 10,
    color: '#6b7280',
  },
  metricIcon: {
    fontSize: 20,
  },
  filterTabsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterTabsContent: {
    paddingRight: 16,
  },
  filterTab: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  analyticsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  severityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisId: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'monospace',
    flex: 1,
  },
  processingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  riskBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  assetInfo: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  assetIcon: {
    fontSize: 16,
  },
  cardItemText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  labelText: {
    fontWeight: '600',
    color: '#374151',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  recommendation: {
    fontSize: 12,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  timestampInfo: {
    flex: 1,
  },
  timestampText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  qualityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analyzeButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});