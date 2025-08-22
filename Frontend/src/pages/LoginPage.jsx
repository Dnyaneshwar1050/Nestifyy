// src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
      const response = await axios.post(`https://nestifyy-my3u.onrender.com/api/user/login`, {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-25 animate-float-fast"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full opacity-15 animate-float-slow"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial from-blue-500/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-radial from-purple-500/30 to-transparent rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-1000 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-20 animate-ping"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-white/80 text-lg">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-100 px-4 py-3 rounded-2xl relative mb-6 flex items-center gap-2 text-sm animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-white/90 text-sm font-semibold tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-cyan-400' : 'text-white/60'
                }`} />
                <input
                  type="email"
                  id="email"
                  className={`w-full px-12 py-4 bg-white/10 backdrop-blur-sm border-2 rounded-2xl outline-none transition-all duration-300 text-white placeholder-white/60 ${
                    focusedField === 'email' 
                      ? 'border-cyan-400 bg-white/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  placeholder="Enter your email"
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
              <label htmlFor="password" className="block text-white/90 text-sm font-semibold tracking-wide">
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-cyan-400' : 'text-white/60'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full px-12 py-4 bg-white/10 backdrop-blur-sm border-2 rounded-2xl outline-none transition-all duration-300 text-white placeholder-white/60 pr-14 ${
                    focusedField === 'password' 
                      ? 'border-cyan-400 bg-white/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                      : 'border-white/20 hover:border-white/40'
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95'
              }`}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300 hover:underline" 
                onClick={() => trackInteraction('click', 'register_link_from_login')}
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(270deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .delay-1000 { animation-delay: 1s; }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.8);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;