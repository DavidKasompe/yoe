import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TopNav() {
  const location = useLocation();

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
        <div className="text-sm text-neutral-600">
          Team: Sample Organization
        </div>
      </div>
    </nav>
  );
}
