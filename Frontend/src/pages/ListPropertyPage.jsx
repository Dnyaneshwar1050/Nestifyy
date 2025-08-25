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
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
              <Building className="text-blue-600" size={24} />
              <span className="text-blue-900 font-semibold">Property Listing</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              List Your Property
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Connect with verified tenants and showcase your property to thousands of potential renters
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Free to List</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Verified Tenants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Quick Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <div className="font-semibold">Success!</div>
              <div className="text-sm">{successMessage}</div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <div>
              <div className="font-semibold">Error</div>
              <div className="text-sm">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Form Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Property Information</h2>
            <p className="text-gray-600 mt-1">Please provide detailed information about your property</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Property Type Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Home className="text-gray-600" size={20} />
                Property Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                      <div className={`p-4 rounded-lg text-center border transition-all ${
                        formData.propertyType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}>
                        <IconComponent size={20} className="mx-auto mb-2" />
                        <div className="text-sm font-medium">{type.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* BHK Type - Conditional */}
            {(formData.propertyType === 'apartment' || formData.propertyType === 'house' || formData.propertyType === 'villa') && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900">
                  <Bed className="inline mr-2 text-gray-600" size={20} />
                  BHK Configuration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                      <div className={`p-3 rounded-lg text-center font-medium border transition-all ${
                        formData.bhkType === bhk
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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
                <label className="block text-sm font-medium text-gray-900">
                  Bedrooms *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="Number of bedrooms"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Bathrooms
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="Number of bathrooms"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Area (sq.ft.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Total area in square feet"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              {/* Rent */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Monthly Rent (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    placeholder="Expected monthly rent"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Security Deposit (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="Security deposit amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai, Delhi, Pune"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Specific Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Koregaon Park, Andheri West, CP"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK with City View in Prime Location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Property Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your property in detail... Include nearby landmarks, unique features, house rules, and what makes your property special."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="text-gray-600" size={20} />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {['Furnished', 'AC', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Balcony', 'Pet Friendly', 'Wi-Fi'].map(amenity => {
                  const IconComponent = amenityIcons[amenity] || Star;
                  return (
                    <label key={amenity} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg text-center border transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}>
                        <IconComponent size={18} className="mx-auto mb-2" />
                        <div className="text-sm font-medium">{amenity}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Broker Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="text-gray-600" size={20} />
                Broker Contact Preference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                  <input
                    type="radio"
                    name="allowBroker"
                    value="yes"
                    checked={formData.allowBroker === 'yes'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Allow broker inquiries</div>
                    <div className="text-sm text-gray-600">Receive inquiries from both brokers and direct tenants</div>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                  <input
                    type="radio"
                    name="allowBroker"
                    value="no"
                    checked={formData.allowBroker === 'no'}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Direct inquiries only</div>
                    <div className="text-sm text-gray-600">Receive inquiries from tenants directly</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="text-gray-600" size={20} />
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Camera size={32} className="mx-auto text-gray-400 mb-4" />
                    <div className="text-sm font-medium text-gray-900 mb-2">Upload Property Images</div>
                    <div className="text-sm text-gray-600 mb-4">Drag & drop or click to select images (Max 5MB each)</div>
                    <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Upload size={16} />
                      Choose Images
                    </div>
                  </div>
                </label>
                
                {propertyImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {propertyImages.map((file, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing Property...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>List Property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListPropertyPage;