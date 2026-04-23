import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Brain,
  LogOut,
  TrendingUp,
  Droplets,
  ThermometerSun,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import logo from "../../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavBar } from "./NavBar";

const PLANT_THRESHOLDS: Record<string, { min: number; max: number; maxTemp: number }> = {
  tomate:         { min: 40, max: 75, maxTemp: 32 },
  poivron:        { min: 35, max: 70, maxTemp: 30 },
  courgette:      { min: 38, max: 72, maxTemp: 35 },
  laitue:         { min: 50, max: 80, maxTemp: 25 },
  carotte:        { min: 30, max: 65, maxTemp: 28 },
  oignon:         { min: 35, max: 70, maxTemp: 30 },
  pomme_de_terre: { min: 45, max: 75, maxTemp: 28 },
  concombre:      { min: 50, max: 80, maxTemp: 32 },
};

async function getAIPrediction(plantType: string, soilMoisture: number, temperature: number, airHumidity: number) {
  try {
    const response = await fetch("http://localhost:8001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plant_type: plantType, soil_moisture: soilMoisture, temperature, air_humidity: airHumidity }),
    });
    return await response.json();
  } catch {
    return null;
  }
}

async function getLatestReading() {
  try {
    const response = await fetch("http://localhost:8000/readings/latest");
    return await response.json();
  } catch {
    return null;
  }
}

async function getReadings(limit = 24) {
  try {
    const response = await fetch(`http://localhost:8000/readings?limit=${limit}`);
    return await response.json();
  } catch {
    return [];
  }
}

async function getPlant() {
  try {
    const response = await fetch("http://localhost:8000/get-plant");
    return await response.json();
  } catch {
    return { plant_type: "tomate" };
  }
}

