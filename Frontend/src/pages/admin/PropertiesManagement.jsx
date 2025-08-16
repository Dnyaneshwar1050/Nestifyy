import React, { useState, useEffect, useContext } from 'react';
import { Edit, Trash, Search, Home, ChevronLeft, ChevronRight, X, Eye, AlertCircle, CheckCircle, Car, Sofa, Wind, Tv, WashingMachine, Wifi, BatteryCharging, ShieldCheck, ArrowUp, Dumbbell, Waves, Building2, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext.jsx';

const PropertiesManagement = () => {
  const { trackInteraction } = useContext(AppContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  propertyType: '',
  bhkType: '',
  noOfBedroom: '',
  bathrooms: '',
  area: '',
  rent: '',
  deposit: '',
  city: '',
  location: '',
  amenities: [],
  allowBroker: '',
  status: 'Active',
  images: [], // Add images field
});
  const [formErrors, setFormErrors] = useState({});
  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    status: ''
  });

  const API_URL = 'https://nestifyy-my3u.onrender.com/api';

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const amenitiesOptions = [
    { value: 'Parking', icon: Car },
    { value: 'Furnished', icon: Sofa },
    { value: 'AC', icon: Wind },
    { value: 'TV', icon: Tv },
    { value: 'Washing Machine', icon: WashingMachine },
    { value: 'Wifi', icon: Wifi },
    { value: 'Power Backup', icon: BatteryCharging },
    { value: 'Security', icon: ShieldCheck },
    { value: 'Lift', icon: ArrowUp },
    { value: 'Gym', icon: Dumbbell },
    { value: 'Swimming Pool', icon: Waves },
    { value: 'Club House', icon: Building2 },
  ];

  const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  setFormData((prev) => ({
    ...prev,
    images: files,
  }));
};

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      let url = `${API_URL}/property/all?page=${currentPage}&limit=10`;

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (filters.propertyType) url += `&propertyType=${encodeURIComponent(filters.propertyType)}`;
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
      setTotalPages(data.pagination?.pages || 1);
      trackInteraction('data_fetch', 'properties_fetch_success');
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      trackInteraction('data_fetch', 'properties_fetch_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  const handleFilter = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.rent) errors.rent = 'Rent is required';
    else if (isNaN(formData.rent) || formData.rent <= 0) errors.rent = 'Rent must be a positive number';
    if (!formData.propertyType) errors.propertyType = 'Property type is required';
    if (!formData.noOfBedroom) errors.noOfBedroom = 'Number of bedrooms is required';
    else if (isNaN(formData.noOfBedroom) || formData.noOfBedroom <= 0) errors.noOfBedroom = 'Number of bedrooms must be a positive number';
    if (!formData.bathrooms) errors.bathrooms = 'Number of bathrooms is required';
    else if (isNaN(formData.bathrooms) || formData.bathrooms <= 0) errors.bathrooms = 'Number of bathrooms must be a positive number';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.images || formData.images.length === 0) errors.images = 'At least one image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedProperty ? `${API_URL}/property/${selectedProperty._id}` : `${API_URL}/property/register`;
      const method = selectedProperty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save property');
      setActionSuccess(selectedProperty ? 'Property updated successfully' : 'Property created successfully');
      setShowModal(false);
      setSelectedProperty(null);
      setFormData({ title: '', city: '', rent: '', propertyType: '', noOfBedroom: '', bathrooms: '', status: 'Active' });
      fetchProperties();
      trackInteraction('click', selectedProperty ? 'update_property_success' : 'create_property_success');
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property. Please try again.');
      trackInteraction('click', selectedProperty ? 'update_property_failure' : 'create_property_failure', { error: err.message });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/property/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete property');
      setActionSuccess('Property deleted successfully');
      fetchProperties();
      trackInteraction('click', 'delete_property_success');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again.');
      trackInteraction('click', 'delete_property_failure', { error: err.message });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setFormData({
      title: property.title,
      city: property.city,
      rent: property.rent,
      propertyType: property.propertyType,
      noOfBedroom: property.noOfBedroom,
      bathrooms: property.bathrooms || '',
      status: property.status || 'Active',
      description: property.description || '',
      bhkType: property.bhkType || '',
      area: property.area || '',
      deposit: property.deposit || '',
      location: property.location || '',
      amenities: property.amenities || [],
      allowBroker: property.allowBroker || 'yes'
    });
    setShowModal(true);
    trackInteraction('click', 'edit_property');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Properties Management</h1>
          <p className="text-gray-600">Manage and organize your property listings</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
            <AlertCircle size={20} className="text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {actionSuccess && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
            <CheckCircle size={20} className="text-emerald-500" />
            <p className="font-medium">{actionSuccess}</p>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          {/* Filters and Search */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Properties
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Search by title or city..."
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-r-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Property Type
              </label>
              <select
                id="typeFilter"
                value={filters.propertyType}
                onChange={(e) => handleFilter('propertyType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Add Property Button */}
          <button
            onClick={() => {
              setSelectedProperty(null);
              setFormData({ title: '', city: '', rent: '', propertyType: '', noOfBedroom: '', bathrooms: '', status: 'Active' });
              setShowModal(true);
              trackInteraction('click', 'add_property');
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Home className="h-5 w-5" />
            Add New Property
          </button>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Bedrooms</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property, index) => (
                  <tr key={property._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{property.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{property.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">₹{property.rent.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {property.propertyType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{property.noOfBedroom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {property.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/property/${property._id}`}
                          className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          onClick={() => trackInteraction('click', 'view_property')}
                          title="View Property"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(property)}
                          className="text-amber-600 hover:text-amber-800 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Property"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Property"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Property */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedProperty ? 'Edit Property' : 'Add Property'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter property title"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.title}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter city name"
                />
                {formErrors.city && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.city}</p>}
              </div>

              <div>
                <label htmlFor="rent" className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter monthly rent"
                />
                {formErrors.rent && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.rent}</p>}
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                </select>
                {formErrors.propertyType && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.propertyType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="0"
                  />
                  {formErrors.noOfBedroom && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.noOfBedroom}</p>}
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="0"
                  />
                  {formErrors.bathrooms && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.bathrooms}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formErrors.status && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.status}</p>}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Property description"
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.description}</p>}
              </div>

              {/* <div>
                <label htmlFor="bhkType" className="block text-sm font-semibold text-gray-700 mb-2">
                  BHK Type *
                </label>
                <select
                  id="bhkType"
                  name="bhkType"
                  value={formData.bhkType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                </select>
                {formErrors.bhkType && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.bhkType}</p>}
              </div> */}

              <div>
                <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-2">
                  Area (in sq. ft.) *
                </label>
                <input
                  id="area"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Property area"
                />
                {formErrors.area && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.area}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Property price"
                />
                {formErrors.price && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.price}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Property location"
                />
                {formErrors.location && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.location}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Property description"
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.description}</p>}
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-2">
                  Images *
                </label>
                <input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                {formErrors.images && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.images}</p>}
              </div>

              

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      {selectedProperty ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Home className="h-4 w-4" />
                      {selectedProperty ? 'Update Property' : 'Create Property'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesManagement;