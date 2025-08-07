import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Loader2, AlertCircle, Users, Home, DollarSign, MapPin } from 'lucide-react';
import StatsCard from './StatsCard';
import Properties from './Properties';
import axios from 'axios';

const AdminDashboard = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalRoomRequests: 0,
    totalBrokers: 0,
  });

  useEffect(() => {
    trackInteraction('page_view', 'admin_dashboard_page');
    const storedRole = localStorage.getItem('userRole');
    if (!isAuthenticated || storedRole !== 'admin') {
      setError('You need to be logged in as an admin to access this dashboard.');
      setLoading(false);
      trackInteraction('auth_error', 'admin_dashboard_unauthenticated');
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [trackInteraction, isAuthenticated, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch stats
      const statsResponse = await axios.get('https://nestifyy-my3u.onrender.com/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsResponse.data || {
        totalUsers: 0,
        totalProperties: 0,
        totalRoomRequests: 0,
        totalBrokers: 0,
      });

      setLoading(false);
      trackInteraction('data_fetch', 'admin_dashboard_stats_success');
    } catch (err) {
      console.error('Fetch admin data error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
      setLoading(false);
      trackInteraction('data_fetch', 'admin_dashboard_stats_failure', { error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <Users size={32} className="text-maroon" />
          Admin Dashboard
        </h1>

        {loading && (
          <div className="text-center text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-blue mb-4 animate-spin" />
            <p>Loading dashboard data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-base">
            <AlertCircle size={20} className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users size={24} className="text-blue-600" />}
              bgColor="bg-blue-50"
            />
            <StatsCard
              title="Total Properties"
              value={stats.totalProperties}
              icon={<Home size={24} className="text-green-600" />}
              bgColor="bg-green-50"
            />
            <StatsCard
              title="Room Requests"
              value={stats.totalRoomRequests}
              icon={<MapPin size={24} className="text-purple-600" />}
              bgColor="bg-purple-50"
            />
            <StatsCard
              title="Total Brokers"
              value={stats.totalBrokers}
              icon={<DollarSign size={24} className="text-yellow-600" />}
              bgColor="bg-yellow-50"
            />
          </div>
        )}

        <Properties />

        <style>{`
          .bg-maroon { background-color: #004dc3; }
          .text-maroon { color: #004dc3; }
          .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDashboard;