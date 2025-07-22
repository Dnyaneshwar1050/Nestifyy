import React, { useState, useContext, useEffect } from 'react';
import { Home, MapPin, Bed, Bath, Camera, Upload, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ListPropertyPage = () => {
  const { trackInteraction, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
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
    // address: '',
    // locality: '',
    city: '',
    // district: '',
    // zipcode: '',
    location: '',
    amenities: [],
    allowBroker: 'yes',
  });
  const [propertyImages, setPropertyImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage('You need to be logged in to list a property.');
      trackInteraction('auth_error', 'list_property_unauthenticated');
      navigate('/login', { replace: true });
    } else {
      trackInteraction('page_view', 'list-property_page');
    }
  }, [isAuthenticated, navigate, trackInteraction]);

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
    if (!isAuthenticated) {
      setErrorMessage('You must be logged in to list a property.');
      trackInteraction('auth_error', 'list_property_unauthenticated_submit');
      navigate('/login', { replace: true });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('No authentication token found. Please log in again.');
      trackInteraction('auth_error', 'missing_token');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        setErrorMessage('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        trackInteraction('auth_error', 'expired_token');
        navigate('/login', { replace: true });
        return;
      }
    } catch (error) {
      setErrorMessage('Invalid authentication token. Please log in again.');
      localStorage.removeItem('token');
      trackInteraction('auth_error', 'invalid_token');
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setSuccessMessage('Property listed successfully!');
    setErrorMessage('');

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'amenities') {
          formData.amenities.forEach((amenity) => data.append('amenities[]', amenity));
        } else if (key === 'bedrooms') {
          data.append('noOfBedroom', formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }

      propertyImages.forEach((image) => {
        data.append('image', image);
      });

      const response = await axios.post('https://nestifyy-my3u.onrender.com/api/property/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setSuccessMessage('Property is listed');
      trackInteraction('property_listed', 'success', { propertyId: response.data.propertyId });
      setFormData({
        title: '',
        description: '',
        propertyType: '',
        bhkType: '',
        bedrooms: '',
        bathrooms: '',
        rent: '',
        deposit: '',
        // address: '',
        // locality: '',
        city: '',
        // district: '',
        // zipcode: '',
        location: '',
        amenities: [],
        allowBroker: 'yes',
      });
      setPropertyImages([]);
      
      // Refresh the page after 2 seconds to show the success message
      setTimeout(() => {
        window.scrollTo(0, 0);
        navigate('/list-property');
      }, 2000);
      
    } catch (error) {
      console.error('Error listing property:', error);
      const errorMsg = error.response?.data?.message || 'Failed to list property. Please try again.';
      setErrorMessage(errorMsg);
      trackInteraction('property_listed', 'failure', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-gray-50 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-gray-800 text-center mb-10 relative">
        <span className="relative inline-block pb-2">
          List Your Property
          <span className="content-[''] absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary-blue rounded-full"></span>
        </span>
      </h1>
      <p className="text-center text-text-gray-600 text-lg mb-8 max-w-3xl leading-relaxed">
        Provide details about your room or property to connect with potential tenants or roommates.
      </p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-base w-full max-w-[1000px] animate-fade-in" role="alert">
          <CheckCircle size={20} />
          <span className="block font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-base w-full max-w-[1000px] animate-fade-in" role="alert">
          <AlertCircle size={20} />
          <span className="block font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card-bg rounded-2xl shadow-card-shadow-xl p-6 md:p-8 w-full max-w-[1000px] mx-auto flex flex-col gap-6 border border-border-gray-200 animate-fade-in-up">
        {/* Property Type */}
        <div className="form-group">
          <label htmlFor="propertyType" className="block text-lg font-semibold text-text-gray-800 mb-2">Property Type *</label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27currentColor%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.5em] focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
            required
            onFocus={() => trackInteraction('focus', 'list_property_type_select')}
          >
            <option value="">Select Property Type</option>
            <option value="apartment">Apartment</option>
            <option value="shared_room">Shared Room</option>
            <option value="house">Independent House</option>
            <option value="villa">Villa</option>
            <option value="pg">PG/Hostel</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* BHK Type (if applicable) */}
        {(formData.propertyType === 'apartment' || formData.propertyType === 'house' || formData.propertyType === 'villa') && (
          <div className="form-group">
            <label htmlFor="bhkType" className="block text-lg font-semibold text-text-gray-800 mb-2">BHK Type</label>
            <select
              id="bhkType"
              name="bhkType"
              value={formData.bhkType}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-1
              800 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27currentColor%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.5em] focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
              onFocus={() => trackInteraction('focus', 'list_property_bhk_select')}
            >
              <option value="">Select BHK Type</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK+">4 BHK +</option>
            </select>
          </div>
        )}

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="bedrooms" className="block text-lg font-semibold text-text-gray-800 mb-2">Bedrooms *</label>
            <div className="relative">
              <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.noOfBedroom}
                onChange={handleChange}
                placeholder="Number of bedrooms"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                min="0"
                required
                onFocus={() => trackInteraction('focus', 'list_property_bedrooms_input')}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="bathrooms" className="block text-lg font-semibold text-text-gray-800 mb-2">Bathrooms</label>
            <div className="relative">
              <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="Number of bathrooms"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                min="0"
                onFocus={() => trackInteraction('focus', 'list_property_bathrooms_input')}
              />
            </div>
          </div>
        </div>

        {/* Area */}
        <div className="form-group">
          <label htmlFor="area" className="block text-lg font-semibold text-text-gray-800 mb-2">Area (in sq.ft.)</label>
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Total area in square feet"
              className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
              min="1"
              onFocus={() => trackInteraction('focus', 'list_property_area_input')}
            />
          </div>
        </div>

        {/* Rent & Deposit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="rent" className="block text-lg font-semibold text-text-gray-800 mb-2">Monthly Rent (₹) *</label>
            <div className="relative">
              <input
                type="number"
                id="rent"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                placeholder="Expected monthly rent"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                min="1"
                required
                onFocus={() => trackInteraction('focus', 'list_property_rent_input')}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="deposit" className="block text-lg font-semibold text-text-gray-800 mb-2">Security Deposit (₹)</label>
            <div className="relative">
              <input
                type="number"
                id="deposit"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="Security deposit amount"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                min="0"
                onFocus={() => trackInteraction('focus', 'list_property_deposit_input')}
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        {/* <div className="form-group">
          <label htmlFor="address" className="block text-lg font-semibold text-text-gray-800 mb-2">Full Address *</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House/Flat No., Street Name"
              className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
              required
              onFocus={() => trackInteraction('focus', 'list_property_address_input')}
            />
          </div>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="form-group">
            // <label htmlFor="locality" className="block text-lg font-semibold text-text-gray-800 mb-2">Locality *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="text"
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="e.g., Koregaon Park"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                required
                onFocus={() => trackInteraction('focus', 'list_property_locality_input')}
              />
            </div>
          </div> */}
          <div className="form-group">
            <label htmlFor="city" className="block text-lg font-semibold text-text-gray-800 mb-2">City *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Pune"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                required
                onFocus={() => trackInteraction('focus', 'list_property_city_input')}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="form-group">
            <label htmlFor="district" className="block text-lg font-semibold text-text-gray-800 mb-2">District *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g., Pune District"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                required
                onFocus={() => trackInteraction('focus', 'list_property_district_input')}
              />
            </div>
          </div> */}
          {/* <div className="form-group">
            <label htmlFor="zipcode" className="block text-lg font-semibold text-text-gray-800 mb-2">Zipcode *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="e.g., 411001"
                className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
                required
                onFocus={() => trackInteraction('focus', 'list_property_zipcode_input')}
              />
            </div>
          </div> */}
        </div>
        <div className="form-group">
          <label htmlFor="location" className="block text-lg font-semibold text-text-gray-800 mb-2">Location (e.g., Google Maps link) *</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray-400" size={20} />
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., pune"
              className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
              required
              onFocus={() => trackInteraction('focus', 'list_property_location_input')}
            />
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="block text-lg font-semibold text-text-gray-800 mb-2">Property Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Cozy 2BHK Apartment in City Center"
            className="w-full pl-12 pr-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
            required
            onFocus={() => trackInteraction('focus', 'list_property_title_input')}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="block text-lg font-semibold text-text-gray-800 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe your property (e.g., nearby landmarks, features, rules)"
            className="w-full px-4 py-3.5 border border-border-gray-300 rounded-lg outline-none transition-all duration-200 bg-card-bg text-base shadow-sm text-text-gray-800 min-h-[7.5rem] focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring"
            onFocus={() => trackInteraction('focus', 'list_property_description_input')}
          ></textarea>
        </div>

        {/* Amenities */}
        <div className="form-group">
          <label className="block text-lg font-semibold text-text-gray-800 mb-2">Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {['Furnished', 'AC', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Balcony', 'Pet Friendly', 'Wi-Fi'].map(amenity => (
              <label key={amenity} className="flex items-center gap-2 text-text-gray-700 cursor-pointer p-2 bg-bg-gray-50 rounded-lg transition-colors duration-200 hover:bg-border-gray-200">
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary-blue rounded border border-border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-focus-ring focus:outline-none cursor-pointer"
                  onFocus={() => trackInteraction('focus', `list_property_amenity_checkbox_${amenity}`)}
                />
                <span className="text-base">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allow Broker */}
        <div className="form-group">
          <label className="block text-lg font-semibold text-text-gray-800 mb-2">Allow Brokers to Contact You?</label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="allowBroker"
                value="yes"
                checked={formData.allowBroker === 'yes'}
                onChange={handleChange}
                className="h-5 w-5 text-primary-blue transition-all duration-200 border border-border-gray-300 focus:ring-2 focus:ring-blue-focus-ring focus:outline-none cursor-pointer"
                onFocus={() => trackInteraction('focus', 'list_property_allow_broker_yes')}
              />
              <span className="ml-2 text-text-gray-700 text-base">Yes</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="allowBroker"
                value="no"
                checked={formData.allowBroker === 'no'}
                onChange={handleChange}
                className="h-5 w-5 text-primary-blue transition-all duration-200 border border-border-gray-300 focus:ring-2 focus:ring-blue-focus-ring focus:outline-none cursor-pointer"
                onFocus={() => trackInteraction('focus', 'list_property_allow_broker_no')}
              />
              <span className="ml-2 text-text-gray-700 text-base">No</span>
            </label>
          </div>
        </div>

        {/* Property Images */}
        <div className="form-group">
          <label className="block text-lg font-semibold text-text-gray-800 mb-2">Property Images (Max 5MB per image)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-text-gray-500 text-base cursor-pointer py-3 px-4 border border-border-gray-300 rounded-lg bg-card-bg shadow-sm transition-colors duration-200 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-primary-blue-light file:text-primary-blue-dark hover:file:bg-[#bfdbfe] focus:border-primary-blue focus:ring-2 focus:ring-blue-focus-ring focus:outline-none"
            onFocus={() => trackInteraction('focus', 'list_property_image_upload_input')}
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {propertyImages.map((file, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden shadow-card-shadow-md border border-border-gray-200 aspect-[4/3] group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-error-text text-white rounded-full p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-card-shadow-md border-none cursor-pointer hover:bg-red-error-border"
                  title="Remove image"
                  onMouseEnter={() => trackInteraction('hover', 'list_property_image_remove_button')}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-card-shadow-lg text-xl flex items-center justify-center gap-2 border-none cursor-pointer transform scale-100 hover:scale-[1.005] hover:shadow-xl active:scale-99 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={() => trackInteraction('click', 'list_property_submit_button')}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload size={22} />
              <span>List Property</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ListPropertyPage;