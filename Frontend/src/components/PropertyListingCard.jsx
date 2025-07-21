import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Bed, Bath } from 'lucide-react';
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
      className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => trackInteraction('click', `property_card_${property.id}`)}
    >
      {/* Image Container - Responsive Height */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {/* Image Stack */}
        <div className="relative w-full h-full">
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={imageUrl}
                alt={`${property.name || 'Property'} - Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image Indicators - Only show on larger screens */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 hidden sm:flex space-x-1">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentImageIndex === index 
                    ? 'bg-white shadow-sm' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{property.title || 'Property'}</h3>
        <p className="text-gray-600 flex items-center mb-3 text-sm">
          <MapPin size={16} className="mr-1 text-blue-500" /> {property.location || 'Unknown Location'}
        </p>
        <p className="text-2xl font-bold text-blue-600 mb-4">{property.rents || 'N/A'}</p>
        <div className="flex justify-between text-gray-700 text-sm border-t border-gray-200 pt-4 mt-auto">
          <div className="flex items-center">
            <Bed size={16} className="mr-1 text-gray-500" /> {property.noOfBedroom ?? 'N/A'} Beds
          </div>
          <div className="flex items-center">
            <Bath size={16} className="mr-1 text-gray-500" /> {property.noOfBath ?? 'N/A'} Baths
          </div>
          <div className="flex items-center">
            <Home size={16} className="mr-1 text-gray-500" /> {property.area || 'N/A'}
          </div>
        </div>
        <Link
          to={`/property/${property.id}`}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg border-none cursor-pointer transition-colors duration-200 text-base font-medium hover:bg-blue-700 text-center"
          onClick={(e) => {
            e.stopPropagation();
            trackInteraction('click', `view_details_button_${property.id}`);
          }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyListingCard;