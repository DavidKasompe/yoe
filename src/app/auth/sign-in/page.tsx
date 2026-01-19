"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm, FormData } from "@/components/auth/AuthForm";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      if (!data.email || !data.password) {
        throw new Error("Email and password are required");
      }

      await login(data.email, data.password);
      router.push("/coach");
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* AuthHeader */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">YOE</h1>
          <p className="text-neutral-400">Competitive Intelligence Platform</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-2">Sign In</h2>
          <p className="text-neutral-600 text-sm mb-6">
            Access your YOE dashboard
          </p>

          <AuthForm
            mode="signin"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />

          {/* Sign Up Link */}
          <p className="text-center text-neutral-600 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-brown font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-8 text-neutral-500 text-xs">
          <p>YOE © 2026 - All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