export function AIPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [aiData, setAiData] = useState<any>(null);
  const [latestReading, setLatestReading] = useState<any>(null);
  const [plantType, setPlantType] = useState("tomate");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [aiOnline, setAiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    const [reading, plant, readings] = await Promise.all([
      getLatestReading(),
      getPlant(),
      getReadings(24),
    ]);

    if (reading) {
      setLatestReading(reading);
      setPlantType(plant?.plant_type ?? "tomate");

      const prediction = await getAIPrediction(
        plant?.plant_type ?? "tomate",
        reading.soil_moisture,
        reading.temperature,
        reading.air_humidity,
      );

      if (prediction) {
        setAiData(prediction);
        setAiOnline(true);
      } else {
        setAiOnline(false);
      }
    }

    // Build history chart — reverse so oldest is left
    if (Array.isArray(readings)) {
      const chart = [...readings].reverse().map((r: any, i: number) => ({
        id: i,
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        moisture: r.soil_moisture,
        pump: r.pump_status ? 1 : 0,
      }));
      setHistoryData(chart);
    }

    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const thresholds = PLANT_THRESHOLDS[plantType] ?? { min: 35, max: 70, maxTemp: 30 };

  const getDecisionColor = (decision: string) => {
    if (!decision) return "#6b7280";
    if (decision.includes("ARROSER") && !decision.includes("NE")) return "#2ECC71";
    if (decision.includes("NE PAS")) return "#3498DB";
    return "#f39c12";
  };

  const getDecisionIcon = (decision: string) => {
    if (!decision) return <Clock className="w-8 h-8 text-gray-400" />;
    if (decision.includes("ARROSER") && !decision.includes("NE"))
      return <Droplets className="w-8 h-8 text-white" />;
    if (decision.includes("NE PAS"))
      return <CheckCircle className="w-8 h-8 text-white" />;
    return <Clock className="w-8 h-8 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — identical to Dashboard */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={logo} alt="AquaSense Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {t("ai.title")}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {t("ai.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg"
                style={{ backgroundColor: aiOnline ? "#2ECC7120" : "#e74c3c20" }}
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${aiOnline ? "bg-[#2ECC71]" : "bg-[#e74c3c]"}`} />
                <span className="text-sm font-semibold" style={{ color: aiOnline ? "#2ECC71" : "#e74c3c" }}>
                  {aiOnline ? t("ai.modelOnline") : t("ai.modelOffline")}
                </span>
              </div>
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">{t("ai.loading")}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top row — decision card + confidence + sensor snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

              {/* Main decision card */}
              <div className="bg-white rounded-xl shadow-md p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#9b59b6" }} />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("ai.lastDecision")}</h2>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: aiData ? getDecisionColor(aiData.decision) : "#e5e7eb" }}
                  >
                    {aiData ? getDecisionIcon(aiData.decision) : <Brain className="w-8 h-8 text-gray-400" />}
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {aiData?.decision ?? t("ai.noData")}
                  </p>
                  <p className="text-xs text-gray-500 text-center leading-relaxed px-2">
                    {aiData?.reason ?? t("ai.noReason")}
                  </p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-400 mt-4">
                      {t("ai.updatedAt")} {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Confidence */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#3498DB" }} />
                  <h2 className="text-lg font-bold text-gray-900">{t("ai.confidence")}</h2>
                </div>
                <div className="flex flex-col items-center">
                  <p
                    className="text-5xl font-bold mb-3"
                    style={{ color: (aiData?.confidence_percent ?? 0) > 70 ? "#2ECC71" : "#f39c12" }}
                  >
                    {aiData?.confidence_percent?.toFixed(0) ?? "--"}%
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${aiData?.confidence_percent ?? 0}%`,
                        backgroundColor: (aiData?.confidence_percent ?? 0) > 70 ? "#2ECC71" : "#f39c12",
                      }}
                    />
                  </div>
                  <div className="w-full grid grid-cols-2 gap-3 mt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{t("ai.pumpDecision")}</p>
                      <p className="font-bold text-sm" style={{ color: aiData?.pump_on ? "#2ECC71" : "#e74c3c" }}>
                        {aiData?.pump_on ? t("ai.pumpOn") : t("ai.pumpOff")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{t("ai.plant")}</p>
                      <p className="font-bold text-sm text-gray-900 capitalize">{plantType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensor snapshot vs thresholds */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ThermometerSun className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#e67e22" }} />
                  <h2 className="text-lg font-bold text-gray-900">{t("ai.sensorVsThreshold")}</h2>
                </div>
                <div className="space-y-4">
                  {/* Soil moisture */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t("ai.soilMoisture")}</span>
                      <span className="font-semibold text-gray-700">{latestReading?.soil_moisture ?? "--"}%</span>
                    </div>
                    <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-4 rounded-full transition-all duration-700"
                        style={{
                          width: `${latestReading?.soil_moisture ?? 0}%`,
                          backgroundColor: (latestReading?.soil_moisture ?? 0) < thresholds.min ? "#e74c3c"
                            : (latestReading?.soil_moisture ?? 0) > thresholds.max ? "#3498DB"
                            : "#2ECC71",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{t("ai.min")}: {thresholds.min}%</span>
                      <span>{t("ai.max")}: {thresholds.max}%</span>
                    </div>
                  </div>
                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t("ai.temperature")}</span>
                      <span className="font-semibold text-gray-700">{latestReading?.temperature?.toFixed(1) ?? "--"}°C</span>
                    </div>
                    <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-4 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(((latestReading?.temperature ?? 0) / 50) * 100, 100)}%`,
                          backgroundColor: (latestReading?.temperature ?? 0) > thresholds.maxTemp ? "#e74c3c" : "#3498DB",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0°C</span>
                      <span>{t("ai.maxTemp")}: {thresholds.maxTemp}°C</span>
                    </div>
                  </div>
                  {/* Air humidity */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t("ai.airHumidity")}</span>
                      <span className="font-semibold text-gray-700">{latestReading?.air_humidity?.toFixed(0) ?? "--"}%</span>
                    </div>
                    <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-[#3498DB] transition-all duration-700"
                        style={{ width: `${latestReading?.air_humidity ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

              {/* Moisture history with threshold bands */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#2ECC71" }} />
                  <h2 className="text-base sm:text-xl font-bold text-gray-900">{t("ai.moistureHistory")}</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="moistureAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "10px" }} interval="preserveStartEnd" />
                    <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                    />
                    {/* Low threshold line */}
                    <Area type="monotone" dataKey={() => thresholds.min} stroke="#e74c3c" strokeDasharray="4 4" fill="none" strokeWidth={1} dot={false} />
                    {/* High threshold line */}
                    <Area type="monotone" dataKey={() => thresholds.max} stroke="#3498DB" strokeDasharray="4 4" fill="none" strokeWidth={1} dot={false} />
                    <Area type="monotone" dataKey="moisture" stroke="#2ECC71" strokeWidth={2} fill="url(#moistureAI)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 justify-center mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#e74c3c] inline-block" /> {t("ai.lowThreshold")} ({thresholds.min}%)</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#3498DB] inline-block" /> {t("ai.highThreshold")} ({thresholds.max}%)</span>
                </div>
              </div>

              {/* Pump activation history */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#3498DB" }} />
                  <h2 className="text-base sm:text-xl font-bold text-gray-900">{t("ai.pumpHistory")}</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "10px" }} interval="preserveStartEnd" />
                    <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} domain={[0, 1]} ticks={[0, 1]}
                      tickFormatter={(v) => v === 1 ? "ON" : "OFF"} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v: any) => [v === 1 ? "ON" : "OFF", t("ai.pump")]}
                    />
                    <Bar dataKey="pump" radius={[4, 4, 0, 0]}>
                      {historyData.map((entry, i) => (
                        <Cell key={i} fill={entry.pump === 1 ? "#2ECC71" : "#e5e7eb"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 text-center mt-3">
                  {t("ai.pumpHistoryNote")}
                </p>
              </div>
            </div>

            {/* Threshold reference table */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Brain className="w-5 h-5" style={{ color: "#9b59b6" }} />
                <h2 className="text-base sm:text-xl font-bold text-gray-900">{t("ai.thresholdTable")}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">{t("ai.plant")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("ai.minMoisture")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("ai.maxMoisture")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("ai.maxTempCol")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("ai.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PLANT_THRESHOLDS).map(([plant, thresh]) => (
                      <tr key={plant} className={`border-b border-gray-50 ${plant === plantType ? "bg-green-50" : ""}`}>
                        <td className="py-2 px-3 font-medium text-gray-900 capitalize flex items-center gap-2">
                          {plant === plantType && <span className="w-2 h-2 rounded-full bg-[#2ECC71] inline-block" />}
                          {plant.replace("_", " ")}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresh.min}%</td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresh.max}%</td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresh.maxTemp}°C</td>
                        <td className="py-2 px-3 text-center">
                          {plant === plantType ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" /> {t("ai.active")}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{t("ai.inactive")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}