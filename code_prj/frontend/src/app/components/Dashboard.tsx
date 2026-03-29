import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Droplets,
  LogOut,
  Cloud,
  ThermometerSun,
  Wind,
  Gauge,
  Power,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import logo from "../../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

// Mock sensor data generator
const generateMoistureData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: `${hour.getHours().toString().padStart(2, "0")}:00`,
      moisture: Math.floor(Math.random() * 30) + 45, // 45-75% range
      id: `hour-${23 - i}`, // Unique identifier for React keys
    });
  }
  return data;
};

const generateWaterConsumption = () => {
  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];
  return days.map((day, index) => ({
    day,
    liters: Math.floor(Math.random() * 150) + 100, // 100-250 liters
    id: `day-${index}`, // Unique identifier for React keys
  }));
};

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentMoisture, setCurrentMoisture] = useState(62);
  const [airTemp, setAirTemp] = useState(28);
  const [humidity, setHumidity] = useState(45);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [moistureData] = useState(generateMoistureData());
  const [waterData] = useState(generateWaterConsumption());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoisture((prev) => {
        const change = (Math.random() - 0.5) * 3;
        return Math.max(30, Math.min(80, prev + change));
      });
      setAirTemp((prev) => {
        const change = (Math.random() - 0.5) * 1;
        return Math.max(20, Math.min(40, prev + change));
      });
      setHumidity((prev) => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(30, Math.min(70, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const togglePump = () => {
    setPumpStatus(!pumpStatus);
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 40) return "#e74c3c"; // Red - dry
    if (moisture < 60) return "#f39c12"; // Orange - moderate
    return "#2ECC71"; // Green - optimal
  };

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 40) return t("dashboard.dry");
    if (moisture < 60) return t("dashboard.moderate");
    return t("dashboard.optimal");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src={logo}
                alt="AquaSense Logo"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {t("header.dashboard")}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {t("header.farmControl")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: systemOnline
                    ? "#2ECC7120"
                    : "#e74c3c20",
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${systemOnline ? "bg-[#2ECC71]" : "bg-[#e74c3c]"} animate-pulse`}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: systemOnline ? "#2ECC71" : "#e74c3c",
                  }}
                >
                  {systemOnline
                    ? t("header.online")
                    : t("header.offline")}
                </span>
              </div>
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {t("header.logout")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Weather Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4"
            style={{ borderLeftColor: "#3498DB" }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#3498DB20" }}
                >
                  <ThermometerSun
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: "#3498DB" }}
                  />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t("dashboard.airTemp")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {airTemp.toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t("dashboard.dhtReading")}
            </p>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4"
            style={{ borderLeftColor: "#3498DB" }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#3498DB20" }}
                >
                  <Wind
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: "#3498DB" }}
                  />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t("dashboard.airHumidity")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {humidity.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t("dashboard.dhtReading")}
            </p>
          </div>

          <div
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 sm:col-span-2 md:col-span-1"
            style={{ borderLeftColor: "#2ECC71" }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#2ECC7120" }}
                >
                  <Calendar
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: "#2ECC71" }}
                  />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t("dashboard.todayDate")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    March 26, 2026
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t("dashboard.systemTime")}{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Main Gauge and Pump Control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Soil Moisture Gauge */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Gauge
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: "#2ECC71" }}
              />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {t("dashboard.soilMoisture")}
              </h2>
            </div>

            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-6">
              {/* Circular gauge background */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 200 200"
              >
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={getMoistureColor(currentMoisture)}
                  strokeWidth="20"
                  strokeDasharray={`${(currentMoisture / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                  {Math.round(currentMoisture)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-2">
                  {t("dashboard.moistureLevel")}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: `${getMoistureColor(currentMoisture)}20`,
                  color: getMoistureColor(currentMoisture),
                }}
              >
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold">
                  {getMoistureStatus(currentMoisture)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                {t("dashboard.soilSensor")}
              </p>
            </div>
          </div>

          {/* Pump Control */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Power
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: "#3498DB" }}
              />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {t("dashboard.pumpControl")}
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center h-full">
              <div
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mb-4 sm:mb-6 transition-all ${
                  pumpStatus ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: pumpStatus
                    ? "#2ECC71"
                    : "#e5e7eb",
                }}
              >
                <Droplets
                  className={`w-16 h-16 sm:w-20 sm:h-20 ${pumpStatus ? "text-white" : "text-gray-400"}`}
                />
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {pumpStatus
                    ? t("dashboard.pumpActive")
                    : t("dashboard.pumpOff")}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {pumpStatus
                    ? t("dashboard.pumpActiveText")
                    : t("dashboard.pumpOffText")}
                </p>
              </div>

              <button
                onClick={togglePump}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                  pumpStatus
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#2ECC71] hover:bg-[#27ae60]"
                }`}
              >
                {pumpStatus
                  ? t("dashboard.stopPump")
                  : t("dashboard.startPump")}
              </button>

              <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                {t("dashboard.manualOverride")}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 24h Moisture Trend */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <TrendingUp
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: "#2ECC71" }}
              />
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                {t("dashboard.moistureTrend")}
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={moistureData}>
                <defs>
                  <linearGradient
                    id="moistureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2ECC71"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2ECC71"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                  domain={[0, 100]}
                  label={{
                    value: t("dashboard.moistureLabel"),
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "10px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="#2ECC71"
                  strokeWidth={2}
                  fill="url(#moistureGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
              {t("dashboard.historicalData")}
            </p>
          </div>

          {/* Water Consumption */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Droplets
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: "#3498DB" }}
              />
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                {t("dashboard.waterConsumption")}
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waterData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                  label={{
                    value: t("dashboard.litersLabel"),
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "10px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="liters"
                  fill="#3498DB"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
              {t("dashboard.totalWeek")}{" "}
              {waterData
                .reduce((sum, d) => sum + d.liters, 0)
                .toFixed(0)}{" "}
              {t("dashboard.liters")}
            </p>
          </div>
        </div>

        {/* System Info Footer */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t("dashboard.avgMoisture")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {(
                  moistureData.reduce(
                    (sum, d) => sum + d.moisture,
                    0,
                  ) / moistureData.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t("dashboard.waterSaved")}
              </p>
              <p
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "#2ECC71" }}
              >
                ~60%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t("dashboard.uptime")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                99.2%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t("dashboard.sensorHealth")}
              </p>
              <p
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "#2ECC71" }}
              >
                {t("dashboard.excellent")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}