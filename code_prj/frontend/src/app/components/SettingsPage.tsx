import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LogOut,
  Settings,
  Save,
  RotateCcw,
  Leaf,
  Clock,
  Thermometer,
  Droplets,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavBar } from "./NavBar";

type PlantKey =
  | "tomate" | "poivron" | "courgette" | "laitue"
  | "carotte" | "oignon" | "pomme_de_terre" | "concombre";

interface PlantThreshold {
  min_moisture: number;
  max_moisture: number;
  max_temp: number;
}

type ThresholdsMap = Record<PlantKey, PlantThreshold>;

const DEFAULT_THRESHOLDS: ThresholdsMap = {
  tomate:         { min_moisture: 40, max_moisture: 75, max_temp: 32 },
  poivron:        { min_moisture: 35, max_moisture: 70, max_temp: 30 },
  courgette:      { min_moisture: 38, max_moisture: 72, max_temp: 35 },
  laitue:         { min_moisture: 50, max_moisture: 80, max_temp: 25 },
  carotte:        { min_moisture: 30, max_moisture: 65, max_temp: 28 },
  oignon:         { min_moisture: 35, max_moisture: 70, max_temp: 30 },
  pomme_de_terre: { min_moisture: 45, max_moisture: 75, max_temp: 28 },
  concombre:      { min_moisture: 50, max_moisture: 80, max_temp: 32 },
};

