import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, LogOut } from 'lucide-react';
import { AppContext } from '../../context/AppContext.jsx';

const AdminLayout = () => {
  const { trackInteraction, isAdmin, authLoading } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading) {
      const token = localStorage.getItem('token');
      if (!token) {
        trackInteraction('auth_error', 'admin_unauthenticated');
        navigate('/login');
        return;
      }
      if (!isAdmin) {
        trackInteraction('auth_error', 'admin_not_authorized');
        navigate('/');
        return;
      }
    }
    // eslint-disable-next-line
  }, [authLoading, isAdmin, navigate, trackInteraction]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    trackInteraction('click', 'admin_logout');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-white shadow-lg"></div>
          <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-emerald-200 animate-pulse opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-slate-900 via-slate-800 to-gray-900 text-white h-screen ${isSidebarOpen ? 'w-64' : 'w-20'} fixed shadow-2xl transition-all duration-300 border-r border-slate-700`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h2 className={`${isSidebarOpen ? 'block' : 'hidden'} text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent`}>
              Nestify Admin
            </h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200 hover:scale-105"
          >
            {isSidebarOpen ? 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg> : 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            }
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 flex-1">
          <Link
            to="/admin-panel"
            className={`group flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
              isActive('/admin-panel') && !isActive('/users') && !isActive('/properties') 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 text-white' 
                : 'hover:bg-slate-700 hover:translate-x-1'
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive('/admin-panel') && !isActive('/users') && !isActive('/properties')
                ? 'bg-white/20' 
                : 'group-hover:bg-slate-600'
            } transition-all duration-200`}>
              <LayoutDashboard className="h-5 w-5" />
            </div>
            {isSidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
          </Link>

          <Link
            to="/admin-panel/users"
            className={`group flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
              isActive('/admin-panel/users') 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25 text-white' 
                : 'hover:bg-slate-700 hover:translate-x-1'
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive('/admin-panel/users')
                ? 'bg-white/20' 
                : 'group-hover:bg-slate-600'
            } transition-all duration-200`}>
              <Users className="h-5 w-5" />
            </div>
            {isSidebarOpen && <span className="ml-3 font-medium">Users</span>}
          </Link>

          <Link
            to="/admin-panel/properties"
            className={`group flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
              isActive('/admin-panel/properties') 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/25 text-white' 
                : 'hover:bg-slate-700 hover:translate-x-1'
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive('/admin-panel/properties')
                ? 'bg-white/20' 
                : 'group-hover:bg-slate-600'
            } transition-all duration-200`}>
              <Home className="h-5 w-5" />
            </div>
            {isSidebarOpen && <span className="ml-3 font-medium">Properties</span>}
          </Link>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="group flex items-center py-3 px-4 w-full text-left hover:bg-red-600 hover:translate-x-1 rounded-xl transition-all duration-200"
            >
              <div className="p-1 rounded-lg group-hover:bg-red-700 transition-all duration-200">
                <LogOut className="h-5 w-5" />
              </div>
              {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
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
    </div>
  );
};

export default AdminLayout;