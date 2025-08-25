import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Building, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const DEFAULT_IMAGE = "https://placehold.co/400x250/E0F7FA/00838F?text=Property";

const PropertyListingCard = ({ property }) => {
  const { trackInteraction } = useContext(AppContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const intervalRef = useRef(null);

  // Ensure imageUrls is always an array
  const imageUrls = Array.isArray(property.imageUrls) && property.imageUrls.length > 0 
    ? property.imageUrls 
    : [DEFAULT_IMAGE];

  // Auto-scroll for image carousel
  useEffect(() => {
    if (imageUrls.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [imageUrls.length, isHovered]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    trackInteraction('click', `image_carousel_${property.id}_${index}`);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeout(() => {
      if (imageUrls.length > 1 && !isHovered) {
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
          );
        }, 5000);
      }
    }, 3000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="group bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md border border-gray-200 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => trackInteraction('click', `property_card_${property.id}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Image Stack */}
        <div className="relative w-full h-full">
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                currentImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={imageUrl}
                alt={`${property.name || 'Property'} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                onLoad={() => setIsImageLoading(false)}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x250/E0F7FA/00838F?text=Image+Not+Found';
                  setIsImageLoading(false);
                }}
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image Indicators */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentImageIndex === index 
                    ? 'bg-white shadow-sm scale-110' 
                    : 'bg-white/70 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
            {property.type || 'Property'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title || 'Property Listing'}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-2 text-indigo-600 flex-shrink-0" />
          <span className="text-sm truncate">{property.location || 'Location not specified'}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {property.price || 'Price not available'}
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Building size={14} className="mr-1.5 text-gray-500" />
            <span>{property.propertyType || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Home size={14} className="mr-1.5 text-gray-500" />
            <span>{property.area || 'N/A'} Sq Ft</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={`/property/${property.id}`}
          className="mt-auto w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg border-none cursor-pointer transition-all duration-200 text-sm font-medium hover:bg-indigo-700 text-center flex items-center justify-center gap-2 group/button"
          onClick={(e) => {
            e.stopPropagation();
            trackInteraction('click', `view_details_button_${property.id}`);
          }}
        >
          View Details
          <ChevronRight size={16} className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default PropertyListingCard;