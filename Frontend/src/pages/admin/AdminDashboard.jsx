import React, { useState, useEffect, useContext } from 'react';
import { Users, Home, MessageSquare, Calendar, AlertCircle, TrendingUp, Activity, Clock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext.jsx';

const AdminDashboard = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const [stats, setStats] = useState({
    userCount: 0,
    propertyCount: 0,
    roomRequestCount: 0,
    recentUsers: [],
    recentProperties: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:8000/api';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const fetches = [
          fetch(`${API_URL}/user/all`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_URL}/property/all`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_URL}/room-request/all`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_URL}/user/all?page=1&limit=5`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_URL}/property/all?page=1&limit=5`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ];

        const [
          userResponse,
          propertyResponse,
          roomRequestResponse,
          recentUsersResponse,
          recentPropertiesResponse
        ] = await Promise.all(fetches);

        const userData = userResponse.ok ? await userResponse.json() : { pagination: { total: 0 } };
        const propertyData = propertyResponse.ok ? await propertyResponse.json() : { pagination: { total: 0 } };
        const roomRequestData = roomRequestResponse.ok ? await roomRequestResponse.json() : { pagination: { total: 0 } };
        const recentUsersData = recentUsersResponse.ok ? await recentUsersResponse.json() : { users: [] };
        const recentPropertiesData = recentPropertiesResponse.ok ? await recentPropertiesResponse.json() : { properties: [] };

        if (!userResponse.ok) throw new Error(userData.message || 'Failed to fetch user count');
        if (!propertyResponse.ok) throw new Error(propertyData.message || 'Failed to fetch property count');
        if (!roomRequestResponse.ok) throw new Error(roomRequestData.message || 'Failed to fetch room request count');
        if (!recentUsersResponse.ok) throw new Error(recentUsersData.message || 'Failed to fetch recent users');
        if (!recentPropertiesResponse.ok) throw new Error(recentPropertiesData.message || 'Failed to fetch recent properties');

        setStats({
          userCount: userData.pagination?.total || (Array.isArray(userData.users) ? userData.users.length : 0),
          propertyCount: propertyData.pagination?.total || (Array.isArray(propertyData.properties) ? propertyData.properties.length : 0),
          roomRequestCount: roomRequestData.pagination?.total || (Array.isArray(roomRequestData) ? roomRequestData.length : 0),
          recentUsers: recentUsersData.users || [],
          recentProperties: recentPropertiesData.properties || []
        });

        trackInteraction('data_fetch', 'admin_dashboard_fetch_success');
      } catch (err) {
        console.error('Error fetching dashboard data:', err.message);
        setError('Failed to load dashboard data. Please try again.');
        trackInteraction('data_fetch', 'admin_dashboard_fetch_failure', { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [trackInteraction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent shadow-xl"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-emerald-200 animate-pulse opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const StatCard = ({ icon: Icon, title, value, trend, color, delay }) => (
    <div 
      className={`group relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 p-8 border border-white/20 overflow-hidden animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${color} rounded-full opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-125`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${color.split(' ')[0].replace('from-', '')}, ${color.split(' ')[1].replace('to-', '')})` }}>
            {value.toLocaleString()}
          </p>
          {/* {trend && (
            <div className="flex items-center text-sm">
              <div className="p-1 bg-green-100 rounded-full mr-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-green-600 font-semibold">+{trend}% from last month</span>
            </div>
          )} */}
        </div>
        <div className={`rounded-2xl p-4 bg-gradient-to-br ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
          <Icon className={`h-8 w-8 text-gray-700 group-hover:text-white transition-all duration-300`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg mt-2">Welcome back! Here's what's happening with your platform.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 px-8 py-6 rounded-2xl mb-12 flex items-center gap-4 animate-shake shadow-lg">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Error Loading Data</h3>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.userCount}
            trend={12}
            color="from-purple-500 to-pink-500"
            delay={0}
          />
          <StatCard
            icon={Home}
            title="Total Properties"
            value={stats.propertyCount}
            trend={8}
            color="from-emerald-500 to-teal-500"
            delay={100}
          />
          <StatCard
            icon={MessageSquare}
            title="Room Requests"
            value={stats.roomRequestCount}
            trend={24}
            color="from-orange-500 to-red-500"
            delay={200}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mr-4">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Recent Users</h2>
                </div>
                <Link 
                  to="/admin-panel/users" 
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 text-sm backdrop-blur-sm hover:scale-105"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-8">
              {stats.recentUsers.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentUsers.map((user, index) => (
                    <div 
                      key={user._id} 
                      className="flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 group animate-slide-in-right border border-gray-100 hover:border-purple-200 hover:shadow-lg"
                      style={{ animationDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="flex items-center">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={user.name}
                            className="h-14 w-14 rounded-2xl object-cover ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300 shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-5">
                          <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 text-lg">{user.name}</p>
                          <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                        <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-all duration-300">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold ml-2">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xl font-medium">No users found</p>
                  <p className="text-gray-400 text-sm mt-2">New users will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Properties */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mr-4">
                    <Home className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Recent Properties</h2>
                </div>
                <Link 
                  to="/admin-panel/properties" 
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 text-sm backdrop-blur-sm hover:scale-105"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-8">
              {stats.recentProperties.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentProperties.map((property, index) => (
                    <div 
                      key={property._id} 
                      className="flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 group animate-slide-in-left border border-gray-100 hover:border-emerald-200 hover:shadow-lg"
                      style={{ animationDelay: `${500 + index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 truncate mb-2 text-lg">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center font-medium">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 shadow-sm"></div>
                          {property.city}
                        </p>
                      </div>
                      <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                        <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-all duration-300">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold ml-2">{formatDate(property.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Home className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xl font-medium">No properties found</p>
                  <p className="text-gray-400 text-sm mt-2">New properties will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out both;
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #14b8a6);
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #0d9488);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;