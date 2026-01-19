"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm, FormData } from "@/components/auth/AuthForm";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      if (!data.fullName || !data.email || !data.password) {
        throw new Error("All fields are required");
      }

      await register(data.fullName, data.email, data.password, data.role || "Coach");
      router.push("/coach");
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md my-8">
        {/* AuthHeader */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">YOE</h1>
          <p className="text-neutral-400">Competitive Intelligence Platform</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-2">Create Account</h2>
          <p className="text-neutral-600 text-sm mb-6">
            Join the elite circle of analysts
          </p>

          <AuthForm
            mode="signup"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />

          {/* Sign In Link */}
          <p className="text-center text-neutral-600 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-brown font-medium hover:underline"
            >
              Sign in
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
