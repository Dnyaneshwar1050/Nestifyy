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
    <div className="min-h-screen bg-bg-gray-50">
      <HeroSection
        initialSearch={searchParams.get('search') || ''}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
      />
      <section className="py-12 md:py-16 px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-gray-800 text-center mb-10 relative">
          <span className="relative inline-block pb-2">
            {activeTab === 'find_room' ? 'Featured Properties' : 'Featured Roommates'}
            <span className="content-[''] absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary-blue rounded-full"></span>
          </span>
        </h2>

        {loading && (
          <div className="text-center text-text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-blue mb-4 animate-spin" />
            <p>Loading {activeTab === 'find_room' ? 'properties' : 'roommates'}...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-base max-w-4xl mx-auto">
            <AlertCircle size={20} className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && properties.length === 0 && roommates.length === 0 && (
          <div className="text-center text-text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
            <Frown size={60} className="text-primary-blue mb-4" />
            <p>No {activeTab === 'find_room' ? 'properties' : 'roommates'} found. Try adjusting your search!</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto animate-fade-in-up">
            {properties.map((property) => (
              <PropertyListingCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!loading && !error && roommates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto animate-fade-in-up">
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
