import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Sliders, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Settings Page
 * /settings
 * 
 * Main settings overview with links to sub-pages
 */
export function Settings() {
  const { user } = useAuth();

  const sections = [
    {
      title: "Profile",
      description: "Manage your account information and personal details",
      icon: User,
      path: "/settings/profile",
    },
    {
      title: "Security",
      description: "Change password, enable 2FA, and manage active sessions",
      icon: Shield,
      path: "/settings/security",
    },
    {
      title: "Preferences",
      description: "Customize dashboard settings and AI explanation verbosity",
      icon: Sliders,
      path: "/settings/preferences",
    },
    {
      title: "Integrations",
      description: "Connect external services and manage API connections",
      icon: Zap,
      path: "/settings/integrations",
    },
  ];

  return (
    <SettingsLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
          <p className="text-neutral-600">
            Manage your YOE account and preferences
          </p>
        </div>

        {/* User Summary Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">
                {user?.fullName || "User"}
              </h2>
              <p className="text-neutral-600 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">
                Role
              </p>
              <p className="text-sm font-semibold text-black">{user?.role}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">
                Account Status
              </p>
              <p className="text-sm font-semibold text-green-600">Active</p>
            </div>
          </div>
        </div>

        {/* Settings Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.path}
                to={section.path}
                className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg hover:border-brown transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-brown group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-neutral-400 group-hover:text-brown transition-colors"
                  />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {section.title}
                </h3>
                <p className="text-neutral-600 text-sm">{section.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </SettingsLayout>
  );
}
