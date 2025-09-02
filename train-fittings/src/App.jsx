import { useEffect, useState } from "react";

export default function App() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/items")
      .then((res) => res.json())
      .then(setItems)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!query) { setFiltered(items); return; }
    setFiltered(items.filter(it =>
      it.ItemID.toLowerCase().includes(query.toLowerCase()) ||
      it.Type.toLowerCase().includes(query.toLowerCase()) ||
      it.Vendor.toLowerCase().includes(query.toLowerCase()) ||
      it.LotNo.toLowerCase().includes(query.toLowerCase())
    ));
  }, [items, query]);

  const statusChip = (ai) => {
    const txt = Array.isArray(ai) ? ai.join(", ") : ai;
    const danger = txt.includes("Expired") || txt.includes("Overdue");
    const ok = txt.includes("OK") && !danger;
    const cls = danger ? "bg-[#fee2e2] text-[#991b1b]" : ok ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef9c3] text-[#a16207]";
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{txt}</span>;
  };

  return (
    <div style={{
      fontFamily: "Inter, system-ui, Arial",
      padding: 32,
      maxWidth: 1200,
      margin: "0 auto",
      background: "#f4f6fb",
      minHeight: "100vh"
    }}>
      <h1 style={{
        fontSize: 32,
        fontWeight: 900,
        marginBottom: 16,
        color: "#111827",
        letterSpacing: -1
      }}>Rail Fittings <span style={{ color: "#0ea5e9" }}>— Exception Dashboard</span></h1>

      <div style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginBottom: 24
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search by QR ID, Type, Vendor, Lot..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #d1d5db",
            fontSize: 16,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
          }}
        />
      </div>

      <div style={{
        overflowX: "auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #e2e8f0"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0
        }}>
          // Inside your table rendering:
<thead style={{
  position: "sticky",
  top: 0,
  zIndex: 1,
  background: "#eff6ff"
}}>
  <tr>
    {["ItemID","Type","Vendor","Lot","Supply Date","Warranty End","Last Inspection","AI Status"].map(h => (
      <th key={h}
        style={{
          textAlign: "left",
          padding: "14px 12px",
          fontWeight: 800,
          fontSize: 15,
          color: "#2563eb", // Header text color
          borderBottom: "2px solid #e0e7ef"
        }}>
        {h}
      </th>
    ))}
  </tr>
</thead>
<tbody>
  {filtered.map((it, i) => (
    <tr key={it.ItemID}
      style={{
        background: i % 2 ? "#f8fafc" : "#fff",
        borderBottom: "1px solid #e7eaee"
      }}>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.ItemID}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.Type}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.Vendor}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.LotNo}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.SupplyDate}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.WarrantyEnd}</td>
      <td style={{ padding: "12px 12px", color: "#22292f" }}>{it.LastInspection}</td>
      <td style={{ padding: "12px 12px", color:"red" }}>{statusChip(it.AI_Status)}</td>
    </tr>
  ))}
  {!filtered.length && (
    <tr>
      <td colSpan="8"
        style={{
          padding: 20,
          textAlign: "center",
          color: "#3971c0",
          fontSize: 16,
        }}>
        No items found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      <p style={{
        marginTop: 24,
        color: "#475569",
        background: "#e0e7ef",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 15,
        maxWidth: 500,
        boxShadow: "0 1px 6px rgba(0,0,0,0.03)"
      }}>
        <strong>Tip:</strong> Try searching <code style={{ background: "#e0e7ef", padding: "2px 5px", borderRadius: "4px" }}>QR001</code> or filter by <code style={{ background: "#e0e7ef", padding: "2px 6px", borderRadius: "4px" }}>Elastic Rail Clip</code>.
      </p>
    </div>
  );
}
