import { NavLink } from "react-router";
import { LayoutDashboard, Brain, History, Settings } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function NavBar() {
  const { t } = useLanguage();

  const links = [
    { to: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: t("nav.dashboard") },
    { to: "/ai",        icon: <Brain className="w-4 h-4" />,           label: t("nav.ai") },
    { to: "/history",   icon: <History className="w-4 h-4" />,         label: t("nav.history") },
    { to: "/settings",  icon: <Settings className="w-4 h-4" />,        label: t("nav.settings") },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[64px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#2ECC71] text-[#2ECC71]"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}