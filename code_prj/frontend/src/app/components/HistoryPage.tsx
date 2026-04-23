import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LogOut,
  History,
  Download,
  Filter,
  Droplets,
  ThermometerSun,
  Wind,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import logo from "../../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavBar } from "./NavBar";

const PLANT_OPTIONS = [
  "tomate", "poivron", "courgette", "laitue",
  "carotte", "oignon", "pomme_de_terre", "concombre",
];

async function getReadings(limit = 200) {
  try {
    const res = await fetch(`http://localhost:8000/readings?limit=${limit}`);
    return await res.json();
  } catch {
    return [];
  }
}

function exportCSV(data: any[], t: (k: string) => string) {
  const headers = ["id", "timestamp", "plant_type", "soil_moisture", "temperature", "air_humidity", "pump_status"];
  const rows = data.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aquasense-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = "timestamp" | "soil_moisture" | "temperature" | "air_humidity";
type SortDir = "asc" | "desc";

export function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [allReadings, setAllReadings]   = useState<any[]>([]);
  const [filtered, setFiltered]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [plantFilter, setPlantFilter]   = useState("all");
  const [pumpFilter, setPumpFilter]     = useState("all");
  const [sortKey, setSortKey]           = useState<SortKey>("timestamp");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");
  const [page, setPage]                 = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => {
    getReadings(200).then((data) => {
      // backend returns newest first — keep that order by default
      setAllReadings(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  // Apply filters + sort whenever deps change
  useEffect(() => {
    let result = [...allReadings];

    if (plantFilter !== "all")
      result = result.filter((r) => r.plant_type === plantFilter);
    if (pumpFilter === "on")
      result = result.filter((r) => r.pump_status === true);
    if (pumpFilter === "off")
      result = result.filter((r) => r.pump_status === false);

    result.sort((a, b) => {
      const av = sortKey === "timestamp" ? new Date(a[sortKey]).getTime() : a[sortKey];
      const bv = sortKey === "timestamp" ? new Date(b[sortKey]).getTime() : b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });

    setFiltered(result);
    setPage(0);
  }, [allReadings, plantFilter, pumpFilter, sortKey, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Chart data — last 48 readings reversed (oldest left)
  const chartData = [...allReadings]
    .slice(0, 48)
    .reverse()
    .map((r, i) => ({
      id: i,
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      soil: r.soil_moisture,
      temp: parseFloat(r.temperature?.toFixed(1)),
      hum: parseFloat(r.air_humidity?.toFixed(1)),
      pump: r.pump_status ? 100 : 0,
    }));

  // Summary stats
  const avg = (key: string) =>
    allReadings.length
      ? (allReadings.reduce((s, r) => s + (r[key] ?? 0), 0) / allReadings.length).toFixed(1)
      : "--";
  const pumpOnCount = allReadings.filter((r) => r.pump_status).length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-30" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={logo} alt="AquaSense Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t("history.title")}</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t("history.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => exportCSV(filtered, t)}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <Download className="w-4 h-4" />
                {t("history.exportCsv")}
              </button>
              <LanguageSwitcher />
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{t("header.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
          {[
            { label: t("history.totalReadings"), value: allReadings.length, color: "#3498DB", icon: <History className="w-5 h-5" style={{ color: "#3498DB" }} /> },
            { label: t("history.avgMoisture"),   value: `${avg("soil_moisture")}%`, color: "#2ECC71", icon: <Droplets className="w-5 h-5" style={{ color: "#2ECC71" }} /> },
            { label: t("history.avgTemp"),        value: `${avg("temperature")}°C`, color: "#e67e22", icon: <ThermometerSun className="w-5 h-5" style={{ color: "#e67e22" }} /> },
            { label: t("history.pumpActivations"),value: pumpOnCount, color: "#9b59b6", icon: <Wind className="w-5 h-5" style={{ color: "#9b59b6" }} /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-4 sm:p-5 border-l-4" style={{ borderLeftColor: color }}>
              <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs text-gray-500">{label}</p></div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Multi-line chart */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t("history.trendChart")}</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e67e22" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e67e22" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498DB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "10px" }} interval="preserveStartEnd" />
                <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="soil" name={t("history.soil")} stroke="#2ECC71" strokeWidth={2} fill="url(#gSoil)" />
                <Area type="monotone" dataKey="temp" name={t("history.temp")} stroke="#e67e22" strokeWidth={2} fill="url(#gTemp)" />
                <Area type="monotone" dataKey="hum"  name={t("history.hum")}  stroke="#3498DB" strokeWidth={2} fill="url(#gHum)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Filters + table */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
            >
              <option value="all">{t("history.allPlants")}</option>
              {PLANT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.replace("_", " ")}</option>
              ))}
            </select>

            <select
              value={pumpFilter}
              onChange={(e) => setPumpFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
            >
              <option value="all">{t("history.allPump")}</option>
              <option value="on">{t("history.pumpOn")}</option>
              <option value="off">{t("history.pumpOff")}</option>
            </select>

            <span className="ml-auto text-xs text-gray-400">
              {filtered.length} {t("history.results")}
            </span>

            {/* Mobile CSV export */}
            <button
              onClick={() => exportCSV(filtered, t)}
              className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium w-36">
                      <button onClick={() => handleSort("timestamp")} className="flex items-center gap-0.5 hover:text-gray-700">
                        {t("history.colTime")} <SortIcon k="timestamp" />
                      </button>
                    </th>
                    <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium w-28">{t("history.colPlant")}</th>
                    <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-24">
                      <button onClick={() => handleSort("soil_moisture")} className="flex items-center gap-0.5 hover:text-gray-700 mx-auto">
                        {t("history.colSoil")} <SortIcon k="soil_moisture" />
                      </button>
                    </th>
                    <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-24">
                      <button onClick={() => handleSort("temperature")} className="flex items-center gap-0.5 hover:text-gray-700 mx-auto">
                        {t("history.colTemp")} <SortIcon k="temperature" />
                      </button>
                    </th>
                    <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-24">
                      <button onClick={() => handleSort("air_humidity")} className="flex items-center gap-0.5 hover:text-gray-700 mx-auto">
                        {t("history.colHum")} <SortIcon k="air_humidity" />
                      </button>
                    </th>
                    <th className="text-center py-2 px-2 text-xs text-gray-500 font-medium w-20">{t("history.colPump")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        {t("history.noResults")}
                      </td>
                    </tr>
                  ) : paginated.map((r, i) => (
                    <tr key={r.id ?? i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-2 text-xs text-gray-500">
                        {new Date(r.timestamp).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2.5 px-2 text-gray-700 capitalize text-xs">{r.plant_type?.replace("_", " ")}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: r.soil_moisture < 40 ? "#e74c3c20" : r.soil_moisture > 75 ? "#3498DB20" : "#2ECC7120",
                            color: r.soil_moisture < 40 ? "#e74c3c" : r.soil_moisture > 75 ? "#3498DB" : "#2ECC71",
                          }}
                        >
                          {r.soil_moisture}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-xs text-gray-700">{r.temperature?.toFixed(1)}°C</td>
                      <td className="py-2.5 px-2 text-center text-xs text-gray-700">{r.air_humidity?.toFixed(0)}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: r.pump_status ? "#2ECC7120" : "#e5e7eb",
                            color: r.pump_status ? "#2ECC71" : "#9ca3af",
                          }}
                        >
                          {r.pump_status ? "ON" : "OFF"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("history.prev")}
              </button>
              <span className="text-xs text-gray-500">
                {t("history.page")} {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("history.next")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}