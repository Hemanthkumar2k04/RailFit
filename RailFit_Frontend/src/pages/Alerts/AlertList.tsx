import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { AlertTriangle, CheckCircle, Clock, X, MapPin, Package } from 'lucide-react';

type Alert = {
  alert_id: string;
  type: string;
  message: string;
  priority: string;
  status: string;
  asset_name: string;
  asset_type: string;
  location: string;
  created_at: string;
  time_ago: string;
  metadata: Record<string, any>;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'acknowledged' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchAlerts();
  }, [filter, priorityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/api/alerts`;
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }

      // Refresh alerts after dismissing
      fetchAlerts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to dismiss alert');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immediate_maintenance':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'predictive_failure':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'immediate_maintenance':
        return 'Immediate Maintenance';
      case 'predictive_failure':
        return 'Predictive Failure';
      case 'info':
        return 'Information';
      default:
        return type;
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Alerts</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Alert Count */}
        <div className="text-sm text-gray-600">
          Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No alerts found</p>
          <p className="text-gray-500 text-sm">All systems running smoothly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`rounded-lg shadow-md border p-5 flex flex-col gap-3 relative ${getPriorityColor(alert.priority)}`}
            >
              {/* Dismiss Button */}
              {alert.status !== 'Resolved' && (
                <button
                  onClick={() => handleDismiss(alert.alert_id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  title="Dismiss alert"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* Header */}
              <div className="flex items-start gap-2">
                {getTypeIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${getPriorityBadgeColor(alert.priority)}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded font-medium">
                      {alert.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {getTypeLabel(alert.type)}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="text-gray-800 text-sm leading-relaxed">
                {alert.message}
              </div>

              {/* Asset Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Package className="w-4 h-4" />
                <span className="font-semibold">{alert.asset_name}</span>
                <span className="text-gray-400">•</span>
                <span>{alert.asset_type}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{alert.location}</span>
              </div>

              {/* Metadata (if any) */}
              {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                <div className="text-xs text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                  {Object.entries(alert.metadata).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-300">
                <Clock className="w-3 h-3" />
                {alert.time_ago}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}