import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * OAuth Callback Page
 * /auth/oauth/callback
 * 
 * Handles OAuth provider redirects and completes authentication
 */
export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const getProvider = (): "google" | "discord" | null => {
        const p = searchParams.get("provider") || sessionStorage.getItem("oauth_provider");
        if (p === "google" || p === "discord") return p;
        return null;
      };

      const provider = getProvider();

      // Check for errors from OAuth provider
      if (errorParam) {
        setError(`OAuth error: ${errorParam}`);
        setIsProcessing(false);
        return;
      }

      // Verify state to prevent CSRF
      const storedState = sessionStorage.getItem("oauth_state");
      if (state && storedState && state !== storedState) {
        setError("Invalid state parameter. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (!code || !provider) {
        setError("Missing authorization code or provider");
        setIsProcessing(false);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/oauth/callback`;
        await loginWithOAuth(provider, code, redirectUri);
        
        // Clear stored OAuth data
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_provider");
        
        // Redirect to dashboard
        navigate("/coach", { replace: true });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "OAuth authentication failed. Please try again."
        );
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, loginWithOAuth, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">YOE</h1>
          <p className="text-neutral-400">Competitive Intelligence Platform</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          {isProcessing ? (
            <>
              <div className="w-12 h-12 border-4 border-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-black mb-2">
                Completing Sign In
              </h2>
              <p className="text-neutral-600">
                Please wait while we verify your account...
              </p>
            </>
          ) : error ? (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-black mb-2">
                Authentication Failed
              </h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <button
                onClick={() => navigate("/auth/sign-in")}
                className="w-full bg-brown text-white py-2 rounded-lg font-medium hover:bg-brown-light transition-colors"
              >
                Back to Sign In
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
