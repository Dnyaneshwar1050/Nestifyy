// src/pages/SuperAdminPanelPage.jsx
import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Settings, TrendingUp, PlusCircle, Trash2, Edit, CheckCircle, AlertCircle, Loader2, Users, Home, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminPanelPage = () => {
  const { trackInteraction, isAuthenticated, isAdmin } = useContext(AppContext); // isAdmin is used as a general check, but specific role check is done below
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'subscription_plans', 'promotional_ads'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dummy data for Super Admin view
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [promotionalAds, setPromotionalAds] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    verifiedBrokers: 0,
    revenueLastMonth: '0',
  });

  useEffect(() => {
    trackInteraction('page_view', 'super_admin_panel_page');
    // Check for super admin role specifically.
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'super_admin') {
      setError("You are not authorized to access the Super Admin Panel.");
      setLoading(false);
      trackInteraction('auth_error', 'super_admin_panel_unauthorized');
      setTimeout(() => navigate('/login'), 2000); // Redirect unauthorized users
      return;
    }
    fetchSuperAdminData();
  }, [trackInteraction, isAuthenticated, navigate]);

  const fetchSuperAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call to get super admin data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dummy data
      setPlatformStats({
        totalUsers: 1250,
        activeListings: 340,
        verifiedBrokers: 85,
        revenueLastMonth: '15,000',
      });
      setSubscriptionPlans([
        { id: 1, name: 'Basic', price: 'Free', features: ['5 Listings', 'Basic Support'] },
        { id: 2, name: 'Premium', price: '$29/month', features: ['Unlimited Listings', 'Priority Support', 'Featured Listings'] },
      ]);
      setPromotionalAds([
        { id: 1, title: 'Summer Sale', content: 'Get 20% off all premium plans!', status: 'Active' },
        { id: 2, title: 'New Feature Launch', content: 'Introducing advanced analytics for brokers.', status: 'Draft' },
      ]);
      setLoading(false);
      trackInteraction('data_fetch', 'super_admin_data_success');
    } catch (err) {
      setError('Failed to load super admin data.');
      setLoading(false);
      trackInteraction('data_fetch', 'super_admin_data_failure', { error: err.message });
    }
  };

  const handleAddSubscriptionPlan = () => {
    trackInteraction('click', 'super_admin_add_plan');
    alert('Simulating Add Subscription Plan functionality.');
    // In a real app, this would open a modal or navigate to a new form
  };

  const handleEditSubscriptionPlan = (planId) => {
    trackInteraction('click', `super_admin_edit_plan_${planId}`);
    alert(`Simulating Edit Subscription Plan ${planId}.`);
  };

  const handleDeleteSubscriptionPlan = (planId) => {
    trackInteraction('click', `super_admin_delete_plan_${planId}`);
    if (window.confirm(`Are you sure you want to delete subscription plan ${planId}?`)) {
      setSubscriptionPlans(prev => prev.filter(p => p.id !== planId));
      setSuccess(`Subscription plan ${planId} deleted.`);
      trackInteraction('plan_management', 'super_admin_plan_delete_success', { planId });
    }
  };

  const handleAddPromotionalAd = () => {
    trackInteraction('click', 'super_admin_add_ad');
    alert('Simulating Add Promotional Ad functionality.');
  };

  const handleEditPromotionalAd = (adId) => {
    trackInteraction('click', `super_admin_edit_ad_${adId}`);
    alert(`Simulating Edit Promotional Ad ${adId}.`);
  };

  const handleDeletePromotionalAd = (adId) => {
    trackInteraction('click', `super_admin_delete_ad_${adId}`);
    if (window.confirm(`Are you sure you want to delete promotional ad ${adId}?`)) {
      setPromotionalAds(prev => prev.filter(a => a.id !== adId));
      setSuccess(`Promotional ad ${adId} deleted.`);
      trackInteraction('ad_management', 'super_admin_ad_delete_success', { adId });
    }
  };

  if (loading && !error && !success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Loading Super Admin Panel data...</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-red-200 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
            <AlertCircle className="w-10 h-10" />
            <h2 className="text-2xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">{error}</p>
          <button
            onClick={() => { navigate('/login'); trackInteraction('click', 'super_admin_login_redirect'); }}
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
          Super Admin Panel
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
        Manage platform settings, subscription plans, and promotional activities.
      </p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-2 text-base w-full max-w-6xl box-border animate-fade-in" role="alert">
          <CheckCircle size={20} />
          <span className="block sm:inline font-medium">{success}</span>
        </div>
      )}
      {error && isAuthenticated && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-2 text-base w-full max-w-6xl box-border animate-fade-in" role="alert">
          <AlertCircle size={20} />
          <span className="block sm:inline font-medium">{error}</span>
        </div>
      )}

      {/* Tabs for navigation */}
      <div className="flex justify-center mb-8 w-full max-w-6xl">
        <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-md border border-gray-200">
          <button
            onClick={() => { setActiveTab('overview'); trackInteraction('click', 'super_admin_tab_overview'); }}
            className={`px-5 py-2 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck size={20} /> Overview
          </button>
          <button
            onClick={() => { setActiveTab('subscription_plans'); trackInteraction('click', 'super_admin_tab_plans'); }}
            className={`px-5 py-2 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === 'subscription_plans' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
          Plans
          </button>
          <button
            onClick={() => { setActiveTab('promotional_ads'); trackInteraction('click', 'super_admin_tab_ads'); }}
            className={`px-5 py-2 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === 'promotional_ads' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={20} /> Ads
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Settings size={28} className="text-gray-600" />
            <span>Platform Overview</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Users className="w-12 h-12 text-blue-600 mb-3" />
              <p className="text-gray-600 text-lg font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-800">{platformStats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Home className="w-12 h-12 text-green-600 mb-3" />
              <p className="text-gray-600 text-lg font-medium">Active Listings</p>
              <p className="text-3xl font-bold text-green-800">{platformStats.activeListings}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Briefcase className="w-12 h-12 text-purple-600 mb-3" />
              <p className="text-gray-600 text-lg font-medium">Verified Brokers</p>
              <p className="text-3xl font-bold text-purple-800">{platformStats.verifiedBrokers}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-gray-600 text-lg font-medium">Revenue (Last Month)</p>
              <p className="text-3xl font-bold text-yellow-800">₹{platformStats.revenueLastMonth}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'subscription_plans' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span>Manage Subscription Plans</span>
          </h2>
          <button
            onClick={handleAddSubscriptionPlan}
            className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 text-base font-semibold shadow-md inline-flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg active:scale-95"
            onMouseEnter={() => trackInteraction('hover', 'super_admin_add_plan_button')}
          >
            <PlusCircle size={20} />
            <span>Add New Plan</span>
          </button>
          {subscriptionPlans.length === 0 ? (
            <p className="text-gray-600 text-lg py-4">No subscription plans defined yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="w-full min-w-[600px] bg-white border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Price</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Features</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionPlans.map(plan => (
                    <tr key={plan.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{plan.id}</td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{plan.name}</td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{plan.price}</td>
                      <td className="py-3 px-4 text-gray-800 text-base">
                        <ul className="list-disc pl-5">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-700">{feature}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                          onClick={() => handleEditSubscriptionPlan(plan.id)}
                        >
                          <Edit size={16} /><span>Edit</span>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200 p-1 rounded hover:bg-red-100"
                          onClick={() => handleDeleteSubscriptionPlan(plan.id)}
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

      {activeTab === 'promotional_ads' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl mb-8 border border-gray-200 box-border md:p-8 animate-fade-in-up delay-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <TrendingUp size={28} className="text-orange-600" />
            <span>Manage Promotional Ads</span>
          </h2>
          <button
            onClick={handleAddPromotionalAd}
            className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 text-base font-semibold shadow-md inline-flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg active:scale-95"
            onMouseEnter={() => trackInteraction('hover', 'super_admin_add_ad_button')}
          >
            <PlusCircle size={20} />
            <span>Add New Ad</span>
          </button>
          {promotionalAds.length === 0 ? (
            <p className="text-gray-600 text-lg py-4">No promotional ads defined yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="w-full min-w-[600px] bg-white border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Title</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Content</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionalAds.map(ad => (
                    <tr key={ad.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{ad.id}</td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{ad.title}</td>
                      <td className="py-3 px-4 text-gray-800 text-base">{ad.content}</td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          ad.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                          onClick={() => handleEditPromotionalAd(ad.id)}
                        >
                          <Edit size={16} /><span>Edit</span>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200 p-1 rounded hover:bg-red-100"
                          onClick={() => handleDeletePromotionalAd(ad.id)}
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
      <style jsx>{`
        /* Animations */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SuperAdminPanelPage;