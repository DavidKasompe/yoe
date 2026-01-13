import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut } from "lucide-react";
import { useState } from "react";

export function TopNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const modules = [
    { name: "Coach", path: "/coach" },
    { name: "Scout", path: "/scout" },
    { name: "Draft", path: "/draft" },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-50">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-bold text-xl text-black">
            YOE
          </Link>
          <div className="flex gap-6">
            {modules.map((module) => (
              <Link
                key={module.path}
                to={module.path}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(module.path)
                    ? "text-black border-b-2 border-brown"
                    : "text-neutral-600 hover:text-black"
                )}
              >
                {module.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-600">
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 border-b border-neutral-200"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="px-4 py-3 text-xs text-neutral-600 border-b border-neutral-200">
                    <p className="font-medium">{user.fullName}</p>
                    <p>{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
