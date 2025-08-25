import React, { useState, useContext } from 'react';
import { Search, MapPin, Home, Users, Building2 } from 'lucide-react';

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
    <main className="relative min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl w-full px-4 py-12">
        {/* Professional header */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Building2 size={40} className="text-indigo-600" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
          Housing
          <br />
          <span className="text-indigo-600">Solutions</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-12 text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
          Connect with quality housing and perfect roommates through our trusted platform
        </p>

        {/* Professional Search Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-4xl mx-auto">
          
          {/* Clean Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-50 rounded-xl p-1 flex border border-gray-200">
              <button
                className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'find_room' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
                onClick={() => {
                  onTabChange('find_room');
                  trackInteraction('click', 'search_tab_find_room');
                  setSearchQuery('');
                  setSearchError(null);
                  onSearch('', 'find_room');
                }}
              >
                <Home size={18} />
                Find Property
              </button>
              <button
                className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'find_roommate' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
                onClick={() => {
                  onTabChange('find_roommate');
                  trackInteraction('click', 'search_tab_find_roommate');
                  setSearchQuery('');
                  setSearchError(null);
                  onSearch('', 'find_roommate');
                }}
              >
                <Users size={18} />
                Find Roommate
              </button>
            </div>
          </div>

          {/* Professional Search Input */}
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={activeTab === 'find_room' ? "Enter location, area, or property type" : "Enter your preferred location"}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl outline-none transition-all duration-200 text-gray-700 bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
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
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl transition-all duration-200 w-full lg:w-auto font-semibold border-none cursor-pointer hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              onClick={handleSearch}
            >
              <span className="flex items-center justify-center gap-2">
                <Search size={20} />
                Search
              </span>
            </button>
          </div>
          
          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {searchError}
              </p>
            </div>
          )}
        </div>

        {/* Trust indicators
        <div className="mt-12 flex justify-center items-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Verified Properties
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Trusted Community
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Secure Platform
          </div>
        </div> */}
      </div>
    </main>
  );
};

export default HeroSection;