// src/pages/BrokerZonePage.jsx
import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { TrendingUp, Briefcase, PlusCircle, Home, Users, CheckCircle, AlertCircle, XCircle, Loader2, Eye, Trash2, Edit, PhoneCall, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BrokerZonePage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive'); // 'active', 'inactive', 'trial'
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for custom confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [propertyToRemoveId, setPropertyToRemoveId] = useState(null);

  useEffect(() => {
    trackInteraction('page_view', 'broker_zone_page');
    const storedRole = localStorage.getItem('userRole'); // Assuming 'broker' role is set on login
    if (!isAuthenticated || storedRole !== 'broker') {
      setError("Please log in as a broker to access this zone.");
      setLoading(false);
      trackInteraction('auth_error', 'broker_zone_unauthenticated');
      // Delay navigation slightly to allow error message to be seen
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    // Simulate fetching broker data
    fetchBrokerData();
  }, [trackInteraction, isAuthenticated, navigate]);

  const fetchBrokerData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call to get broker's subscription, leads, and properties
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dummy data
      setSubscriptionStatus('active'); // or 'inactive', 'trial'
      setLeads([
        { id: 1, name: 'John Doe', contact: 'john.doe@example.com', interestedIn: '2BHK Apartment, Pune', status: 'New' },
        { id: 2, name: 'Jane Smith', contact: '+919876543210', interestedIn: 'Shared Room, Bengaluru', status: 'Contacted' },
        { id: 3, name: 'Ravi Kumar', contact: 'ravi.k@example.com', interestedIn: '1BHK Flat, Delhi', status: 'New' },
        { id: 4, name: 'Priya Sharma', contact: '+919988776655', interestedIn: 'Villa, Chennai', status: 'Contacted' },
      ]);
      setProperties([
        { id: 101, name: 'Luxury 3BHK Flat', location: 'Koregaon Park', status: 'Active', imageUrl: 'https://placehold.co/100x70/E0E7FF/4338CA?text=Prop1' },
        { id: 102, name: 'Commercial Office Space', location: 'Baner', status: 'Pending Review', imageUrl: 'https://placehold.co/100x70/D1FAE5/065F46?text=Prop2' },
        { id: 103, name: 'Spacious 2BHK', location: 'Hinjewadi', status: 'Active', imageUrl: 'https://placehold.co/100x70/BFDBFE/1D4ED8?text=Prop3' },
      ]);
      setLoading(false);
      trackInteraction('data_fetch', 'broker_data_success');
    } catch (err) {
      setError('Failed to load broker data.');
      setLoading(false);
      trackInteraction('data_fetch', 'broker_data_failure', { error: err.message });
    }
  };

  const handlePurchaseSubscription = async (plan) => {
    setLoading(true);
    setSuccess('');
    setError('');
    trackInteraction('click', 'broker_purchase_subscription', { plan });
    try {
      // Simulate API call to purchase subscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubscriptionStatus('active');
      setSuccess(`Successfully subscribed to ${plan} plan!`);
      trackInteraction('subscription', 'broker_subscription_success', { plan });
    } catch (err) {
      setError('Failed to purchase subscription. Please try again.');
      trackInteraction('subscription', 'broker_subscription_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    trackInteraction('click', 'broker_add_property_button');
    navigate('/list-property');
  };

  const handleViewProperty = (propertyId) => {
    trackInteraction('click', `broker_view_property_${propertyId}`);
    // Navigate to property detail page or open a modal
    console.log(`Viewing property ${propertyId}`);
    // Example: navigate(`/property/${propertyId}`);
  };

  // Function to open the custom confirmation modal
  const confirmRemoveProperty = (propertyId) => {
    setPropertyToRemoveId(propertyId);
    setShowConfirmModal(true);
    trackInteraction('click', `broker_remove_property_initiate_${propertyId}`);
  };

  // Function to handle removal after confirmation
  const executeRemoveProperty = async () => {
    setShowConfirmModal(false); // Close modal
    if (!propertyToRemoveId) return; // Should not happen if modal was opened correctly

    setLoading(true);
    setSuccess('');
    setError('');
    trackInteraction('click', `broker_remove_property_confirm_${propertyToRemoveId}`);
    try {
      // Simulate API call to remove property
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProperties(prev => prev.filter(p => p.id !== propertyToRemoveId));
      setSuccess('Property removed successfully!');
      trackInteraction('property_management', 'broker_property_remove_success', { propertyId: propertyToRemoveId });
    } catch (err) {
      setError('Failed to remove property.');
      trackInteraction('property_management', 'broker_property_remove_failure', { propertyId: propertyToRemoveId, error: err.message });
    } finally {
      setLoading(false);
      setPropertyToRemoveId(null); // Reset ID
    }
  };

  // Function to cancel removal
  const cancelRemoveProperty = () => {
    setShowConfirmModal(false);
    setPropertyToRemoveId(null);
    trackInteraction('click', `broker_remove_property_cancel_${propertyToRemoveId}`);
  };


  if (loading && !error && !success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Loading broker zone data...</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) { // Only show full error page if not authenticated
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-red-200 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
            <AlertCircle className="w-10 h-10" />
            <h2 className="text-2xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">{error}</p>
          <button
            onClick={() => { navigate('/login'); trackInteraction('click', 'broker_zone_login_redirect'); }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-300 font-bold text-lg shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-98 border-none cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center md:p-12">
      <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10 relative md:text-5xl">
        <span className="relative inline-block pb-2">
          Broker Zone
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
        Manage your listings, leads, and subscription here to grow your business.
      </p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-2 text-base w-full max-w-6xl box-border animate-fade-in" role="alert">
          <CheckCircle size={20} />
          <span className="block sm:inline font-medium">{success}</span>
        </div>
      )}
      {error && isAuthenticated && ( // Show error message if authenticated but data fetch failed
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-2 text-base w-full max-w-6xl box-border animate-fade-in" role="alert">
          <AlertCircle size={20} />
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {/* Subscription Section */}
      <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">

          <span>Subscription Status</span>
        </h2>
        <div className="flex flex-col items-start justify-between mb-4 gap-3 sm:flex-row sm:items-center sm:gap-0">
          <p className="text-lg text-gray-700">
            Current Status: <span className={`font-semibold text-xl ${subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {subscriptionStatus === 'active' ? 'Active' : subscriptionStatus === 'trial' ? 'Trial Period' : 'Inactive'}
            </span>
          </p>
          {subscriptionStatus !== 'active' && (
            <button
              onClick={() => handlePurchaseSubscription('Premium')}
              className="bg-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 text-base font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 flex items-center gap-2 border-none cursor-pointer"
              disabled={loading}
              onMouseEnter={() => trackInteraction('hover', 'broker_activate_subscription_button')}
            >
              <Briefcase size={20} className="w-5 h-5" />
              <span>{loading ? 'Processing...' : 'Activate Premium Plan'}</span>
            </button>
          )}
        </div>
        {subscriptionStatus !== 'active' && (
          <p className="text-gray-600 text-sm mt-2">
            Upgrade your plan to unlock more leads and features for your business.
          </p>
        )}
      </section>

      {/* Leads Section */}
      <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <TrendingUp size={28} className="text-blue-600" />
          <span>My Leads</span>
        </h2>
        {leads.length === 0 ? (
          <p className="text-gray-600 text-lg py-4">No new leads yet. Promote your properties to get more!</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <table className="w-full min-w-[600px] bg-white border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Contact</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Interested In</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-200 transition-colors duration-150 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{lead.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{lead.contact}</td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{lead.interestedIn}</td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                      <button
                        className="text-blue-600 transition-colors duration-200 text-sm font-medium inline-flex items-center gap-1 bg-none border-none cursor-pointer p-1 rounded hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => trackInteraction('click', `broker_contact_lead_${lead.id}`)}
                      >
                        <PhoneCall size={16} /><span>Contact</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Properties Section */}
      <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Home size={28} className="text-orange-600" />
          <span>My Properties</span>
        </h2>
        <button
          onClick={handleAddProperty}
          className="mb-6 bg-green-600 text-white px-6 py-3 rounded-full transition-all duration-300 text-base font-semibold shadow-md inline-flex items-center gap-2 hover:bg-green-700 hover:shadow-lg active:scale-95 border-none cursor-pointer"
          onMouseEnter={() => trackInteraction('hover', 'broker_add_property_button')}
        >
          <PlusCircle size={20} className="w-5 h-5" />
          <span>Add New Property</span>
        </button>

        {properties.length === 0 ? (
          <p className="text-gray-600 text-lg py-4">You haven't listed any properties yet. Start by adding one!</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <table className="w-full min-w-[600px] bg-white border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Image</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Location</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => (
                  <tr key={property.id} className="border-b border-gray-200 transition-colors duration-150 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                      <img src={property.imageUrl} alt={property.name} className="w-20 h-14 object-cover rounded-md shadow-sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{property.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{property.location}</td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap flex gap-3 flex-wrap">
                      <button
                        className="text-blue-600 transition-colors duration-200 text-sm font-medium inline-flex items-center gap-1 bg-none border-none cursor-pointer p-1 rounded hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        <Eye size={16} /><span>View</span>
                      </button>
                      <button
                        className="text-red-600 transition-colors duration-200 text-sm font-medium inline-flex items-center gap-1 bg-none border-none cursor-pointer p-1 rounded hover:text-red-800 hover:bg-red-100"
                        onClick={() => confirmRemoveProperty(property.id)} // Use custom confirm
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

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-11/12 text-center relative animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Removal</h3>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">Are you sure you want to remove this property? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelRemoveProperty} className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800">
                Cancel
              </button>
              <button onClick={executeRemoveProperty} className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 bg-red-600 text-white border border-transparent hover:bg-red-800">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerZonePage;