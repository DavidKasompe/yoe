"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut } from "lucide-react";
import { useState } from "react";

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const modules = [
    { name: "Coach", path: "/coach" },
    { name: "Scout", path: "/scout" },
    { name: "Draft", path: "/draft" },
  ];

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50">
      <div className="h-full flex items-center justify-between px-6">
        {/* Logo on left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src="/yoe.png" alt="YOE Logo" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        
        {/* Navigation buttons in center */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-6">
          {modules.map((module) => (
            <Link
              key={module.path}
              href={module.path}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(module.path)
                  ? "text-white border-b-2 border-brown-light"
                  : "text-neutral-400 hover:text-white",
              )}
            >
              {module.name}
            </Link>
          ))}
        </div>
        
        {/* User menu on right */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            Team: Sample Organization
          </div>
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-brown rounded-full flex items-center justify-center text-white font-bold hover:bg-brown-light transition-colors"
                title={user.fullName}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-lg shadow-lg">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-300 hover:bg-white/5 border-b border-white/10"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="px-4 py-3 text-xs text-neutral-400 border-b border-white/10">
                    <p className="font-medium text-white">{user.fullName}</p>
                    <p>{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
