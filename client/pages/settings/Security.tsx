import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { AlertTriangle, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordStrength =
    newPassword.length >= 8 ? "strong" : newPassword.length >= 6 ? "medium" : "";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FAToggle = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTwoFAEnabled(!twoFAEnabled);
      toast.success(
        twoFAEnabled ? "2FA disabled" : "2FA enabled successfully!"
      );
    } catch (error) {
      toast.error("Failed to update 2FA settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In real implementation, would call API with confirmation
    toast.success("Account deletion request submitted");
    setShowDeleteConfirm(false);
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="flex min-h-screen">
        <SettingsSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                Security Settings
              </h1>
              <p className="text-neutral-600">
                Manage your password, 2FA, and active sessions
              </p>
            </div>

            {/* Change Password */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-6">
              <h2 className="text-lg font-bold text-black mb-6">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength === "strong"
                            ? "bg-green-600"
                            : passwordStrength === "medium"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                      ></div>
                      <span className="text-xs font-medium text-neutral-600">
                        {passwordStrength === "strong"
                          ? "Strong"
                          : passwordStrength === "medium"
                            ? "Medium"
                            : "Weak"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-brown text-white py-2 rounded-lg font-medium hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Two Factor Authentication */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-black">
                    Two Factor Authentication
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={handle2FAToggle}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    twoFAEnabled
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-brown text-white hover:bg-brown-light"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {twoFAEnabled ? "Disable" : "Enable"}
                </button>
              </div>
              {twoFAEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Check size={20} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      2FA is enabled
                    </p>
                    <p className="text-xs text-green-700">
                      Your account is protected with two-factor authentication
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-6">
              <h2 className="text-lg font-bold text-black mb-4">
                Active Sessions
              </h2>
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-black">Chrome on MacOS</p>
                    <p className="text-sm text-neutral-600">
                      Last active: Just now
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Current
                  </span>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-black">Safari on iPhone</p>
                    <p className="text-sm text-neutral-600">
                      Last active: 2 hours ago
                    </p>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Sign out
                  </button>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                Sign out of all other sessions
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={24} className="text-red-600 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                  <p className="text-sm text-red-800 mt-1">
                    Permanent account actions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>

              {showDeleteConfirm && (
                <div className="mt-4 bg-white border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-black mb-4">
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    >
                      Delete My Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 border border-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
