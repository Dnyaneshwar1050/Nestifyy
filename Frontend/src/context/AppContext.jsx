import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();


export const AppContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAllAuth = async () => {
      setAuthLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            setUserId(decoded.id || decoded._id);
            setUserRole(decoded.role || localStorage.getItem("userRole") || "");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            setIsAuthenticated(false);
            setUserId(null);
            setUserRole("");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          setIsAuthenticated(false);
          setUserId(null);
          setUserRole("");
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole("");
      }
      // Always check admin status on mount
      await checkAuthAndAdmin();
      setAuthLoading(false);
    };
    checkAllAuth();
  }, []);
  
  const checkAuthAndAdmin = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token is still valid
          const response = await fetch('http://localhost:8000/api/user/profile', {
            headers:
             {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsAuthenticated(true);
            setIsAdmin(userData.isAdmin === true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // On error, assume token is invalid
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };


  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);
    const decoded = jwtDecode(token);
    setIsAuthenticated(true);
    setUserId(user?.id || user?._id || decoded.id || decoded._id || null);
    setUserRole(user.role || decoded.role || ""); // Update userRole in context
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUserId(null);
    setUserRole("");
    navigate("/login");
  };

  const trackInteraction = (eventType, elementId, additionalData = {}) => {
    console.log("TRACKING EVENT:", {
      timestamp: new Date().toISOString(),
      userId: userId || "anonymous",
      eventType,
      elementId,
      currentPath: window.location.pathname,
      ...additionalData,
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        userId,
        userRole,
        isAdmin,
        authLoading,
        trackInteraction,
        handleLogout,
        handleLogin,
        checkAuthAndAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
