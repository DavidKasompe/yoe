"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Target, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { AnimatedFeaturesSection } from "@/components/landing/AnimatedFeaturesSection";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/yoe.png" alt="YOE Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link
                href="/coach"
                className="bg-brown text-white px-6 py-2 rounded font-medium hover:bg-brown-light transition-colors"
              >
                Launch App
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-white px-6 py-2 rounded font-medium hover:bg-white/10 transition-colors border border-white/20"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-brown text-white px-6 py-2 rounded font-medium hover:bg-brown-light transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-0">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-5xl">
            Competitive Intelligence for Champions
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-10 max-w-3xl leading-relaxed">
            YOE empowers coaches, scouts, and analysts with AI-driven insights
            for competitive League of Legends teams. Analyze opponents,
            optimize picks, and dominate the draft.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-2">
            <Link
              href="/coach"
              className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
            <button className="border-2 border-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors">
              See The Platform
            </button>
          </div>

          <div className="relative w-full max-w-6xl">
            <div className="relative transform hover:scale-[1.01] transition-transform duration-700 ease-out">
              <img
                src="/hero-dashboard-hd.png"
                alt="YOE Analytics Dashboard"
                className="w-full h-auto block drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animated Features Section */}
      <AnimatedFeaturesSection />

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-[#111] border border-white/10 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Start using YOE and gain competitive intelligence advantage
          </p>
          <Link
            href="/coach"
            className="bg-brown text-white px-8 py-3 rounded font-medium hover:bg-brown-light transition-colors"
          >
            Access Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-neutral-500">
            © 2026 YOE. Professional esports analytics platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
