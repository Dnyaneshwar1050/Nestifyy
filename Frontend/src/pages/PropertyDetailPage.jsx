import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Bed, Bath, Home, Building, MessageCircle, Loader2, AlertCircle, Frown, ArrowLeft, Phone, Mail, CheckCircle } from 'lucide-react';

const DEFAULT_IMAGE = "https://placehold.co/800x600/E0F7FA/00838F?text=Property+Image";

const PropertyDetailPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    trackInteraction('page_view', `property_detail_page_${id}`);
    fetchProperty();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, trackInteraction]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || "https://nestifyy-my3u.onrender.com";
      const response = await fetch(`${apiUrl}/api/property/${id}`, {
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
      if (!data.property) {
        throw new Error('Property not found');
      }
      const formattedProperty = {
        ...data.property,
        id: data.property._id,
        imageUrls: Array.isArray(data.property.imageUrls) && data.property.imageUrls.length > 0
          ? data.property.imageUrls
          : [DEFAULT_IMAGE],
        price: `₹ ${data.property.rent.toLocaleString()}/month`,
        beds: data.property.noOfBedroom,
        baths: data.property.bathrooms || 'N/A',
        type: data.property.propertyType,
        location: data.property.city,
        owner: data.property.owner || { name: 'Unknown', email: 'Unknown', phone: '' },
      };
      setProperty(formattedProperty);
      trackInteraction('data_fetch', 'property_detail_fetch_success', { propertyId: id });
    } catch (err) {
      console.error('Fetch property error:', err);
      setError(err.message || 'Failed to load property details. Please try again.');
      trackInteraction('data_fetch', 'property_detail_fetch_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (property && property.imageUrls.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [property, isHovered]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    trackInteraction('click', `image_carousel_dot_click_${id}_${index}`);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      if (property && property.imageUrls.length > 1 && !isHovered) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
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
    if (property && property.owner.phone) {
      const cleanedPhone = property.owner.phone.replace(/\s/g, '');
      if (/^\+\d{10,15}$/.test(cleanedPhone)) {
        const message = `Hi ${property.owner.name},\n\nI'm interested in your property "${property.title}" located in ${property.city}. Could you please share more details or schedule a visit?\n\nProperty.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        trackInteraction('click', `whatsapp_contact_${id}`, { owner: property.owner.name });
      } else {
        alert('Invalid phone number format provided by the owner. Please contact via email instead.');
        trackInteraction('click', `whatsapp_contact_failed_${id}`, { reason: 'invalid_phone_format' });
      }
    } else {
      alert('Owner phone number not available. Please contact via email.');
      trackInteraction('click', `whatsapp_contact_failed_${id}`, { reason: 'no_phone' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <Loader2 className="w-12 h-12 text-blue-600 mb-4 animate-spin mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Property</h3>
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
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Property</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchProperty}
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

  // Property Not Found State
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <Frown size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Property Not Found</h3>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            
            {/* Left Column - Image and Contact (Desktop) */}
            <div className="lg:col-span-3 relative">
              {/* Image Section */}
              <div
                className="relative w-full h-[280px] sm:h-[350px] lg:h-[420px] bg-gray-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {property.imageUrls.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`${property.title} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                ))}

                {property.imageUrls.length > 1 && (
                  <>
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => handleImageChange(currentImageIndex === 0 ? property.imageUrls.length - 1 : currentImageIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 text-gray-800 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageChange(currentImageIndex === property.imageUrls.length - 1 ? 0 : currentImageIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 text-gray-800 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {property.imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageChange(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            currentImageIndex === index ? 'bg-white scale-110 shadow-md' : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Price Badge */}
                <div className="absolute top-6 left-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2.5 rounded-2xl font-semibold text-base shadow-xl border border-white/20">
                  {property.type}
                </div>
              </div>

              {/* Contact Section - Desktop Only (Below Image) */}
              <div className="hidden lg:block p-8 bg-gray-50/30">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <div className="flex items-center mb-5">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Phone size={20} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Contact Property Owner</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Name:</span>
                      <span className="ml-3 text-gray-900 font-medium">{property.owner.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Email:</span>
                      <span className="ml-3 text-blue-600 font-medium break-all text-sm">{property.owner.email}</span>
                    </div>
                    {property.owner.phone && (
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Phone:</span>
                        <span className="ml-3 text-gray-900 font-medium">{property.owner.phone}</span>
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
                      href={`mailto:${property.owner.email}`}
                      className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Mail size={18} className="mr-2" />
                      Send Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content Section */}
            <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col bg-gray-50/30">
              
              {/* Property Info */}
              <div className="flex-1">
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {property.title || 'Premium Property'}
                  </h1>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={20} className="mr-3 text-blue-600 flex-shrink-0" />
                    <span className="text-lg font-medium">{property.city}</span>
                  </div>

                  {property.deposit && (
                    <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-semibold text-sm">
                      Security Deposit: ₹{property.deposit.toLocaleString()}
                    </div>
                  )}

                  {property.rent && (
                    <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-semibold text-sm mt-2 ml-2">
                      Rent: ₹{property.rent.toLocaleString()}/month
                    </div>
                  )}
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-2 gap-6 mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Type</div>
                      <div className="font-semibold text-gray-900 text-sm">{property.propertyType || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Bed size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Bedrooms</div>
                      <div className="font-semibold text-gray-900 text-sm">{property.noOfBedroom || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bath size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Bathrooms</div>
                      <div className="font-semibold text-gray-900 text-sm">{property.bathrooms}</div>
                    </div>
                  </div>
                  {property.area && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Home size={20} className="text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Area</div>
                        <div className="font-semibold text-gray-900 text-sm">{property.area} sq ft</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description - Compact */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Amenities - Compact */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 10).map((amenity, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 10 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{property.amenities.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Contact - Mobile/Tablet Only (Bottom of right column) */}
              <div className="border-t border-gray-200 pt-8 mt-8 lg:hidden">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <div className="flex items-center mb-5">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Phone size={20} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Contact Property Owner</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Name:</span>
                      <span className="ml-3 text-gray-900 font-medium">{property.owner.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Email:</span>
                      <span className="ml-3 text-blue-600 font-medium break-all text-sm">{property.owner.email}</span>
                    </div>
                    {property.owner.phone && (
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-700 text-sm min-w-[60px]">Phone:</span>
                        <span className="ml-3 text-gray-900 font-medium">{property.owner.phone}</span>
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
                      href={`mailto:${property.owner.email}`}
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
    </div>
  );
};

export default PropertyDetailPage;