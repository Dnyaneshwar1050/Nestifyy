import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  Home,
  Users,
  List,
  HelpCircle,
  LogOut,
  Edit,
  Trash2,
  Bed,
  Bath,
  Camera,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const DashboardPage = () => {
  const { isAuthenticated, userId, userRole, handleLogout, trackInteraction } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [myRoomRequests, setMyRoomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roomRequestForm, setRoomRequestForm] = useState({
    budget: "",
    location: "",
  });
  const [editingRoomRequest, setEditingRoomRequest] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        // Fetch user
        const userRes = await axios.get("https://nestifyy-my3u.onrender.com/api/user/profile", config);
        setUser(userRes.data);

        // Fetch properties
        const propsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/property/my-properties", config);
        setMyProperties(propsRes.data.properties || []);

        // Fetch room requests
        const reqsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/room-request/user", config);
        setMyRoomRequests(reqsRes.data || []);

        trackInteraction("data_fetch", "dashboard_data_fetch_success");
      } catch (err) {
        console.error("Data fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch data");
        trackInteraction("data_fetch", "dashboard_data_fetch_failure", { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, trackInteraction]);

  const refetchData = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const propsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/property/my-properties", config);
      setMyProperties(propsRes.data.properties || []);
      const reqsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/room-request/user", config);
      setMyRoomRequests(reqsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refetch data");
    }
  };

  const handleRoomRequestChange = (field, value) => {
    setRoomRequestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoomRequestSubmit = async () => {
    setRequestLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const { budget, location } = roomRequestForm;
      if (!budget || !location) {
        throw new Error("Budget and location are required");
      }
      await axios.post(
        "https://nestifyy-my3u.onrender.com/api/room-request",
        { budget, location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Room request submitted successfully!");
      setRoomRequestForm({ budget: "", location: "" });
      refetchData();
      trackInteraction("room_request", "submit_success");
    } catch (err) {
      console.error("Room request error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit room request");
      trackInteraction("room_request", "submit_failure", { error: err.message });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDeleteRoomRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://nestifyy-my3u.onrender.com/api/room-request/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Room request deleted successfully!");
      refetchData();
      trackInteraction("room_request", "delete_success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room request");
      trackInteraction("room_request", "delete_failure", { error: err.message });
    }
  };

  const handleUpdateRoomRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://nestifyy-my3u.onrender.com/api/room-request/${editingRoomRequest._id}`,
        editingRoomRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Room request updated successfully!");
      setEditingRoomRequest(null);
      refetchData();
      trackInteraction("room_request", "update_success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update room request");
      trackInteraction("room_request", "update_failure", { error: err.message });
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://nestifyy-my3u.onrender.com/api/property/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Property deleted successfully!");
      refetchData();
      trackInteraction("property", "delete_success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete property");
      trackInteraction("property", "delete_failure", { error: err.message });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (propertyImages.length + files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      return;
    }
    setPropertyImages((prev) => [...prev, ...files]);
    setError("");
  };

  const removeImage = (index) => {
    setPropertyImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProperty = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      for (const key in editingProperty) {
        if (key === "amenities") {
          editingProperty.amenities.forEach((amenity) => data.append("amenities", amenity));  // No "[]"
        } else if (key === "images") {
          editingProperty.images.forEach((url) => data.append("existingImageUrls", url));  // Send kept URLs
        } else if (key !== "_id") {
          data.append(key, editingProperty[key]);
        }
      }
      propertyImages.forEach((image) => {
        data.append("image", image);  // New files
      });

      await axios.put(
        `https://nestifyy-my3u.onrender.com/api/property/${editingProperty._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Property updated successfully!");
      setEditingProperty(null);
      setPropertyImages([]);
      refetchData();
      trackInteraction("property", "update_success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update property");
      trackInteraction("property", "update_failure", { error: err.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-800 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <User className="w-8 h-8 text-blue-500" />
          Welcome to Your Dashboard, {user?.name || "User"}
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                Your Information
              </h2>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Name:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Phone:</span>
                    <span>{user.phone || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Location:</span>
                    <span>{user.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 w-32">Role:</span>
                    <span className="capitalize">{userRole}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No user information available.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <List className="w-6 h-6 text-blue-500" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/list-property")}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-3"
              >
                <Home className="w-5 h-5 text-blue-500" />
                List Property
              </button>
              <button
                onClick={() => navigate("/support")}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-3"
              >
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Support
              </button>
            </div>
          </div>

          {/* Add Room Request Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-500" />
                Add Room Request
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 w-32">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    Budget:
                  </label>
                  <input
                    type="text"
                    value={roomRequestForm.budget}
                    onChange={(e) => handleRoomRequestChange("budget", e.target.value)}
                    className="flex-1 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Enter your budget (e.g., 10000)"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 w-32">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Location:
                  </label>
                  <input
                    type="text"
                    value={roomRequestForm.location}
                    onChange={(e) => handleRoomRequestChange("location", e.target.value)}
                    className="flex-1 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Enter preferred location"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setRoomRequestForm({ budget: "", location: "" })}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={handleRoomRequestSubmit}
                    disabled={requestLoading}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                  >
                    {requestLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* My Room Requests Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                My Room Requests
              </h2>
              {myRoomRequests.length === 0 ? (
                <p className="text-gray-600">No room requests found.</p>
              ) : (
                <div className="space-y-4">
                  {myRoomRequests.map((req) => (
                    <div key={req._id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p><strong>Budget:</strong> {req.budget}</p>
                        <p><strong>Location:</strong> {req.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRoomRequest({ ...req })}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomRequest(req._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Properties Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-500" />
                My Properties
              </h2>
              {myProperties.length === 0 ? (
                <p className="text-gray-600">No properties found.</p>
              ) : (
                <div className="space-y-4">
                  {myProperties.map((prop) => (
                    <div key={prop._id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p><strong>Title:</strong> {prop.title}</p>
                        <p><strong>Rent:</strong> ₹{prop.rent}</p>
                        <p><strong>Location:</strong> {prop.location}, {prop.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProperty({
                              ...prop,
                              bedrooms: prop.noOfBedroom || "",
                              amenities: prop.amenities || [],
                              allowBroker: prop.allowBroker ? "yes" : "no",
                            });
                            setPropertyImages([]);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit Room Request Modal */}
          {editingRoomRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Edit Room Request</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget</label>
                    <input
                      type="text"
                      value={editingRoomRequest.budget}
                      onChange={(e) => setEditingRoomRequest({ ...editingRoomRequest, budget: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={editingRoomRequest.location}
                      onChange={(e) => setEditingRoomRequest({ ...editingRoomRequest, location: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingRoomRequest(null)}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateRoomRequest}
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Property Modal */}
          {editingProperty && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full overflow-y-auto max-h-[80vh]">
                <h3 className="text-xl font-bold mb-4">Edit Property</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                    <select
                      value={editingProperty.propertyType}
                      onChange={(e) => setEditingProperty({ ...editingProperty, propertyType: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Property Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="shared_room">Shared Room</option>
                      <option value="house">Independent House</option>
                      <option value="villa">Villa</option>
                      <option value="pg">PG/Hostel</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  {(editingProperty.propertyType === "apartment" ||
                    editingProperty.propertyType === "house" ||
                    editingProperty.propertyType === "villa") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">BHK Type</label>
                      <select
                        value={editingProperty.bhkType}
                        onChange={(e) => setEditingProperty({ ...editingProperty, bhkType: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select BHK Type</option>
                        <option value="1RK">1 RK</option>
                        <option value="1BHK">1 BHK</option>
                        <option value="2BHK">2 BHK</option>
                        <option value="3BHK">3 BHK</option>
                        <option value="4BHK+">4 BHK +</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bedrooms *</label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={editingProperty.bedrooms}
                        onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: e.target.value })}
                        className="mt-1 block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={editingProperty.bathrooms}
                        onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: e.target.value })}
                        className="mt-1 block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area (in sq.ft.)</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={editingProperty.area}
                        onChange={(e) => setEditingProperty({ ...editingProperty, area: e.target.value })}
                        className="mt-1 block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Rent (₹) *</label>
                    <input
                      type="number"
                      value={editingProperty.rent}
                      onChange={(e) => setEditingProperty({ ...editingProperty, rent: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={editingProperty.deposit}
                      onChange={(e) => setEditingProperty({ ...editingProperty, deposit: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={editingProperty.city}
                        onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                        className="mt-1 block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location (e.g., Google Maps link) *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={editingProperty.location}
                        onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                        className="mt-1 block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                    <input
                      type="text"
                      value={editingProperty.title}
                      onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingProperty.description}
                      onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                      rows="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                      {["Furnished", "AC", "Parking", "Gym", "Security", "Power Backup", "Lift", "Balcony", "Pet Friendly", "Wi-Fi"].map(
                        (amenity) => (
                          <label key={amenity} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingProperty.amenities.includes(amenity)}
                              onChange={(e) => {
                                const newAmenities = e.target.checked
                                  ? [...editingProperty.amenities, amenity]
                                  : editingProperty.amenities.filter((item) => item !== amenity);
                                setEditingProperty({ ...editingProperty, amenities: newAmenities });
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span>{amenity}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allow Brokers to Contact You?</label>
                    <div className="flex items-center gap-6 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="allowBroker"
                          value="yes"
                          checked={editingProperty.allowBroker === "yes"}
                          onChange={(e) => setEditingProperty({ ...editingProperty, allowBroker: e.target.value })}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="allowBroker"
                          value="no"
                          checked={editingProperty.allowBroker === "no"}
                          onChange={(e) => setEditingProperty({ ...editingProperty, allowBroker: e.target.value })}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Images (Max 5MB per image)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {editingProperty.images?.map((url, index) => (
                        <div key={`existing-${index}`} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 aspect-[4/3] group">
                          <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = editingProperty.images.filter((_, i) => i !== index);
                              setEditingProperty({ ...editingProperty, images: newImages });
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      {propertyImages.map((file, index) => (
                        <div key={`new-${index}`} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 aspect-[4/3] group">
                          <img src={URL.createObjectURL(file)} alt={`New Property ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setPropertyImages([]);
                      }}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProperty}
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;