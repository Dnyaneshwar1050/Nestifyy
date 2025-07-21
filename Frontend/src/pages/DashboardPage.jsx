import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Home, MessageSquare, Briefcase, CheckCircle, AlertCircle, Eye, Trash2, Edit, Loader2, PlusCircle, Heart, Users, MapPin } from 'lucide-react'; // Added Users, MapPin for roommate section
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null); // 'user', 'owner', 'broker'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]); // For owners/brokers
  const [roommateProfile, setRoommateProfile] = useState(null); // For users looking for roommates
  const [messages, setMessages] = useState([]); // For all users
  const [savedListings, setSavedListings] = useState([]); // For all users

  useEffect(() => {
    trackInteraction('page_view', 'dashboard_page');
    const storedRole = localStorage.getItem('userRole');
    if (!isAuthenticated || !storedRole) {
      setError("You need to be logged in to access the dashboard.");
      setLoading(false);
      trackInteraction('auth_error', 'dashboard_unauthenticated');
      navigate('/login');
      return;
    }
    setUserRole(storedRole);
    fetchDashboardData(storedRole);
  }, [trackInteraction, isAuthenticated, navigate]);

  const fetchDashboardData = async (role) => {
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Dummy data based on role
      if (role === 'owner' || role === 'broker') {
        setProperties([
          { id: 201, name: 'Spacious 2BHK for Rent', location: 'Kothrud, Pune', status: 'Active', imageUrl: 'https://placehold.co/100x70/E0E7FF/4338CA?text=PropA' },
          { id: 202, name: '1RK near IT Park', location: 'Hinjewadi, Pune', status: 'Pending', imageUrl: 'https://placehold.co/100x70/BFDBFE/1D4ED8?text=PropB' },
          { id: 203, name: 'Luxury Villa', location: 'Lonavala, Pune', status: 'Active', imageUrl: 'https://placehold.co/100x70/D1FAE5/065F46?text=PropC' },
        ]);
        trackInteraction('data_fetch', 'dashboard_properties_success');
      } else if (role === 'user') {
        setRoommateProfile({
          id: 301,
          name: 'Your Roommate Profile',
          location: 'Pune',
          lookingFor: 'Shared room in Baner',
          budget: '₹ 10,000',
          status: 'Active',
          imageUrl: 'https://placehold.co/100x70/F0F9FF/0284C7?text=MyProfile',
        });
        trackInteraction('data_fetch', 'dashboard_roommate_profile_success');
      }

      // Dummy data for messages (common for all roles)
      setMessages([
        { id: 1, sender: 'Property Owner', subject: 'Inquiry about 2BHK', date: '2023-10-26' },
        { id: 2, sender: 'Nestify Support', subject: 'Your recent feedback', date: '2023-10-25' },
      ]);
      trackInteraction('data_fetch', 'dashboard_messages_success');

      // Dummy data for saved listings (common for all roles)
      setSavedListings([
        { id: 401, name: 'Cozy 1BHK', location: 'Koregaon Park', price: '₹ 20,000/month', imageUrl: 'https://placehold.co/100x70/FFEDD5/9A3412?text=Saved1' },
        { id: 402, name: 'Roommate: Sarah J.', location: 'Bengaluru', lookingFor: 'Indiranagar', budget: '₹ 12,000', imageUrl: 'https://placehold.co/100x70/E8F5E9/2E7D32?text=Saved2' },
      ]);
      trackInteraction('data_fetch', 'dashboard_saved_listings_success');

      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data.');
      setLoading(false);
      trackInteraction('data_fetch', 'dashboard_failure', { error: err.message });
    }
  };

  const handleEditProperty = (propertyId) => {
    trackInteraction('click', `dashboard_edit_property_${propertyId}`);
    console.log('Edit property:', propertyId);
    // Example: navigate(`/list-property?edit=${propertyId}`);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setLoading(true);
      trackInteraction('click', `dashboard_delete_property_confirm_${propertyId}`);
      try {
        // Simulate API call to delete property
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setLoading(false);
        trackInteraction('property_management', 'dashboard_property_delete_success', { propertyId });
      } catch (err) {
        setError('Failed to delete property.');
        setLoading(false);
        trackInteraction('property_management', 'dashboard_property_delete_failure', { propertyId, error: err.message });
      }
    } else {
      trackInteraction('click', `dashboard_delete_property_cancel_${propertyId}`);
    }
  };

  const handleEditRoommateProfile = () => {
    trackInteraction('click', 'dashboard_edit_roommate_profile');
    console.log('Edit roommate profile');
    // Example: navigate('/profile'); // Assuming profile page is where roommate profile is managed
  };

  const handleViewMessage = (messageId) => {
    trackInteraction('click', `dashboard_view_message_${messageId}`);
    console.log('Viewing message:', messageId);
    // Example: navigate(`/messages/${messageId}`);
  };

  const handleRemoveSavedListing = (listingId) => {
    trackInteraction('click', `dashboard_remove_saved_listing_${listingId}`);
    setSavedListings(prev => prev.filter(l => l.id !== listingId));
    console.log('Removed saved listing:', listingId);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-red-200 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
            <AlertCircle className="w-10 h-10" />
            <h2 className="text-2xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">{error}</p>
          <button
            onClick={() => { fetchDashboardData(userRole); trackInteraction('click', 'dashboard_retry_load'); }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-98"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-10 relative">
        <span className="relative inline-block pb-2">
          Your Dashboard
          <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-blue-600 transform -translate-x-1/2 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
        Welcome! Here you can manage your Nestify activities.
      </p>

      {(userRole === 'owner' || userRole === 'broker') && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200 animate-fade-in-up animation-delay-100"> {/* Using a custom animation delay utility if defined in tailwind.config.js or via inline style directly */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
            <Home size={28} className="text-blue-600" />
            <span>My Properties</span>
          </h2>
          <button
            onClick={() => { navigate('/list-property'); trackInteraction('click', 'dashboard_add_property_button'); }}
            className="mb-6 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors duration-300 text-base font-semibold shadow-md hover:shadow-lg flex items-center space-x-2 transform hover:scale-105 active:scale-95"
          >
            <PlusCircle size={20} />
            <span>Add New Property</span>
          </button>

          {properties.length === 0 ? (
            <p className="text-gray-600 text-lg py-4">You haven't listed any properties yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <tr key={property.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4">
                        <img src={property.imageUrl} alt={property.name} className="w-20 h-14 object-cover rounded-md shadow-sm" />
                      </td>
                      <td className="py-3 px-4 text-gray-800 text-base">{property.name}</td>
                      <td className="py-3 px-4 text-gray-800 text-base">{property.location}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                          onClick={() => handleEditProperty(property.id)}
                        >
                          <Edit size={16} /><span>Edit</span>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 size={16} /><span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {userRole === 'user' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200 animate-fade-in-up animation-delay-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
            <Users size={28} className="text-purple-600" />
            <span>My Roommate Profile</span>
          </h2>
          {roommateProfile ? (
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <img
                src={roommateProfile.imageUrl}
                alt={roommateProfile.name}
                className="w-32 h-32 object-cover rounded-full border-4 border-purple-200 shadow-md"
              />
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-900">{roommateProfile.name}</h3>
                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                  <MapPin size={16} className="mr-1 text-purple-500" /> {roommateProfile.location}
                </p>
                <p className="text-gray-700 mt-2 text-base">Looking for: <span className="font-medium">{roommateProfile.lookingFor}</span></p>
                <p className="text-gray-700 text-base">Budget: <span className="font-medium">{roommateProfile.budget}</span></p>
                <p className="text-gray-700 text-base">Status: <span className="font-medium text-green-600">{roommateProfile.status}</span></p>
                <button
                  onClick={handleEditRoommateProfile}
                  className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors duration-300 text-sm font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-lg py-4">You don't have a roommate profile yet. Create one to find matches!</p>
          )}
        </section>
      )}

      {/* Common Dashboard Sections */}
      <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200 animate-fade-in-up animation-delay-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
          <MessageSquare size={28} className="text-orange-600" />
          <span>Messages</span>
        </h2>
        {messages.length === 0 ? (
          <p className="text-gray-600 text-lg py-4">You have no new messages.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Sender</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr key={message.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-800 text-base">{message.sender}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{message.subject}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{message.date}</td>
                    <td className="py-3 px-4">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleViewMessage(message.id)}
                      >
                        <Eye size={16} /><span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-fade-in-up animation-delay-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
          <Heart size={28} className="text-red-600" />
          <span>Saved Listings</span>
        </h2>
        {savedListings.length === 0 ? (
          <p className="text-gray-600 text-lg py-4">You haven't saved any listings yet. Start exploring!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedListings.map(listing => (
                  <tr key={listing.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <img src={listing.imageUrl} alt={listing.name} className="w-20 h-14 object-cover rounded-md shadow-sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-base">{listing.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{listing.location}</td>
                    <td className="py-3 px-4">
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleRemoveSavedListing(listing.id)}
                      >
                        <Trash2 size={16} /><span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;