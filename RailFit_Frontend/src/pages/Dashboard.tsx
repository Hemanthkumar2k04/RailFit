import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, AlertTriangleIcon } from "lucide-react"

export default function Dashboard() {
    return (
        <div className="p-6 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary">RailFIT Dashboard</h1>
                <p className="text-rail-gray mt-2">
                    Railway Asset Management & Predictive Analytics
                </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Railway Assets */}
                <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">
                            Total Railway Assets
                        </CardTitle>
                        <div className="text-2xl">🚆</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">2,847</div>
                        <div className="flex items-center text-sm text-success mt-1">
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                            <span>+127 this quarter</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Assets */}
                <Card className="border-l-4 border-l-success bg-gradient-to-r from-green-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">
                            Operational Assets
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-success animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-success">2,654</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                93.2% Operational
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Required */}
                <Card className="border-l-4 border-l-warning bg-gradient-to-r from-yellow-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">
                            Maintenance Queue
                        </CardTitle>
                        <AlertTriangleIcon className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-warning">175</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                                6.1% of fleet
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                <Card className="border-l-4 border-l-danger bg-gradient-to-r from-red-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rail-gray">
                            Critical Alerts
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-danger animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-danger">18</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="destructive" className="bg-danger/10 text-danger border-danger/20">
                                Immediate Action Required
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Railway Analytics & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Railway Asset Health Distribution */}
                <Card className="border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardTitle className="flex items-center text-primary">
                            🚄 Rolling Stock Health Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Excellent (90-100%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[65%] h-full bg-success"></div>
                                    </div>
                                    <span className="text-sm text-success font-semibold">1,851 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Good (75-89%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[28%] h-full bg-primary"></div>
                                    </div>
                                    <span className="text-sm text-primary font-semibold">803 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Fair (60-74%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[6%] h-full bg-warning"></div>
                                    </div>
                                    <span className="text-sm text-warning font-semibold">175 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Critical (&lt;60%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[1%] h-full bg-danger"></div>
                                    </div>
                                    <span className="text-sm text-danger font-semibold">18 assets</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI-Powered Predictive Analytics */}
                <Card className="border-success/20">
                    <CardHeader className="bg-gradient-to-r from-success/5 to-success/10">
                        <CardTitle className="flex items-center text-success">
                            🤖 SAT Algorithm Predictions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Next 30 Days RUL Alerts</span>
                                    <Badge className="bg-success text-white">23 Predictions</Badge>
                                </div>
                                <p className="text-xs text-rail-gray mt-1">Locomotive engines requiring attention</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Track Section Analysis</span>
                                    <Badge className="bg-warning text-white">7 Sections</Badge>
                                </div>
                                <p className="text-xs text-rail-gray mt-1">Preventive maintenance recommended</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Efficiency Optimization</span>
                                    <Badge className="bg-primary text-white">+12.3%</Badge>
                                </div>
                                <p className="text-xs text-rail-gray mt-1">Projected improvement with AI insights</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Railway Infrastructure Overview */}
                <Card className="border-warning/20">
                    <CardHeader className="bg-gradient-to-r from-warning/5 to-warning/10">
                        <CardTitle className="flex items-center text-warning">
                            🛤️ Infrastructure Asset Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                                    <span className="text-sm">Rolling Stock</span>
                                </div>
                                <span className="font-semibold text-primary">1,247 units</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-success rounded-full"></div>
                                    <span className="text-sm">Track Infrastructure</span>
                                </div>
                                <span className="font-semibold text-success">856 sections</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                                    <span className="text-sm">Signaling Systems</span>
                                </div>
                                <span className="font-semibold text-warning">423 units</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-danger rounded-full"></div>
                                    <span className="text-sm">Power & Electrical</span>
                                </div>
                                <span className="font-semibold text-danger">321 systems</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Monitoring Dashboard */}
                <Card className="border-danger/20">
                    <CardHeader className="bg-gradient-to-r from-danger/5 to-danger/10">
                        <CardTitle className="flex items-center text-danger">
                            ⚡ Live System Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-success/10 rounded-lg">
                                    <div className="text-2xl font-bold text-success">97.8%</div>
                                    <div className="text-xs text-rail-gray">System Uptime</div>
                                </div>
                                <div className="text-center p-3 bg-primary/10 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">2.1s</div>
                                    <div className="text-xs text-rail-gray">Avg Response Time</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Northern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                        <span className="text-success">Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Southern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                        <span className="text-success">Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Eastern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                                        <span className="text-warning">Maintenance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Inspection Activity */}
                        <div className="flex items-start space-x-3 p-3 rounded-md border">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    New inspection completed - Asset RF-2024-001234
                                </p>
                                <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                        </div>

                        {/* Maintenance Alert */}
                        <div className="flex items-start space-x-3 p-3 rounded-md border">
                            <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    Maintenance alert triggered - Asset RF-2024-000567
                                </p>
                                <p className="text-xs text-muted-foreground">15 minutes ago</p>
                            </div>
                        </div>

                        {/* QR Generation */}
                        <div className="flex items-start space-x-3 p-3 rounded-md border">
                            <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    QR codes generated for 50 new assets
                                </p>
                                <p className="text-xs text-muted-foreground">1 hour ago</p>
                            </div>
                        </div>

                        {/* System Sync */}
                        <div className="flex items-start space-x-3 p-3 rounded-md border">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    UDM sync completed successfully
                                </p>
                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Railway Operations Summary & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Recent Railway Operations */}
                <Card className="lg:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardTitle className="flex items-center text-primary">
                            🚉 Recent Railway Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="flex items-start space-x-3 p-3 rounded-md border border-success/20 bg-success/5">
                                <div className="h-2 w-2 rounded-full bg-success mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Locomotive WAP-7 #30427 - Preventive maintenance completed
                                    </p>
                                    <p className="text-xs text-rail-gray">Northern Railway, New Delhi - 5 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border border-warning/20 bg-warning/5">
                                <div className="h-2 w-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Track Section NK-127: AI detected wear pattern anomaly
                                    </p>
                                    <p className="text-xs text-rail-gray">Central Railway, Mumbai - 12 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border border-primary/20 bg-primary/5">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        QR Code scan completed for Signal Box SB-4521
                                    </p>
                                    <p className="text-xs text-rail-gray">Southern Railway, Chennai - 28 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border border-danger/20 bg-danger/5">
                                <div className="h-2 w-2 rounded-full bg-danger mt-2 flex-shrink-0 animate-pulse" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Critical alert: Overhead line voltage fluctuation detected
                                    </p>
                                    <p className="text-xs text-rail-gray">Eastern Railway, Kolkata - 45 minutes ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card>
                    <CardHeader className="bg-gradient-to-r from-success/5 to-success/10">
                        <CardTitle className="flex items-center text-success">
                            ⚡ Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-4">
                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                                <div className="text-xl">📱</div>
                                <div>
                                    <div className="text-sm font-medium">QR Code Scanner</div>
                                    <div className="text-xs text-rail-gray">Scan asset QR codes</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-success/20 hover:bg-success/5 transition-colors">
                                <div className="text-xl">📋</div>
                                <div>
                                    <div className="text-sm font-medium">New Inspection</div>
                                    <div className="text-xs text-rail-gray">Start asset inspection</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-warning/20 hover:bg-warning/5 transition-colors">
                                <div className="text-xl">🔧</div>
                                <div>
                                    <div className="text-sm font-medium">Maintenance Log</div>
                                    <div className="text-xs text-rail-gray">Record maintenance</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-danger/20 hover:bg-danger/5 transition-colors">
                                <div className="text-xl">🚨</div>
                                <div>
                                    <div className="text-sm font-medium">Report Issue</div>
                                    <div className="text-xs text-rail-gray">Emergency reporting</div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}