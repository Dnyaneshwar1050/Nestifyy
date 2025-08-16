// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext'; 

// Import Components
import Navbar from './components/Navbar.jsx';
import Footer from './components/footer.jsx';

// Import Pages
import HomePage from './components/HomePage';
import FindRoomPage from './pages/FindRoomPage';
import FindRoommatePage from './pages/FindRoommatePage';
import ListPropertyPage from './pages/ListPropertyPage';
import BrokerZonePage from './pages/BrokerZonePage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage.jsx';
import ProfileDetailPage from './pages/ProfileDetailPage';
import FeedbackPage from './pages/FeedbackPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PropertyDetailPage from './pages/PropertyDetailPage';

// admin routes 
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UsersManagement from './pages/admin/UsersManagement.jsx';
import PropertiesManagement from './pages/admin/PropertiesManagement.jsx';

// Layout component for main site
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen bg-gray-100">
      {children}
    </main>
    <Footer />
  </>
);


const App = () => {
  return (
    <Router>
      <AppContextProvider> {/* Wrap the entire application with AppContextProvider */}
        <div className="min-h-screen bg-gray-50 font-inter antialiased flex flex-col">
          <div className="flex-grow"> {/* This div ensures content pushes footer down */}
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin-panel" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="properties" element={<PropertiesManagement />} />
              </Route>
              <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
              <Route path="/find-room" element={<MainLayout><FindRoomPage /></MainLayout>} />
              <Route path="/find-roommate" element={<MainLayout><FindRoommatePage /></MainLayout>} />
              <Route path="/list-property" element={<MainLayout><ListPropertyPage /></MainLayout>} />
              <Route path="/broker-zone" element={<MainLayout><BrokerZonePage /></MainLayout>} />
              <Route path="/support" element={<MainLayout><SupportPage /></MainLayout>} />
              <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
              <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
              <Route path="/profile/:id" element={<MainLayout><ProfileDetailPage /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
              <Route path="/feedback" element={<MainLayout><FeedbackPage /></MainLayout>} />
              <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
              <Route path="/property/:id" element={<MainLayout><PropertyDetailPage /></MainLayout>} />
              <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
            </Routes>
          </div>
        </div>
      </AppContextProvider>
    </Router>
  );
};

export default App;
