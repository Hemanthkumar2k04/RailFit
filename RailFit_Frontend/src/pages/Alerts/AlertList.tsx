type Alert = {
  id: number;
  type: string;
  message: string;
  affected: string;
  timestamp: string;
};

// Mock data for track fitting alerts
const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "Critical",
    message: "Health score dropped below 30%. Replacement recommended.",
    affected: "Rail Clip #RC-7842",
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    type: "Warning",
    message: "Warranty expires in 15 days. Schedule inspection.",
    affected: "Rail Pad #RP-9156",
    timestamp: "1 day ago"
  },
  {
    id: 3,
    type: "Critical",
    message: "RUL below threshold. Immediate maintenance required.",
    affected: "Liner #LN-3421",
    timestamp: "4 hours ago"
  },
  {
    id: 4,
    type: "Warning",
    message: "Anomaly detected in vibration pattern during scan.",
    affected: "Rail Clip #RC-6598",
    timestamp: "2 days ago"
  },
  {
    id: 5,
    type: "Critical",
    message: "Batch performance alert: Higher failure rate detected.",
    affected: "Vendor: SteelTech Corp",
    timestamp: "6 hours ago"
  },
  {
    id: 6,
    type: "Warning",
    message: "Inventory below minimum stock level. Reorder suggested.",
    affected: "Rail Pads (Size M)",
    timestamp: "3 days ago"
  },
];

export default function Alerts() {
  const alerts = mockAlerts;

  if (!alerts.length) return <div>No alerts.</div>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`rounded-lg shadow-md border p-4 flex flex-col gap-2 ${
            alert.type === "Critical" ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`px-2 py-1 text-xs rounded font-semibold ${
              alert.type === "Critical"
                ? "bg-red-500 text-white"
                : "bg-yellow-500 text-white"
            }`}>
              {alert.type}
            </span>
            <span className="font-bold text-gray-700">{alert.affected}</span>
          </div>
          <div className="text-gray-800 text-sm mb-2">{alert.message}</div>
          <div className="text-xs text-gray-500 mt-auto">{alert.timestamp}</div>
        </div>
      ))}
    </div>
  );
}