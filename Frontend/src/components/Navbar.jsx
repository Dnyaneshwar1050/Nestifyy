import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Map,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, userRole, trackInteraction, handleLogout } =
    useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Pune");
  const cityDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  const cities = [
    "Pune",
    "Mumbai",
    "Bengaluru",
    "Delhi",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Ahmedabad",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setIsCityDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        isMobileMenuOpen &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-white shadow-lg py-4 px-6 md:px-12 flex justify-between items-center relative z-50">
      <Link
        to="/"
        className="text-2xl font-extrabold flex items-center gap-2 text-blue-700 transition-colors duration-300 hover:text-blue-800"
        onClick={() => trackInteraction("click", "logo")}
      >
        <Home className="text-blue-600" size={28} strokeWidth={2.5} />
        <span className="text-gray-900">Nestify</span>
      </Link>

      <div className="md:hidden">
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            trackInteraction(
              "click",
              `mobile_menu_toggle_${isMobileMenuOpen ? "close" : "open"}`
            );
          }}
          className="p-2 rounded-md text-gray-600 transition-colors duration-150 hover:text-gray-900 hover:bg-gray-100 focus:outline-none mobile-menu-button"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <div className="relative" ref={cityDropdownRef}>
          <button
            className="flex items-center px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer hover:bg-blue-100 hover:shadow-md"
            onClick={() => {
              setIsCityDropdownOpen(!isCityDropdownOpen);
              trackInteraction("click", "city_dropdown_toggle");
            }}
          >
            <Map size={18} className="mr-2 text-blue-500" />
            <span className="font-semibold">{selectedCity}</span>
            <ChevronDown
              size={16}
              className={`ml-2 transition-transform duration-200 ${
                isCityDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto animate-fade-in-down">
              <div className="py-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    className="block w-full text-left px-4 py-2 text-gray-700 text-sm transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                      trackInteraction("click", `city_select_${city}`);
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <NavLink
          to="/find-room"
          className={({ isActive }) =>
            `font-medium text-base py-2 px-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? "text-blue-700 bg-blue-50 shadow-sm"
                : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
            }`
          }
          onClick={() => trackInteraction("click", "nav_find_room")}
        >
          Find Room
        </NavLink>
        <NavLink
          to="/find-roommate"
          className={({ isActive }) =>
            `font-medium text-base py-2 px-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? "text-blue-700 bg-blue-50 shadow-sm"
                : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
            }`
          }
          onClick={() => trackInteraction("click", "nav_find_roommate")}
        >
          Find Roommate
        </NavLink>
        <NavLink
          to="/list-property"
          className={({ isActive }) =>
            `font-medium text-base py-2 px-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? "text-blue-700 bg-blue-50 shadow-sm"
                : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
            }`
          }
          onClick={() => trackInteraction("click", "nav_list_property")}
        >
          List Property
        </NavLink>
        {userRole === "broker" && (
          <NavLink
            to="/broker-zone"
            className={({ isActive }) =>
              `font-medium text-base py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "text-blue-700 bg-blue-50 shadow-sm"
                  : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
              }`
            }
            onClick={() => trackInteraction("click", "nav_broker_zone")}
          >
            Broker Zone
          </NavLink>
        )}
        {isAuthenticated && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `font-medium text-base py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "text-blue-700 bg-blue-50 shadow-sm"
                  : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
              }`
            }
            onClick={() => trackInteraction("click", "nav_profile")}
          >
            Profile
          </NavLink>
        )}
        {isAuthenticated ? (
          <>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            {userRole === "user" && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
                onClick={() => trackInteraction("click", "nav_dashboard")}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin-panel"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
                onClick={() => trackInteraction("click", "nav_admin_panel")}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </NavLink>
            )}
            <button
              onClick={() => {
                handleLogout();
                navigate("/login");
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-white transition-all duration-300 text-sm font-medium shadow-md hover:bg-red-700 hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-blue-50 text-blue-600 transition-all duration-300 text-sm font-semibold shadow-sm hover:bg-blue-100 hover:shadow-md"
              onClick={() => trackInteraction("click", "login_signup_button")}
            >
              Login/Signup
            </Link>
          </>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-[72px] left-0 w-full bg-white shadow-xl py-6 px-4 border-t border-gray-200 z-40 overflow-y-auto max-h-[calc(100vh-72px)] md:hidden animate-slide-in-down"
        >
          <div className="relative mb-6">
            <button
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 text-base font-medium shadow-sm transition-colors duration-200"
              onClick={() => {
                setIsCityDropdownOpen(!isCityDropdownOpen);
                trackInteraction("click", "mobile_city_dropdown_toggle");
              }}
            >
              <span className="flex items-center">
                <Map size={20} className="mr-3 text-blue-500" />
                <span className="font-semibold">{selectedCity}</span>
              </span>
              <ChevronDown
                size={18}
                className={`ml-1 transition-transform duration-200 ${
                  isCityDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isCityDropdownOpen && (
              <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto animate-fade-in-down">
                {cities.map((city) => (
                  <button
                    key={city}
                    className="block w-full text-left px-4 py-2 text-gray-700 text-base transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                      trackInteraction("click", `mobile_city_select_${city}`);
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <NavLink
              to="/find-room"
              onClick={() => {
                setIsMobileMenuOpen(false);
                trackInteraction("click", "mobile_nav_find_room");
              }}
              className={({ isActive }) =>
                `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                  isActive
                    ? "text-blue-700 bg-blue-50 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                }`
              }
            >
              Find Room
            </NavLink>
            <NavLink
              to="/find-roommate"
              onClick={() => {
                setIsMobileMenuOpen(false);
                trackInteraction("click", "mobile_nav_find_roommate");
              }}
              className={({ isActive }) =>
                `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                  isActive
                    ? "text-blue-700 bg-blue-50 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                }`
              }
            >
              Find Roommate
            </NavLink>
            <NavLink
              to="/list-property"
              onClick={() => {
                setIsMobileMenuOpen(false);
                trackInteraction("click", "mobile_nav_list_property");
              }}
              className={({ isActive }) =>
                `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                  isActive
                    ? "text-blue-700 bg-blue-50 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                }`
              }
            >
              List Property
            </NavLink>
            {userRole === "broker" && (
              <NavLink
                to="/broker-zone"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  trackInteraction("click", "mobile_nav_broker_zone");
                }}
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                    isActive
                      ? "text-blue-700 bg-blue-50 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                  }`
                }
              >
                Broker Zone
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                {userRole === "user" && (
                  <NavLink
                    to="/dashboard"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      trackInteraction("click", "mobile_nav_dashboard");
                    }}
                    className={({ isActive }) =>
                      `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                        isActive
                          ? "text-blue-700 bg-blue-50 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                )}
                </>
            )}
            {isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
                <NavLink
                to="/profile"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  trackInteraction("click", "mobile_nav_profile");
                }}
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                    isActive
                      ? "text-blue-700 bg-blue-50 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                  }`
                }
              >
                Profile
              </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin-panel"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      trackInteraction("click", "mobile_nav_admin_panel");
                    }}
                    className={({ isActive }) =>
                      `block py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                        isActive
                          ? "text-blue-700 bg-blue-50 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                    trackInteraction("click", "mobile_logout_button");
                    navigate("/login");
                  }}
                  className="block w-full text-left py-3 px-4 rounded-lg text-red-600 transition-colors duration-200 text-base font-medium hover:bg-red-100 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-3 px-4">
                <Link
                  to="/login"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    trackInteraction("click", "mobile_login_signup_button");
                  }}
                  className="px-5 py-3 text-center text-blue-600 bg-blue-50 rounded-full transition-colors duration-200 font-semibold shadow-sm hover:bg-blue-100"
                >
                  Login/Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;