"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-16 p-10 overflow-y-auto bg-background/50">
        {children}
      </main>
    </div>
  );
}
