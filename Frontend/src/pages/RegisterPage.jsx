
import React, { useState, useContext, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, MapPin, GraduationCap, Briefcase, Calendar, Camera, ArrowRight, Phone } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const RegisterPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    role: "",
    location: "",
    gender: "",
    phone: "",
  });

  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registration data:', data);

      // Replace with actual API call
      const response = await axios.post('https://nestifyy-my3u.onrender.com/api/user/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration successful:', response.data);
      alert("Registration successful! Please log in."); 
      trackInteraction('registration', 'registration_success');
      // Redirect to login page
      window.location.assign('/login');

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-3 tracking-tight">Create Your Account</h2>
        <p className="text-lg text-gray-600 text-center mb-10">Join us and find your perfect property or client.</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-5 py-4 rounded-xl relative mb-8 flex items-center gap-3 text-base animate-fade-in shadow-sm" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-1">
            <label htmlFor="name" className="block text-gray-800 text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'name' ? 'shadow-md' : ''}`}

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
            <label htmlFor="email" className="block text-gray-800 text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'email' ? 'shadow-md' : ''}`}

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
            <label htmlFor="password" className="block text-gray-800 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'password' ? 'shadow-md' : ''}`}

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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="phone" className="block text-gray-800 text-sm font-semibold mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="phone"
                name="phone"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'phone' ? 'shadow-md' : ''}`}

                placeholder="e.g., +1234567890"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="age" className="block text-gray-800 text-sm font-semibold mb-2">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              className={`w-full px-5 py-3 border border-gray-300 rounded-xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'age' ? 'shadow-md' : ''}`}

              placeholder="Your age"
              value={formData.age}
              onChange={handleChange}
              onFocus={() => setFocusedField('age')}
              onBlur={() => setFocusedField('')}
              min="18"
            />
          </div>

          <div className="col-span-1">
            <label htmlFor="gender" className="block text-gray-800 text-sm font-semibold mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              className={`w-full px-5 py-3 border border-gray-300 rounded-xl outline-none appearance-none bg-white pr-8 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'gender' ? 'shadow-md' : ''}`}

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
            <label htmlFor="role" className="block text-gray-800 text-sm font-semibold mb-2">Register As</label>
            <select
              id="role"
              name="role"
              className={`w-full px-5 py-3 border border-gray-300 rounded-xl outline-none appearance-none bg-white pr-8 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'role' ? 'shadow-md' : ''}`}

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

          {/* <div className="col-span-1">
            <label htmlFor="profession" className="block text-gray-800 text-sm font-semibold mb-2">Profession</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="profession"
                name="profession"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'profession' ? 'shadow-md' : ''}`}

                placeholder="e.g., Engineer, Doctor"
                value={formData.profession}
                onChange={handleChange}
                onFocus={() => setFocusedField('profession')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div> */}

          <div className="col-span-1">
            <label htmlFor="location" className="block text-gray-800 text-sm font-semibold mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="location"
                name="location"
                className={`w-full px-5 py-3 border border-gray-300 rounded-xl pr-12 outline-none transition-all duration-300 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${focusedField === 'location' ? 'shadow-md' : ''}`}

                placeholder="Your city/state"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="photo" className="block text-gray-800 text-sm font-semibold mb-2">Profile Photo (Optional)</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-3 text-gray-600">
                <Camera className="w-7 h-7 text-gray-500" />
                <span className="font-medium text-base">
                  {photo ? photo.name : "Click to upload a profile image"}
                </span>
              </div>
              <span className="text-blue-600 font-semibold text-sm sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
                {photo ? "Change file" : "Browse"}
              </span>
            </div>
            {photo && (
              <p className="text-sm text-gray-500 mt-2 text-center sm:text-left">Selected: <span className="font-medium text-gray-700">{photo.name}</span></p>
            )}
          </div>

          <div className="col-span-full mt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline font-semibold" onClick={() => trackInteraction('click', 'terms_link_from_register')}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline font-semibold" onClick={() => trackInteraction('click', 'privacy_link_from_register')}>
            Privacy Policy
          </Link>.
        </p>

        <p className="text-center text-gray-700 text-base mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold" onClick={() => trackInteraction('click', 'login_link_from_register')}>
            Login here
          </Link>
        </p>
      </div>

      <style jsx>{`
        /* Animations */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
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
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }



      `}</style>
    </div>
  );
};
export default RegisterPage;
