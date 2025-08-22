import React, { useState, useContext } from 'react';
import { Search, MapPin, Home, Users, Sparkles } from 'lucide-react';

// Mock context for demo
const AppContext = React.createContext({
  trackInteraction: () => {}
});

const HeroSection = ({ initialSearch = '', activeTab = 'find_room', onTabChange = () => {}, onSearch = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchError, setSearchError] = useState(null);
  const { trackInteraction } = useContext(AppContext);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchError('Please enter a search query');
      return;
    }
    setSearchError(null);
    trackInteraction('click', `search_button_${activeTab}`, { query: trimmedQuery });
    onSearch(trimmedQuery, activeTab);
  };

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center text-white max-w-6xl w-full px-4">
        {/* Header with icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            {/* <div className="relative bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
              <Home size={32} className="text-yellow-300" />
            </div> */}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
            Find Your Perfect
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
            Living Space
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 text-blue-100 font-light max-w-3xl mx-auto leading-relaxed">
          Discover amazing rooms, houses, and connect with perfect roommates in your dream location
        </p>

        {/* Enhanced Search Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 w-full">
            
            {/* Enhanced Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-2 flex">
                <button
                  className={`px-8 py-4 font-semibold text-base rounded-xl transition-all duration-300 flex items-center gap-3 ${
                    activeTab === 'find_room' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                  }`}
                  onClick={() => {
                    onTabChange('find_room');
                    trackInteraction('click', 'search_tab_find_room');
                    setSearchQuery('');
                    setSearchError(null);
                    onSearch('', 'find_room');
                  }}
                >
                  <Home size={20} />
                  Find Room
                </button>
                <button
                  className={`px-3 py-4 font-semibold text-base rounded-xl transition-all duration-300 flex items-center gap-3 ${
                    activeTab === 'find_roommate' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                  }`}
                  onClick={() => {
                    onTabChange('find_roommate');
                    trackInteraction('click', 'search_tab_find_roommate');
                    setSearchQuery('');
                    setSearchError(null);
                    onSearch('', 'find_roommate');
                  }}
                >
                  <Users size={20} />
                  Find Roommate
                </button>
              </div>
            </div>

            {/* Enhanced Search Input */}
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              <div className="relative flex-grow w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                  <Search className="absolute left-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors hidden" size={22} />
                  <input
                    type="text"
                    placeholder={activeTab === 'find_room' ? "Search by area, location, or property type" : "Search by area, city, or location"}
                    className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 text-gray-800 text-lg bg-white/80 backdrop-blur-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white group-hover:border-gray-300"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError(null);
                    }}
                    onFocus={() => trackInteraction('focus', `search_input_${activeTab}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmedQuery = searchQuery.trim();
                        if (!trimmedQuery) {
                          setSearchError('Please enter a search query');
                          return;
                        }
                        trackInteraction('keypress', `search_input_enter_${activeTab}`, { query: trimmedQuery });
                        onSearch(trimmedQuery, activeTab);
                      }
                    }}
                  />
                </div>
              </div>
              
              <button
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl shadow-xl transition-all duration-300 w-full lg:w-auto text-lg font-bold border-none cursor-pointer group hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:scale-105 active:scale-95"
                onClick={handleSearch}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Search size={22} />
                  Search Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            
            {searchError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {searchError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;