// src/pages/AdminPanelPage.jsx
import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Users, Home, Briefcase, CheckCircle, AlertCircle, Trash2, Eye, Ban, Loader2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanelPage = () => {
  const { trackInteraction, isAuthenticated, isAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'brokers', 'properties', 'reports'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dummy data for admin view
  const [users, setUsers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    trackInteraction('page_view', 'admin_panel_page');
    // Check for admin/super_admin role specifically.
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || (userRole !== 'admin' && userRole !== 'super_admin')) {
      setError("You are not authorized to access the Admin Panel.");
      setLoading(false);
      trackInteraction('auth_error', 'admin_panel_unauthorized');
      navigate('/login'); // Redirect unauthorized users
      return;
    }
    fetchAdminData();
  }, [trackInteraction, isAuthenticated, isAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Dummy Data
      setUsers([
        { id: 'user_1', name: 'Regular User 1', email: 'user1@example.com', role: 'user', status: 'Active' },
        { id: 'user_2', name: 'House Owner 1', email: 'owner1@example.com', role: 'owner', status: 'Active' },
        { id: 'user_3', name: 'Blocked User', email: 'blocked@example.com', role: 'user', status: 'Blocked' },
        { id: 'user_4', name: 'New User', email: 'newuser@example.com', role: 'user', status: 'Active' },
      ]);
      setBrokers([
        { id: 'broker_A', name: 'Broker A', email: 'brokerA@example.com', status: 'Verified', subscription: 'Premium' },
        { id: 'broker_B', name: 'Broker B', email: 'brokerB@example.com', status: 'Pending Verification', subscription: 'Basic' },
        { id: 'broker_C', name: 'Broker C', email: 'brokerC@example.com', status: 'Verified', subscription: 'Basic' },
      ]);
      setProperties([
        { id: 'prop_X', name: 'Apartment in Bandra', owner: 'owner1@example.com', status: 'Active' },
        { id: 'prop_Y', name: 'Shared Room in Delhi', owner: 'brokerA@example.com', status: 'Under Review' },
        { id: 'prop_Z', name: 'Commercial Space', owner: 'brokerC@example.com', status: 'Active' },
      ]);
      setReports([
        { id: 'rep_1', type: 'Scam Report', reportedBy: 'user1@example.com', reportedAgainst: 'brokerB@example.com', status: 'New', details: 'Broker asked for advance payment outside platform.' },
        { id: 'rep_2', type: 'Fake Listing', reportedBy: 'user2@example.com', reportedAgainst: 'prop_Y', status: 'Resolved', details: 'Property images did not match actual site.' },
        { id: 'rep_3', type: 'Harassment', reportedBy: 'user4@example.com', reportedAgainst: 'user_3', status: 'New', details: 'User sending inappropriate messages.' },
      ]);

      setLoading(false);
      trackInteraction('data_fetch', 'admin_data_success');
    } catch (err) {
      setError('Failed to load admin data.');
      setLoading(false);
      trackInteraction('data_fetch', 'admin_data_failure', { error: err.message });
    }
  };

  const handleVerifyBroker = async (brokerId) => {
    setLoading(true);
    setSuccess('');
    setError('');
    trackInteraction('click', `admin_verify_broker_${brokerId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBrokers(prev => prev.map(b => b.id === brokerId ? { ...b, status: 'Verified' } : b));
      setSuccess(`Broker ${brokerId} verified successfully!`);
      trackInteraction('broker_management', 'admin_broker_verify_success', { brokerId });
    } catch (err) {
      setError('Failed to verify broker.');
      trackInteraction('broker_management', 'admin_broker_verify_failure', { brokerId, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm(`Are you sure you want to remove user ${userId}? This action cannot be undone.`)) {
      setLoading(true);
      setSuccess('');
      setError('');
      trackInteraction('click', `admin_remove_user_confirm_${userId}`);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(prev => prev.filter(u => u.id !== userId));
        setBrokers(prev => prev.filter(b => b.id !== userId)); // Also remove if they are a broker
        setSuccess(`User ${userId} removed successfully.`);
        trackInteraction('user_management', 'admin_user_remove_success', { userId });
      } catch (err) {
        setError('Failed to remove user.');
        trackInteraction('user_management', 'admin_user_remove_failure', { userId, error: err.message });
      } finally {
        setLoading(false);
      }
    } else {
      trackInteraction('click', `admin_remove_user_cancel_${userId}`);
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm(`Are you sure you want to block user ${userId}?`)) {
      setLoading(true);
      setSuccess('');
      setError('');
      trackInteraction('click', `admin_block_user_confirm_${userId}`);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Blocked' } : u));
        setSuccess(`User ${userId} blocked successfully.`);
        trackInteraction('user_management', 'admin_user_block_success', { userId });
      } catch (err) {
        setError('Failed to block user.');
        trackInteraction('user_management', 'admin_user_block_failure', { userId, error: err.message });
      } finally {
        setLoading(false);
      }
    } else {
      trackInteraction('click', `admin_block_user_cancel_${userId}`);
    }
  };

  const handleResolveReport = async (reportId) => {
    setLoading(true);
    setSuccess('');
    setError('');
    trackInteraction('click', `admin_resolve_report_${reportId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Resolved' } : r));
      setSuccess(`Report ${reportId} marked as resolved.`);
      trackInteraction('report_management', 'admin_report_resolve_success', { reportId });
    } catch (err) {
      setError('Failed to resolve report.');
      trackInteraction('report_management', 'admin_report_resolve_failure', { reportId, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReportDetails = (report) => {
    trackInteraction('click', `admin_view_report_details_${report.id}`);
    alert(`Report Details:\nID: ${report.id}\nType: ${report.type}\nReported By: ${report.reportedBy}\nAgainst: ${report.reportedAgainst}\nStatus: ${report.status}\nDetails: ${report.details}`);
  };


  if (loading && !error && !success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Loading Admin Panel data...</p>
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
            <h2 className="text-2xl font-bold">Access Denied</h2>
          </div>
          <p className="text-gray-700 mb-8 text-lg">{error}</p>
          <button
            onClick={() => { navigate('/'); trackInteraction('click', 'admin_panel_go_home'); }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-98"
          >
            Go to Home
          </button>
        </div>
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-10 relative">
        <span className="relative inline-block pb-2">
          Admin Panel
          <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-blue-600 transform -translate-x-1/2 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
        Manage users, brokers, properties, and reports for the Nestify platform.
      </p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 flex items-center space-x-2 animate-fade-in" role="alert">
          <CheckCircle size={20} />
          <span className="block sm:inline font-medium">{success}</span>
        </div>
      )}

      {/* Tabs for navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-3 mb-10 flex flex-wrap justify-center space-x-2 md:space-x-4 border border-gray-200 animate-fade-in-up delay-100">
        <button
          className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 text-lg ${
            activeTab === 'users' ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`}
          onClick={() => { setActiveTab('users'); trackInteraction('click', 'admin_tab_users'); }}
        >
          <Users size={24} /> <span>Users</span>
        </button>
        <button
          className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 text-lg ${
            activeTab === 'brokers' ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`}
          onClick={() => { setActiveTab('brokers'); trackInteraction('click', 'admin_tab_brokers'); }}
        >
          <Briefcase size={24} /> <span>Brokers</span>
        </button>
        <button
          className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 text-lg ${
            activeTab === 'properties' ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`}
          onClick={() => { setActiveTab('properties'); trackInteraction('click', 'admin_tab_properties'); }}
        >
          <Home size={24} /> <span>Properties</span>
        </button>
        <button
          className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 text-lg ${
            activeTab === 'reports' ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`}
          onClick={() => { setActiveTab('reports'); trackInteraction('click', 'admin_tab_reports'); }}
        >
          <AlertCircle size={24} /> <span>Reports</span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'users' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-800 text-sm">{user.id}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{user.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{user.email}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{user.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-3">
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <Trash2 size={16} /><span>Remove</span>
                      </button>
                      {user.status === 'Active' && (
                        <button
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-1"
                          onClick={() => handleBlockUser(user.id)}
                        >
                          <Ban size={16} /><span>Block</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'brokers' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Broker Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Subscription</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map(broker => (
                  <tr key={broker.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-800 text-sm">{broker.id}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{broker.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{broker.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        broker.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {broker.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-base">{broker.subscription}</td>
                    <td className="py-3 px-4 space-x-3">
                      {broker.status === 'Pending Verification' && (
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                          onClick={() => handleVerifyBroker(broker.id)}
                        >
                          <CheckCircle size={16} /><span>Verify</span>
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleRemoveUser(broker.id)} // Re-using remove user for broker removal
                      >
                        <Trash2 size={16} /><span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'properties' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Property Listings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Owner/Broker</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => (
                  <tr key={property.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-800 text-sm">{property.id}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{property.name}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{property.owner}</td>
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
                        onClick={() => trackInteraction('click', `admin_view_property_${property.id}`)}
                      >
                        <Eye size={16} /><span>View</span>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleRemoveUser(property.id)} // Placeholder for property removal
                      >
                        <Trash2 size={16} /><span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">User Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Reported By</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Against</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-gray-800 text-sm">{report.id}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{report.type}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{report.reportedBy}</td>
                    <td className="py-3 px-4 text-gray-800 text-base">{report.reportedAgainst}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'New' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-3">
                      {report.status === 'New' && (
                        <button
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle size={16} /><span>Resolve</span>
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                        onClick={() => handleViewReportDetails(report)}
                      >
                        <Eye size={16} /><span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminPanelPage;