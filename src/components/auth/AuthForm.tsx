"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
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
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Full Name (Sign Up) */}
      {mode === "signup" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 ml-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={cn(
                "w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black",
                validationErrors.fullName && "border-destructive focus:ring-destructive"
              )}
            />
          </div>
          {validationErrors.fullName && (
            <p className="text-destructive text-xs ml-1 mt-1">
              {validationErrors.fullName}
            </p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700 ml-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className={cn(
              "w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black",
              validationErrors.email && "border-destructive focus:ring-destructive"
            )}
          />
        </div>
        {validationErrors.email && (
          <p className="text-destructive text-xs ml-1 mt-1">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Role (Sign Up) */}
      {mode === "signup" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 ml-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black"
          >
            <option value="Coach">Coach</option>
            <option value="Analyst">Analyst</option>
            <option value="Player">Player</option>
          </select>
        </div>
      )}

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-medium text-neutral-700">
            Password
          </label>
          {mode === "signin" && (
            <button
              type="button"
              className="text-xs text-brown font-medium hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={cn(
              "w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black",
              validationErrors.password && "border-destructive focus:ring-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-destructive text-xs ml-1 mt-1">
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password (Sign Up) */}
      {mode === "signup" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={cn(
                "w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent transition-all text-black",
                validationErrors.confirmPassword && "border-destructive focus:ring-destructive"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-destructive text-xs ml-1 mt-1">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Remember Me (Sign In) */}
      {mode === "signin" && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 rounded border-neutral-300 text-brown focus:ring-brown"
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-neutral-600 cursor-pointer"
          >
            Remember for 30 days
          </label>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : mode === "signin" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
