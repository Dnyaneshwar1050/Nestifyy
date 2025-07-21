import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Bed, Bath, Home, Building, MessageCircle, Loader2, AlertCircle, Frown } from 'lucide-react'; // Added Frown icon for not found

const DEFAULT_IMAGE = "https://placehold.co/800x600/E0F7FA/00838F?text=Property+Image"; // Larger default image

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
    // Cleanup interval on component unmount
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
        // Ensure imageUrls is an array and has at least one image
        imageUrls: Array.isArray(data.property.imageUrls) && data.property.imageUrls.length > 0
          ? data.property.imageUrls
          : [DEFAULT_IMAGE],
        price: `₹ ${data.property.rent.toLocaleString()}/month`,
        beds: data.property.noOfBedroom,
        baths: data.property.bathrooms || 'N/A',
        type: data.property.propertyType,
        location: data.property.city, // Keep city for the address line
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

  // Auto-scroll for image carousel
  useEffect(() => {
    if (property && property.imageUrls.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change image every 5 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [property, isHovered]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    trackInteraction('click', `image_carousel_dot_click_${id}_${index}`);
    // Clear existing interval and restart after a brief delay to allow manual Browse
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      if (property && property.imageUrls.length > 1 && !isHovered) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === property.imageUrls.length - 1 ? 0 : prevIndex + 1
          );
        }, 5000);
      }
    }, 3000); // Auto-scroll resumes after 3 seconds
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) clearInterval(intervalRef.current); // Pause auto-scroll on hover
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleWhatsAppContact = () => {
    if (property && property.owner.phone) {
      const cleanedPhone = property.owner.phone.replace(/\s/g, ''); // Remove spaces
      // Basic validation for international phone number format (starts with +, then 10-15 digits)
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

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-600 text-lg flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <Loader2 className="w-16 h-16 text-blue-500 mb-4 animate-spin" />
          <p className="text-xl font-medium">Fetching property details...</p>
          <p className="text-sm text-gray-500 mt-2">This might take a moment.</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg flex flex-col items-center text-center gap-3 text-lg max-w-md shadow-lg">
          <AlertCircle size={32} className="text-red-600" />
          <p className="font-semibold text-xl">Error Loading Property</p>
          <p className="text-base text-gray-700">{error}</p>
          <button
            onClick={fetchProperty}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm"
          >
            Try Again
          </button>
          <Link to="/" className="mt-3 text-blue-600 hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Property Not Found State ---
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-600 text-lg flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <Frown size={60} className="text-blue-500 mb-4" />
          <p className="text-2xl font-semibold mb-2">Property Not Found</p>
          <p className="text-base text-gray-700">The property you are looking for does not exist or has been removed.</p>
          <Link to="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md">
            Explore Other Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden animate-fade-in-up">
        {/* Header Section */}
        <div className="p-6 md:p-8 lg:p-10 border-b border-gray-200">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
            {property.title || 'Exquisite Property'}
          </h1>
          <p className="text-gray-600 flex items-center text-base sm:text-lg font-medium">
            <MapPin size={24} className="mr-2 text-blue-600 flex-shrink-0" />
            <span className="truncate">{` ${property.city}`}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xl font-bold text-gray-900">
            <span className="flex items-center text-green-700">
              {property.rent}
            </span>
            {property.deposit && (
              <span className="flex items-center text-orange-700">
                Deposit: ₹{property.deposit.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Image Carousel */}
        <div
          className="relative w-full aspect-[16/9] bg-gray-100 flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {property.imageUrls.length === 0 ? (
            <img
              src={DEFAULT_IMAGE}
              alt="No Property Images Available"
              className="w-full h-full object-cover rounded-b-2xl"
            />
          ) : (
            <div className="relative w-full h-full">
              {property.imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${property.title} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE; // Fallback to default image on error
                  }}
                />
              ))}
            </div>
          )}

          {property.imageUrls.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={() => handleImageChange(currentImageIndex === 0 ? property.imageUrls.length - 1 : currentImageIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-2 text-gray-800 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous image"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button
                onClick={() => handleImageChange(currentImageIndex === property.imageUrls.length - 1 ? 0 : currentImageIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-2 text-gray-800 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Next image"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              {/* Dot Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'bg-blue-600 shadow-lg scale-125'
                        : 'bg-white/70 hover:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Property Details & Additional Information */}
        <div className="p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Property Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex items-center text-gray-800 text-lg">
                <Building size={24} className="mr-3 text-purple-600 flex-shrink-0" />
                <span className="font-semibold">Type:</span> <span className="ml-2">{property.propertyType || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-800 text-lg">
                <Bed size={24} className="mr-3 text-red-600 flex-shrink-0" />
                <span className="font-semibold">Bedrooms:</span> <span className="ml-2">{property.noOfBedroom || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-800 text-lg">
                <Bath size={24} className="mr-3 text-blue-600 flex-shrink-0" />
                <span className="font-semibold">Bathrooms:</span> <span className="ml-2">{property.bathrooms}</span>
              </div>
              {property.area && (
                <div className="flex items-center text-gray-800 text-lg">
                  <Home size={24} className="mr-3 text-orange-600 flex-shrink-0" />
                  <span className="font-semibold">Area:</span> <span className="ml-2">{property.area} sq ft</span>
                </div>
              )}
              {property.bhkType && (
                <div className="flex items-center text-gray-800 text-lg">
                  <Home size={24} className="mr-3 text-cyan-600 flex-shrink-0" />
                  <span className="font-semibold">BHK Type:</span> <span className="ml-2">{property.bhkType}</span>
                </div>
              )}
              {/* <div className="flex items-center text-gray-800 text-lg">
                <input
                  type="checkbox"
                  checked={property.allowBroker}
                  readOnly
                  className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold">Broker Allowed:</span> <span className="ml-2">{property.allowBroker ? 'Yes' : 'No'}</span>
              </div> */}
            </div>

            {property.description && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {property.description}
                </p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Amenities</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-gray-700 text-base list-none p-0 m-0">
                  {property.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Owner Contact Information */}
          <div className="lg:col-span-1 bg-blue-50 p-6 rounded-xl shadow-inner">
            <h2 className="text-2xl font-bold text-blue-800 mb-5">Contact Owner</h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-lg">
                <span className="font-semibold">Name:</span> {property.owner.name}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Email:</span>{' '}
                <a href={`mailto:${property.owner.email}`} className="text-blue-700 hover:underline break-words">
                  {property.owner.email}
                </a>
              </p>
              {property.owner.phone && (
                <p className="text-lg">
                  <span className="font-semibold">Phone:</span>{' '}
                  <a href={`tel:${property.owner.phone}`} className="text-blue-700 hover:underline">
                    {property.owner.phone}
                  </a>
                </p>
              )}
            </div>

            {/* Action Buttons for Contact */}
            <div className="mt-8 flex flex-col gap-4">
              <button
                onClick={handleWhatsAppContact}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-200 shadow-md transform hover:scale-105"
                aria-label="Contact owner via WhatsApp"
              >
                <MessageCircle size={24} className="mr-3" />
                WhatsApp
              </button>
              <a
                href={`mailto:${property.owner.email}`}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-md transform hover:scale-105"
                aria-label="Contact owner via Email"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26c.73.49 1.54.74 2.37.74s1.64-.25 2.37-.74L21 8m-8 13H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v8"></path></svg>
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home Button at the bottom */}
        <div className="p-6 md:p-8 lg:p-10 border-t border-gray-200 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium text-lg hover:bg-gray-300 transition-all duration-200 shadow-sm"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to All Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;