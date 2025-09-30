

type Alert = {
  id: number;
  type: string;
  message: string;
  affected: string;
};

// Mock data for alerts
const mockAlerts: Alert[] = [
  {
    id: 1,
    type: "Critical",
    message: "Track misalignment detected near Sector 12.",
    affected: "Track #45"
  },
  {
    id: 2,
    type: "Warning",
    message: "Inspection overdue by 3 days.",
    affected: "Bridge #7"
  },
  {
    id: 3,
    type: "Critical",
    message: "Signal failure detected, requires immediate attention.",
    affected: "Signal Tower A"
  },
  {
    id: 4,
    type: "Warning",
    message: "Unusual vibration levels reported during inspection.",
    affected: "Track #102"
  },
  {
    id: 5,
    type: "Critical",
    message: "Overheating reported in axle sensor.",
    affected: "Train Unit 21"
  },
  {
    id: 6,
    type: "Warning",
    message: "Loose fastening detected in sleeper joint.",
    affected: "Track #78"
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
          <div className="text-gray-800">{alert.message}</div>
        </div>
      ))}
    </div>
  );
}
