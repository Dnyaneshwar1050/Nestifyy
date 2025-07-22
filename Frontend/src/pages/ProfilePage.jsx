import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Loader2,
  Frown,
  CheckCircle,
  Camera,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const ProfilePage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const { id } = useParams();
  const [editForm, setEditForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    roleSpecific: true,
    roomRequest: false, // New state for room request section
  });
  const [roomRequestForm, setRoomRequestForm] = useState({
    budget: "",
    location: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const token = localStorage.getItem("token");
        if (!token && !id) {
          throw new Error("No authentication token found");
        }

        const apiUrl = id
          ? `https://nestifyy-my3u.onrender.com/api/user/${id}`
          : `https://nestifyy-my3u.onrender.com/api/user/profile`;
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data.user || response.data;
        setUser(userData);
        setEditForm(userData);
        if (userData.photo) {
          setPreviewUrl(userData.photo);
        }
        setSuccess("Profile loaded successfully!");
        trackInteraction("data_fetch", "profile_success", {
          userId: id || "current_user",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch profile";
        setError(errorMessage);
        trackInteraction("data_fetch", "profile_failure", {
          userId: id || "current_user",
          error: errorMessage,
        });
        if (err.response?.status === 401 || errorMessage.includes("token")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!id && !isAuthenticated) {
      navigate("/login");
    } else {
      fetchUser();
    }
  }, [id, isAuthenticated, navigate, trackInteraction]);

  // Handle file selection for photo upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        setError("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
      setSuccess("Photo selected successfully!");
      trackInteraction("file_select", "profile_photo_edit");
    } else {
      setError("No file selected");
    }
  };
  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field === "location" && !value.trim()) {
      setError("Location cannot be empty");
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  // Handle nested field changes
  const handleNestedInputChange = (parentField, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [parentField]: { ...prev[parentField], [field]: value },
    }));
  };

  // Handle room request form changes
  const handleRoomRequestChange = (field, value) => {
    setRoomRequestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Save profile changes
  // ProfilePage.jsx - handleSave
const handleSave = async () => {
  setSaveLoading(true);
  setError("");
  setSuccess("");
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    const editableFields = { ...editForm };
    // Remove non-editable fields
    delete editableFields.name;
    delete editableFields.gender;
    delete editableFields.age;

    Object.keys(editableFields).forEach((key) => {
      if (editableFields[key] !== null && editableFields[key] !== undefined) {
        if (key === "brokerInfo" || key === "preferences") {
          formData.append(key, JSON.stringify(editableFields[key]));
        } else if (key !== "photo") {
          formData.append(key, editableFields[key]);
        }
      }
    });
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    const response = await axios.put(
      `https://nestifyy-my3u.onrender.com/api/user/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUser(response.data.user);
    setEditForm(response.data.user);
    setIsEditing(false);
    setSuccess("Profile updated successfully!");
    trackInteraction("profile_management", "profile_update_success");
    if (previewUrl && selectedFile) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(
      response.data.user.photo
        ? response.data.user.photo.startsWith("http")
          ? response.data.user.photo
          : `https://nestifyy-my3u.onrender.com/${response.data.user.photo}`
        : ""
    );
    setSelectedFile(null);
  } catch (err) {
    console.error("Profile update error:", err);
    setError(
      err.response?.data?.message || err.message || "Failed to update profile"
    );
    trackInteraction("profile_management", "profile_update_failure", {
      error: err.response?.data?.message || err.message,
    });
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setSaveLoading(false);
  }
};
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user);
    setError("");
    setSuccess("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(
      user?.photo ? `https://nestifyy-my3u.onrender.com/${user.photo}` : ""
    );
    setSelectedFile(null);
    trackInteraction("click", "profile_cancel_edit");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-maroon animate-spin" />
          <p className="text-black font-medium text-lg">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!user && error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full border border-warm-gray text-center">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Error Loading Profile</h2>
          </div>
          <p className="text-black mb-6 text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-maroon text-white py-2 px-4 rounded-lg hover:bg-deep-maroon transition-colors font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full border border-warm-gray text-center">
          <div className="flex items-center justify-center gap-3 text-yellow-600 mb-4">
            <Frown className="w-8 h-8" />
            <h2 className="text-xl font-bold">No Profile Found</h2>
          </div>
          <p className="text-black mb-6 text-base">
            Please log in to view your profile or ensure the URL is correct.
          </p>
          <Link
            to="/login"
            className="w-full bg-maroon text-white py-2 px-4 rounded-lg hover:bg-deep-maroon transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
            onClick={() =>
              trackInteraction("click", "profile_no_profile_go_login")
            }
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-lg mb-4 shadow-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm sm:text-base">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-4 shadow-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 border border-warm-gray">
          <div className="h-32 sm:h-40 bg-blue-500 relative">
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-6">
              <div className="relative">
                <img
                  src={
                    previewUrl ||
                    (user.photo
                      ? user.photo.startsWith("http")
                        ? user.photo
                        : `https://nestifyy-my3u.onrender.com/${user.photo}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&size=96&background=004dc3&color=FFFFFF`)
                  }
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover"
                />
                {isEditing && !id && (
                  <label className="absolute bottom-0 right-0 bg-maroon rounded-full p-1.5 sm:p-2 cursor-pointer shadow-md hover:bg-deep-maroon transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="pt-16 sm:pt-20 pb-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="text-2xl sm:text-3xl font-bold text-black bg-transparent border-b-2 border-maroon/20 focus:border-maroon outline-none w-full"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold text-black truncate">
                      {user.name}
                    </h1>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-2 text-sm sm:text-base">
                  <div className="flex items-center text-black">
                    <Mail className="w-4 h-4 mr-2 text-maroon flex-shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-[300px]">
                      {user.email}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-black">
                      <Phone className="w-4 h-4 mr-2 text-maroon flex-shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">
                        {user.phone}
                      </span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center text-black">
                      <MapPin className="w-4 h-4 mr-2 text-maroon flex-shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">
                        {user.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {!isEditing ? (
                  <>
                    <Link
                      to="/"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-warm-gray text-black px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium shadow-sm text-sm sm:text-base"
                      onClick={() =>
                        trackInteraction("click", "profile_back_to_home")
                      }
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Link>
                    {!id && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          trackInteraction("click", "profile_toggle_edit");
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-maroon text-white px-3 py-2 rounded-lg hover:bg-deep-maroon transition-colors font-medium shadow-sm text-sm sm:text-base"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saveLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-warm-gray text-black px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-maroon text-white px-3 py-2 rounded-lg hover:bg-deep-maroon transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-gray">
            <div
              className="bg-gradient-to-r from-maroon to-light-maroon px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("personal")}
            >
              <h2 className="text-lg sm:text-xl font-bold text-black flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              {expandedSections.personal ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
            {expandedSections.personal && (
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="bg-cream rounded-xl p-4 border border-warm-gray">
                    <h3 className="font-semibold text-maroon mb-3 flex items-center text-sm sm:text-base">
                      <User className="w-4 h-4 mr-2" />
                      Basic Details
                    </h3>
                    // ProfilePage.jsx - Inside the "Basic Details" section
<div className="space-y-3">
  <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
    <div className="flex items-center mb-2 sm:mb-0">
      <User className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
      <span className="text-black font-medium w-24">
        Gender:
      </span>
    </div>
    <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
      {user.gender || "Not specified"}
    </span>
  </div>
  <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
    <div className="flex items-center mb-2 sm:mb-0">
      <GraduationCap className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
      <span className="text-black font-medium w-24">
        Age:
      </span>
    </div>
    <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
      {user.age || "Not specified"}
    </span>
  </div>
  {/* <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Briefcase className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">
                            Profession:
                          </span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.profession || ""}
                            onChange={(e) =>
                              handleInputChange("profession", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                            placeholder="Enter profession"
                          />
                        ) : (
                          <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
                            {user.profession || "Not specified"}
                          </span>
                        )}
                      </div> */}
                    </div>
                  </div>
                  <div className="bg-cream rounded-xl p-4 border border-warm-gray">
                    <h3 className="font-semibold text-maroon mb-3 flex items-center text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Mail className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">
                            Email:
                          </span>
                        </div>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                            placeholder="Enter email"
                          />
                        ) : (
                          <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
                            {user.email}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Phone className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">
                            Phone:
                          </span>
                        </div>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
                            {user.phone || "Not specified"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <MapPin className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">
                            Location:
                          </span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location || ""}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                            placeholder="Enter location"
                          />
                        ) : (
                          <span className="text-black truncate max-w-[200px] sm:max-w-[300px]">
                            {user.location || "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        
        </div>

        {/* Actions Panel */}
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 justify-center sm:justify-end">
          {user.email && (
            <a
              href={`mailto:${user.email}`}
              className="flex-1 sm:flex-none bg-cream text-maroon border border-blue py-2 px-4 rounded-lg hover:bg-maroon hover:text-white transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              onClick={() =>
                trackInteraction("click", "contact_user_email", {
                  userId: user._id,
                })
              }
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}
          {user.number && (
            <a
              href={`tel:${user.number}`}
              className="flex-1 sm:flex-none bg-cream text-maroon border border-blue py-2 px-4 rounded-lg hover:bg-maroon hover:text-white transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              onClick={() =>
                trackInteraction("click", "contact_user_phone", {
                  userId: user._id,
                })
              }
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
        </div>

        {/* Inline CSS */}
        <style>{`
          .bg-maroon { background-color: #004dc3; }
          .bg-cream { background-color: #f8fafc; }
          .bg-light-maroon { background-color: #b91c1c; }
          .bg-deep-maroon { background-color: #450a0a; }
          .bg-warm-gray { background-color: #e5e7eb; }
          .text-maroon { color: #004dc3; }
          .text-cream { color: #f8fafc; }
          .text-light-maroon { color: #b91c1c; }
          .text-deep-maroon { color: #450a0a; }
          .text-warm-gray { color: #6b7280; }
          .border-maroon { border-color: #004dc3; }
          .border-warm-gray { border-color: #e5e7eb; }
          .hover\\:bg-maroon:hover { background-color: #004dc3; }
          .hover\\:bg-deep-maroon:hover { background-color: #450a0a; }
          .hover\\:bg-gray-400:hover { background-color: #9ca3af; }
          .focus\\:border-maroon:focus { border-color: #004dc3; }
          .focus\\:ring-light-maroon\\/20:focus { --tw-ring-color: rgba(185, 28, 28, 0.2); }
          
          .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          @media (max-width: 640px) {
            .min-h-screen { padding-bottom: 4rem; }
            .max-w-4xl { max-width: 100%; }
            .text-3xl { font-size: 1.5rem; }
            .text-2xl { font-size: 1.25rem; }
            .text-xl { font-size: 1.125rem; }
            .text-lg { font-size: 1rem; }
            .text-base { font-size: 0.875rem; }
            .text-sm { font-size: 0.75rem; }
            .w-28 { width: 6rem; }
            .w-24 { width: 5rem; }
            .max-w-[200px] { max-width: 70%; }
            .max-w-[300px] { max-width: 80%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProfilePage;
