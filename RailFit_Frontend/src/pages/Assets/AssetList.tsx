import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    ChevronRight
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

export default function AssetList() {
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
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Asset
                    </Button>
                    <Button variant="outline">
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
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
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
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <QrCode className="h-4 w-4" />
                                            </Button>
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
        </div>
    )
}