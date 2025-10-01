import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import BulkImportModal from '@/components/BulkImportModal'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import {
    Search,
    Plus,
    Upload,
    FileText,
    Download,
    Grid3X3,
    List,
    Eye,
    Edit,
    // QrCode, // Removed - not needed after qr_code column deletion
    Calendar,
    MapPin,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X,
    Save,
    Building,
    Settings,
    User
} from 'lucide-react'

// Define options outside component to avoid re-declaration
const assetTypes = [
    'Elastic Rail Clip',
    'Rail Pad',
    'Liner',
    'Sleeper'
]

const assetTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Elastic Rail Clip', label: 'Elastic Rail Clip' },
    { value: 'Rail Pad', label: 'Rail Pad' },
    { value: 'Liner', label: 'Liner' },
    { value: 'Sleeper', label: 'Sleeper' }
]

const regionOptions = [
    { value: '', label: 'All Regions' },
    { value: 'Northern Railway', label: 'Northern Railway' },
    { value: 'Southern Railway', label: 'Southern Railway' },
    { value: 'Eastern Railway', label: 'Eastern Railway' },
    { value: 'Western Railway', label: 'Western Railway' },
    { value: 'Central Railway', label: 'Central Railway' },
    { value: 'North Eastern Railway', label: 'North Eastern Railway' },
    { value: 'North Central Railway', label: 'North Central Railway' },
    { value: 'South Central Railway', label: 'South Central Railway' },
    { value: 'South Eastern Railway', label: 'South Eastern Railway' },
    { value: 'North Western Railway', label: 'North Western Railway' },
    { value: 'South East Central Railway', label: 'South East Central Railway' },
    { value: 'East Central Railway', label: 'East Central Railway' },
    { value: 'East Coast Railway', label: 'East Coast Railway' },
    { value: 'South Western Railway', label: 'South Western Railway' },
    { value: 'West Central Railway', label: 'West Central Railway' },
    { value: 'North East Frontier Railway', label: 'North East Frontier Railway' },
    { value: 'Metro Railway Kolkata', label: 'Metro Railway Kolkata' }
]

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'under_maintenance', label: 'Under Maintenance' },
        { value: 'retired', label: 'Retired' },
        { value: 'not_installed', label: 'Not Installed' }
    ]

    const conditionOptions = [
        { value: '', label: 'All Conditions' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'critical', label: 'Critical' }
    ]// Types for API response

// Metadata structure stored in the database as JSON
interface AssetMetadata {
    model?: string
    description?: string
    manufacturer?: string
    serial_number?: string
    last_inspection?: string
    next_maintenance?: string
    [key: string]: any // Allow additional metadata fields
}

// Vendor information from vendors table
interface Vendor {
    id: string
    name: string
    contact_email?: string
    contact_phone?: string
    address?: string
    warranty_terms?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

// Asset structure from database
interface Asset {
    asset_id: string
    type: string
    location: string
    region?: string
    health_score?: number
    status: string
    condition: string
    install_date?: string
    vendor_id?: string
    created_at: string
    updated_at: string
    // qr_code?: string // Removed - column deleted from database
    // Metadata JSON field from database
    metadata?: AssetMetadata
    // Legacy direct fields (for backward compatibility)
    description?: string
    serial_number?: string
    model?: string
    manufacturer?: string
    maintenance_schedule?: string
    last_maintenance?: string
    next_maintenance?: string
    purchase_cost?: number
    depreciation_rate?: number
    warranty_expiry?: string
    technical_specs?: string
}

interface AssetListResponse {
    assets: Asset[]
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

interface AddAssetFormData {
    type: string
    location: string
    region: string
    description: string
    serial_number: string
    model: string
    manufacturer: string
    vendor_id: string
    install_date: string
    purchase_cost: string
    warranty_expiry: string
    maintenance_schedule: string
    technical_specs: string
    status: string
}

// Add Asset Modal Component
function AddAssetModal({ isOpen, onClose, onAssetAdded }: {
    isOpen: boolean
    onClose: () => void
    onAssetAdded: (asset: Asset) => void
}) {
    const [formData, setFormData] = useState<AddAssetFormData>({
        type: '',
        location: '',
        region: '',
        description: '',
        serial_number: '',
        model: '',
        manufacturer: '',
        vendor_id: '',
        install_date: '',
        purchase_cost: '',
        warranty_expiry: '',
        maintenance_schedule: 'monthly',
        technical_specs: '',
        status: 'active'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const maintenanceSchedules = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'semi-annually', label: 'Semi-Annually' },
        { value: 'annually', label: 'Annually' }
    ]

    const handleInputChange = (field: keyof AddAssetFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Basic validation
        if (!formData.type || !formData.location || !formData.serial_number) {
            setError('Please fill in all required fields (Type, Location, Serial Number)')
            setIsSubmitting(false)
            return
        }

        try {
            const token = localStorage.getItem('jwt_token')
            if (!token) {
                throw new Error('No authentication token found. Please log in again.')
            }
            
            const payload = {
                type: formData.type,
                location: formData.location,
                region: formData.region || null,
                description: formData.description || null,
                serial_number: formData.serial_number,
                model: formData.model || null,
                manufacturer: formData.manufacturer || null,
                vendor_id: formData.vendor_id || null,
                status: formData.status,
                install_date: formData.install_date || null,
                purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : null,
                warranty_expiry: formData.warranty_expiry || null,
                maintenance_schedule: formData.maintenance_schedule,
                technical_specs: formData.technical_specs || null
            }

            const response = await apiCall(API_ENDPOINTS.ASSETS.BASE, {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.')
                }
                if (response.status === 422) {
                    const errorData = await response.json()
                    throw new Error(errorData.detail || 'Invalid data provided')
                }
                throw new Error(`Failed to create asset. Status: ${response.status}`)
            }

            const newAsset: Asset = await response.json()
            
            onAssetAdded(newAsset)
            onClose()
            
            // Reset form
            setFormData({
                type: '',
                location: '',
                region: '',
                description: '',
                serial_number: '',
                model: '',
                manufacturer: '',
                vendor_id: '',
                install_date: '',
                purchase_cost: '',
                warranty_expiry: '',
                maintenance_schedule: 'monthly',
                technical_specs: '',
                status: 'active'
            })

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create asset')
            console.error('Error creating asset:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Add New Asset</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Asset Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Asset Type</option>
                                {assetTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Location *</label>
                            <Input
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="e.g., Platform 1, Section A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Region</label>
                            <select
                                value={formData.region}
                                onChange={(e) => handleInputChange('region', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Region</option>
                                {regionOptions.filter(opt => opt.value !== '').map(region => (
                                    <option key={region.value} value={region.value}>{region.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Serial Number *</label>
                            <Input
                                value={formData.serial_number}
                                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                placeholder="Unique serial number"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Model</label>
                            <Input
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                placeholder="Model number/name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Manufacturer</label>
                            <Input
                                value={formData.manufacturer}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Manufacturer name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Vendor ID</label>
                            <Input
                                value={formData.vendor_id}
                                onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                                placeholder="Vendor identifier"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Install Date</label>
                            <Input
                                type="date"
                                value={formData.install_date}
                                onChange={(e) => handleInputChange('install_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Purchase Cost</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.purchase_cost}
                                onChange={(e) => handleInputChange('purchase_cost', e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Warranty Expiry</label>
                            <Input
                                type="date"
                                value={formData.warranty_expiry}
                                onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Maintenance Schedule</label>
                            <select
                                value={formData.maintenance_schedule}
                                onChange={(e) => handleInputChange('maintenance_schedule', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {maintenanceSchedules.map(schedule => (
                                    <option key={schedule.value} value={schedule.value}>
                                        {schedule.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {statusOptions.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of the asset"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Technical Specifications</label>
                        <textarea
                            value={formData.technical_specs}
                            onChange={(e) => handleInputChange('technical_specs', e.target.value)}
                            placeholder="Technical specifications, dimensions, capacity, etc."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Create Asset
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/**
 * Asset Detail Modal Component
 * 
 * DATA STRUCTURE OVERVIEW:
 * ========================
 * 
 * 1. ASSET DATA (from database 'assets' table):
 *    - asset_id: Unique identifier (UUID)
 *    - type: Rail component type (Elastic Rail Clip, Rail Pad, etc.)
 *    - location: Physical location of the asset
 *    - vendor_id: Foreign key to vendors table (UUID)
 *    - status: active, under_maintenance, retired, not_installed
 *    - condition: excellent, good, ok, critical
 *    - health_score: Numeric score (0-100)
 *    - install_date: Installation date
 *    - metadata: JSON object containing:
 *      {
 *        "model": "Workshop-Pro",
 *        "description": "Workshop rail pad for maintenance operations",
 *        "manufacturer": "PadTech", 
 *        "serial_number": "RP-008",
 *        "last_inspection": "2024-08-15",
 *        "next_maintenance": "2024-11-15"
 *        // ... other custom fields
 *      }
 * 
 * 2. VENDOR DATA (from database 'vendors' table, fetched separately):
 *    - id: Primary key (UUID) - matches asset.vendor_id
 *    - name: Vendor company name
 *    - contact_email: Vendor email
 *    - contact_phone: Vendor phone
 *    - address: Vendor address
 *    - warranty_terms: Warranty information
 *    - is_active: Boolean status
 * 
 * 3. API ENDPOINTS USED:
 *    - GET /api/assets - Returns asset data with metadata JSON
 *    - GET /api/vendors/{vendor_id} - Returns vendor details
 */
function AssetDetailModal({ asset, isOpen, onClose }: {
    asset: Asset | null
    isOpen: boolean
    onClose: () => void
}) {
    const { user } = useAuth()
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [vendorLoading, setVendorLoading] = useState(false)
    const [vendorError, setVendorError] = useState<string | null>(null)

    // Fetch vendor details when modal opens
    useEffect(() => {
        const fetchVendorDetails = async () => {
            if (!asset?.vendor_id) {
                setVendor(null)
                setVendorError(null)
                return
            }

            setVendorLoading(true)
            setVendorError(null)
            
            try {
                const response = await apiCall(API_ENDPOINTS.VENDORS.BY_ID(asset.vendor_id))
                
                if (response.ok) {
                    const vendorData = await response.json()
                    setVendor(vendorData)
                } else {
                    const errorText = await response.text()
                    console.error('Failed to fetch vendor details:', response.status, errorText)
                    setVendorError(`Failed to load vendor details (${response.status})`)
                    setVendor(null)
                }
            } catch (error) {
                console.error('Error fetching vendor details:', error)
                setVendorError('Network error while loading vendor details')
                setVendor(null)
            } finally {
                setVendorLoading(false)
            }
        }

        if (isOpen && asset) {
            fetchVendorDetails()
        } else {
            // Reset states when modal is closed
            setVendor(null)
            setVendorError(null)
            setVendorLoading(false)
        }
    }, [asset, isOpen])

    // Helper function to safely get metadata or fallback values
    const getMetadataField = (key: string, fallbackProperty?: keyof Asset): string => {
        // First try to get from metadata object directly
        const metadataValue = asset?.metadata?.[key]
        if (metadataValue !== undefined && metadataValue !== null) {
            return String(metadataValue)
        }
        
        // Check if it's in technical_specs nested object
        const technicalSpecs = asset?.metadata?.technical_specs
        if (technicalSpecs && typeof technicalSpecs === 'object') {
            const techValue = (technicalSpecs as any)[key]
            if (techValue !== undefined && techValue !== null) {
                return String(techValue)
            }
        }
        
        // Then try fallback property on asset object (for backward compatibility)
        if (fallbackProperty && asset?.[fallbackProperty]) {
            return String(asset[fallbackProperty])
        }
        
        return 'N/A'
    }

    if (!isOpen || !asset) return null

    const getHealthStatus = (healthScore?: number): string => {
        if (!healthScore) return 'Unknown'
        if (healthScore >= 90) return 'Excellent'
        if (healthScore >= 75) return 'Good'
        if (healthScore >= 50) return 'Fair'
        return 'Critical'
    }

    const getHealthColor = (score?: number) => {
        if (!score) return 'text-gray-500 bg-gray-100'
        if (score >= 90) return 'text-emerald-600 bg-emerald-100'
        if (score >= 75) return 'text-slate-600 bg-slate-100'
        if (score >= 50) return 'text-amber-600 bg-amber-100'
        return 'text-rose-600 bg-rose-100'
    }

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount?: number): string => {
        if (!amount) return 'N/A'
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    function getStatusColor(status: string) {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'under_maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'retired':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'not_installed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Asset Details</h2>
                        <p className="text-gray-600 font-mono text-sm">ID: {asset.asset_id}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Location</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <p className="font-semibold">{asset.location}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Region</span>
                                    <p className="font-semibold">{asset.region || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                    <div className="mt-1">
                                        <Badge className={`${getStatusColor(asset.status)} inline-flex w-fit transition-colors`}>
                                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Install Date</span>
                                    <p className="font-semibold">{formatDate(asset.install_date)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hide Health & Performance section for inspectors as it's system monitoring */}
                        {user?.role !== 'field_inspector' && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Health & Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Health Score</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-2xl font-bold">{asset.health_score || 'N/A'}</div>
                                            <Badge className={`${getHealthColor(asset.health_score)} text-xs`}>
                                                {getHealthStatus(asset.health_score)}
                                            </Badge>
                                        </div>
                                        {asset.health_score && (
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        asset.health_score >= 90 ? 'bg-emerald-500' :
                                                        asset.health_score >= 70 ? 'bg-slate-500' :
                                                        asset.health_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${asset.health_score}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Last Updated</span>
                                        <p className="font-semibold">{formatDate(asset.updated_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Asset Identification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Asset ID</span>
                                    <p className="font-mono text-sm">{asset.asset_id}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Type</span>
                                    <p className="font-semibold">{asset.type}</p>
                                </div>
                                {/* QR Code display removed - column deleted from database */}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Timeline & Maintenance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Last Inspection</span>
                                        <p className="font-semibold">
                                            {getMetadataField('last_inspection') !== 'N/A' ? formatDate(getMetadataField('last_inspection')) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Next Maintenance</span>
                                        <p className="font-semibold">
                                            {getMetadataField('next_maintenance') !== 'N/A' ? formatDate(getMetadataField('next_maintenance')) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Created Date</span>
                                    <p className="font-semibold">{formatDate(asset.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Maintenance Schedule</span>
                                    <p className="font-semibold capitalize">{asset.maintenance_schedule || 'N/A'}</p>
                                </div>
                                {asset.warranty_expiry && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Warranty Expiry</span>
                                        <p className="font-semibold">{formatDate(asset.warranty_expiry)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Vendor & Financial Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Vendor Information Section */}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Vendor Details</span>
                                    {vendorLoading ? (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                            <span className="text-sm text-gray-500">Loading vendor information...</span>
                                        </div>
                                    ) : vendorError ? (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-sm text-red-700">{vendorError}</span>
                                            </div>
                                            <p className="text-xs text-red-600 mt-1">Vendor ID: {asset.vendor_id}</p>
                                        </div>
                                    ) : vendor ? (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-green-900">{vendor.name}</p>
                                                <div className="text-sm text-green-700 space-y-1">
                                                    <p><span className="font-medium">ID:</span> <code className="bg-green-100 px-1 rounded text-xs">{vendor.id}</code></p>
                                                    {vendor.contact_email && (
                                                        <p><span className="font-medium">Email:</span> {vendor.contact_email}</p>
                                                    )}
                                                    {vendor.contact_phone && (
                                                        <p><span className="font-medium">Phone:</span> {vendor.contact_phone}</p>
                                                    )}
                                                    {vendor.address && (
                                                        <p><span className="font-medium">Address:</span> {vendor.address}</p>
                                                    )}
                                                    <div><span className="font-medium">Status:</span> 
                                                        <Badge className={vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                            {vendor.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : asset.vendor_id ? (
                                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                            <p className="text-sm text-gray-600">No vendor details available</p>
                                            <p className="text-xs text-gray-500 mt-1 font-mono">Vendor ID: {asset.vendor_id}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                            <p className="text-sm text-gray-500">No vendor assigned to this asset</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Financial Information */}
                                {asset.purchase_cost && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Purchase Cost</span>
                                        <p className="font-semibold text-lg text-green-600">{formatCurrency(asset.purchase_cost)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Asset Specifications and Details */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Asset Specifications
                                </CardTitle>
                                <p className="text-xs text-gray-500 mt-1">Detailed asset information and specifications</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* Core Asset Specifications */}
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Model</span>
                                        <p className="font-semibold">{getMetadataField('model', 'model')}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Serial Number</span>
                                        <p className="font-mono text-sm">{getMetadataField('serial_number', 'serial_number')}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Manufacturer</span>
                                        <p className="font-semibold">{getMetadataField('manufacturer', 'manufacturer')}</p>
                                    </div>
                                </div>

                                {/* Technical Specifications Grid */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Technical Specifications</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Material</span>
                                            <p className="mt-1 font-semibold text-gray-900">{getMetadataField('material')}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Weight</span>
                                            <p className="mt-1 font-semibold text-gray-900">{getMetadataField('weight_kg')} kg</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dimensions</span>
                                            <p className="mt-1 font-semibold text-gray-900">{getMetadataField('dimensions')}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tensile Strength</span>
                                            <p className="mt-1 font-semibold text-gray-900">{getMetadataField('tensile_strength')}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Temperature Range</span>
                                            <p className="mt-1 font-semibold text-gray-900">{getMetadataField('temperature_range')}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Description from Metadata */}
                                {getMetadataField('description', 'description') !== 'N/A' && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mb-4">
                                        <span className="text-sm font-medium text-gray-700">Description</span>
                                        <p className="mt-2 text-gray-800">{getMetadataField('description', 'description')}</p>
                                    </div>
                                )}
                                
                                {/* Raw Metadata Display for Development */}
                                {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                                    <details className="mt-4">
                                        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                                            View Raw Metadata (Developer Info)
                                        </summary>
                                        <pre className="mt-2 text-xs text-gray-600 overflow-x-auto bg-white p-3 rounded border">
                                            {JSON.stringify(asset.metadata, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Technical Specifications - only if available and not in metadata */}
                        {asset.technical_specs && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Technical Specifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-800 whitespace-pre-line">{asset.technical_specs}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 mt-6 border-t">
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Asset
                            </Button>
                            {/* Generate QR Code button removed - qr_code column deleted from database */}
                        </div>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AssetList() {
    const { user } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0,
        has_next: false,
        has_prev: false
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState({
        type: '',
        location: '',
        region: '',
        status: '',
        condition: ''
    })
    const [showAddAssetModal, setShowAddAssetModal] = useState(false)
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
    const [showAssetDetail, setShowAssetDetail] = useState(false)
    const [showBulkImportModal, setShowBulkImportModal] = useState(false)
    const [metrics, setMetrics] = useState<{
        totalAssets: number;
        installedAssets: number;
        maintenanceQueue: number;
        criticalAssets: number;
        assetDistribution: {
            excellent: number;
            good: number;
            ok: number;
            critical: number;
        };
        statusDistribution: {
            active: number;
            under_maintenance: number;
            retired: number;
            not_installed: number;
        };
        lastUpdated: string;
    } | null>(null)

    // Check for URL parameter to auto-open add asset modal
    useEffect(() => {
        const addAssetParam = searchParams.get('addAsset')
        if (addAssetParam === 'true') {
            setShowAddAssetModal(true)
            // Remove the parameter from URL to keep it clean
            searchParams.delete('addAsset')
            setSearchParams(searchParams, { replace: true })
        }
    }, [searchParams, setSearchParams])

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('jwt_token')
            if (!token) {
                console.warn('No authentication token found')
                return
            }

            const response = await apiCall(API_ENDPOINTS.ASSETS.METRICS)

            if (!response.ok) {
                throw new Error(`Failed to fetch metrics: ${response.status}`)
            }

            const metricsData = await response.json()
            setMetrics(metricsData)
        } catch (error) {
            console.error('Error fetching metrics:', error)
        }
    }

    

    const fetchAssets = async (page: number = 1, searchQuery: string = '', assetFilters: any = {}) => {
        setLoading(true)
        setError(null)
        
        try {
            const token = localStorage.getItem('jwt_token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            })

            if (searchQuery) params.append('search', searchQuery)
            if (assetFilters.type) params.append('asset_type', assetFilters.type)
            if (assetFilters.location) params.append('location', assetFilters.location)
            if (assetFilters.region) params.append('region', assetFilters.region)
            if (assetFilters.status) params.append('status', assetFilters.status)
            if (assetFilters.condition) params.append('condition', assetFilters.condition)
            
            const response = await apiCall(`${API_ENDPOINTS.ASSETS.BASE}?${params}`)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.')
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: AssetListResponse = await response.json()
            setAssets(data.assets || [])
            setPagination({
                total: data.total ?? 0,
                page: data.page ?? 1,
                limit: data.limit ?? 20,
                total_pages: data.total_pages ?? 0,
                has_next: data.has_next ?? false,
                has_prev: data.has_prev ?? false
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch assets')
            console.error('Error fetching assets:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
        fetchMetrics()
    }, [])

    // Refetch assets when filters change
    useEffect(() => {
        fetchAssets(1, searchTerm, filters)
    }, [filters])

    // Generate comprehensive PDF report
    const generateReport = async () => {
        try {
            const token = localStorage.getItem('jwt_token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            // Show loading state
            const loadingToast = document.createElement('div')
            loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50'
            loadingToast.textContent = 'Generating report...'
            document.body.appendChild(loadingToast)

            const response = await apiCall(`${API_ENDPOINTS.ASSETS.BASE}/generate-report`)

            if (!response.ok) {
                throw new Error(`Failed to generate report: ${response.status}`)
            }

            // Get the PDF blob
            const blob = await response.blob()
            
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `RailFit_Report_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            
            // Cleanup
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            document.body.removeChild(loadingToast)

            // Show success message
            const successToast = document.createElement('div')
            successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
            successToast.textContent = 'Report downloaded successfully!'
            document.body.appendChild(successToast)
            setTimeout(() => document.body.removeChild(successToast), 3000)
        } catch (error) {
            console.error('Error generating report:', error)
            const errorToast = document.createElement('div')
            errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50'
            errorToast.textContent = 'Failed to generate report'
            document.body.appendChild(errorToast)
            setTimeout(() => document.body.removeChild(errorToast), 3000)
        }
    }



    // Ensure assets is always an array to prevent filter errors
    const safeAssets = assets || []

    // Helper function to get health status - must be defined before filteredAssets
    const getHealthStatus = (healthScore?: number): string => {
        if (!healthScore) return 'Unknown'
        if (healthScore >= 90) return 'Excellent'
        if (healthScore >= 75) return 'Good'
        if (healthScore >= 50) return 'Fair'
        return 'Critical'
    }

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when searching
        fetchAssets(1, searchTerm, filters)
    }

    const handlePageChange = (newPage: number) => {
        fetchAssets(newPage, searchTerm, filters)
    }

    const filteredAssets = safeAssets.filter(asset => {
        // Search term filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            const matchesSearch = (
                asset.asset_id.toLowerCase().includes(search) ||
                asset.type.toLowerCase().includes(search) ||
                asset.location.toLowerCase().includes(search)
            )
            if (!matchesSearch) return false
        }
        
        // Condition filter based on calculated health status
        if (filters.condition) {
            const calculatedCondition = getHealthStatus(asset.health_score).toLowerCase()
            if (calculatedCondition !== filters.condition.toLowerCase()) {
                return false
            }
        }
        
        return true
    })

    const toggleSelectAsset = (assetId: string) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        )
    }

    const toggleSelectAll = () => {
        setSelectedAssets(prev =>
            prev.length === filteredAssets.length
                ? []
                : filteredAssets.map(asset => asset.asset_id)
        )
    }

    const handleAddAsset = async (newAsset: Asset) => {
        // Add the new asset to the beginning of the list
        setAssets(prev => [newAsset, ...prev])
        setPagination(prev => ({ ...prev, total: prev.total + 1 }))
        
        // Optionally refresh the entire list to ensure data consistency
        // This is especially useful if other users might be adding assets simultaneously
        try {
            await fetchAssets(1, searchTerm, filters)
        } catch (error) {
            console.error('Error refreshing asset list:', error)
            // The UI will still show the new asset even if refresh fails
        }
    }

    const handleViewAsset = (asset: Asset) => {
        setSelectedAsset(asset)
        setShowAssetDetail(true)
    }

    const getHealthColor = (_score?: number) => {
        return 'text-black bg-white border-gray-300 hover:bg-gray-100'
    }

    const getStatusColor = (_status?: string) => {
        return 'text-black bg-white border-gray-300 hover:bg-gray-100'
    }

    const getRiskLevel = (healthScore?: number): string => {
        if (!healthScore) return 'Unknown'
        if (healthScore >= 80) return 'Low'
        if (healthScore >= 60) return 'Medium'
        return 'High'
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'text-emerald-600 bg-emerald-100'
            case 'Medium': return 'text-amber-600 bg-amber-100'
            case 'High': return 'text-rose-600 bg-rose-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    const handleBulkQRDownload = async () => {
        if (selectedAssets.length === 0) {
            alert('Please select assets to download QR codes.')
            return
        }

        try {
            // Show loading state (you could add a loading state here)
            const JSZip = (await import('jszip')).default
            const QRCode = (await import('qrcode')).default
            const zip = new JSZip()
            
            // Process each selected asset
            for (const assetId of selectedAssets) {
                const asset = filteredAssets.find(a => a.asset_id === assetId)
                if (asset) {
                    try {
                        // Generate QR code for this asset with asset details JSON
                        const assetData = {
                            id: asset.asset_id,
                            type: asset.type,
                            location: asset.location,
                            status: asset.status,
                            health_score: asset.health_score || 'N/A'
                        }
                        
                        // Create QR code with asset data
                        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(assetData), {
                            width: 300,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })
                        
                        // Convert data URL to blob
                        const response = await fetch(qrDataUrl)
                        const blob = await response.blob()
                        
                        // Add to ZIP with descriptive filename
                        const fileName = `QR_${asset.asset_id.slice(0, 8)}_${asset.type.replace(/\s+/g, '_')}.png`
                        zip.file(fileName, blob)
                        
                    } catch (assetError) {
                        console.error(`Error generating QR for asset ${asset.asset_id}:`, assetError)
                        // Continue with other assets
                    }
                }
            }
            
            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            })
            
            // Create download link
            const url = URL.createObjectURL(zipBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `QR_Codes_${selectedAssets.length}_assets_${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            // Clear selection after download
            setSelectedAssets([])
            
        } catch (error) {
            console.error('Error generating bulk QR codes:', error)
            alert('Failed to generate QR codes. Please try again.')
        }
    }

    if (error) {
        return (
            <div className="p-6 space-y-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={() => fetchAssets()} className="mx-auto">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Calculate asset distribution categories
    const assetDistribution = {
        excellent: metrics?.assetDistribution?.excellent ?? 0,
        good: metrics?.assetDistribution?.good ?? 0,
        ok: metrics?.assetDistribution?.ok ?? 0,
        critical: metrics?.assetDistribution?.critical ?? 0
      };

      console.log('Asset Distribution:', assetDistribution); // Temporary usage to avoid unused variable error

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Asset Management</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive railway infrastructure asset tracking and management</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setShowAddAssetModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Asset
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => setShowBulkImportModal(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={generateReport}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Reports
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Real-time Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
                        <div className="text-2xl">📦</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{((metrics?.totalAssets ?? pagination.total) || 0).toLocaleString()}</div>
                        <p className="text-xs text-emerald-600 mt-1">Real-time count</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-400">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Assets</CardTitle>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">
                            {(metrics?.totalAssets ?? pagination.total) - (metrics?.maintenanceQueue ?? safeAssets.filter(a => a.status === 'under_maintenance').length)}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Operational status</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-400">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Queue</CardTitle>
                        <Clock className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            {metrics?.maintenanceQueue ?? safeAssets.filter(a => a.status === 'under_maintenance').length}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">Pending maintenance</p>
                    </CardContent>
                </Card>

                {/* Hide Critical Alerts for inspectors */}
                {user?.role !== 'field_inspector' && (
                    <Card className="border-l-4 border-l-rose-400">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-rose-600">
                                {metrics?.criticalAssets ?? safeAssets.filter(a => a.condition === 'critical').length}
                            </div>
                            <p className="text-xs text-rose-600 mt-1">Immediate attention</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Search and Filter Section */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Search assets..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleSearch} variant="outline">
                                    Search
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Filter Controls */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col md:flex-row gap-2 flex-1">
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {assetTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <select
                                    value={filters.region || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {regionOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <select
                                    value={filters.condition || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {conditionOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Bulk Actions */}
                            {selectedAssets.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedAssets.length} selected
                                    </span>
                                    <Button
                                        onClick={() => handleBulkQRDownload()}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download QR Codes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading assets...</span>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto min-w-full">
                                <colgroup>
                                    <col style={{ width: '3%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '15%' }} />
                                    <col style={{ width: '18%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '13%' }} />
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '18%' }} />
                                </colgroup>
                                <thead className="bg-gray-100">
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-4 px-2 font-bold text-base">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Asset ID</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Type</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Region</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Condition</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Status</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Install Date</th>
                                        <th className="text-left py-4 px-2 font-bold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.asset_id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-2 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.includes(asset.asset_id)}
                                                    onChange={() => toggleSelectAsset(asset.asset_id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-2 font-mono text-xs align-middle truncate" title={asset.asset_id}>{asset.asset_id.slice(0, 8)}</td>
                                            <td className="py-3 px-2 text-sm align-middle truncate" title={asset.type}>{asset.type}</td>
                                            <td className="py-3 px-2 text-sm align-middle truncate" title={asset.region || 'N/A'}>{asset.region || 'N/A'}</td>
                                            <td className="py-3 px-2 align-middle">
                                                <Badge className={`${getHealthColor(asset.health_score)} text-xs inline-flex w-fit transition-colors`}>
                                                    {getHealthStatus(asset.health_score)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 align-middle">
                                                <Badge className={`${getStatusColor(asset.status)} text-xs inline-flex w-fit transition-colors`}>
                                                    {asset.status ? asset.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-xs align-middle whitespace-nowrap">{formatDate(asset.install_date)}</td>
                                            <td className="py-3 px-2 align-middle">
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleViewAsset(asset)}
                                                        className="text-xs px-2 py-1"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                    <QRCodeDisplay 
                                                        assetId={asset.asset_id}
                                                        assetType={asset.type}
                                                        showControls={true}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssets.map((asset) => (
                                <Card key={asset.asset_id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{asset.type}</h3>
                                                <p className="text-sm text-muted-foreground font-mono">{asset.asset_id.slice(0, 8)}</p>
                                            </div>
                                            <Badge className={`${getHealthColor(asset.health_score)} text-xs`}>
                                                {getHealthStatus(asset.health_score)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="truncate">{asset.location}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>Health: {asset.health_score || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>Installed: {formatDate(asset.install_date)}</span>
                                            </div>
                                            <Badge className={`${getRiskColor(getRiskLevel(asset.health_score))} text-xs w-fit`}>
                                                {getRiskLevel(asset.health_score)} Risk
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleViewAsset(asset)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <QRCodeDisplay 
                                                assetId={asset.asset_id}
                                                assetType={asset.type}
                                                showControls={true}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t mt-6">
                        <div className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total || 0)} of {pagination.total || 0} assets
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={!pagination.has_prev || loading}
                                onClick={() => handlePageChange(pagination.page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, pagination.total_pages || 0) }, (_, i) => {
                                const pageNum = Math.max(1, pagination.page - 2) + i
                                if (pageNum > (pagination.total_pages || 0)) return null
                                
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === pagination.page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading}
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={!pagination.has_next || loading}
                                onClick={() => handlePageChange(pagination.page + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Asset Modal */}
            <AddAssetModal
                isOpen={showAddAssetModal}
                onClose={() => setShowAddAssetModal(false)}
                onAssetAdded={handleAddAsset}
            />

            {/* Bulk Import Modal */}
            <BulkImportModal
                isOpen={showBulkImportModal}
                onClose={() => setShowBulkImportModal(false)}
                onSuccess={() => {
                    // Refresh assets list and summary after successful import
                    fetchAssets()
                    fetchMetrics()
                }}
            />

            {/* Asset Detail Modal */}
            <AssetDetailModal
                asset={selectedAsset}
                isOpen={showAssetDetail}
                onClose={() => {
                    setShowAssetDetail(false)
                    setSelectedAsset(null)
                }}
            />
        </div>
    )
}