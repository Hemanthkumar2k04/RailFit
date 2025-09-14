import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, AlertTriangleIcon } from "lucide-react"

export default function Dashboard() {
    return (
        <div className="p-6 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">RailFIT Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Railway Asset Management & Predictive Analytics
                </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Railway Assets */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Railway Assets
                        </CardTitle>
                        <div className="text-2xl">🚆</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2,847</div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                            <span>+127 this quarter</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Assets */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Operational Assets
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2,654</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="text-xs">
                                93.2% Operational
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Required */}
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Maintenance Queue
                        </CardTitle>
                        <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">175</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                                6.1% of fleet
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Critical Alerts
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">18</div>
                        <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                                Immediate Action Required
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Railway Analytics & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Railway Asset Health Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            🚄 Rolling Stock Health Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Excellent (90-100%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[65%] h-full bg-slate-600"></div>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">1,851 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Good (75-89%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[28%] h-full bg-slate-500"></div>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">803 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Fair (60-74%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[6%] h-full bg-slate-400"></div>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">175 assets</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Critical (&lt;60%)</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="w-[1%] h-full bg-slate-700"></div>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">18 assets</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI-Powered Predictive Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            🤖 SAT Algorithm Predictions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="p-3 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Next 30 Days RUL Alerts</span>
                                    <Badge variant="secondary" className="text-xs">23 Predictions</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Locomotive engines requiring attention</p>
                            </div>
                            <div className="p-3 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Track Section Analysis</span>
                                    <Badge variant="secondary" className="text-xs">7 Sections</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Preventive maintenance recommended</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Efficiency Optimization</span>
                                    <Badge className="bg-primary text-white">+12.3%</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Projected improvement with AI insights</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Railway Infrastructure Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            🛤️ Infrastructure Asset Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                                    <span className="text-sm">Rolling Stock</span>
                                </div>
                                <span className="font-semibold">1,247 units</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                    <span className="text-sm">Track Infrastructure</span>
                                </div>
                                <span className="font-semibold">856 sections</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                                    <span className="text-sm">Signaling Systems</span>
                                </div>
                                <span className="font-semibold">423 units</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                                    <span className="text-sm">Power & Electrical</span>
                                </div>
                                <span className="font-semibold">321 systems</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Monitoring Dashboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            ⚡ Live System Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-lg border">
                                    <div className="text-2xl font-bold">97.8%</div>
                                    <div className="text-xs text-muted-foreground">System Uptime</div>
                                </div>
                                <div className="text-center p-3 rounded-lg border">
                                    <div className="text-2xl font-bold">2.1s</div>
                                    <div className="text-xs text-muted-foreground">Avg Response Time</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Northern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                        <span className="text-muted-foreground">Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Southern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                        <span className="text-muted-foreground">Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Eastern Railway Zone</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                                        <span className="text-muted-foreground">Maintenance</span>
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
                            <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
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
                            <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
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
                            <div className="flex items-start space-x-3 p-3 rounded-md border">
                                <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Locomotive WAP-7 #30427 - Preventive maintenance completed
                                    </p>
                                    <p className="text-xs text-muted-foreground">Northern Railway, New Delhi - 5 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border">
                                <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Track Section NK-127: AI detected wear pattern anomaly
                                    </p>
                                    <p className="text-xs text-muted-foreground">Central Railway, Mumbai - 12 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border border-primary/20 bg-primary/5">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        QR Code scan completed for Signal Box SB-4521
                                    </p>
                                    <p className="text-xs text-muted-foreground">Southern Railway, Chennai - 28 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md border">
                                <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0 animate-pulse" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        Critical alert: Overhead line voltage fluctuation detected
                                    </p>
                                    <p className="text-xs text-muted-foreground">Eastern Railway, Kolkata - 45 minutes ago</p>
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
                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="text-xl">📱</div>
                                <div>
                                    <div className="text-sm font-medium">QR Code Scanner</div>
                                    <div className="text-xs text-muted-foreground">Scan asset QR codes</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="text-xl">📋</div>
                                <div>
                                    <div className="text-sm font-medium">New Inspection</div>
                                    <div className="text-xs text-muted-foreground">Start asset inspection</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="text-xl">🔧</div>
                                <div>
                                    <div className="text-sm font-medium">Maintenance Log</div>
                                    <div className="text-xs text-muted-foreground">Record maintenance</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="text-xl">🚨</div>
                                <div>
                                    <div className="text-sm font-medium">Report Issue</div>
                                    <div className="text-xs text-muted-foreground">Emergency reporting</div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}