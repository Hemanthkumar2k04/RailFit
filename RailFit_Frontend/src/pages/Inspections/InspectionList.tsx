import React, { useEffect, useState } from "react";
import { Camera, Upload, Calendar, User, MapPin, AlertTriangle, CheckCircle, Clock, TrendingUp, QrCode } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import QRScanner from "@/components/QRScanner";

type Inspection = {
  inspection_id: string;
  asset_id: string;
  inspector_id: string;
  inspector_name: string;
  location: string;
  inspection_date: string;
  inspection_type: string;
  result: string;
  confidence_score?: number;
  notes?: string;
  image_data?: string;
  ai_prediction?: {
    prediction: string;
    confidence: number;
    defect_probability: number;
  };
  created_at: string;
};

type Analytics = {
  total_inspections: number;
  defective_count: number;
  non_defective_count: number;
  defect_rate: number;
  average_confidence: number;
  recent_inspections_count: number;
  top_inspectors: { name: string; count: number; }[];
};

const resultStyles = {
  "Defective": "bg-red-100 text-red-800 border-red-400",
  "Non-Defective": "bg-green-100 text-green-800 border-green-400",
  "Manual Inspection Required": "bg-yellow-100 text-yellow-800 border-yellow-400",
};

const resultIcons = {
  "Defective": <AlertTriangle className="w-4 h-4" />,
  "Non-Defective": <CheckCircle className="w-4 h-4" />,
  "Manual Inspection Required": <Clock className="w-4 h-4" />,
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  // Modal state for inspection details
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  // Asset details state for enhanced modal
  const [assetDetails, setAssetDetails] = useState<{
    type?: string;
    location?: string;
    health_score?: number;
    vendor_name?: string;
    status?: string;
    condition?: string;
  }>({});
  const [isLoadingAsset, setIsLoadingAsset] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    asset_id: '',
    location: '',
    inspection_type: 'visual',
    notes: ''
  });

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection utility
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768);
  };

  // QR Code scan handler
  const handleQRScan = (scannedData: string) => {
    // Extract asset ID from QR code data
    // Assuming QR code contains asset ID directly or in a specific format
    let assetId = scannedData;
    
    // If QR code contains JSON or specific format, parse it
    try {
      const parsed = JSON.parse(scannedData);
      if (parsed.asset_id) {
        assetId = parsed.asset_id;
      } else if (parsed.assetId) {
        assetId = parsed.assetId;
      } else if (parsed.id) {
        assetId = parsed.id;
      }
    } catch (e) {
      // If it's not JSON, treat as plain asset ID
      // Remove any prefix like "AST-" or similar if needed
      assetId = scannedData.trim();
    }
    
    // Update form data with scanned asset ID
    setFormData(prev => ({ ...prev, asset_id: assetId }));
    
    // Trigger asset details fetch
    handleAssetIdChange({ target: { value: assetId } } as any);
    
    // Close QR scanner
    setShowQRScanner(false);
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
  };

  // API headers with authentication (using apiCall helper instead)

  useEffect(() => {
    fetchInspections();
    fetchAnalytics();
    setIsMobile(detectMobile());
    
    // Add resize listener to detect mobile on window resize
    const handleResize = () => setIsMobile(detectMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchInspections = async () => {
    try {
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError('Please log in to view inspections');
        return;
      }

      const response = await fetch(API_ENDPOINTS.INSPECTIONS.BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInspections(data);
    } catch (error) {
      setError('Failed to load inspections. Please try again.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.INSPECTIONS.ANALYTICS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      // Analytics failure shouldn't block the main functionality
    }
  };

  // Fetch asset details when asset ID changes
  const fetchAssetDetails = async (assetId: string) => {
    if (!assetId.trim()) {
      setAssetDetails({});
      return;
    }

    setIsLoadingAsset(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        setError('Please log in to fetch asset details');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.INSPECTIONS.BASE}/asset/${assetId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const asset = await response.json();
        setAssetDetails({
          type: asset.type,
          location: asset.location,
          health_score: asset.health_score,
          vendor_name: asset.vendor_name,
          status: asset.status,
          condition: asset.condition
        });
        
        // Auto-fill location if not already filled
        if (asset.location && !formData.location) {
          setFormData(prev => ({ ...prev, location: asset.location }));
        }
      } else {
        setAssetDetails({});
        if (response.status === 404) {
          setError(`Asset ${assetId} not found`);
        }
      }
    } catch (error) {
      setAssetDetails({});
    } finally {
      setIsLoadingAsset(false);
    }
  };

  // Handle asset ID input change with debouncing
  const handleAssetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, asset_id: value });
    
    // Clear previous error when user starts typing
    if (error && error.includes('Asset')) {
      setError(null);
    }
    
    // Debounce asset fetching
    const timeoutId = setTimeout(() => {
      fetchAssetDetails(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      if (!token) {
        setError('Please log in to create inspections');
        setIsLoading(false);
        return;
      }

      // Create FormData for multipart form submission
      const formDataToSend = new FormData();
      formDataToSend.append('asset_id', formData.asset_id);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('inspection_type', formData.inspection_type);
      formDataToSend.append('notes', formData.notes || '');
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await fetch(API_ENDPOINTS.INSPECTIONS.BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formDataToSend
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          setIsLoading(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const newInspection = await response.json();
      
      // Add new inspection to the list
      setInspections([newInspection, ...inspections]);
      
      // Reset form
      setShowCreateForm(false);
      setFormData({ asset_id: '', location: '', inspection_type: 'visual', notes: '' });
      setSelectedImage(null);
      
      // Refresh analytics
      await fetchAnalytics();
      
    } catch (error) {
      setError(`Failed to create inspection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file too large. Please select a file under 5MB.');
        return;
      }
      setSelectedImage(file);
      setError(null);
    } else {
      setError('Please select a valid image file.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInspections = inspections.filter(inspection => {
    if (filter === 'all') return true;
    if (filter === 'defective') return inspection.result === 'Defective';
    if (filter === 'non-defective') return inspection.result === 'Non-Defective';
    if (filter === 'manual') return inspection.result === 'Manual Inspection Required';
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rail Inspections</h1>
          <p className="text-gray-600 mt-1">AI-powered defect detection and inspection management</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Camera className="w-5 h-5" />
          New Inspection
        </button>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.total_inspections}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">+{analytics.recent_inspections_count} this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Defect Rate</p>
                <p className="text-3xl font-bold text-red-600">{analytics.defect_rate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.defective_count} defects found</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-3xl font-bold text-green-600">{(analytics.average_confidence * 100).toFixed(0)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Average AI accuracy</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">{(100 - analytics.defect_rate).toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">{analytics.non_defective_count} passed inspections</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Inspections
        </button>
        <button
          onClick={() => setFilter('defective')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'defective' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Defective
        </button>
        <button
          onClick={() => setFilter('non-defective')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'non-defective' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Non-Defective
        </button>
        <button
          onClick={() => setFilter('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'manual' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Manual Review
        </button>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInspections.map((inspection) => (
          <div
            key={inspection.inspection_id}
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-semibold text-lg text-gray-900 truncate" title={inspection.inspection_id}>{inspection.inspection_id}</h3>
                <p className="text-sm text-gray-600 truncate" title={inspection.asset_id}>{inspection.asset_id}</p>
              </div>
              <span className={`text-right px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                resultStyles[inspection.result as keyof typeof resultStyles] || 'bg-gray-100 text-gray-800'
              }`}>
                {resultIcons[inspection.result as keyof typeof resultIcons]}
                {inspection.result}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {inspection.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {inspection.inspector_name}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {formatDate(inspection.inspection_date)}
              </div>
            </div>

            {inspection.confidence_score && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">AI Confidence</span>
                  <span className="text-xs font-bold">{(inspection.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${inspection.confidence_score * 100}%` }}
                  />
                </div>
              </div>
            )}

            {inspection.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{inspection.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xs text-gray-500 capitalize">{inspection.inspection_type}</span>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setSelectedInspection(inspection)}
                type="button"
              >
                View Details
              </button>
            </div>
      {/* Inspection Details Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Inspection Details</h2>
              <button
                className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2"
                onClick={() => setSelectedInspection(null)}
                aria-label="Close"
                type="button"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Inspection ID:</span>
                  <span className="text-gray-900">{selectedInspection.inspection_id}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Asset ID:</span>
                  <span className="text-gray-900">{selectedInspection.asset_id}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Inspector:</span>
                  <span className="text-gray-900">{selectedInspection.inspector_name}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="text-gray-900">{selectedInspection.location}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="text-gray-900">{formatDate(selectedInspection.inspection_date)}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900 capitalize">{selectedInspection.inspection_type}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Result:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${resultStyles[selectedInspection.result as keyof typeof resultStyles]}`}>{selectedInspection.result}</span>
                </div>
                {selectedInspection.confidence_score !== undefined && (
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-gray-700">AI Confidence:</span>
                    <span className="text-gray-900">{(selectedInspection.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                )}
                {selectedInspection.ai_prediction && (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-700">AI Prediction:</span>
                    <span className="text-gray-900">{selectedInspection.ai_prediction.prediction} ({(selectedInspection.ai_prediction.confidence * 100).toFixed(0)}% confidence, {(selectedInspection.ai_prediction.defect_probability * 100).toFixed(0)}% defect probability)</span>
                  </div>
                )}
                {selectedInspection.notes && (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <span className="text-gray-900">{selectedInspection.notes}</span>
                  </div>
                )}
                {selectedInspection.image_data && (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-700">Image:</span>
                    <img src={selectedInspection.image_data} alt="Inspection" className="w-40 h-40 object-cover rounded border" />
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-700">Created At:</span>
                  <span className="text-gray-900">{formatDate(selectedInspection.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        ))}
      </div>

      {/* Enhanced Inspection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">AI-Powered Asset Inspection</h2>
              <p className="text-sm text-gray-600 mt-1">Create an inspection with automatic health score analysis</p>
            </div>

            <form onSubmit={handleCreateInspection} className="p-6 space-y-6">
              {/* QR Scanner for Mobile - Top of Modal */}
              {isMobile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Quick QR Scan</h4>
                        <p className="text-xs text-blue-700">Scan asset QR code to auto-fill Asset ID</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Camera className="w-4 h-4" />
                      Scan QR
                    </button>
                  </div>
                </div>
              )}

              {/* Asset Information Section */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Asset Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset ID *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.asset_id}
                        onChange={handleAssetIdChange}
                        className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., AST-001"
                      />
                      {/* QR Scanner button for desktop or as secondary option */}
                      <button
                        type="button"
                        onClick={() => setShowQRScanner(true)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Scan QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Type
                    </label>
                    <input
                      type="text"
                      value={isLoadingAsset ? 'Loading...' : (assetDetails.type || 'Enter Asset ID above')}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={assetDetails.location || formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Track Section A-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Health Score
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={isLoadingAsset ? 'Loading...' : (assetDetails.health_score ? `${assetDetails.health_score}%` : 'Enter Asset ID above')}
                        className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        disabled
                      />
                      {assetDetails.health_score && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          assetDetails.health_score >= 70 ? 'bg-green-100 text-green-800' :
                          assetDetails.health_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assetDetails.health_score >= 70 ? 'Good' :
                           assetDetails.health_score >= 40 ? 'Fair' : 'Poor'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {assetDetails.vendor_name && (
                  <div className="text-sm text-gray-600">
                    <strong>Vendor:</strong> {assetDetails.vendor_name} | 
                    <strong> Status:</strong> {assetDetails.status} | 
                    <strong> Condition:</strong> {assetDetails.condition}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Type
                </label>
                <select
                  value={formData.inspection_type}
                  onChange={(e) => setFormData({...formData, inspection_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="visual">Visual Inspection</option>
                  <option value="ai_assisted">AI-Assisted Inspection</option>
                  <option value="detailed">Detailed Inspection</option>
                  <option value="routine">Routine Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {selectedImage ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Selected"
                          className="w-20 h-20 object-cover mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600">{selectedImage.name}</p>
                        <p className="text-xs text-blue-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500">AI analysis available with image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional observations..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedImage(null);
                    setFormData({ asset_id: '', location: '', inspection_type: 'visual', notes: '' });
                    setAssetDetails({});
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Create Inspection
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredInspections.length === 0 && !error && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "Get started by creating your first inspection"
              : `No inspections match the "${filter}" filter`
            }
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all inspections
            </button>
          )}
        </div>
      )}
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
}