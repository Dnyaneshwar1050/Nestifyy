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
  Sparkles,
  Award,
  Heart
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full opacity-20 animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium text-xl">Loading your profile...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!user && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-red-100 text-center">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-yellow-100 text-center">
          <div className="flex items-center justify-center gap-3 text-yellow-600 mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Frown className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Profile Found</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Please log in to view your profile or ensure the URL is correct.
          </p>
          <Link
            to="/login"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-float-fast"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full animate-float-slow"></div>
        
        {/* Gradient Mesh */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5 backdrop-blur-3xl"></div>
      </div>

      <div className={`relative z-10 max-w-6xl mx-auto px-4 py-8 transform transition-all duration-1000 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 backdrop-blur-sm border-l-4 border-green-500 text-green-700 p-4 rounded-2xl mb-6 shadow-lg flex items-center gap-3 animate-slide-in">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-base font-medium">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-2xl mb-6 shadow-lg flex items-center gap-3 animate-shake">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-base font-medium">{error}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/20">
          <div className="h-48 relative bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600">
            {/* Header Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
            
            {/* Floating Elements in Header */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-float-slow"></div>
            <div className="absolute top-8 right-16 w-4 h-4 bg-white/30 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-8 left-8 w-6 h-6 bg-white/20 rounded-full animate-float-fast"></div>
            
            {/* Profile Image */}
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-white">
                  <img
                    src={
                      previewUrl ||
                      (user.photo && user.photo.startsWith('http')
                        ? user.photo
                        : `https://nestifyy-my3u.onrender.com/${user.photo}`) ||
                      `https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fuser-profile-pic&psig=AOvVaw0CHlSK5wf50zFSELSy0abX&ust=1755935474183000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCNjC-sP3nY8DFQAAAAAdAAAAABAE`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Edit Photo Button */}
                {isEditing && !id && (
                  <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-3 cursor-pointer shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                
                {/* Status Indicator */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="pt-20 pb-8 px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                {/* Name */}
                <div className="mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-indigo-200 focus:border-indigo-500 outline-none w-full transition-colors duration-300"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {user.name}
                      <Sparkles className="inline-block w-6 h-6 text-yellow-400 ml-2 animate-pulse" />
                    </h1>
                  )}
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Profile</span>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <Mail className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 truncate text-sm">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <Phone className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 truncate text-sm">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-cyan-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 truncate text-sm">{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isEditing ? (
                  <>
                    <Link
                      to="/"
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium transform hover:scale-105"
                      onClick={() => trackInteraction("click", "profile_back_to_home")}
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
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saveLoading}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
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

        {/* Personal Information Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 mb-6">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            onClick={() => toggleSection("personal")}
          >
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="w-6 h-6 mr-3" />
              Personal Information
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              {expandedSections.personal ? (
                <ChevronUp className="w-5 h-5 text-white transform transition-transform duration-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white transform transition-transform duration-300" />
              )}
            </div>
          </div>
          
          {expandedSections.personal && (
            <div className="p-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Details Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="font-bold text-indigo-800 mb-4 flex items-center text-lg">
                    <User className="w-5 h-5 mr-2" />
                    Basic Details
                  </h3>
                  <div className="space-y-4">
                    {/* Gender */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <Heart className="w-4 h-4 mr-2 text-pink-500" />
                        <span className="text-gray-700 font-medium">Gender:</span>
                      </div>
                      {isEditing ? (
                        <select
                          value={editForm.gender || ""}
                          onChange={(e) => handleInputChange("gender", e.target.value)}
                          className="flex-1 px-4 py-2 border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg">
                          {user.gender || "Not specified"}
                        </span>
                      )}
                    </div>

                    {/* Age */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700 font-medium">Age:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.age || ""}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          className="flex-1 px-4 py-2 border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                          placeholder="Enter age"
                          min="1"
                          max="120"
                        />
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg">
                          {user.age || "Not specified"}
                        </span>
                      )}
                    </div>

                    {/* Profession
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <Briefcase className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-700 font-medium">Profession:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.profession || ""}
                          onChange={(e) => handleInputChange("profession", e.target.value)}
                          className="flex-1 px-4 py-2 border border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                          placeholder="Enter profession"
                        />
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg">
                          {user.profession || "Not specified"}
                        </span>
                      )}
                    </div> */}
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                  <h3 className="font-bold text-cyan-800 mb-4 flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="text-gray-700 font-medium">Email:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="flex-1 px-4 py-2 border border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                          placeholder="Enter email"
                        />
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg truncate">
                          {user.email}
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <Phone className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700 font-medium">Phone:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="flex-1 px-4 py-2 border border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg">
                          {user.phone || "Not specified"}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 hover:bg-white/50 rounded-xl transition-colors">
                      <div className="flex items-center mb-2 sm:mb-0 sm:w-32">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-gray-700 font-medium">Location:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location || ""}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="flex-1 px-4 py-2 border border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                          placeholder="Enter location"
                        />
                      ) : (
                        <span className="text-gray-600 bg-white px-3 py-1 rounded-lg">
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

        {/* Action Panel */}
        <div className="flex flex-wrap gap-4 justify-center">
          {/* {user.email && (
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => trackInteraction("click", "contact_user_email", { userId: user._id })}
            >
              <Mail className="w-5 h-5" />
              Send Email
            </a>
          )} */}
          
          {!id && (
            <button
              onClick={() => {
                navigate("/dashboard");
                trackInteraction("click", "view_dashboard");
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <User className="w-5 h-5" />
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Custom Styles */}
        <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(180deg); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(90deg); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(270deg); }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 3s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 2s ease-in-out infinite; }
          .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
          .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.5);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.8);
          }
          
          /* Responsive adjustments */
          @media (max-width: 640px) {
            .grid-cols-3 { grid-template-columns: 1fr; }
            .lg\\:grid-cols-2 { grid-template-columns: 1fr; }
            .text-3xl { font-size: 2rem; }
            .px-6 { padding-left: 1rem; padding-right: 1rem; }
          }
        `}</style>
        </div>
        </div>
  )
}

export default ProfilePage;