import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Loader2, AlertCircle, Save, X, ChevronDown, ChevronUp, DollarSign, MapPin, Home, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [expandedSections, setExpandedSections] = useState({ roomRequest: false });
  const [roomRequestForm, setRoomRequestForm] = useState({ budget: '', location: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    trackInteraction('page_view', 'dashboard_page');
    const storedRole = localStorage.getItem('userRole');
    if (!isAuthenticated || !storedRole) {
      setError('You need to be logged in to access the dashboard.');
      setLoading(false);
      trackInteraction('auth_error', 'dashboard_unauthenticated');
      navigate('/login');
      return;
    }
    setUserRole(storedRole);
    if (storedRole === 'user') {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [trackInteraction, isAuthenticated, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    let propertiesError = '';
    let roomRequestsError = '';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch user-created properties
      try {
        const propertiesResponse = await axios.get('https://nestifyy-my3u.onrender.com/api/property/my-properties', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(propertiesResponse.data.properties || []);
      } catch (propErr) {
        console.error('fetchUserData: Properties fetch error:', propErr);
        propertiesError = propErr.response?.data?.message || 'Failed to load properties. Please try again later.';
      }

      // Fetch user-created room requests
      try {
        const roomRequestsResponse = await axios.get('https://nestifyy-my3u.onrender.com/api/room-request/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomRequests(roomRequestsResponse.data || []);
      } catch (reqErr) {
        console.error('fetchUserData: Room requests fetch error:', reqErr);
        roomRequestsError = reqErr.response?.data?.message || 'Failed to load room requests. Please try again later.';
      }

      // Set error message only if both fetches fail
      if (propertiesError && roomRequestsError) {
        setError('Failed to load dashboard data: ' + propertiesError + ' ' + roomRequestsError);
        trackInteraction('data_fetch', 'dashboard_failure', { error: propertiesError + ' ' + roomRequestsError });
      } else if (propertiesError) {
        setError(propertiesError);
        trackInteraction('data_fetch', 'dashboard_properties_failure', { error: propertiesError });
      } else if (roomRequestsError) {
        setError(roomRequestsError);
        trackInteraction('data_fetch', 'dashboard_room_requests_failure', { error: roomRequestsError });
      } else {
        trackInteraction('data_fetch', 'dashboard_user_data_success');
      }

      setLoading(false);
    } catch (err) {
      console.error('fetchUserData: General error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please check your connection or try again later.');
      setLoading(false);
      trackInteraction('data_fetch', 'dashboard_failure', { error: err.message });
    }
  };

  const handleRoomRequestChange = (field, value) => {
    setRoomRequestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRoomRequestSubmit = async () => {
    setRequestLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { budget, location } = roomRequestForm;
      if (!budget || !location) {
        throw new Error('Budget and location are required');
      }

      await axios.post(
        'https://nestifyy-my3u.onrender.com/api/room-request',
        { budget, location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setRoomRequestForm({ budget: '', location: '' });
      toggleSection('roomRequest');
      fetchUserData(); // Refresh room requests after submission
      trackInteraction('room_request', 'submit_success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit room request');
      trackInteraction('room_request', 'submit_failure', { error: err.message });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleEditProperty = (propertyId) => {
    trackInteraction('click', `dashboard_edit_property_${propertyId}`);
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDeleteProperty = async (propertyId) => {
    trackInteraction('click', `dashboard_delete_property_${propertyId}`);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://nestifyy-my3u.onrender.com/api/property/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      trackInteraction('property_delete', 'success', { propertyId });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete property');
      trackInteraction('property_delete', 'failure', { error: err.message });
    }
  };

  const handleDeleteRoomRequest = async (requestId) => {
    trackInteraction('click', `dashboard_delete_room_request_${requestId}`);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://nestifyy-my3u.onrender.com/api/room-request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoomRequests((prev) => prev.filter((r) => r._id !== requestId));
      trackInteraction('room_request_delete', 'success', { requestId });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room request');
      trackInteraction('room_request_delete', 'failure', { error: err.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-maroon animate-spin" />
          <p className="text-black font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-cream p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-warm-gray text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
            <AlertCircle className="w-10 h-10" />
            <h2 className="text-2xl font-bold">Error</h2>
          </div>
          <p className="text-black mb-8 text-lg">{error}</p>
          <button
            onClick={() => {
              fetchUserData();
              trackInteraction('click', 'dashboard_retry_load');
            }}
            className="w-full bg-maroon text-white py-3 px-4 rounded-lg hover:bg-deep-maroon transition-colors duration-300 font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-98"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-black text-center mb-10 relative">
        <span className="relative inline-block pb-2">
          Your Dashboard
          <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-maroon transform -translate-x-1/2 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
        Welcome! Here you can manage your Nestify activities.
      </p>

      {userRole === 'user' && (
        <>
          <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-warm-gray animate-fade-in-up animation-delay-100">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center space-x-3">
              <Home size={28} className="text-maroon" />
              <span>My Properties</span>
            </h2>
            {properties.length === 0 ? (
              <p className="text-gray-600 text-lg py-4">You haven't created any properties yet. Start listing!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden border border-warm-gray">
                  <thead className="bg-cream">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr
                        key={property._id}
                        className="border-b border-warm-gray last:border-b-0 hover:bg-cream transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <img
                            src={property.imageUrls?.[0] || 'https://via.placeholder.com/80'}
                            alt={property.title}
                            className="w-20 h-14 object-cover rounded-md shadow-sm"
                          />
                        </td>
                        <td className="py-3 px-4 text-black text-base">{property.title}</td>
                        <td className="py-3 px-4 text-black text-base">{property.location}</td>
                        <td className="py-3 px-4 text-black text-base">{property.propertyType}</td>
                        <td className="py-3 px-4 flex space-x-2">
                          <button
                            onClick={() => handleEditProperty(property._id)}
                            className="text-maroon hover:text-deep-maroon text-sm font-medium flex items-center space-x-1"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-gray mb-8 animate-fade-in-up animation-delay-200">
            <div
              className="bg-gradient-to-r from-maroon to-light-maroon px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('roomRequest')}
            >
              <h2 className="text-lg sm:text-xl font-bold text-black flex items-center">
                <User className="w-5 h-5 mr-2" />
                Request a Room
              </h2>
              {expandedSections.roomRequest ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
            {expandedSections.roomRequest && (
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="bg-cream rounded-xl p-4 border border-warm-gray">
                    <h3 className="font-semibold text-maroon mb-3 flex items-center text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      Room Request Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <DollarSign className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">Budget:</span>
                        </div>
                        <input
                          type="text"
                          value={roomRequestForm.budget}
                          onChange={(e) => handleRoomRequestChange('budget', e.target.value)}
                          className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                          placeholder="Enter your budget (e.g., ₹10,000)"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <MapPin className="w-5 h-5 mr-2 text-maroon flex-shrink-0" />
                          <span className="text-black font-medium w-24">Location:</span>
                        </div>
                        <input
                          type="text"
                          value={roomRequestForm.location}
                          onChange={(e) => handleRoomRequestChange('location', e.target.value)}
                          className="flex-1 px-3 py-2 border border-warm-gray rounded-lg focus:border-maroon focus:ring-2 focus:ring-light-maroon/20 outline-none text-sm sm:text-base"
                          placeholder="Enter preferred location"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setRoomRequestForm({ budget: '', location: '' });
                            toggleSection('roomRequest');
                            trackInteraction('click', 'room_request_cancel');
                          }}
                          className="flex items-center justify-center gap-2 bg-warm-gray text-black px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium shadow-sm text-sm sm:text-base"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleRoomRequestSubmit}
                          disabled={requestLoading}
                          className="flex items-center justify-center gap-2 bg-maroon text-white px-3 py-2 rounded-lg hover:bg-deep-maroon transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
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
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-warm-gray animate-fade-in-up animation-delay-300">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center space-x-3">
              <User size={28} className="text-maroon" />
              <span>My Room Requests</span>
            </h2>
            {roomRequests.length === 0 ? (
              <p className="text-gray-600 text-lg py-4">You haven't created any room requests yet. Create one above!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden border border-warm-gray">
                  <thead className="bg-cream">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Budget</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="border-b border-warm-gray last:border-b-0 hover:bg-cream transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-black text-base">{request.budget}</td>
                        <td className="py-3 px-4 text-black text-base">{request.location}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteRoomRequest(request._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

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
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;