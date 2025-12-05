import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import OrderHistory from "./OrderHistory";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  type UserProfile as UserProfileType,
} from "../utils/userHelpers";

interface UserProfileProps {
  onGoHome?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onGoHome }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          setFormData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            address: profile.address || "",
            city: profile.city || "",
            zipCode: profile.zipCode || "",
            phone: profile.phone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate form data
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("⚠️ First name and last name are required!");
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Saving profile data:", formData);

      await updateUserProfile(user.uid, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        phone: formData.phone.trim(),
      });

      console.log("✅ Profile saved, fetching updated data...");

      // Refresh profile data
      const updatedProfile = await getUserProfile(user.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        console.log("✅ Profile refreshed:", updatedProfile);
      }

      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      const err = error as { message?: string };
      console.error("❌ Error updating profile:", error);
      alert(`❌ Failed to update profile: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current profile data
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        zipCode: userProfile.zipCode || "",
        phone: userProfile.phone || "",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Step 1: First confirmation
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account?\n\n" +
        "This action cannot be undone and will permanently delete:\n" +
        "• All your personal information\n" +
        "• Your order history\n" +
        "• Your account access\n\n" +
        "Click OK to continue."
    );

    if (!confirmDelete) return;

    // Step 2: Ask for password (re-authentication required by Firebase)
    const password = window.prompt(
      "🔐 For security, please enter your password to confirm account deletion:"
    );

    if (!password) {
      alert("Account deletion cancelled.");
      return;
    }

    // Step 3: Final confirmation with typed DELETE
    const confirmText = window.prompt(
      "⚠️ FINAL WARNING!\n\n" +
        "Type 'DELETE' (in capital letters) to permanently delete your account:"
    );

    if (confirmText !== "DELETE") {
      alert("Account deletion cancelled. The text did not match.");
      return;
    }

    try {
      // Re-authenticate user before deletion (Firebase requirement)
      if (!user.email) {
        alert("❌ Unable to verify your email address.");
        return;
      }

      console.log("🔐 Re-authenticating user...");
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("✅ Re-authentication successful");

      // Delete user data from Firestore
      console.log("🗑️ Deleting user data from Firestore...");
      await deleteUserAccount(user.uid);
      console.log("✅ User data deleted from Firestore");

      // Delete user from Firebase Auth
      console.log("🗑️ Deleting user from Firebase Auth...");
      await deleteUser(user);
      console.log("✅ User deleted from Firebase Auth");

      alert(
        "✅ Your account has been permanently deleted. You will now be logged out."
      );

      // Redirect to home
      if (onGoHome) {
        onGoHome();
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("❌ Error deleting account:", error);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);

      // Handle specific errors
      if (err?.code === "auth/wrong-password") {
        alert("❌ Incorrect password. Account deletion cancelled.");
      } else if (err?.code === "auth/too-many-requests") {
        alert("❌ Too many failed attempts. Please try again later.");
      } else if (err?.code === "auth/requires-recent-login") {
        alert(
          "❌ For security reasons, please log out and log back in, then try deleting your account again."
        );
      } else if (err?.code === "auth/invalid-credential") {
        alert("❌ Invalid password. Please try again.");
      } else {
        alert(
          `❌ Failed to delete account: ${err?.message || "Unknown error"}`
        );
      }
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-dark mb-3">
            <i className="bi bi-person-circle me-2"></i>
            My Account
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            data-tab="profile"
          >
            <i className="bi bi-person me-2"></i>
            Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            data-tab="orders"
          >
            <i className="bi bi-bag-check me-2"></i>
            Order History
          </button>
        </li>
      </ul>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Profile Information</h5>
                {!isEditing && (
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="card-body">
                {!isEditing ? (
                  // View Mode
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="text-muted small">
                          Email Address
                        </label>
                        <p className="text-dark fw-bold mb-0">{user.email}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small">
                          Account Status
                        </label>
                        <p className="mb-0">
                          <span className="badge bg-success">Active</span>
                        </p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="text-muted small">First Name</label>
                        <p className="text-dark mb-0">
                          {userProfile?.firstName || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small">Last Name</label>
                        <p className="text-dark mb-0">
                          {userProfile?.lastName || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="text-muted small">Address</label>
                        <p className="text-dark mb-0">
                          {userProfile?.address || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="text-muted small">City</label>
                        <p className="text-dark mb-0">
                          {userProfile?.city || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small">Zip Code</label>
                        <p className="text-dark mb-0">
                          {userProfile?.zipCode || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="text-muted small">Phone</label>
                        <p className="text-dark mb-0">
                          {userProfile?.phone || (
                            <em className="text-muted">Not set</em>
                          )}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small">Member Since</label>
                        <p className="text-dark mb-0">
                          {user.metadata?.creationTime
                            ? new Date(
                                user.metadata.creationTime
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-muted small">User ID</label>
                      <p className="text-dark small mb-0">
                        <code>{user.uid}</code>
                      </p>
                    </div>
                  </>
                ) : (
                  // Edit Mode
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-dark">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-dark">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-dark">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark">Zip Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="Enter zip code"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-dark">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card shadow-sm border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Danger Zone
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Once you delete your account, there is no going back. This
                  will permanently delete:
                </p>
                <ul className="text-muted small">
                  <li>Your profile information</li>
                  <li>Your order history</li>
                  <li>All associated data</li>
                </ul>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && <OrderHistory onGoHome={onGoHome} />}
    </div>
  );
};

export default UserProfile;
