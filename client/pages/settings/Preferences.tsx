import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { toast } from "@/components/ui/sonner";

export function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    defaultGame: "LoL",
    dashboardLanding: "coach",
    refreshFrequency: "realtime",
    aiVerbosity: "standard",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="flex min-h-screen">
        <SettingsSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                Preferences
              </h1>
              <p className="text-neutral-600">
                Customize your dashboard and AI experience
              </p>
            </div>

            {/* Preferences Form */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8">
              <div className="space-y-6">
                {/* Default Game */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Default Game
                  </label>
                  <select
                    name="defaultGame"
                    value={preferences.defaultGame}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  >
                    <option value="LoL">League of Legends</option>
                    <option value="VAL">VALORANT</option>
                    <option value="CS2">Counter-Strike 2</option>
                    <option value="OW">Overwatch 2</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    The game to display by default when you open the dashboard
                  </p>
                </div>

                {/* Dashboard Landing Page */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Dashboard Landing Page
                  </label>
                  <select
                    name="dashboardLanding"
                    value={preferences.dashboardLanding}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  >
                    <option value="coach">Coach Dashboard</option>
                    <option value="scout">Scouting Reports</option>
                    <option value="draft">Draft Intelligence</option>
                    <option value="analytics">Analytics</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    Choose which module loads first when you sign in
                  </p>
                </div>

                {/* Data Refresh Frequency */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Data Refresh Frequency
                  </label>
                  <select
                    name="refreshFrequency"
                    value={preferences.refreshFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="5min">Every 5 minutes</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="30min">Every 30 minutes</option>
                    <option value="hourly">Every hour</option>
                    <option value="manual">Manual only</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    How often data should update on your dashboard
                  </p>
                </div>

                {/* AI Explanation Verbosity */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    AI Explanation Verbosity
                  </label>
                  <select
                    name="aiVerbosity"
                    value={preferences.aiVerbosity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  >
                    <option value="brief">Brief</option>
                    <option value="standard">Standard</option>
                    <option value="detailed">Detailed</option>
                    <option value="expert">Expert Level</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    Level of detail in AI-generated insights and explanations
                  </p>
                </div>

                {/* Notification Preferences */}
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-black mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 accent-brown"
                      />
                      <span className="ml-3 text-sm text-neutral-700">
                        Email notifications for new insights
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 accent-brown"
                      />
                      <span className="ml-3 text-sm text-neutral-700">
                        Match result alerts
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-brown"
                      />
                      <span className="ml-3 text-sm text-neutral-700">
                        Weekly digest
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
