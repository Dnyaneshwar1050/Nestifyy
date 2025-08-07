import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Users, Home, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { trackInteraction, handleLogout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    trackInteraction('click', 'admin_logout');
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 flex items-center gap-2">
          <Settings size={28} className="text-maroon" />
          Admin Panel
        </h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin-panel"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
                  }`
                }
                onClick={() => trackInteraction('click', 'admin_nav_dashboard')}
              >
                <Users size={20} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin-panel/properties"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
                  }`
                }
                onClick={() => trackInteraction('click', 'admin_nav_properties')}
              >
                <Home size={20} />
                Properties
              </NavLink>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleLogoutClick}
          className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>

      <style>{`
        .bg-maroon { background-color: #004dc3; }
        .text-maroon { color: #004dc3; }
      `}</style>
    </div>
  );
};

export default AdminLayout;