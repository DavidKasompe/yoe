"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Target, Zap } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: "coach",
    icon: <BarChart3 size={28} className="text-white" />,
    title: "Coach Dashboard",
    description:
      "Real-time KPIs, win rates, objective control, and performance metrics with AI-powered recommendations for live game analysis.",
    image: "/coach-dashboard.png",
  },
  {
    id: "scout",
    icon: <Target size={28} className="text-white" />,
    title: "Scouting Reports",
    description:
      "Auto-generated opponent analysis, player tendencies, and strategic breakdowns for competitive advantage against any team.",
    image: "/scout-dashboard.png",
  },
  {
    id: "draft",
    icon: <Zap size={28} className="text-white" />,
    title: "Draft Intelligence",
    description:
      "Live draft simulation and AI pick/ban recommendations with confidence indicators to dominate champion select.",
    image: "/draft-dashboard.png",
  },
];

export function AnimatedFeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const textCardsRef = useRef<HTMLDivElement[]>([]);
  const imageWrappersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    // Create the main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: sticky,
        pinSpacing: false,
      },
    });

    // Initial state: first card and image visible
    gsap.set(textCardsRef.current[0], { x: 0, opacity: 1 });
    gsap.set(imageWrappersRef.current[0], { y: 0, opacity: 1 });

    // Hide other cards initially
    textCardsRef.current.slice(1).forEach((card) => {
      gsap.set(card, { x: "100%", opacity: 0 });
    });
    imageWrappersRef.current.slice(1).forEach((img) => {
      gsap.set(img, { y: "135%", opacity: 0 });
    });

    // Transition from Coach to Scout (at 33% scroll)
    tl.to(
      textCardsRef.current[0],
      { x: "-100%", opacity: 0, duration: 0.5 },
      0.33
    )
      .to(imageWrappersRef.current[0], { y: "-135%", opacity: 0, duration: 0.5 }, 0.33)
      .to(textCardsRef.current[1], { x: 0, opacity: 1, duration: 0.5 }, 0.33)
      .to(imageWrappersRef.current[1], { y: 0, opacity: 1, duration: 0.5 }, 0.33);

    // Transition from Scout to Draft (at 66% scroll)
    tl.to(
      textCardsRef.current[1],
      { x: "-100%", opacity: 0, duration: 0.5 },
      0.66
    )
      .to(imageWrappersRef.current[1], { y: "-135%", opacity: 0, duration: 0.5 }, 0.66)
      .to(textCardsRef.current[2], { x: 0, opacity: 1, duration: 0.5 }, 0.66)
      .to(imageWrappersRef.current[2], { y: 0, opacity: 1, duration: 0.5 }, 0.66);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-black -mt-24"
      style={{ height: "300vh" }} // 3 sections x 100vh
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-start"
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center relative">
            {/* Shadow divider between text and image */}
            {/* Shadow divider removed to prevent visual obstruction */}
            
            {/* Text Column - Left Side - with solid black background */}
            <div className="relative h-[400px] z-20 bg-black overflow-hidden">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.id}
                  ref={(el) => {
                    if (el) textCardsRef.current[index] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className="w-14 h-14 bg-brown rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brown/20">
                    {feature.icon}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                  <div className="mt-8 flex gap-2">
                    {FEATURES.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === index ? "bg-brown w-8" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Image Column - Right Side */}
            <div className="relative h-[600px] flex items-center justify-center">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.id}
                  ref={(el) => {
                    if (el) imageWrappersRef.current[index] = el;
                  }}
                  className="absolute w-full max-w-[90%]"
                  style={{ willChange: "transform, opacity" }}
                >
                  <div className="relative rounded-[32px] overflow-hidden bg-black border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.02)]">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto object-cover block"
                    />
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
