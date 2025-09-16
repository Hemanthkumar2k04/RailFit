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
                        <div className="space-y-6 mt-4">
                            {/* Single Stacked Progress Bar */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-center">Asset Health Distribution</div>
                                <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
                                    <div className="h-full bg-slate-600 flex-none" style={{ width: '65.2%' }} title="Excellent: 1,851 assets"></div>
                                    <div className="h-full bg-slate-500 flex-none" style={{ width: '28.3%' }} title="Good: 803 assets"></div>
                                    <div className="h-full bg-slate-400 flex-none" style={{ width: '6.2%' }} title="Fair: 175 assets"></div>
                                    <div className="h-full bg-slate-700 flex-none" style={{ width: '0.3%' }} title="Critical: 18 assets"></div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium">Excellent (90-100%)</div>
                                        <div className="text-xs text-muted-foreground">1,851 assets</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium">Good (75-89%)</div>
                                        <div className="text-xs text-muted-foreground">803 assets</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium">Fair (60-74%)</div>
                                        <div className="text-xs text-muted-foreground">175 assets</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium">Critical (&lt;60%)</div>
                                        <div className="text-xs text-muted-foreground">18 assets</div>
                                    </div>
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

        </div>
    )
}