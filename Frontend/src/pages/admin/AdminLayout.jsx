import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, LogOut } from 'lucide-react';
import { AppContext } from '../../context/AppContext.jsx';

const AdminLayout = () => {
  const { trackInteraction, isAdmin } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          trackInteraction('auth_error', 'admin_unauthenticated');
          navigate('/login');
          return;
        }

        const response = await fetch('https://nestifyy-my3u.onrender.com/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Not authorized');
        }

        const userData = await response.json();
        if (!isAdmin) {
          trackInteraction('auth_error', 'admin_not_authorized');
          navigate('/');
          return;
        }

        setUser(userData);
        trackInteraction('data_fetch', 'admin_profile_fetch_success');
      } catch (error) {
        console.error('Auth error:', error);
        trackInteraction('data_fetch', 'admin_profile_fetch_failure', { error: error.message });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, trackInteraction, isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    trackInteraction('click', 'admin_logout');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-blue-600 text-white h-screen ${isSidebarOpen ? 'w-64' : 'w-20'} fixed shadow-lg transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className={`${isSidebarOpen ? 'block' : 'hidden'} text-xl font-bold`}>Nestify Admin</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-blue-700"
          >
            {isSidebarOpen ? <span>&larr;</span> : <span>&rarr;</span>}
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/admin-panel"
            className={`flex items-center py-3 px-4 ${isActive('/admin-panel') && !isActive('/users') && !isActive('/properties') ? 'bg-blue-700' : 'hover:bg-blue-700'} transition-colors duration-200`}
          >
            <LayoutDashboard className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link
            to="/admin-panel/users"
            className={`flex items-center py-3 px-4 ${isActive('/admin-panel/users') ? 'bg-blue-700' : 'hover:bg-blue-700'} transition-colors duration-200`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Users</span>}
          </Link>
          <Link
            to="/admin-panel/properties"
            className={`flex items-center py-3 px-4 ${isActive('/admin-panel/properties') ? 'bg-blue-700' : 'hover:bg-blue-700'} transition-colors duration-200`}
          >
            <Home className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Properties</span>}
          </Link>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center py-3 px-4 w-full text-left hover:bg-blue-700 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        .bg-blue-600 { background-color: #2563eb; }
        .bg-blue-700 { background-color: #1d4ed8; }
      `}</style>
    </div>
  );
};

export default AdminLayout;