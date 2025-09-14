import { useState } from 'react'
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
    Clock
} from 'lucide-react'

// Mock data for assets
const mockAssets = [
    {
        id: 'RF-2024-001234',
        type: 'Elastic Rail Clips',
        location: 'Mumbai-Delhi Route, KM 156.3',
        zone: 'Central Railway',
        healthScore: 92,
        status: 'Excellent',
        lastInspection: '2024-09-10',
        nextMaintenance: '2024-12-15',
        vendor: 'Kalindee Rail Nirman',
        installDate: '2024-01-15',
        rul: '8.2 years',
        riskLevel: 'Low'
    },
    {
        id: 'RF-2024-001235',
        type: 'Rail Pads',
        location: 'Chennai-Bangalore Route, KM 89.7',
        zone: 'Southern Railway',
        healthScore: 78,
        status: 'Good',
        lastInspection: '2024-09-08',
        nextMaintenance: '2024-11-20',
        vendor: 'Texmaco Rail & Engineering',
        installDate: '2023-11-20',
        rul: '5.1 years',
        riskLevel: 'Medium'
    },
    {
        id: 'RF-2024-001236',
        type: 'Sleepers',
        location: 'Kolkata-Delhi Route, KM 234.1',
        zone: 'Eastern Railway',
        healthScore: 45,
        status: 'Poor',
        lastInspection: '2024-09-05',
        nextMaintenance: '2024-10-01',
        vendor: 'Railway Sleepers India',
        installDate: '2020-08-10',
        rul: '1.3 years',
        riskLevel: 'High'
    },
    {
        id: 'RF-2024-001237',
        type: 'NFC-enabled Fittings',
        location: 'Mumbai-Ahmedabad Route, KM 67.8',
        zone: 'Western Railway',
        healthScore: 88,
        status: 'Excellent',
        lastInspection: '2024-09-12',
        nextMaintenance: '2025-01-10',
        vendor: 'Smart Rail Solutions',
        installDate: '2024-03-22',
        rul: '9.5 years',
        riskLevel: 'Low'
    }
]

const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-success bg-success/10 border-success/20'
    if (score >= 70) return 'text-primary bg-primary/10 border-primary/20'
    if (score >= 50) return 'text-warning bg-warning/10 border-warning/20'
    return 'text-danger bg-danger/10 border-danger/20'
}

const getRiskColor = (risk: string) => {
    switch (risk) {
        case 'Low': return 'text-success bg-success/10'
        case 'Medium': return 'text-warning bg-warning/10'
        case 'High': return 'text-danger bg-danger/10'
        default: return 'text-rail-gray bg-rail-gray/10'
    }
}

