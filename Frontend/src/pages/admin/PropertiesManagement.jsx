import { useState, useEffect, useContext } from 'react';
import { Edit, Trash, Search, Home, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

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
    city: '',
    rent: '',
    propertyType: '',
    noOfBedroom: '',
    bathrooms: '',
    status: 'Active'
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
      const url = selectedProperty ? `${API_URL}/property/${selectedProperty._id}` : `${API_URL}/property`;
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
      status: property.status || 'Active'
    });
    setShowModal(true);
    trackInteraction('click', 'edit_property');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Properties Management</h1>

      {error && (
        <div className="bg-red-error-bg border border-red-error-border text-red-error-text px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      {actionSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <p>{actionSuccess}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Properties
          </label>
          <div className="flex">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Search by title or city"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            id="typeFilter"
            value={filters.propertyType}
            onChange={(e) => handleFilter('propertyType', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Add Property Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedProperty(null);
            setFormData({ title: '', city: '', rent: '', propertyType: '', noOfBedroom: '', bathrooms: '', status: 'Active' });
            setShowModal(true);
            trackInteraction('click', 'add_property');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Home className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrooms</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{property.rent.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.propertyType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.noOfBedroom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.status || 'Active'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/property/${property._id}`}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                    onClick={() => trackInteraction('click', 'view_property')}
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleEdit(property)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(property._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Modal for Add/Edit Property */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProperty ? 'Edit Property' : 'Add Property'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                  Rent
                </label>
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formErrors.rent && <p className="text-red-500 text-xs mt-1">{formErrors.rent}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                </select>
                {formErrors.propertyType && <p className="text-red-500 text-xs mt-1">{formErrors.propertyType}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="noOfBedroom" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="noOfBedroom"
                  name="noOfBedroom"
                  value={formData.noOfBedroom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formErrors.noOfBedroom && <p className="text-red-500 text-xs mt-1">{formErrors.noOfBedroom}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {formErrors.bathrooms && <p className="text-red-500 text-xs mt-1">{formErrors.bathrooms}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      {selectedProperty ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedProperty ? 'Update Property' : 'Create Property'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-blue-600 { background-color: #2563eb; }
        .bg-blue-700 { background-color: #1d4ed8; }
        .text-blue-600 { color: #2563eb; }
        .focus\\:ring-blue-600:focus { --tw-ring-color: #2563eb; }
      `}</style>
    </div>
  );
};

export default PropertiesManagement;