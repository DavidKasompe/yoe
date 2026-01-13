import { Link, useLocation } from "react-router-dom";
import { User, Lock, Sliders, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const SETTINGS_MENU = [
  {
    label: "Profile",
    path: "/settings/profile",
    icon: User,
  },
  {
    label: "Security",
    path: "/settings/security",
    icon: Lock,
  },
  {
    label: "Preferences",
    path: "/settings/preferences",
    icon: Sliders,
  },
  {
    label: "Integrations",
    path: "/settings/integrations",
    icon: Zap,
  },
];

export function SettingsSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-neutral-50 border-r border-neutral-200 p-6">
      <h2 className="text-lg font-bold text-black mb-8">Settings</h2>

      <nav className="space-y-2 mb-8">
        {SETTINGS_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-brown text-white"
                  : "text-neutral-700 hover:bg-neutral-200"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Danger Zone */}
      <div className="border-t border-neutral-200 pt-6">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
