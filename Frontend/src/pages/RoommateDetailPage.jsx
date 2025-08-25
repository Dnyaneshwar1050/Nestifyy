import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Users, MessageCircle, Loader2, AlertCircle, Frown, ArrowLeft, Phone, Mail, CheckCircle, DollarSign } from 'lucide-react';

const DEFAULT_IMAGE = "https://ui-avatars.com/api/?name=Unknown&size=400&background=F0F9FF&color=0284C7";

const RoommateDetailPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const { id } = useParams();
  const [roommate, setRoommate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    trackInteraction('page_view', `roommate_detail_page_${id}`);
    fetchRoommate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, trackInteraction]);

  const fetchRoommate = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || "https://nestifyy-my3u.onrender.com";
      const response = await fetch(`${apiUrl}/api/room-request/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (!data) {
        throw new Error('Roommate request not found');
      }
      const formattedRoommate = {
        id: data._id,
        name: data.user?.name || 'Unknown',
        gender: data.user?.gender || 'Not specified',
        budget: `₹ ${parseInt(data.budget).toLocaleString()}/month`,
        location: data.location,
        imageUrls: data.user?.photo ? [data.user.photo] : [DEFAULT_IMAGE],
        user: data.user || { name: 'Unknown', email: 'Unknown', phone: '' },
      };
      setRoommate(formattedRoommate);
      trackInteraction('data_fetch', 'roommate_detail_fetch_success', { roommateId: id });
    } catch (err) {
      console.error('Fetch roommate error:', err);
      setError(err.message || 'Failed to load roommate details. Please try again.');
      trackInteraction('data_fetch', 'roommate_detail_fetch_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roommate && roommate.imageUrls.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === roommate.imageUrls.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roommate, isHovered]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    trackInteraction('click', `image_carousel_dot_click_${id}_${index}`);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      if (roommate && roommate.imageUrls.length > 1 && !isHovered) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === roommate.imageUrls.length - 1 ? 0 : prevIndex + 1
          );
        }, 5000);
      }
    }, 3000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleWhatsAppContact = () => {
    if (roommate && roommate.user.phone) {
      const cleanedPhone = roommate.user.phone.replace(/\s/g, '');
      if (/^\+\d{10,15}$/.test(cleanedPhone)) {
        const message = `Hi ${roommate.user.name},\n\nI'm interested in rooming with you in ${roommate.location} within budget ${roommate.budget}. Could you please share more details?\n\nRoommate Request.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        trackInteraction('click', `whatsapp_contact_${id}`, { user: roommate.user.name });
      } else {
        alert('Invalid phone number format provided by the user. Please contact via email instead.');
        trackInteraction('click', `whatsapp_contact_failed_${id}`, { reason: 'invalid_phone_format' });
      }
    } else {
      alert('User phone number not available. Please contact via email.');
      trackInteraction('click', `whatsapp_contact_failed_${id}`, { reason: 'no_phone' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <Loader2 className="w-12 h-12 text-blue-600 mb-4 animate-spin mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Roommate</h3>
          <p className="text-gray-600">Please wait while we fetch the details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100 text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Roommate</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchRoommate}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <Link to="/" className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Roommate Not Found State
  if (!roommate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <Frown size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Roommate Not Found</h3>
          <p className="text-gray-600 mb-6">The roommate request you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Explore Roommates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/find-roommate" 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              onClick={() => trackInteraction('click', `back_to_list_${id}`)}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to List
            </Link>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900">{roommate.name}</h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <MapPin size={16} className="mr-1 text-gray-400" />
                {roommate.location}
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleWhatsAppContact}
                className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </button>
              <a
                href={`mailto:${roommate.user.email}`}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                <Mail size={18} className="mr-2" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Image Section */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div 
              className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={roommate.imageUrls[currentImageIndex]}
                alt={`${roommate.name}'s profile`}
                className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-500 hover:scale-105"
              />
              {roommate.imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {roommate.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{roommate.name}</h1>
              <p className="text-gray-600 flex items-center text-sm">
                <MapPin size={16} className="mr-1 text-gray-400" />
                {roommate.location}
              </p>
            </div>

            {/* Price and Key Info */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-lg">
                {roommate.budget}
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                <Users size={16} className="mr-1" />
                {roommate.gender}
              </div>
            </div>

            {/* Roommate Features */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign size={20} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Budget</div>
                  <div className="font-semibold text-gray-900 text-sm">{roommate.budget}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users size={20} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Gender</div>
                  <div className="font-semibold text-gray-900 text-sm">{roommate.gender}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</div>
                  <div className="font-semibold text-gray-900 text-sm">{roommate.location}</div>
                </div>
              </div>
            </div>

            {/* Description - Compact */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                Looking for a roommate in {roommate.location} with a budget of {roommate.budget}. Gender preference: {roommate.gender}.
              </p>
            </div>

            {/* User Contact - Mobile/Tablet Only (Bottom of right column) */}
            <div className="border-t border-gray-200 pt-8 mt-8 lg:hidden">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Phone size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Contact Roommate</h3>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Name:</span>
                    <span className="ml-3 text-gray-900 font-medium">{roommate.user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Email:</span>
                    <span className="ml-3 text-blue-600 font-medium break-all text-sm">{roommate.user.email}</span>
                  </div>
                  {roommate.user.phone && (
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Phone:</span>
                      <span className="ml-3 text-gray-900 font-medium">{roommate.user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleWhatsAppContact}
                    className="inline-flex items-center justify-center px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <MessageCircle size={18} className="mr-2" />
                    WhatsApp Chat
                  </button>
                  <a
                    href={`mailto:${roommate.user.email}`}
                    className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Mail size={18} className="mr-2" />
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateDetailPage;