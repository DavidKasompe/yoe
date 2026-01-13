import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { Check, AlertCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const INTEGRATIONS = [
  {
    name: "GRID API",
    description: "Official League of Legends competitive data",
    status: "connected",
    lastSync: "Just now",
    icon: "🎮",
  },
  {
    name: "Discord",
    description: "Send alerts and insights to your Discord server",
    status: "pending",
    lastSync: null,
    icon: "💬",
  },
  {
    name: "Twitch",
    description: "Stream integration and live analytics",
    status: "available",
    lastSync: null,
    icon: "📺",
  },
  {
    name: "YouTube",
    description: "Embed clips and analytics in videos",
    status: "available",
    lastSync: null,
    icon: "📹",
  },
];

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <Check size={14} />
            Connected
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock size={14} />
            Coming Soon
          </div>
        );
      case "available":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
            <AlertCircle size={14} />
            Not Connected
          </div>
        );
      default:
        return null;
    }
  };

  const handleConnect = async (integrationName: string) => {
    setIsConnecting(integrationName);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIntegrations((prev) =>
        prev.map((int) =>
          int.name === integrationName
            ? { ...int, status: "connected", lastSync: "Just now" }
            : int
        )
      );
      toast.success(`${integrationName} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${integrationName}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (integrationName: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.name === integrationName
          ? { ...int, status: "available", lastSync: null }
          : int
      )
    );
    toast.success(`${integrationName} disconnected`);
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
                Integrations
              </h1>
              <p className="text-neutral-600">
                Connect external services to enhance your YOE experience
              </p>
            </div>

            {/* Integrations List */}
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="bg-white border border-neutral-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>

                  {/* Last Sync */}
                  {integration.lastSync && (
                    <div className="mb-4 text-xs text-neutral-500">
                      Last synced: {integration.lastSync}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex gap-3">
                    {integration.status === "connected" ? (
                      <>
                        <button className="flex-1 px-4 py-2 border border-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                          Settings
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.name)}
                          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.name)}
                        disabled={
                          isConnecting === integration.name ||
                          integration.status === "pending"
                        }
                        className="flex-1 px-4 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting === integration.name
                          ? "Connecting..."
                          : integration.status === "pending"
                            ? "Coming Soon"
                            : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Future Integrations Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                More Integrations Coming Soon
              </h3>
              <p className="text-sm text-blue-800">
                We're constantly adding new integrations to expand YOE's
                capabilities. Have a suggestion? Let us know!
              </p>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
