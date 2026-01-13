import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    displayName: user?.displayName || "",
    teamAffiliation: user?.teamAffiliation || "",
    region: user?.region || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateUser(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
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
                Profile Settings
              </h1>
              <p className="text-neutral-600">
                Manage your account information and personal details
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-neutral-200 rounded-lg p-8">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., Coach Jake"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Role
                  </label>
                  <div className="px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-700">
                    {user?.role}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Role cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Team Affiliation */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Affiliation
                  </label>
                  <input
                    type="text"
                    name="teamAffiliation"
                    value={formData.teamAffiliation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., Team Alpha"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a region</option>
                    <option value="NA">North America</option>
                    <option value="EU">Europe</option>
                    <option value="ASIA">Asia</option>
                    <option value="LAN">Latin America North</option>
                    <option value="LAS">Latin America South</option>
                    <option value="BR">Brazil</option>
                    <option value="KR">Korea</option>
                    <option value="CN">China</option>
                  </select>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-700">
                    {user?.email}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-200">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-brown text-white rounded-lg font-medium hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-neutral-300 text-black rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