const DEFAULT_SYSTEM = {
  override_minutes: 30,
  sensor_interval_s: 10,
  pump_poll_interval_s: 5,
  plant_poll_interval_s: 15,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

async function getSystemConfig() {
  try {
    const res = await fetch("http://localhost:8000/config");
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function saveSystemConfig(config: typeof DEFAULT_SYSTEM) {
  try {
    const res = await fetch("http://localhost:8000/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch { return false; }
}

async function saveThresholds(thresholds: ThresholdsMap) {
  try {
    const res = await fetch("http://localhost:8000/thresholds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(thresholds),
    });
    return res.ok;
  } catch { return false; }
}

async function getThresholds() {
  try {
    const res = await fetch("http://localhost:8000/thresholds");
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [thresholds, setThresholds]       = useState<ThresholdsMap>({ ...DEFAULT_THRESHOLDS });
  const [systemConfig, setSystemConfig]   = useState({ ...DEFAULT_SYSTEM });
  const [activePlant, setActivePlant]     = useState<PlantKey>("tomate");
  const [thresholdStatus, setThresholdStatus] = useState<SaveStatus>("idle");
  const [systemStatus, setSystemStatus]   = useState<SaveStatus>("idle");
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([getThresholds(), getSystemConfig()]).then(([thresh, sys]) => {
      if (thresh) setThresholds({ ...DEFAULT_THRESHOLDS, ...thresh });
      if (sys)    setSystemConfig({ ...DEFAULT_SYSTEM, ...sys });
      setLoading(false);
    });
  }, []);

  const updateThreshold = (plant: PlantKey, field: keyof PlantThreshold, raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value)) return;
    setThresholds((prev) => ({
      ...prev,
      [plant]: { ...prev[plant], [field]: value },
    }));
  };

  const handleSaveThresholds = async () => {
    setThresholdStatus("saving");
    const ok = await saveThresholds(thresholds);
    setThresholdStatus(ok ? "saved" : "error");
    setTimeout(() => setThresholdStatus("idle"), 3000);
  };

  const handleSaveSystem = async () => {
    setSystemStatus("saving");
    const ok = await saveSystemConfig(systemConfig);
    setSystemStatus(ok ? "saved" : "error");
    setTimeout(() => setSystemStatus("idle"), 3000);
  };

  const handleResetThresholds = () => {
    setThresholds({ ...DEFAULT_THRESHOLDS });
    setThresholdStatus("idle");
  };

  const currentThresh = thresholds[activePlant];
  const plants = Object.keys(DEFAULT_THRESHOLDS) as PlantKey[];

  const SaveButton = ({
    status, onSave, onReset,
  }: { status: SaveStatus; onSave: () => void; onReset?: () => void }) => (
    <div className="flex items-center gap-3">
      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t("settings.reset")}
        </button>
      )}
      <button
        onClick={onSave}
        disabled={status === "saving"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
        style={{
          backgroundColor:
            status === "saved" ? "#2ECC71"
            : status === "error" ? "#e74c3c"
            : "#3498DB",
          opacity: status === "saving" ? 0.7 : 1,
        }}
      >
        {status === "saved"  ? <CheckCircle className="w-4 h-4" /> :
         status === "error"  ? <AlertTriangle className="w-4 h-4" /> :
         status === "saving" ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
         <Save className="w-4 h-4" />}
        {status === "saved"  ? t("settings.saved")  :
         status === "error"  ? t("settings.error")  :
         status === "saving" ? t("settings.saving") :
         t("settings.save")}
      </button>
    </div>
  );

  const NumberInput = ({
    value, min, max, step = 1, unit, onChange,
  }: { value: number; min: number; max: number; step?: number; unit: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 text-center bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
      />
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src={logo} alt="AquaSense Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t("settings.title")}</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t("settings.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Plant thresholds ───────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#2ECC71" }} />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("settings.plantThresholds")}</h2>
                    <p className="text-xs text-gray-500">{t("settings.plantThresholdsNote")}</p>
                  </div>
                </div>
                <SaveButton
                  status={thresholdStatus}
                  onSave={handleSaveThresholds}
                  onReset={handleResetThresholds}
                />
              </div>

              {/* Plant tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {plants.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlant(p)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
                    style={{
                      backgroundColor: activePlant === p ? "#2ECC71" : "#f3f4f6",
                      color: activePlant === p ? "white" : "#6b7280",
                    }}
                  >
                    {p.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Active plant sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Min moisture */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-4 h-4" style={{ color: "#e74c3c" }} />
                    <p className="text-sm font-medium text-gray-700">{t("settings.minMoisture")}</p>
                  </div>
                  <p className="text-3xl font-bold mb-3" style={{ color: "#e74c3c" }}>
                    {currentThresh.min_moisture}%
                  </p>
                  <input
                    type="range" min={10} max={70} step={1}
                    value={currentThresh.min_moisture}
                    onChange={(e) => updateThreshold(activePlant, "min_moisture", e.target.value)}
                    className="w-full accent-red-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10%</span><span>70%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("settings.minMoistureNote")}</p>
                </div>

                {/* Max moisture */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-4 h-4" style={{ color: "#3498DB" }} />
                    <p className="text-sm font-medium text-gray-700">{t("settings.maxMoisture")}</p>
                  </div>
                  <p className="text-3xl font-bold mb-3" style={{ color: "#3498DB" }}>
                    {currentThresh.max_moisture}%
                  </p>
                  <input
                    type="range" min={40} max={100} step={1}
                    value={currentThresh.max_moisture}
                    onChange={(e) => updateThreshold(activePlant, "max_moisture", e.target.value)}
                    className="w-full accent-blue-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>40%</span><span>100%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("settings.maxMoistureNote")}</p>
                </div>

                {/* Max temp */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-4 h-4" style={{ color: "#e67e22" }} />
                    <p className="text-sm font-medium text-gray-700">{t("settings.maxTemp")}</p>
                  </div>
                  <p className="text-3xl font-bold mb-3" style={{ color: "#e67e22" }}>
                    {currentThresh.max_temp}°C
                  </p>
                  <input
                    type="range" min={15} max={45} step={0.5}
                    value={currentThresh.max_temp}
                    onChange={(e) => updateThreshold(activePlant, "max_temp", e.target.value)}
                    className="w-full accent-orange-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>15°C</span><span>45°C</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("settings.maxTempNote")}</p>
                </div>
              </div>

              {/* Validation warning */}
              {currentThresh.min_moisture >= currentThresh.max_moisture && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{t("settings.thresholdWarning")}</p>
                </div>
              )}

              {/* All-plants summary table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">{t("settings.plant")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("settings.minCol")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("settings.maxCol")}</th>
                      <th className="text-center py-2 px-3 text-xs text-gray-500 font-medium">{t("settings.tempCol")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plants.map((p) => (
                      <tr
                        key={p}
                        onClick={() => setActivePlant(p)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          p === activePlant ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-3 font-medium text-gray-900 capitalize flex items-center gap-2">
                          {p === activePlant && <span className="w-2 h-2 rounded-full bg-[#2ECC71] inline-block" />}
                          {p.replace("_", " ")}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresholds[p].min_moisture}%</td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresholds[p].max_moisture}%</td>
                        <td className="py-2 px-3 text-center text-gray-600">{thresholds[p].max_temp}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── System config ──────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#3498DB" }} />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("settings.systemConfig")}</h2>
                    <p className="text-xs text-gray-500">{t("settings.systemConfigNote")}</p>
                  </div>
                </div>
                <SaveButton status={systemStatus} onSave={handleSaveSystem} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    key: "override_minutes" as const,
                    label: t("settings.overrideDuration"),
                    note: t("settings.overrideDurationNote"),
                    min: 1, max: 120, step: 1, unit: t("settings.minutes"),
                    color: "#9b59b6",
                  },
                  {
                    key: "sensor_interval_s" as const,
                    label: t("settings.sensorInterval"),
                    note: t("settings.sensorIntervalNote"),
                    min: 5, max: 60, step: 1, unit: t("settings.seconds"),
                    color: "#2ECC71",
                  },
                  {
                    key: "pump_poll_interval_s" as const,
                    label: t("settings.pumpPollInterval"),
                    note: t("settings.pumpPollNote"),
                    min: 2, max: 30, step: 1, unit: t("settings.seconds"),
                    color: "#3498DB",
                  },
                  {
                    key: "plant_poll_interval_s" as const,
                    label: t("settings.plantPollInterval"),
                    note: t("settings.plantPollNote"),
                    min: 5, max: 60, step: 1, unit: t("settings.seconds"),
                    color: "#e67e22",
                  },
                ].map(({ key, label, note, min, max, step, unit, color }) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-xl border-l-4" style={{ borderLeftColor: color }}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                    <p className="text-xs text-gray-400 mb-3">{note}</p>
                    <div className="flex items-center justify-between">
                      <NumberInput
                        value={systemConfig[key]}
                        min={min} max={max} step={step} unit={unit}
                        onChange={(v) =>
                          setSystemConfig((prev) => ({ ...prev, [key]: parseFloat(v) || prev[key] }))
                        }
                      />
                      <span className="text-2xl font-bold" style={{ color }}>
                        {systemConfig[key]}
                        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100">
                <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">{t("settings.systemNote")}</p>
              </div>
            </div>

            {/* ── About ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5" style={{ color: "#6b7280" }} />
                <h2 className="text-lg font-bold text-gray-900">{t("settings.about")}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: t("settings.frontend"), value: "React + Vite" },
                  { label: t("settings.backend"),  value: "FastAPI 8000" },
                  { label: t("settings.aiService"), value: "FastAPI 8001" },
                  { label: t("settings.device"),   value: "ESP32 + DHT22" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}