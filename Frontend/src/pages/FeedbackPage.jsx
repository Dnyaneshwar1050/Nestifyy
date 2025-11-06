// src/pages/FeedbackPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Mail, User, MessageSquare, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const FeedbackPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Feedback', // Default to Feedback
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    trackInteraction('page_view', 'feedback_page');
  }, [trackInteraction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    trackInteraction('input', `feedback_form_input_${name}`, { value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    trackInteraction('submit', 'feedback_form_submit_attempt');

    try {
      // Simulate API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Feedback Submitted:', formData);
      // In a real application, you'd send this to your backend
      // const response = await fetch('https://nestifyy-my3u.onrender.com/api/feedback', { // Placeholder URL
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Failed to submit feedback');

      setSuccessMessage('Thank you for your feedback! It has been submitted.');
      setFormData({ name: '', email: '', type: 'Feedback', message: '' }); // Clear form
      trackInteraction('submit', 'feedback_form_success');
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      trackInteraction('submit', 'feedback_form_failure', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-md w-full">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-10 relative">
        <span className="relative inline-block pb-2">
          Send Us Your Feedback
          <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-blue-600 transform -translate-x-1/2 rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
        Your thoughts help us improve! Please share your feedback or report any issues you've encountered.
      </p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 flex items-center space-x-2 animate-fade-in" role="alert">
          <CheckCircle size={20} />
          <span className="block sm:inline font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center space-x-2 animate-fade-in" role="alert">
          <AlertCircle size={20} />
          <span className="block sm:inline font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md mx-auto space-y-6 border border-gray-200 animate-fade-in-up">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-lg font-semibold text-gray-800 mb-2">Your Name *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base shadow-sm"
              required
              onFocus={() => trackInteraction('focus', 'feedback_name_input')}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-lg font-semibold text-gray-800 mb-2">Your Email *</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base shadow-sm"
              required
              onFocus={() => trackInteraction('focus', 'feedback_email_input')}
            />
          </div>
        </div>

        {/* Type of Feedback */}
        <div>
          <label htmlFor="type" className="block text-lg font-semibold text-gray-800 mb-2">Type of Inquiry</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white text-base shadow-sm"
            onFocus={() => trackInteraction('focus', 'feedback_type_select')}
          >
            <option value="Feedback">General Feedback</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Support">Support Inquiry</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-lg font-semibold text-gray-800 mb-2">Your Message *</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-gray-400" size={20} />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              placeholder="Tell us what's on your mind or describe the issue in detail"
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base shadow-sm"
              required
              onFocus={() => trackInteraction('focus', 'feedback_message_input')}
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.005] shadow-lg hover:shadow-xl text-xl flex items-center justify-center space-x-2 ${
            loading ? 'opacity-75 cursor-not-allowed bg-blue-500' : ''
          }`}
          onClick={() => trackInteraction('click', 'feedback_submit_button')}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={22} />
              <span>Submit Feedback</span>
            </>
          )}
        </button>
      </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FeedbackPage;
