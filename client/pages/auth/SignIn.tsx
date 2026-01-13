import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthForm, FormData } from "@/components/auth/AuthForm";
import { Mail } from "lucide-react";

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      navigate("/coach");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-600">Or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button className="w-full border border-neutral-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors mb-6">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium text-black">
              Sign in with Google
            </span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-neutral-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="text-brown font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-neutral-500 text-xs">
          <p>YOE © 2024 - All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