export default function AssetList() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [filters, setFilters] = useState({
        assetType: '',
        zone: '',
        healthStatus: '',
        vendor: ''
    })

    const filteredAssets = mockAssets.filter(asset => {
        const matchesSearch = asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = !filters.assetType || asset.type === filters.assetType
        const matchesZone = !filters.zone || asset.zone === filters.zone
        const matchesHealth = !filters.healthStatus || asset.status === filters.healthStatus
        const matchesVendor = !filters.vendor || asset.vendor === filters.vendor

        return matchesSearch && matchesType && matchesZone && matchesHealth && matchesVendor
    })

    const toggleAssetSelection = (assetId: string) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        )
    }

    const selectAllAssets = () => {
        setSelectedAssets(
            selectedAssets.length === filteredAssets.length
                ? []
                : filteredAssets.map(asset => asset.id)
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Asset Management</h1>
                    <p className="text-rail-gray mt-1">Comprehensive railway infrastructure asset tracking and management</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-success hover:bg-success/90">
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
                        <CardTitle className="text-sm font-medium text-rail-gray">Total Assets</CardTitle>
                        <div className="text-2xl">📦</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">2,847</div>
                        <p className="text-xs text-success mt-1">+127 this month</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">Active Assets</CardTitle>
                        <CheckCircle className="h-5 w-5 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-success">2,654</div>
                        <p className="text-xs text-rail-gray mt-1">93.2% operational</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-warning">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">Need Maintenance</CardTitle>
                        <Clock className="h-5 w-5 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-warning">175</div>
                        <p className="text-xs text-rail-gray mt-1">Next 30 days</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-info">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">Recently Added</CardTitle>
                        <TrendingUp className="h-5 w-5 text-info" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-info">18</div>
                        <p className="text-xs text-rail-gray mt-1">Last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Global Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rail-gray h-4 w-4" />
                            <Input
                                placeholder="Search by Asset ID, Type, Location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex gap-3 items-center">
                            <select
                                value={filters.assetType}
                                onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value }))}
                                className="w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="">All Asset Types</option>
                                <option value="Elastic Rail Clips">Elastic Rail Clips</option>
                                <option value="Rail Pads">Rail Pads</option>
                                <option value="Sleepers">Sleepers</option>
                                <option value="NFC-enabled Fittings">NFC-enabled Fittings</option>
                            </select>

                            <select
                                value={filters.zone}
                                onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
                                className="w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="">All Railway Zones</option>
                                <option value="Central Railway">Central Railway</option>
                                <option value="Southern Railway">Southern Railway</option>
                                <option value="Eastern Railway">Eastern Railway</option>
                                <option value="Western Railway">Western Railway</option>
                            </select>

                            <select
                                value={filters.healthStatus}
                                onChange={(e) => setFilters(prev => ({ ...prev, healthStatus: e.target.value }))}
                                className="w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="">All Health Status</option>
                                <option value="Excellent">Excellent (90-100)</option>
                                <option value="Good">Good (70-89)</option>
                                <option value="Fair">Fair (50-69)</option>
                                <option value="Poor">Poor (0-49)</option>
                            </select>

                            {/* View Toggle */}
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedAssets.length > 0 && (
                        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-primary">
                                    {selectedAssets.length} asset(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Inspection
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Generate QR Codes
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Selected
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Asset Table/Grid View */}
            <Card>
                <CardContent className="p-0">
                    {viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-rail-light border-b">
                                    <tr>
                                        <th className="p-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                                                onChange={selectAllAssets}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Asset ID</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Type</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Location</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Health Score</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Last Inspection</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">RUL</th>
                                        <th className="p-4 text-left font-medium text-rail-gray">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssets.map((asset) => (
                                        <tr key={asset.id} className="border-b hover:bg-rail-light/50">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.includes(asset.id)}
                                                    onChange={() => toggleAssetSelection(asset.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-sm font-semibold text-primary">
                                                    {asset.id}
                                                </div>
                                                <div className="text-xs text-rail-gray">{asset.zone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{asset.type}</div>
                                                <div className="text-xs text-rail-gray">{asset.vendor}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-sm">
                                                    <MapPin className="h-3 w-3 mr-1 text-rail-gray" />
                                                    {asset.location}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getHealthColor(asset.healthScore)}>
                                                        {asset.healthScore}%
                                                    </Badge>
                                                    <span className="text-xs text-rail-gray">{asset.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">{asset.lastInspection}</td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium">{asset.rul}</div>
                                                <Badge className={getRiskColor(asset.riskLevel)} variant="outline">
                                                    {asset.riskLevel} Risk
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {filteredAssets.map((asset) => (
                                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="checkbox"
                                                checked={selectedAssets.includes(asset.id)}
                                                onChange={() => toggleAssetSelection(asset.id)}
                                                className="rounded border-gray-300"
                                            />
                                            <Badge className={getHealthColor(asset.healthScore)}>
                                                {asset.healthScore}%
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-mono text-primary">
                                            {asset.id}
                                        </CardTitle>
                                        <p className="text-sm text-rail-gray">{asset.type}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-2 text-rail-gray" />
                                                {asset.location}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-rail-gray">RUL:</span>
                                                <span className="font-medium">{asset.rul}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-rail-gray">Risk:</span>
                                                <Badge className={getRiskColor(asset.riskLevel)} variant="outline">
                                                    {asset.riskLevel}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 mt-4">
                                            <Button size="sm" variant="outline" className="flex-1">
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
                    <div className="flex items-center justify-between p-4 border-t">
                        <div className="text-sm text-rail-gray">
                            Showing {filteredAssets.length} of {mockAssets.length} assets
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="bg-primary text-white">
                                1
                            </Button>
                            <Button variant="outline" size="sm">
                                2
                            </Button>
                            <Button variant="outline" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}