"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { LeftSidebar } from "./LeftSidebar";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="flex pt-16">
        {showSidebar && <LeftSidebar />}
        <main
          className={
            showSidebar
              ? "flex-1 md:ml-56 p-8 overflow-y-auto"
              : "flex-1 p-8 overflow-y-auto"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
