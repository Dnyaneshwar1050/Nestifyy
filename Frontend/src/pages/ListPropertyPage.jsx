import React, { useState, useContext, useEffect } from 'react';
import { Home, MapPin, Bed, Bath, Camera, Upload, CheckCircle, AlertCircle, Loader2, X, Building, Star, Shield, Wifi } from 'lucide-react';

// Mock context for demonstration
const AppContext = React.createContext({
  trackInteraction: () => {},
  isAuthenticated: true
});

const ListPropertyPage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '',
    bhkType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    rent: '',
    deposit: '',
    city: '',
    location: '',
    amenities: [],
    allowBroker: 'yes',
  });
  const [propertyImages, setPropertyImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => {
        const newAmenities = checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((item) => item !== value);
        return { ...prev, amenities: newAmenities };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (propertyImages.length + files.length > 10) {
      setErrorMessage('You can upload a maximum of 10 images.');
      return;
    }
    setPropertyImages((prev) => [...prev, ...files]);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const removeImage = (index) => {
    setPropertyImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Property listed successfully! Redirecting...');
      setLoading(false);
      setFormData({
        title: '',
        description: '',
        propertyType: '',
        bhkType: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        rent: '',
        deposit: '',
        city: '',
        location: '',
        amenities: [],
        allowBroker: 'yes',
      });
      setPropertyImages([]);
    }, 2000);
  };

  const propertyTypeIcons = {
    apartment: Building,
    shared_room: Home,
    house: Home,
    villa: Star,
    pg: Shield,
    commercial: Building
  };

  const amenityIcons = {
    'Furnished': Home,
    'AC': Star,
    'Parking': Building,
    'Gym': Star,
    'Security': Shield,
    'Power Backup': Star,
    'Lift': Building,
    'Balcony': Home,
    'Pet Friendly': Star,
    'Wi-Fi': Wifi
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16 px-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Home className="text-white" size={24} />
            <span className="text-lg font-semibold">Property Listing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            List Your
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Dream Property
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with thousands of verified tenants and find the perfect match for your property
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle size={16} />
              <span>Free Listing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle size={16} />
              <span>Verified Tenants</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle size={16} />
              <span>Quick Approval</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Status Messages */}
        {successMessage && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 shadow-2xl backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="font-bold text-lg">Success!</div>
              <div className="opacity-90">{successMessage}</div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 shadow-2xl backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-full">
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="font-bold text-lg">Error</div>
              <div className="opacity-90">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Building size={28} />
              Property Details
            </h2>
            <p className="text-blue-100 mt-2">Fill in the information about your property</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Property Type Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="text-blue-600" size={24} />
                Property Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'shared_room', label: 'Shared Room' },
                  { value: 'house', label: 'House' },
                  { value: 'villa', label: 'Villa' },
                  { value: 'pg', label: 'PG/Hostel' },
                  { value: 'commercial', label: 'Commercial' }
                ].map((type) => {
                  const IconComponent = propertyTypeIcons[type.value];
                  return (
                    <label key={type.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="propertyType"
                        value={type.value}
                        checked={formData.propertyType === type.value}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                        formData.propertyType === type.value
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md'
                      }`}>
                        <IconComponent size={24} className="mx-auto mb-2" />
                        <div className="text-sm font-semibold">{type.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* BHK Type - Conditional */}
            {(formData.propertyType === 'apartment' || formData.propertyType === 'house' || formData.propertyType === 'villa') && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                <label className="block text-xl font-bold text-gray-800 mb-4">
                  <Bed className="inline mr-2 text-green-600" size={24} />
                  BHK Configuration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {['1RK', '1BHK', '2BHK', '3BHK', '4BHK+'].map((bhk) => (
                    <label key={bhk} className="cursor-pointer">
                      <input
                        type="radio"
                        name="bhkType"
                        value={bhk}
                        checked={formData.bhkType === bhk}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl text-center font-bold transition-all duration-300 border-2 ${
                        formData.bhkType === bhk
                          ? 'border-green-500 bg-green-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:shadow-md'
                      }`}>
                        {bhk}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  <Bed className="inline mr-2 text-blue-600" size={20} />
                  Bedrooms *
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="Number of bedrooms"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    min="0"
                    required
                  />
                  <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  <Bath className="inline mr-2 text-blue-600" size={20} />
                  Bathrooms
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="Number of bathrooms"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    min="0"
                  />
                  <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  <Home className="inline mr-2 text-blue-600" size={20} />
                  Area (sq.ft.)
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Total area in square feet"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    min="1"
                  />
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
              </div>

              {/* Rent */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  Monthly Rent (₹) *
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    placeholder="Expected monthly rent"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    min="1"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  Security Deposit (₹)
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="Security deposit amount"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    min="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-800">
                  <MapPin className="inline mr-2 text-blue-600" size={20} />
                  City *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai, Delhi, Pune"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                    required
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-lg font-bold text-gray-800">
                <MapPin className="inline mr-2 text-blue-600" size={20} />
                Specific Location *
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Koregaon Park, Andheri West, CP"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                  required
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-lg font-bold text-gray-800">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK with City View in Prime Location"
                className="w-full pl-4 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-lg font-bold text-gray-800">
                Property Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe your property in detail... Include nearby landmarks, unique features, house rules, and what makes your property special."
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-base focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 resize-none"
              ></textarea>
            </div>

            {/* Amenities */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="text-purple-600" size={24} />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {['Furnished', 'AC', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Balcony', 'Pet Friendly', 'Wi-Fi'].map(amenity => {
                  const IconComponent = amenityIcons[amenity] || Star;
                  return (
                    <label key={amenity} className="cursor-pointer group">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                        formData.amenities.includes(amenity)
                          ? 'border-purple-500 bg-purple-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:shadow-md group-hover:scale-105'
                      }`}>
                        <IconComponent size={20} className="mx-auto mb-2" />
                        <div className="text-sm font-semibold">{amenity}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Broker Contact */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="text-yellow-600" size={24} />
                Broker Contact Preference
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center cursor-pointer bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 flex-1">
                  <input
                    type="radio"
                    name="allowBroker"
                    value="yes"
                    checked={formData.allowBroker === 'yes'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.allowBroker === 'yes' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                  }`}>
                    {formData.allowBroker === 'yes' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Yes, allow brokers</div>
                    <div className="text-sm text-gray-600">Get more inquiries from brokers</div>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 flex-1">
                  <input
                    type="radio"
                    name="allowBroker"
                    value="no"
                    checked={formData.allowBroker === 'no'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.allowBroker === 'no' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                  }`}>
                    {formData.allowBroker === 'no' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">No brokers</div>
                    <div className="text-sm text-gray-600">Direct tenant inquiries only</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="text-indigo-600" size={24} />
                Property Images
              </h3>
              <div className="space-y-4">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300">
                    <Camera size={48} className="mx-auto text-indigo-400 mb-4" />
                    <div className="text-lg font-semibold text-gray-800 mb-2">Upload Property Images</div>
                    <div className="text-gray-600">Drag & drop or click to select images (Max 5MB each)</div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors">
                      <Upload size={20} />
                      Choose Images
                    </div>
                  </div>
                </label>
                
                {propertyImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {propertyImages.map((file, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white aspect-[4/3] group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-500 shadow-2xl flex items-center gap-3 text-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-3xl transform hover:scale-105 ${
                  loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Publishing Your Property...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    <span>List My Property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default ListPropertyPage;