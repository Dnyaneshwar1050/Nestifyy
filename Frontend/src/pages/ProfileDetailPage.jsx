import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Bed, Bath, Home, Building, MessageCircle, Loader2, AlertCircle, Frown } from 'lucide-react';

const DEFAULT_IMAGE = "https://placehold.co/800x600/E0F7FA/00838F?text=Property+Image";

const PropertyDetailPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
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
        price: `₹${data.property.rent.toLocaleString()}/month`,
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
      setIsImageLoading(false);
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
        const message = `Hi ${property.owner.name},\n\nI'm interested in your property "${property.title}" located in ${property.city}. Could you please share more details or schedule a visit?\n\nProperty Link: ${window.location.href}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg flex flex-col items-center text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-900">Fetching property details...</p>
          <p className="text-xs text-gray-600 mt-1">This might take a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-base font-semibold text-gray-900">Error Loading Property</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={fetchProperty}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          <Link to="/" className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg flex flex-col items-center text-center gap-3">
          <Frown className="w-8 h-8 text-green-600" />
          <p className="text-base font-semibold text-gray-900">Property Not Found</p>
          <p className="text-sm text-gray-600">The property you are looking for does not exist or has been removed.</p>
          <Link
            to="/"
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Explore Other Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Carousel */}
        <div
          className="relative aspect-[4/3] bg-gray-50 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {property.imageUrls.length === 0 ? (
            <img
              src={DEFAULT_IMAGE}
              alt="No Property Images Available"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
                setIsImageLoading(false);
              }}
            />
          ) : (
            <div className="relative w-full h-full">
              {property.imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${property.title} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                  } hover:scale-105`}
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                    setIsImageLoading(false);
                  }}
                />
              ))}
            </div>
          )}

          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          )}

          {property.imageUrls.length > 1 && (
            <>
              <button
                onClick={() => handleImageChange(currentImageIndex === 0 ? property.imageUrls.length - 1 : currentImageIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-1.5 text-gray-800 shadow-md transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button
                onClick={() => handleImageChange(currentImageIndex === property.imageUrls.length - 1 ? 0 : currentImageIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-1.5 text-gray-800 shadow-md transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 hidden sm:flex space-x-1">
                {property.imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentImageIndex === index ? 'bg-white shadow-sm' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors duration-200 line-clamp-2 mb-1">
              {property.title || 'Exquisite Property'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
              <span className="line-clamp-1">{property.city}</span>
            </p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900">{property.price}</span>
              {property.deposit && (
                <span className="text-xs sm:text-sm text-gray-600">
                  Deposit: ₹{property.deposit.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Property Overview */}
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Property Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Type:</span> <span className="ml-1">{property.type || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Bedrooms:</span> <span className="ml-1">{property.beds || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
                <span className="font-medium">Bathrooms:</span> <span className="ml-1">{property.baths}</span>
              </div>
              {property.area && (
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Area:</span> <span className="ml-1">{property.area} sq ft</span>
                </div>
              )}
              {property.bhkType && (
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1.5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">BHK Type:</span> <span className="ml-1">{property.bhkType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Amenities</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 list-none p-0 m-0">
                {property.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Owner */}
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Contact Owner</h2>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <p>
                <span className="font-medium">Name:</span> {property.owner.name}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${property.owner.email}`} className="text-green-600 hover:text-green-700 transition-colors duration-200 break-words">
                  {property.owner.email}
                </a>
              </p>
              {property.owner.phone && (
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${property.owner.phone}`} className="text-green-600 hover:text-green-700 transition-colors duration-200">
                    {property.owner.phone}
                  </a>
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsAppContact}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                aria-label="Contact owner via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </button>
              <a
                href={`mailto:${property.owner.email}`}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                aria-label="Contact owner via Email"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26c.73.49 1.54.74 2.37.74s1.64-.25 2.37-.74L21 8m-8 13H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v8"></path></svg>
                Email
              </a>
            </div>
          </div>

          {/* Back to Home */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-900 rounded-md text-sm font-medium hover:bg-gray-200 transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to All Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;