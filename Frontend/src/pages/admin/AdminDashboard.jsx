import { useState, useEffect, useContext } from 'react';
import { Users, Home, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext.jsx';

const AdminDashboard = () => {
  const { trackInteraction } = useContext(AppContext);
  const [stats, setStats] = useState({
    userCount: 0,
    propertyCount: 0,
    roomRequestCount: 0,
    recentUsers: [],
    recentProperties: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'https://nestifyy-my3u.onrender.com/api';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

        // Fetch user count
        const userResponse = await fetch(`${API_URL}/user/count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const userData = await userResponse.json();
        if (!userResponse.ok) throw new Error(userData.message || 'Failed to fetch user count');

        // Fetch property count
        const propertyResponse = await fetch(`${API_URL}/property/count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const propertyData = await propertyResponse.json();
        if (!propertyResponse.ok) throw new Error(propertyData.message || 'Failed to fetch property count');

        // Fetch room request count
        const roomRequestResponse = await fetch(`${API_URL}/room-request/count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const roomRequestData = await roomRequestResponse.json();
        if (!roomRequestResponse.ok) throw new Error(roomRequestData.message || 'Failed to fetch room request count');

        // Fetch recent users
        const recentUsersResponse = await fetch(`${API_URL}/user?page=1&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const recentUsersData = await recentUsersResponse.json();
        if (!recentUsersResponse.ok) throw new Error(recentUsersData.message || 'Failed to fetch recent users');

        // Fetch recent properties
        const recentPropertiesResponse = await fetch(`${API_URL}/property/all?page=1&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const recentPropertiesData = await recentPropertiesResponse.json();
        if (!recentPropertiesResponse.ok) throw new Error(recentPropertiesData.message || 'Failed to fetch recent properties');

        setStats({
          userCount: userData.count || 0,
          propertyCount: propertyData.count || 0,
          roomRequestCount: roomRequestData.count || 0,
          recentUsers: recentUsersData.users || [],
          recentProperties: recentPropertiesData.properties || []
        });
        trackInteraction('data_fetch', 'admin_dashboard_fetch_success');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <Users className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.userCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <Home className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Properties</p>
            <p className="text-2xl font-bold text-gray-800">{stats.propertyCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <MessageSquare className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Room Requests</p>
            <p className="text-2xl font-bold text-gray-800">{stats.roomRequestCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Users and Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
            <Link to="/admin-panel/users" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-6">
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Properties</h2>
            <Link to="/admin-panel/properties" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-6">
            {stats.recentProperties.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProperties.map((property) => (
                  <div key={property._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{property.title}</h3>
                      <p className="text-xs text-gray-500">{property.city}</p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(property.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No properties found</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-blue-600 { background-color: #2563eb; }
        .bg-blue-700 { background-color: #1d4ed8; }
        .text-blue-600 { color: #2563eb; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;