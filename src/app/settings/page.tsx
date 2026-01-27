"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Zap } from "lucide-react";
import { useState } from "react";

// Settings Card Component
const SettingsCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    rounded-2xl overflow-hidden
    bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950
    border border-white/[0.08]
    shadow-lg shadow-black/50
    p-6
    ${className}
  `}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

export default function SettingsPage() {
  const [gridApiKey, setGridApiKey] = useState(process.env.NEXT_PUBLIC_GRID_API_KEY || "");
  const [riotApiKey, setRiotApiKey] = useState(process.env.NEXT_PUBLIC_RIOT_API_KEY || "");
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <MainLayout>
      <div className="min-h-screen bg-black -m-10 p-10 pt-16">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">SETTINGS</h1>
            <p className="text-neutral-400 text-sm">Configure your YOE platform preferences and integrations</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* API Configuration */}
            <div className="col-span-12 lg:col-span-8">
              <SettingsCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                    <Database size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">API Configuration</h2>
                    <p className="text-xs text-neutral-500">Manage your API keys for live data integration</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* GRID API Key */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                      GRID Live Data Feed API Key
                    </label>
                    <input
                      type="password"
                      value={gridApiKey}
                      onChange={(e) => setGridApiKey(e.target.value)}
                      placeholder="Enter your GRID API key..."
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-brown-light transition-colors"
                    />
                    <p className="text-xs text-neutral-600 mt-2">
                      Get your API key from <a href="https://grid.gg" target="_blank" className="text-brown-light hover:underline">grid.gg</a>
                    </p>
                  </div>

                  {/* Riot API Key */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                      Riot Games API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={riotApiKey}
                      onChange={(e) => setRiotApiKey(e.target.value)}
                      placeholder="Enter your Riot API key..."
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-brown-light transition-colors"
                    />
                    <p className="text-xs text-neutral-600 mt-2">
                      Used for additional player and match data. Get it from <a href="https://developer.riotgames.com" target="_blank" className="text-brown-light hover:underline">developer.riotgames.com</a>
                    </p>
                  </div>

                  <button className="px-6 py-3 bg-gradient-to-r from-brown to-brown-light hover:from-brown-light hover:to-brown text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brown/20">
                    Save API Keys
                  </button>
                </div>
              </SettingsCard>

              {/* Preferences */}
              <SettingsCard className="mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                    <Zap size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Preferences</h2>
                    <p className="text-xs text-neutral-500">Customize your experience</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Auto Refresh */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-sm font-semibold text-white">Auto-refresh live data</div>
                      <div className="text-xs text-neutral-500">Automatically update dashboard data every 30 seconds</div>
                    </div>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoRefresh ? 'bg-brown-light' : 'bg-neutral-700'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-sm font-semibold text-white">Enable notifications</div>
                      <div className="text-xs text-neutral-500">Get alerts for important game events</div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications ? 'bg-brown-light' : 'bg-neutral-700'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Sidebar - Account Info */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <SettingsCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brown/30 to-brown-light/30 flex items-center justify-center">
                    <User size={20} className="text-brown-light" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Account</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-neutral-500">Email</div>
                    <div className="text-sm text-white font-medium">coach@yoe.gg</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Role</div>
                    <div className="text-sm text-white font-medium">Assistant Coach</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Team</div>
                    <div className="text-sm text-white font-medium">T1</div>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                    <Shield size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Status</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">GRID Connection</span>
                    <span className="text-xs font-bold text-green-400">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Data Sync</span>
                    <span className="text-xs font-bold text-green-400">Live</span>
                  </div>
                </div>
              </SettingsCard>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
