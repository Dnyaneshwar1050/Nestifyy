// src/pages/RegisterPage.jsx
import React, { useState, useContext, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, MapPin, GraduationCap, Briefcase, Calendar, Camera, ArrowRight, Phone } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const RegisterPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    role: "",
    profession: "",
    location: "",
    gender: "",
    phone: "",
    photo: "",
  });

  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate()

  useEffect(() => {
    trackInteraction('page_view', 'register_page');
  }, [trackInteraction]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    trackInteraction('input', `register_input_${e.target.name}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        setPhoto(selectedFile);
        trackInteraction('file_select', 'register_photo_upload');
        setError(''); // Clear any previous file-related errors
      } else {
        setPhoto(null);
        setError('Please select a valid image file for your profile photo.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    trackInteraction('submit', 'register_form_submit_attempt');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      trackInteraction('validation_error', 'register_missing_fields');
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      trackInteraction('validation_error', 'register_password_short');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      trackInteraction('validation_error', 'register_invalid_email');
      return;
    }
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (photo) {
        data.append('photo', photo);
      }

      for (const [key, value] of data.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

      // Replace with actual API call
      const response = await axios.post('https://nestifyy-my3u.onrender.com/api/user/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration successful:', response.data);
      trackInteraction('registration', 'registration_success');
      // Redirect to login page
      navigate('/login');

    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      trackInteraction('registration', 'registration_failure', { error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg animate-fade-in-up">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Create Your Account</h2>
        <p className="text-gray-600 text-center mb-8">Join us and find your perfect property or client.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-2 text-sm animate-fade-in" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-1">
            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'name' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                required
              />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'email' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
              />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'password' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'phone' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="e.g., +1234567890"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="age" className="block text-gray-700 text-sm font-semibold mb-2">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all duration-200
                ${focusedField === 'age' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
              placeholder="Your age"
              value={formData.age}
              onChange={handleChange}
              onFocus={() => setFocusedField('age')}
              onBlur={() => setFocusedField('')}
              min="18"
            />
          </div>

          <div className="col-span-1">
            <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all duration-200
                ${focusedField === 'gender' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
              value={formData.gender}
              onChange={handleChange}
              onFocus={() => setFocusedField('gender')}
              onBlur={() => setFocusedField('')}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">Register As</label>
            <select
              id="role"
              name="role"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all duration-200
                ${focusedField === 'role' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
              value={formData.role}
              onChange={handleChange}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField('')}
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="broker">Broker</option>
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="profession" className="block text-gray-700 text-sm font-semibold mb-2">Profession</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="profession"
                name="profession"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'profession' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="e.g., Engineer, Doctor"
                value={formData.profession}
                onChange={handleChange}
                onFocus={() => setFocusedField('profession')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="location"
                name="location"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 outline-none transition-all duration-200 pl-10
                  ${focusedField === 'location' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                placeholder="Your city/state"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="photo" className="block text-gray-700 text-sm font-semibold mb-2">Profile Photo (Optional)</label>
            <div className="relative border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all duration-200">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-gray-500" />
                <span className="text-gray-600">
                  {photo ? photo.name : "Choose a file"}
                </span>
              </div>
              <span className="text-blue-600 font-medium">Browse</span>
            </div>
            {photo && (
              <p className="text-sm text-gray-500 mt-2">Selected: {photo.name}</p>
            )}
          </div>

          <div className="col-span-full mt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline" onClick={() => trackInteraction('click', 'terms_link_from_register')}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline" onClick={() => trackInteraction('click', 'privacy_link_from_register')}>
            Privacy Policy
          </Link>.
        </p>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium" onClick={() => trackInteraction('click', 'login_link_from_register')}>
            Login here
          </Link>
        </p>
      </div>

      <style jsx>{`
        /* Animations */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RegisterPage;