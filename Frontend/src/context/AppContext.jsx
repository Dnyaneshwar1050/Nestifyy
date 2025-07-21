import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserId(decoded.id || decoded._id);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUserId(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserId(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserId(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserId(null);
    navigate("/login"); 
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    setIsAuthenticated(true);
    setUserId(user?.id || user?._id || null);
  };

  const trackInteraction = (eventType, elementId, additionalData = {}) => {
    console.log('TRACKING EVENT:', {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      eventType,
      elementId,
      currentPath: window.location.pathname,
      ...additionalData,
    });
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, userId, trackInteraction, handleLogout, handleLogin }}>
      {children}
    </AppContext.Provider>
  );
};