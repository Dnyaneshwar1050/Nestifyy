import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Bed, Bath, Home, Building, MessageCircle, Loader2, AlertCircle } from 'lucide-react';

const DEFAULT_IMAGE = "https://placehold.co/400x250/E0F7FA/00838F?text=Property";

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
    trackInteraction('click', `image_carousel_${id}_${index}`);
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
      // Ensure phone number is in correct format (remove spaces, ensure country code)
      const cleanPhone = property.owner.phone.replace(/\s/g, '').startsWith('+')
        ? property.owner.phone.replace(/\s/g, '')
        : `+91${property.owner.phone.replace(/\s/g, '')}`;
      const message = `Hi ${property.owner.name}, I'm interested in your property "${property.title}" in ${property.location}. Can we discuss further?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      trackInteraction('click', `whatsapp_contact_${id}`, { owner: property.owner.name });
    } else {
      alert('Owner phone number not available. Please contact via email.');
      trackInteraction('click', `whatsapp_contact_failed_${id}`, { reason: 'no_phone' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-gray-50 flex items-center justify-center">
        <div className="text-center text-text-gray-600 text-lg flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary-blue mb-4 animate-spin" />
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-gray-50 flex items-center justify-center">
        <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg flex items-center gap-2 text-base max-w-4xl">
          <AlertCircle size={20} className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-bg-gray-50 flex items-center justify-center">
        <div className="text-center text-text-gray-600 text-lg flex flex-col items-center">
          <Frown size={60} className="text-primary-blue mb-4" />
          <p>Property not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-gray-800 mb-6">
          {property.title || 'Property'}
        </h1>
        <p className="text-gray-600 flex items-center mb-4 text-base">
          <MapPin size={20} className="mr-2 text-blue-500" />
          {`${property.location}, ${property.city}`}
        </p>

        <div
          className="relative aspect-[4/3] overflow-hidden bg-gray-50 rounded-lg mb-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-full h-full">
            {property.imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
            ))}
          </div>
          {property.imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentImageIndex === index
                      ? 'bg-white shadow-sm'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-text-gray-800 mb-4">Property Details</h2>
            <div className="space-y-4">
              <p className="flex items-center text-gray-700">
                <span>Rent: {property.rent}</span>
              </p>
              {property.deposit && (
                <p className="flex items-center text-gray-700">
                  <span>Deposit: ₹{property.deposit.toLocaleString()}</span>
                </p>
              )}
              <p className="flex items-center text-gray-700">
                <Building size={20} className="mr-2 text-blue-500" />
                <span>Type: {property.type || 'N/A'}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Bed size={20} className="mr-2 text-blue-500" />
                <span>Bedrooms: {property.noOfBedroom || 'N/A'}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Bath size={20} className="mr-2 text-blue-500" />
                <span>Bathrooms: {property.bathrooms || 'N/A'}</span>
              </p>
              {property.area && (
                <p className="flex items-center text-gray-700">
                  <Home size={20} className="mr-2 text-blue-500" />
                  <span>Area: {property.area} sq ft</span>
                </p>
              )}
              {property.bhkType && (
                <p className="flex items-center text-gray-700">
                  <Home size={20} className="mr-2 text-blue-500" />
                  <span>BHK Type: {property.bhkType}</span>
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-gray-800 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {property.description && (
                <p className="text-gray-700">
                  <span className="font-semibold">Description:</span> {property.description}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-semibold">Broker Allowed:</span> {property.allowBroker ? 'Yes' : 'No'}
              </p>
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <span className="font-semibold">Amenities:</span>
                  <ul className="list-disc list-inside text-gray-700">
                    {property.amenities.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-gray-700">
                <span className="font-semibold">Owner:</span> {property.owner.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Contact Email:</span>{' '}
                <a href={`mailto:${property.owner.email}`} className="text-blue-600 hover:underline">
                  {property.owner.email}
                </a>
              </p>
              {property.owner.phone && (
                <p className="text-gray-700">
                  <span className="font-semibold">Contact Phone:</span> {property.owner.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleWhatsAppContact}
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
          >
            <MessageCircle size={20} className="mr-2" />
            Contact via WhatsApp
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;