import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Users, MessageCircle, Loader2, AlertCircle, Frown, ArrowLeft, Phone, Mail, CheckCircle, DollarSign, Calendar, User, Home, IndianRupee } from 'lucide-react';

const DEFAULT_IMAGE = "https://ui-avatars.com/api/?name=Unknown&size=200&background=F8FAFC&color=475569";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg p-12 shadow-lg border">
          <Loader2 className="w-10 h-10 text-slate-600 mb-4 animate-spin mx-auto" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Profile</h3>
          <p className="text-slate-600 text-sm">Please wait while we fetch the details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg border text-center max-w-md">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Unable to Load Profile</h3>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchRoommate}
              className="w-full px-6 py-2.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors text-sm"
            >
              Try Again
            </button>
            <Link to="/" className="block w-full px-6 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors text-sm">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg border text-center">
          <Frown size={40} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Profile Not Found</h3>
          <p className="text-slate-600 mb-6 text-sm">The roommate request you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors text-sm">
            <ArrowLeft size={16} className="mr-2" />
            Explore Roommates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/find-roommate" 
              className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
              onClick={() => trackInteraction('click', `back_to_list_${id}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Listings
            </Link>
            <div className="hidden lg:block text-center">
              <h1 className="text-xl font-semibold text-slate-900">Roommate Profile</h1>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={handleWhatsAppContact}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-sm"
              >
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </button>
              <a
                href={`mailto:${roommate.user.email}`}
                className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors text-sm"
              >
                <Mail size={16} className="mr-2" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            {/* Profile Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
              {/* Small Profile Photo */}
              <div className="flex-shrink-0">
                <div 
                  className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-lg overflow-hidden border-2 border-gray-100 bg-white shadow-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={roommate.imageUrls[currentImageIndex]}
                    alt={`${roommate.name}'s profile`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{roommate.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-slate-400" />
                      <span className="font-medium">{roommate.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-slate-400" />
                      <span className="font-medium">{roommate.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Budget Badge */}
                <div className="mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-900 rounded-md font-bold text-xl border">
                    <IndianRupee size={20} className="mr-2 text-slate-600" />
                    {roommate.budget}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3 text-lg">About This Request</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Looking for a compatible roommate in {roommate.location} with a monthly budget of {roommate.budget}. 
                    Preference for {roommate.gender} roommate. Seeking a responsible and respectful living arrangement.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Details Grid
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-6 border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-slate-100 rounded-md mr-3">
                    <DollarSign size={20} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Budget Range</h3>
                </div>
                <p className="text-slate-600 text-sm mb-2">Monthly Budget</p>
                <p className="font-bold text-slate-900 text-lg">{roommate.budget}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-slate-100 rounded-md mr-3">
                    <MapPin size={20} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Location</h3>
                </div>
                <p className="text-slate-600 text-sm mb-2">Preferred Area</p>
                <p className="font-medium text-slate-900">{roommate.location}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-slate-100 rounded-md mr-3">
                    <Users size={20} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Preference</h3>
                </div>
                <p className="text-slate-600 text-sm mb-2">Gender Preference</p>
                <p className="font-medium text-slate-900">{roommate.gender}</p>
              </div>
            </div> */}

            {/* Contact Information Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-slate-50 rounded-lg p-6 border">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-slate-100 rounded-md mr-3">
                    <Phone size={20} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Contact Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-slate-600 text-sm mb-2 font-medium">Full Name</p>
                    <p className="text-slate-900 font-semibold">{roommate.user.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm mb-2 font-medium">Email Address</p>
                    <p className="text-slate-700 break-all">{roommate.user.email}</p>
                  </div>
                  {roommate.user.phone && (
                    <div className="md:col-span-2">
                      <p className="text-slate-600 text-sm mb-2 font-medium">Phone Number</p>
                      <p className="text-slate-900 font-medium">{roommate.user.phone}</p>
                    </div>
                  )}
                </div>

                {/* Professional Contact Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleWhatsAppContact}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-all duration-200 text-sm border border-green-600"
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Contact via WhatsApp
                  </button>
                  <a
                    href={`mailto:${roommate.user.email}`}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800 transition-all duration-200 text-sm border border-slate-900"
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