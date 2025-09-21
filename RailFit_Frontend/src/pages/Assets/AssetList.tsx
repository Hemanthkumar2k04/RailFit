import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import BulkImportModal from '@/components/BulkImportModal'
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
    QrCode,
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
    User,
    Tag
} from 'lucide-react'

// Types for API response
interface Asset {
    asset_id: string
    type: string
    location: string
    health_score?: number
    status: string
    install_date?: string
    vendor_id?: string
    created_at: string
    updated_at: string
    qr_code?: string
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

    const assetTypes = [
        'Track Signal',
        'Railway Switch',
        'Bridge Component',
        'Locomotive Engine',
        'Passenger Car',
        'Freight Car',
        'Power Distribution',
        'Communication System',
        'Safety Equipment',
        'Platform Infrastructure'
    ]

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'needs_maintenance', label: 'Needs Maintenance' },
        { value: 'under_repair', label: 'Under Repair' },
        { value: 'decommissioned', label: 'Decommissioned' }
    ]

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

            const response = await fetch('http://localhost:5000/api/assets/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
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

// Asset Detail Modal Component
function AssetDetailModal({ asset, isOpen, onClose }: {
    asset: Asset | null
    isOpen: boolean
    onClose: () => void
}) {
    if (!isOpen || !asset) return null

    const getHealthStatus = (healthScore?: number): string => {
        if (!healthScore) return 'Unknown'
        if (healthScore >= 90) return 'Excellent'
        if (healthScore >= 70) return 'Good'
        if (healthScore >= 50) return 'Fair'
        return 'Critical'
    }

    const getHealthColor = (score?: number) => {
        if (!score) return 'text-gray-500 bg-gray-100'
        if (score >= 90) return 'text-emerald-600 bg-emerald-100'
        if (score >= 70) return 'text-slate-600 bg-slate-100'
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                                    <span className="text-sm font-medium text-gray-500">Type</span>
                                    <p className="font-semibold">{asset.type}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Location</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <p className="font-semibold">{asset.location}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                    <div className="mt-1">
                                        <Badge variant={asset.status === 'active' ? 'default' : 'outline'}>
                                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Asset Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Serial Number</span>
                                    <p className="font-mono text-sm">{asset.serial_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Model</span>
                                    <p className="font-semibold">{asset.model || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Manufacturer</span>
                                    <p className="font-semibold">{asset.manufacturer || 'N/A'}</p>
                                </div>
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
                                        <span className="text-sm font-medium text-gray-500">Install Date</span>
                                        <p className="font-semibold">{formatDate(asset.install_date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Created</span>
                                        <p className="font-semibold">{formatDate(asset.created_at)}</p>
                                    </div>
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
                                    Vendor & Financial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Vendor ID</span>
                                    <p className="font-mono text-sm">{asset.vendor_id || 'N/A'}</p>
                                </div>
                                {asset.purchase_cost && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Purchase Cost</span>
                                        <p className="font-semibold text-lg">{formatCurrency(asset.purchase_cost)}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">QR Code</span>
                                    <p className="font-mono text-sm">{asset.qr_code || 'Not generated'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {(asset.description || asset.technical_specs) && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {asset.description && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Description</span>
                                            <p className="mt-1 text-gray-800">{asset.description}</p>
                                        </div>
                                    )}
                                    {asset.technical_specs && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Technical Specifications</span>
                                            <p className="mt-1 text-gray-800 whitespace-pre-line">{asset.technical_specs}</p>
                                        </div>
                                    )}
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
                            <Button variant="outline">
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate QR Code
                            </Button>
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
        assetType: '',
        location: '',
        status: ''
    })
    const [showAddAssetModal, setShowAddAssetModal] = useState(false)
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
    const [showAssetDetail, setShowAssetDetail] = useState(false)
    const [showBulkImportModal, setShowBulkImportModal] = useState(false)

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

    // Utility function to check authentication and handle redirects
    const checkAuthentication = () => {
        const token = localStorage.getItem('jwt_token')
        if (!token) {
            // In a real app, you might want to redirect to login page
            console.warn('No authentication token found')
            return false
        }
        return true
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
            if (assetFilters.assetType) params.append('asset_type', assetFilters.assetType)
            if (assetFilters.location) params.append('location', assetFilters.location)
            if (assetFilters.status) params.append('status', assetFilters.status)

            const response = await fetch(`http://localhost:5000/api/assets/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

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
    }, [])

    // Ensure assets is always an array to prevent filter errors
    const safeAssets = assets || []

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when searching
        fetchAssets(1, searchTerm, filters)
    }

    const handlePageChange = (newPage: number) => {
        fetchAssets(newPage, searchTerm, filters)
    }

    const filteredAssets = safeAssets.filter(asset => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            asset.asset_id.toLowerCase().includes(search) ||
            asset.type.toLowerCase().includes(search) ||
            asset.location.toLowerCase().includes(search)
        )
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

    const getHealthStatus = (healthScore?: number): string => {
        if (!healthScore) return 'Unknown'
        if (healthScore >= 90) return 'Excellent'
        if (healthScore >= 70) return 'Good'
        if (healthScore >= 50) return 'Fair'
        return 'Critical'
    }

    const getHealthColor = (score?: number) => {
        if (!score) return 'text-gray-500 bg-gray-100 border-gray-200'
        if (score >= 90) return 'text-emerald-600 bg-emerald-100 border-emerald-200'
        if (score >= 70) return 'text-slate-600 bg-slate-100 border-slate-200'
        if (score >= 50) return 'text-amber-600 bg-amber-100 border-amber-200'
        return 'text-rose-600 bg-rose-100 border-rose-200'
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
                    <Button variant="outline">
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
                        <div className="text-3xl font-bold text-primary">{(pagination.total || 0).toLocaleString()}</div>
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
                            {safeAssets.filter(a => a.status === 'active').length}
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
                            {safeAssets.filter(a => a.status === 'needs_maintenance').length}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">Pending maintenance</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-400">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">
                            {safeAssets.filter(a => (a.health_score || 0) < 50).length}
                        </div>
                        <p className="text-xs text-rose-600 mt-1">Immediate attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Section */}
            <Card>
                <CardHeader>
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
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading assets...</span>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">Asset ID</th>
                                        <th className="text-left py-3 px-4 font-medium">Type</th>
                                        <th className="text-left py-3 px-4 font-medium">Location</th>
                                        <th className="text-left py-3 px-4 font-medium">Health Score</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Install Date</th>
                                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.asset_id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.includes(asset.asset_id)}
                                                    onChange={() => toggleSelectAsset(asset.asset_id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4 font-mono text-sm">{asset.asset_id.slice(0, 8)}</td>
                                            <td className="py-3 px-4">{asset.type}</td>
                                            <td className="py-3 px-4">{asset.location}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={`${getHealthColor(asset.health_score)} text-xs`}>
                                                    {asset.health_score || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={asset.status === 'active' ? 'default' : 'outline'} className="text-xs">
                                                    {getHealthStatus(asset.health_score)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{formatDate(asset.install_date)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
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
                    // Refresh assets list after successful import
                    fetchAssets()
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