import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import PropertyListingCard from '../components/PropertyListingCard';
import RoommateListingCard from '../components/RoommateListingCard';
import { AppContext } from '../context/AppContext';
import { Loader2, AlertTriangle, RefreshCw, Home, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        initialSearch={searchParams.get('search') || ''}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
      />
      
      {/* Results Section */}
      <section className="py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              {activeTab === 'find_room' ? (
                <Home className="text-indigo-600" size={28} />
              ) : (
                <Users className="text-indigo-600" size={28} />
              )}
              <h2 className="text-3xl font-bold text-gray-900">
                {activeTab === 'find_room' ? 'Available Properties' : 'Available Roommates'}
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl">
              {activeTab === 'find_room' 
                ? 'Browse through our carefully curated selection of verified properties'
                : 'Connect with verified individuals looking for roommates in your area'
              }
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-12 max-w-md mx-auto border border-gray-200">
                <Loader2 className="w-12 h-12 text-indigo-600 mb-4 animate-spin mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading {activeTab === 'find_room' ? 'Properties' : 'Roommates'}
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we fetch the latest listings
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl">
                <div className="flex items-start">
                  <AlertTriangle size={24} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Unable to Load Content</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && properties.length === 0 && roommates.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-xl p-12 max-w-md mx-auto border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === 'find_room' ? (
                    <Home size={32} className="text-gray-400" />
                  ) : (
                    <Users size={32} className="text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No {activeTab === 'find_room' ? 'Properties' : 'Roommates'} Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or check back later for new listings
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 border-none cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
              {properties.map((property) => (
                <PropertyListingCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Roommates Grid */}
          {!loading && !error && roommates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
              {roommates.map((roommate) => (
                <RoommateListingCard key={roommate.id} roommate={roommate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;