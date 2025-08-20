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
    const propsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/property/my-properties", config);
    setMyProperties(propsRes.data.properties || []);
    const reqsRes = await axios.get("https://nestifyy-my3u.onrender.com/api/room-request/user", config);
    setMyRoomRequests(reqsRes.data || []);
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
    } catch (err) {
      setError("Failed to delete room request");
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
    } catch (err) {
      setError("Failed to update room request");
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
    } catch (err) {
      setError("Failed to delete property");
    }
  };

  const handleUpdateProperty = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://nestifyy-my3u.onrender.com/api/property/${editingProperty._id}`,
        editingProperty,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Property updated successfully!");
      setEditingProperty(null);
      refetchData();
    } catch (err) {
      setError("Failed to update property");
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
              <div className="mt-6">
                <button
                  onClick={() => {
                    navigate("/profile");
                    trackInteraction("click", "edit_profile_from_dashboard");
                  }}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
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
                onClick={() => navigate("/find-room")}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-3"
              >
                <Home className="w-5 h-5 text-blue-500" />
                Find Room
              </button>
              <button
                onClick={() => navigate("/find-roommate")}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-3"
              >
                <Users className="w-5 h-5 text-blue-500" />
                Find Roommate
              </button>
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
              <button
                onClick={handleLogout}
                className="w-full bg-red-100 text-red-800 py-3 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                Logout
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
                          onClick={() => setEditingProperty({ ...prop })}
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
            <div className="bg-white p-6 rounded-lg max-w-md w-full overflow-y-auto max-h-96">
              <h3 className="text-xl font-bold mb-4">Edit Property</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editingProperty.title}
                    onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rent</label>
                  <input
                    type="number"
                    value={editingProperty.rent}
                    onChange={(e) => setEditingProperty({ ...editingProperty, rent: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={editingProperty.location}
                    onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={editingProperty.city}
                    onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit</label>
                  <input
                    type="number"
                    value={editingProperty.deposit}
                    onChange={(e) => setEditingProperty({ ...editingProperty, deposit: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {/* Add more fields as needed */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingProperty(null)}
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
  );
};

export default DashboardPage;