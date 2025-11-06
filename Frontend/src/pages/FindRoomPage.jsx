import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, MapPin, Bed, Bath, Building, Loader2, Frown, AlertCircle } from 'lucide-react';
import PropertyListingCard from '../components/PropertyListingCard';

const DEFAULT_IMAGE = "https://placehold.co/400x250/E0F7FA/00838F?text=Property";

const FindRoomPage = () => {
  const { trackInteraction } = useContext(AppContext);
  const [properties, setProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    trackInteraction('page_view', 'find_room_page');
    fetchProperties();
  }, [trackInteraction]);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/property/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.properties) {
        throw new Error("No properties data in response");
      }
      const fetchedProperties = data.properties.map((property) => ({
        ...property,
        id: property._id,
        imageUrls:
          property.imageUrls && property.imageUrls.length > 0
            ? property.imageUrls
            : [DEFAULT_IMAGE],
        price: `₹ ${property.rent.toLocaleString()}/month`,
        beds: property.noOfBedroom,
        type: property.propertyType,
        location: property.city,
      }));
      setProperties(fetchedProperties);
      setDisplayedProperties(fetchedProperties.slice(0, 6));
      trackInteraction('data_fetch', 'properties_fetch_success', { count: fetchedProperties.length });
    } catch (err) {
      console.error("Fetch properties error:", err);
      setError(`Failed to load properties: ${err.message}. Please try again.`);
      trackInteraction('data_fetch', 'properties_fetch_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    trackInteraction('input', `filter_input_${name}`, { value });
  };

  const applyFilters = async () => {
    trackInteraction('click', 'apply_filters_button', { filters });
    setFiltersApplied(true);
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/property/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      let filtered = data.properties.map((property) => ({
        ...property,
        id: property._id,
        imageUrl: property.image && property.image.length > 0 ? property.image[0] : DEFAULT_IMAGE,
        price: `₹ ${property.rent.toLocaleString()}/month`,
        beds: property.noOfBedroom,
        type: property.propertyType,
        location: property.city,
      }));

      filtered = filtered.filter(property => {
        const matchesLocation = filters.location
          ? (property.location && property.location.includes(filters.location)) ||
            (property.city && property.city.includes(filters.location))
          : true;
        const matchesMinPrice = filters.minPrice
          ? property.rent >= parseFloat(filters.minPrice)
          : true;
        const matchesMaxPrice = filters.maxPrice
          ? property.rent <= parseFloat(filters.maxPrice)
          : true;
        const matchesPropertyType = filters.propertyType
          ? property.propertyType === filters.propertyType
          : true;
        return matchesLocation && matchesMinPrice && matchesMaxPrice && matchesPropertyType;
      });

      setProperties(filtered);
      setDisplayedProperties(filtered);
      setLoading(false);
      if (filtered.length === 0) {
        setError('No properties found matching your criteria.');
      } else {
        setError('');
      }
    } catch (err) {
      console.error("Filter properties error:", err);
      setError(`Failed to load properties: ${err.message}. Please try again.`);
      trackInteraction('data_fetch', 'filter_properties_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleShowLess = () => {
    trackInteraction('click', 'show_less_button');
    setDisplayedProperties(properties.slice(0, 6));
    setFiltersApplied(false);
  };

  return (
    <div className="min-h-screen bg-bg-gray-50 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-gray-800 text-center mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-primary-blue after:rounded-full">
        Find Your Perfect Room
      </h1>
      <p className="text-center text-text-gray-600 text-lg mb-10 max-w-3xl leading-relaxed">
        Browse through thousands of verified listings to find your next home.
      </p>

      <section className="bg-card-bg rounded-2xl shadow-card-shadow p-6 md:p-8 w-full max-w-4xl mb-10 border border-border-gray-300 animate-fade-in-up delay-100">
        <h2 className="text-2xl font-bold text-text-gray-800 mb-6 flex items-center gap-3">
          <Search size={28} className="text-primary-blue" /> Refine Your Search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="filter-group">
            <label htmlFor="location" className="block text-sm font-semibold text-text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray-400" />
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., Koregaon Park"
                className="w-full px-4 py-3 pl-10 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 text-base text-text-gray-800 bg-card-bg shadow-sm focus:border-primary-blue focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'filter_location_input')}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice" className="block text-sm font-semibold text-text-gray-700 mb-2">Min Price (₹)</label>
            <div className="relative">
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="e.g., 10000"
                className="w-full px-4 py-3 pl-10 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 text-base text-text-gray-800 bg-card-bg shadow-sm focus:border-primary-blue focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'filter_min_price_input')}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice" className="block text-sm font-semibold text-text-gray-700 mb-2">Max Price (₹)</label>
            <div className="relative">
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="e.g., 50000"
                className="w-full px-4 py-3 pl-10 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 text-base text-text-gray-800 bg-card-bg shadow-sm focus:border-primary-blue focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'filter_max_price_input')}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="propertyType" className="block text-sm font-semibold text-text-gray-700 mb-2">Property Type</label>
            <div className="relative">
              <Building size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray-400" />
              <select
                id="propertyType"
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 pl-10 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 text-base text-text-gray-800 bg-card-bg shadow-sm appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27currentColor%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.5em] focus:border-primary-blue focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'filter_property_type_select')}
              >
                <option value="">Any</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="shared_room">Shared Room</option>
                <option value="studio">Studio</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button 
            onClick={applyFilters} 
            className="bg-blue-500 text-white py-3 px-8 rounded-xl border-none cursor-pointer transition-all duration-300 font-semibold shadow-card-shadow inline-flex items-center gap-2 text-lg hover:bg-primary-blue-dark hover:scale-105 active:scale-95 ai-style-change-1"
          >
            <Search size={20} className="w-5 h-5" /> Apply Filters
          </button>
        </div>
      </section>

      <section className="w-full max-w-6xl py-6 mx-auto">
        {loading && (
          <div className="text-center text-text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-blue mb-4 animate-spin" />
            <p>Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-base">
            <AlertCircle size={20} className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && displayedProperties.length === 0 && (
          <div className="text-center text-text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
            <Frown size={60} className="text-primary-blue mb-4" />
            <p>No properties found matching your search criteria.</p>
          </div>
        )}

        {!loading && !error && displayedProperties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up delay-200">
            {displayedProperties.map((property) => (
              <PropertyListingCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!loading && !error && displayedProperties.length > 6 && filtersApplied && (
          <div className="text-center mt-8">
            <button 
              onClick={handleShowLess} 
              className="relative bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-10 rounded-xl border-none cursor-pointer transition-all duration-300 font-semibold shadow-lg text-lg hover:from-gray-600 hover:to-gray-700 hover:scale-105 active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="relative inline-flex items-center gap-2">
                <Search size={20} className="w-5 h-5" /> Show Less
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default FindRoomPage;