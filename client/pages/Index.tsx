import { useNavigate } from "react-router-dom";
import { BarChart3, Target, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export function Index() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await login("demo@yoe.com", "demopassword");
      navigate("/coach");
    } catch {
      // Demo login for testing
      const mockUser = {
        id: "demo-user",
        email: "demo@yoe.com",
        fullName: "Demo Coach",
        displayName: "Coach Demo",
        role: "Coach" as const,
        teamAffiliation: "Demo Team",
        region: "NA",
      };
      localStorage.setItem("authToken", "demo-token");
      localStorage.setItem("user", JSON.stringify(mockUser));
      window.location.href = "/coach";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-black">YOE</div>
          <div className="flex gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/settings")}
                  className="text-black px-6 py-2 rounded font-medium hover:bg-neutral-100 transition-colors border border-black"
                >
                  Settings
                </button>
                <button
                  onClick={() => navigate("/coach")}
                  className="bg-brown text-white px-6 py-2 rounded font-medium hover:bg-brown-light transition-colors"
                >
                  Launch App
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDemoLogin}
                  className="text-black px-6 py-2 rounded font-medium hover:bg-neutral-100 transition-colors border border-black"
                >
                  Demo Login
                </button>
                <button
                  onClick={() => navigate("/auth/sign-in")}
                  className="text-black px-6 py-2 rounded font-medium hover:bg-neutral-100 transition-colors border border-black"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth/sign-up")}
                  className="bg-brown text-white px-6 py-2 rounded font-medium hover:bg-brown-light transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
              Competitive Intelligence for Champions
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              YOE empowers coaches, scouts, and analysts with AI-driven insights
              for competitive League of Legends teams. Analyze opponents, optimize
              picks, and dominate the draft.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/coach")}
                className="bg-black text-white px-8 py-3 rounded font-medium hover:bg-neutral-900 transition-colors"
              >
                Get Started
              </button>
              <button className="border-2 border-black text-black px-8 py-3 rounded font-medium hover:bg-neutral-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="bg-neutral-100 rounded-lg h-96 flex items-center justify-center border border-neutral-200">
            <div className="text-center">
              <BarChart3 size={64} className="mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-500">Advanced Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <div className="w-12 h-12 bg-brown rounded-lg flex items-center justify-center mb-4">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Coach Dashboard
            </h3>
            <p className="text-neutral-600">
              Real-time KPIs, win rates, objective control, and performance
              metrics with AI-powered recommendations.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <div className="w-12 h-12 bg-brown rounded-lg flex items-center justify-center mb-4">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Scouting Reports
            </h3>
            <p className="text-neutral-600">
              Auto-generated opponent analysis, player tendencies, and strategic
              breakdowns for competitive advantage.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <div className="w-12 h-12 bg-brown rounded-lg flex items-center justify-center mb-4">
              <Zap size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Draft Intelligence
            </h3>
            <p className="text-neutral-600">
              Live draft simulation and AI pick/ban recommendations with
              confidence indicators.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Start using YOE and gain competitive intelligence advantage
          </p>
          <button
            onClick={() => navigate("/coach")}
            className="bg-brown text-white px-8 py-3 rounded font-medium hover:bg-brown-light transition-colors"
          >
            Access Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-neutral-600">
            © 2024 YOE. Professional esports analytics platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
