import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import PropertyListingCard from '../components/PropertyListingCard';
import RoommateListingCard from '../components/RoommateListingCard';
import { AppContext } from '../context/AppContext';
import { Loader2, Frown, AlertCircle } from 'lucide-react';
import axios from 'axios';

const DEFAULT_IMAGE = "https://placehold.co/400x250/E0F7FA/00838F?text=Property";

const HomePage = () => {
  const { trackInteraction } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('find_room');
  const [properties, setProperties] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    trackInteraction('page_view', 'home_page');
    const searchQuery = searchParams.get('search') || '';
    if (activeTab === 'find_room') {
      fetchProperties(searchQuery);
    } else {
      fetchRoommates(searchQuery);
    }
  }, [searchParams, activeTab]);

  const fetchProperties = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || "https://nestifyy-my3u.onrender.com";
      const url = query
        ? `${apiUrl}/api/property/search?search=${encodeURIComponent(query)}`
        : `${apiUrl}/api/property/all`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const formattedProperties = data.properties.map((property) => ({
          ...property,
          id: property._id,
          imageUrls:
            property.imageUrls && Array.isArray(property.imageUrls)
              ? property.imageUrls
              : [DEFAULT_IMAGE],
          price: `₹ ${property.rent.toLocaleString()}/month`,
          beds: property.noOfBedroom,
          type: property.propertyType,
          location: property.city,
        }));
        setProperties(formattedProperties);
        setRoommates([]);
        trackInteraction('data_fetch', 'home_properties_fetch_success', {
          count: formattedProperties.length,
        });
      } else {
        setError(data.message || 'Failed to fetch properties. Please try again.');
        trackInteraction('data_fetch', 'home_properties_fetch_failure', {
          error: data.message || 'Unknown error',
          details: data.details || {},
        });
      }
    } catch (err) {
      setError(err.message || 'Network error or server issue. Please try again later.');
      console.error('Fetch properties error:', err);
      trackInteraction('data_fetch', 'home_properties_fetch_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoommates = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || "https://nestifyy-my3u.onrender.com";
      const url = query
        ? `${apiUrl}/api/room-request/search?search=${encodeURIComponent(query)}`
        : `${apiUrl}/api/room-request/all`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const formattedRoommates = response.data.map((request) => ({
        id: request._id,
        name: request.user?.name || 'Unknown',
        location: request.location,
        lookingFor: request.location,
        budget: request.budget,
        imageUrl: request.user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user?.name || 'Unknown')}&size=400&background=F0F9FF&color=0284C7`,
        gender: request.user?.gender || 'Not specified',
        interests: "Not specified",
      }));
      setRoommates(formattedRoommates);
      setProperties([]);
      trackInteraction('data_fetch', 'home_roommates_fetch_success', {
        count: formattedRoommates.length,
      });
    } catch (err) {
      setError(err.message || 'Failed to load roommates. Please try again.');
      trackInteraction('data_fetch', 'home_roommates_fetch_failure', {
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({}); // Clear search params
    trackInteraction('click', `tab_${tab}`);
    if (tab === 'find_room') {
      fetchProperties(''); // Fetch default properties
    } else {
      fetchRoommates(''); // Fetch default roommates
    }
  };

  const handleSearch = (query, tab) => {
    setActiveTab(tab);
    setSearchParams(query ? { search: query } : {});
    if (tab === 'find_room') {
      fetchProperties(query);
    } else {
      fetchRoommates(query);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <HeroSection
        initialSearch={searchParams.get('search') || ''}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
      />
      
      {/* Results Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
            {activeTab === 'find_room' ? '🏠 Featured Properties' : '👥 Featured Roommates'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base max-w-2xl mx-auto">
            {activeTab === 'find_room' 
              ? 'Discover your next home from our curated selection of properties'
              : 'Connect with potential roommates in your area'
            }
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-600 py-12 sm:py-16 flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 mb-6 animate-spin mx-auto" />
              <p className="text-lg sm:text-xl font-medium mb-2">
                Loading {activeTab === 'find_room' ? 'properties' : 'roommates'}...
              </p>
              <p className="text-gray-500 text-sm sm:text-base">
                This might take a few seconds
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 sm:p-6 rounded-r-xl shadow-md">
              <div className="flex items-start">
                <AlertCircle size={24} className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Oops! Something went wrong</h3>
                  <p className="text-sm sm:text-base">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && roommates.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Frown size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
                No {activeTab === 'find_room' ? 'properties' : 'roommates'} found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Try adjusting your search criteria or check back later for new listings
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto animate-fade-in-up">
            {properties.map((property) => (
              <PropertyListingCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Roommates Grid */}
        {!loading && !error && roommates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto animate-fade-in-up">
            {roommates.map((roommate) => (
              <RoommateListingCard key={roommate.id} roommate={roommate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;