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
    city: '',
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

      setSuccessMessage('Property listed successfully! Redirecting...');
      trackInteraction('property_listed', 'success', { propertyId: response.data.propertyId });
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

      setTimeout(() => {
        window.scrollTo(0, 0);
        navigate('/list-property');
      }, 3000);
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
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-10 relative">
        List Your Property
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-600 rounded-full"></span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-8 max-w-3xl leading-relaxed">
        Provide details about your property to connect with potential tenants or roommates.
      </p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center gap-3 text-lg w-full max-w-4xl animate-pulse" role="alert">
          <CheckCircle size={24} />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center gap-3 text-lg w-full max-w-4xl animate-pulse" role="alert">
          <AlertCircle size={24} />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl flex flex-col gap-6 border border-gray-200">
        <div>
          <label htmlFor="propertyType" className="block text-lg font-semibold text-gray-800 mb-2">Property Type *</label>
          <div className="relative">
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
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
        </div>

        {(formData.propertyType === 'apartment' || formData.propertyType === 'house' || formData.propertyType === 'villa') && (
          <div>
            <label htmlFor="bhkType" className="block text-lg font-semibold text-gray-800 mb-2">BHK Type</label>
            <select
              id="bhkType"
              name="bhkType"
              value={formData.bhkType}
              onChange={handleChange}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bedrooms" className="block text-lg font-semibold text-gray-800 mb-2">Bedrooms *</label>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="Number of bedrooms"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
                min="0"
                required
                onFocus={() => trackInteraction('focus', 'list_property_bedrooms_input')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-lg font-semibold text-gray-800 mb-2">Bathrooms</label>
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="Number of bathrooms"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
                min="0"
                onFocus={() => trackInteraction('focus', 'list_property_bathrooms_input')}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="area" className="block text-lg font-semibold text-gray-800 mb-2">Area (in sq.ft.)</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Total area in square feet"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              min="1"
              onFocus={() => trackInteraction('focus', 'list_property_area_input')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rent" className="block text-lg font-semibold text-gray-800 mb-2">Monthly Rent (₹) *</label>
            <input
              type="number"
              id="rent"
              name="rent"
              value={formData.rent}
              onChange={handleChange}
              placeholder="Expected monthly rent"
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              min="1"
              required
              onFocus={() => trackInteraction('focus', 'list_property_rent_input')}
            />
          </div>
          <div>
            <label htmlFor="deposit" className="block text-lg font-semibold text-gray-800 mb-2">Security Deposit (₹)</label>
            <input
              type="number"
              id="deposit"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              placeholder="Security deposit amount"
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              min="0"
              onFocus={() => trackInteraction('focus', 'list_property_deposit_input')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block text-lg font-semibold text-gray-800 mb-2">City *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Pune"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              required
              onFocus={() => trackInteraction('focus', 'list_property_city_input')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-lg font-semibold text-gray-800 mb-2">Location (e.g., Google Maps link) *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., https://maps.google.com/..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              required
              onFocus={() => trackInteraction('focus', 'list_property_location_input')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-2">Property Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Cozy 2BHK Apartment in City Center"
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
            required
            onFocus={() => trackInteraction('focus', 'list_property_title_input')}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe your property (e.g., nearby landmarks, features, rules)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-blue-300 focus:border-blue-600 min-h-[120px]"
            onFocus={() => trackInteraction('focus', 'list_property_description_input')}
          ></textarea>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {['Furnished', 'AC', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Balcony', 'Pet Friendly', 'Wi-Fi'].map(amenity => (
              <label key={amenity} className="flex items-center gap-2 text-gray-700 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-200">
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-300 rounded"
                  onFocus={() => trackInteraction('focus', `list_property_amenity_checkbox_${amenity}`)}
                />
                <span className="text-base">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Allow Brokers to Contact You?</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="allowBroker"
                value="yes"
                checked={formData.allowBroker === 'yes'}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'list_property_allow_broker_yes')}
              />
              <span className="ml-2 text-gray-700 text-base">Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="allowBroker"
                value="no"
                checked={formData.allowBroker === 'no'}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-300"
                onFocus={() => trackInteraction('focus', 'list_property_allow_broker_no')}
              />
              <span className="ml-2 text-gray-700 text-base">No</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Property Images (Max 5MB per image)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-gray-500 text-base cursor-pointer py-3 px-4 border border-gray-300 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
            onFocus={() => trackInteraction('focus', 'list_property_image_upload_input')}
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {propertyImages.map((file, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200 aspect-[4/3] group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-md hover:bg-red-700"
                  title="Remove image"
                  onMouseEnter={() => trackInteraction('hover', 'list_property_image_remove_button')}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-lg hover:bg-blue-700 hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
          onClick={() => trackInteraction('click', 'list_property_submit_button')}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>List Property</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ListPropertyPage;