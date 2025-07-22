import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

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
        trackInteraction,
        handleLogout,
        handleLogin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
