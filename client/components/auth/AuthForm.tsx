import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface FormData {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  rememberMe?: boolean;
}

export function AuthForm({
  mode,
  onSubmit,
  isLoading = false,
  error,
}: AuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Coach",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (mode === "signup" && !formData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (mode === "signup") {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error for this field
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Full Name (Sign Up) */}
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown",
              validationErrors.fullName
                ? "border-red-500 focus:ring-red-500"
                : "border-neutral-300",
            )}
            placeholder="John Doe"
            disabled={isLoading}
          />
          {validationErrors.fullName && (
            <p className="text-red-600 text-sm mt-1">
              {validationErrors.fullName}
            </p>
          )}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3 text-neutral-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={cn(
              "w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown",
              validationErrors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-neutral-300",
            )}
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>
        {validationErrors.email && (
          <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Password
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3 text-neutral-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={cn(
              "w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown",
              validationErrors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-neutral-300",
            )}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-neutral-400 hover:text-black"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-red-600 text-sm mt-1">
            {validationErrors.password}
          </p>
        )}
        {mode === "signup" && (
          <p className="text-neutral-600 text-xs mt-1">
            At least 8 characters recommended
          </p>
        )}
      </div>

      {/* Confirm Password (Sign Up) */}
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-3 text-neutral-400"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              className={cn(
                "w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown",
                validationErrors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-neutral-300",
              )}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-black"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Role Selection (Sign Up) */}
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            I am a...
          </label>
          <select
            name="role"
            value={formData.role || "Coach"}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
            disabled={isLoading}
          >
            <option value="Coach">Coach</option>
            <option value="Analyst">Analyst</option>
            <option value="Player">Player</option>
          </select>
        </div>
      )}

      {/* Remember Me (Sign In) */}
      {mode === "signin" && (
        <label className="flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe || false}
            onChange={handleChange}
            className="w-4 h-4 accent-brown"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-neutral-700">Remember me</span>
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brown text-white py-2 rounded-lg font-medium hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Loading..."
          : mode === "signin"
            ? "Sign In"
            : "Create Account"}
      </button>
    </form>
  );
}
