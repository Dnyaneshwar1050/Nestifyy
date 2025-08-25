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
  Shield,
  Settings,
  Building
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
    roomRequest: false,
  });
  const [roomRequestForm, setRoomRequestForm] = useState({
    budget: "",
    location: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
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
        setMounted(true);
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
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
      trackInteraction("file_select", "profile_photo_edit");
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== null && editForm[key] !== undefined) {
          if (key === "brokerInfo" || key === "preferences") {
            formData.append(key, JSON.stringify(editForm[key]));
          } else if (key !== "photo") {
            formData.append(key, editForm[key]);
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
      trackInteraction("profile_management", "profile_update_success");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(
        response.data.user.photo
          ? `https://nestifyy-my3u.onrender.com/${response.data.user.photo}`
          : ""
      );
      setSelectedFile(null);
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile";
      setError(errorMessage);
      trackInteraction("profile_management", "profile_update_failure", {
        error: errorMessage,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Profile</h3>
            <p className="text-slate-600 text-sm">Please wait while we fetch your information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!user && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Unable to Load Profile</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-2.5 px-6 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Frown className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Profile Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">
            Please log in to view your profile or ensure the URL is correct.
          </p>
          <Link
            to="/login"
            className="w-full bg-slate-900 text-white py-2.5 px-6 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            onClick={() =>
              trackInteraction("click", "profile_no_profile_go_login")
            }
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
              onClick={() => trackInteraction("click", "profile_back_to_home")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Link>
            <div className="hidden lg:block text-center">
              <h1 className="text-xl font-semibold text-slate-900">User Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                !id && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      trackInteraction("click", "profile_toggle_edit");
                    }}
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors text-sm"
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit Profile
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saveLoading}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-800 font-medium text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          {/* Profile Header Background */}
          <div className="h-32 bg-slate-100 rounded-t-lg relative">
            <div className="absolute -bottom-8 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
                  <img
                    src={
                      previewUrl ||
                      (user.photo && user.photo.startsWith('http')
                        ? user.photo
                        : `https://nestifyy-my3u.onrender.com/${user.photo}`) ||
                      `https://ui-avatars.com/api/?name=${user.name}&size=96&background=F8FAFC&color=475569`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Edit Photo Button */}
                {isEditing && !id && (
                  <label className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-2 cursor-pointer hover:bg-slate-800 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                
                {/* Verified Badge */}
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="pt-12 pb-6 px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                {/* Name and Status */}
                <div className="mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-gray-200 focus:border-slate-500 outline-none w-full transition-colors duration-300 pb-1"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {user.name}
                    </h1>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Verified Account</span>
                  </div>
                </div>
                
                {/* Contact Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 truncate text-sm">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                      <span className="text-slate-700 truncate text-sm">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                      <span className="text-slate-700 truncate text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div
            className="bg-slate-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border-b"
            onClick={() => toggleSection("personal")}
          >
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <User className="w-5 h-5 mr-3 text-slate-600" />
              Personal Information
            </h2>
            {expandedSections.personal ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
          
          {expandedSections.personal && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Details */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center">
                    <User className="w-5 h-5 mr-2 text-slate-600" />
                    Basic Details
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Gender */}
                    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
                      <label className="text-slate-700 font-medium text-sm">Gender</label>
                      <div className="col-span-2">
                        {isEditing ? (
                          <select
                            value={editForm.gender || ""}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors text-sm"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <span className="text-slate-600 text-sm">
                            {user.gender || "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Age */}
                    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
                      <label className="text-slate-700 font-medium text-sm">Age</label>
                      <div className="col-span-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.age || ""}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors text-sm"
                            placeholder="Enter age"
                            min="1"
                            max="120"
                          />
                        ) : (
                          <span className="text-slate-600 text-sm">
                            {user.age || "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-slate-600" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
                      <label className="text-slate-700 font-medium text-sm">Email</label>
                      <div className="col-span-2">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors text-sm"
                            placeholder="Enter email"
                          />
                        ) : (
                          <span className="text-slate-600 text-sm truncate">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
                      <label className="text-slate-700 font-medium text-sm">Phone</label>
                      <div className="col-span-2">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors text-sm"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <span className="text-slate-600 text-sm">
                            {user.phone || "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100">
                      <label className="text-slate-700 font-medium text-sm">Location</label>
                      <div className="col-span-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location || ""}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors text-sm"
                            placeholder="Enter location"
                          />
                        ) : (
                          <span className="text-slate-600 text-sm">
                            {user.location || "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          {!id && (
            <button
              onClick={() => {
                navigate("/dashboard");
                trackInteraction("click", "view_dashboard");
              }}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              <Settings className="w-4 h-4" />
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;