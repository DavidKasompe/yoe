import { useState, useEffect } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { toast } from "sonner";

/**
 * Preferences Settings Page
 * /settings/preferences
 * 
 * Fetch preferences from GET /api/users/preferences
 * Render toggles & dropdowns
 * 
 * OnSave:
 *   Call PUT /api/users/preferences
 */
export function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    defaultGame: "LoL",
    dashboardLanding: "coach",
    refreshFrequency: "realtime",
    aiVerbosity: "detailed",
    notifications: {
      emailInsights: true,
      matchAlerts: true,
      weeklyDigest: false,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences from GET /api/users/preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch("/api/users/preferences", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPreferences({
            defaultGame: data.default_game || "LoL",
            dashboardLanding: data.dashboard_view || "coach",
            refreshFrequency: data.refresh_frequency || "realtime",
            aiVerbosity: data.ai_verbosity || "detailed",
            notifications: {
              emailInsights: data.notifications?.email_insights ?? true,
              matchAlerts: data.notifications?.match_alerts ?? true,
              weeklyDigest: data.notifications?.weekly_digest ?? false,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call PUT /api/users/preferences
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          default_game: preferences.defaultGame,
          dashboard_view: preferences.dashboardLanding,
          refresh_frequency: preferences.refreshFrequency,
          ai_verbosity: preferences.aiVerbosity,
          notifications: {
            email_insights: preferences.notifications.emailInsights,
            match_alerts: preferences.notifications.matchAlerts,
            weekly_digest: preferences.notifications.weeklyDigest,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update preferences"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="max-w-2xl">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading preferences...</p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Preferences</h1>
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
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
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
                    name="emailInsights"
                    checked={preferences.notifications.emailInsights}
                    onChange={handleNotificationChange}
                    className="w-4 h-4 accent-brown"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Email notifications for new insights
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="matchAlerts"
                    checked={preferences.notifications.matchAlerts}
                    onChange={handleNotificationChange}
                    className="w-4 h-4 accent-brown"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Match result alerts
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="weeklyDigest"
                    checked={preferences.notifications.weeklyDigest}
                    onChange={handleNotificationChange}
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
    </SettingsLayout>
  );
}
