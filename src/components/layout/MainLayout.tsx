"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = "bg-background" }: MainLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <TopNav />
      <main className="pt-16 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
