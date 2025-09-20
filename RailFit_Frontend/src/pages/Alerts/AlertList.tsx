import { useEffect, useState } from "react";

type Alert = {
  id: number;
  type: string;
  message: string;
  affected: string;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading alerts...</div>;

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
