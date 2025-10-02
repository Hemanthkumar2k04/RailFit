import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, FileText, Package, TrendingUp, Users } from 'lucide-react';

interface AnalyticsData {
  summary: {
    total_assets: number;
    total_inspections: number;
    total_alerts: number;
    total_vendors: number;
    average_health_score: number;
    unresolved_alerts: number;
    recent_inspections_7days: number;
  };
  assets: {
    by_type: Array<{ name: string; count: number }>;
    by_status: Array<{ name: string; count: number }>;
    by_condition: Array<{ name: string; count: number }>;
    by_location: Array<{ name: string; count: number }>;
  };
  inspections: {
    by_month: Array<{ month: string; count: number }>;
    total: number;
    recent_count: number;
  };
  alerts: {
    by_priority: Array<{ priority: string; count: number }>;
    by_type: Array<{ type: string; count: number }>;
    total: number;
    unresolved: number;
    resolved: number;
  };
  vendors: {
    total: number;
    assets_per_vendor: Array<{ vendor: string; count: number }>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Assets</p>
              <p className="text-3xl font-bold text-blue-600">{data.summary.total_assets}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Inspections</p>
              <p className="text-3xl font-bold text-green-600">{data.summary.total_inspections}</p>
              <p className="text-xs text-gray-400 mt-1">
                {data.summary.recent_inspections_7days} in last 7 days
              </p>
            </div>
            <FileText className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-orange-600">{data.summary.total_alerts}</p>
              <p className="text-xs text-red-500 mt-1">
                {data.summary.unresolved_alerts} unresolved
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Health Score</p>
              <p className="text-3xl font-bold text-purple-600">
                {data.summary.average_health_score.toFixed(1)}%
              </p>
            </div>
            <Activity className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assets by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.assets.by_type}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.assets.by_type.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assets by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.assets.by_status}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inspection Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Inspections Trend (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.inspections.by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Alerts by Priority</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.alerts.by_priority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location and Vendor Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 10 Locations by Asset Count</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-right">Asset Count</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.by_location.map((loc, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{loc.name}</td>
                    <td className="px-4 py-2 text-right font-semibold">{loc.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 10 Vendors by Asset Count</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Vendor</th>
                  <th className="px-4 py-2 text-right">Asset Count</th>
                </tr>
              </thead>
              <tbody>
                {data.vendors.assets_per_vendor.map((vendor, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{vendor.vendor}</td>
                    <td className="px-4 py-2 text-right font-semibold">{vendor.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
