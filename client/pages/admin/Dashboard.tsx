import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { AuditEvent } from "@shared/api";
import { Shield, Users, Activity, Lock } from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
        const headers = { 
          Authorization: `Bearer ${storedTokens?.accessToken}`,
          "Content-Type": "application/json"
        };

        const [logsRes, eventsRes] = await Promise.all([
          fetch("/api/admin/audit-logs/", { headers }),
          fetch("/api/admin/security-events/", { headers }),
        ]);

        if (logsRes.ok) {
          const data = await logsRes.json();
          // Adjust for Django response structure
          setAuditLogs(data.results || data);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setSecurityEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Admin Console</h1>
            <p className="text-neutral-600">
              System administration and security monitoring
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg max-w-md">
            <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
              <Shield size={16} />
              Foundational Data Layer
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              YOE integrates official GRID GraphQL APIs as a foundational data layer, transforming static and aggregated esports data into actionable intelligence using analytics, ML models, and explainable AI.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Events</p>
                <h3 className="text-2xl font-bold">{(securityEvents as any).total_events || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Active Sessions</p>
                <h3 className="text-2xl font-bold">42</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Security Alerts</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <Lock size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Failed Logins</p>
                <h3 className="text-2xl font-bold">{(securityEvents as any).failed_logins || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-bold text-black">Recent Audit Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Event Type</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">IP Address</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      Loading logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 text-neutral-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-black">
                        {log.event_type}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 font-mono text-xs">
                        {log.username || "-"}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 font-mono text-xs">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.event_type !== 'ACCESS_DENIED'
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.event_type !== 'ACCESS_DENIED' ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 truncate max-w-xs">
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
