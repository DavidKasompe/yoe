import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthForm, FormData } from "@/components/auth/AuthForm";

/**
 * Sign In Page
 * /auth/sign-in
 * 
 * Users authenticate using email/password or OAuth providers.
 * On success, a signed JWT is issued and stored securely.
 */
export function SignIn() {
  const navigate = useNavigate();
  const { login, getOAuthUrl } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);

    try {
      if (!data.email || !data.password) {
        throw new Error("Email and password are required");
      }

      await login(data.email, data.password);
      navigate("/coach");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    setOauthLoading(provider);
    setError("");

    try {
      // Store provider for callback
      sessionStorage.setItem("oauth_provider", provider);
      
      const url = await getOAuthUrl(provider);
      
      if (url) {
        // Redirect to OAuth provider
        window.location.href = url;
      } else {
        setError(`${provider} sign in is not configured. Please use email/password.`);
        setOauthLoading(null);
      }
    } catch (err) {
      setError("Failed to initiate OAuth login. Please try again.");
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* AuthHeader (YOE logo + tagline) */}
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
              <span className="px-2 bg-white text-neutral-600">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={oauthLoading !== null}
              className="w-full border border-neutral-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
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
              )}
              <span className="text-sm font-medium text-black">
                {oauthLoading === "google" ? "Connecting..." : "Sign in with Google"}
              </span>
            </button>

            {/* Discord Sign In */}
            <button
              onClick={() => handleOAuthLogin("discord")}
              disabled={oauthLoading !== null}
              className="w-full border border-neutral-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === "discord" ? (
                <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#5865F2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              )}
              <span className="text-sm font-medium text-black">
                {oauthLoading === "discord" ? "Connecting..." : "Sign in with Discord"}
              </span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-neutral-600 text-sm mt-6">
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
