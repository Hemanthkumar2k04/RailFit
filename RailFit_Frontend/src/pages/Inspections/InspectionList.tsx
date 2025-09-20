import { useEffect, useState } from "react";

type Fitting = {
  Fitting_ID: string;
  QR_Code: string;
  Fitting_Type: string;
  Vendor_Name: string;
  Vendor_Lot: string;
  Manufacture_Date: string;
  Supply_Date: string;
  Location: string;
  Warranty_Period: string;
  Inspection_Date: string;
  Inspection_Result: string;
  Performance_Status: string;
  UDM_ID: string;
  TMS_ID: string;
};

const statusStyle = {
  "Pass": "bg-green-100 text-green-800 border-green-400",
  "Fail": "bg-red-100 text-red-800 border-red-400",
  "In Service": "bg-blue-100 text-blue-800 border-blue-400",
  "Defective": "bg-yellow-100 text-yellow-800 border-yellow-400",
  "Expired": "bg-gray-100 text-gray-800 border-gray-400",
};

export default function InspectionHistory() {
  const [data, setData] = useState<Fitting[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/fittings')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  const filtered = data.filter(
    fit =>
      fit.Fitting_ID.toLowerCase().includes(search.toLowerCase()) ||
      fit.QR_Code.toLowerCase().includes(search.toLowerCase()) ||
      fit.Inspection_Result.toLowerCase().includes(search.toLowerCase())
  );
  


  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-rail-primary">Inspection History</h2>
      <input
        type="text"
        placeholder="🔍 Search Fitting ID, QR Code, Result..."
        className="border border-rail-gray px-3 py-2 rounded-lg mb-6 shadow focus:outline-primary w-full max-w-xl"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((fit, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:scale-[1.03] transition-all flex flex-col gap-2 border-rail-gray`}
            style={{
              borderColor: fit.Inspection_Result === "Pass"
                ? "#22c55e"
                : fit.Inspection_Result === "Fail"
                ? "#f43f5e"
                : "#a8a29e"
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">{fit.Fitting_ID}</span>
              <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
  statusStyle[fit.Inspection_Result as keyof typeof statusStyle] || "bg-gray-100 text-gray-800 border-gray-400"
}`}>
  {fit.Inspection_Result}
</span>

            </div>
            <div className="text-base text-rail-dark flex gap-2 items-center">
              <span className="font-bold">{fit.Fitting_Type}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{fit.Location}</span>
            </div>
            <div className="flex gap-4 mt-2 text-sm">
              <span>Date: <span className="font-medium">{fit.Inspection_Date}</span></span>
              <span>Warranty: <span className="text-rail-gray">{fit.Warranty_Period}</span></span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded bg-gradient-to-r ${
                  fit.Performance_Status === "In Service"
                    ? "from-blue-200 to-blue-100 text-blue-700"
                    : fit.Performance_Status === "Defective"
                    ? "from-yellow-200 to-yellow-100 text-yellow-700"
                    : "from-gray-200 to-gray-100 text-gray-700"
                } font-semibold text-xs`}
              >
                {fit.Performance_Status}
              </span>
              <span className="text-xs text-rail-gray">Vendor: {fit.Vendor_Name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
