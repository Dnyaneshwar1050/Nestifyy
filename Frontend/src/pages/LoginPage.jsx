// src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Building2, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const LoginPage = () => {
  const { handleLogin, trackInteraction, isAuthenticated } = useContext(AppContext);
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    trackInteraction('page_view', 'login_page');
    setMounted(true);
  }, [trackInteraction]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); 
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:8000/api/user/login`, {
        email,
        password,
      });
      const { token, user } = response.data;

      // Store token and update context
      localStorage.setItem("token", token);
      console.log('Token saved:', token);
      handleLogin(token, user);
      trackInteraction("login", "login_success");

      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      trackInteraction("login", "login_failure", { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md transform transition-all duration-500 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 rounded-2xl p-4 shadow-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative mb-6 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  id="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all duration-200 text-gray-900 bg-gray-50 ${
                    focusedField === 'email' 
                      ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all duration-200 text-gray-900 bg-gray-50 ${
                    focusedField === 'password' 
                      ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-100'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200" 
                onClick={() => trackInteraction('click', 'register_link_from_login')}
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <Shield className="w-4 h-4" />
              <span>Your information is secure and protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;