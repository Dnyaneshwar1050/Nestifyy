import React, { useEffect, useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Loader2, AlertCircle, Home, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

const Properties = () => {
  const { trackInteraction } = useContext(AppContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [propertyToRemoveId, setPropertyToRemoveId] = useState(null);

  useEffect(() => {
    trackInteraction('page_view', 'admin_properties_page');
    fetchProperties();
  }, [trackInteraction]);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://nestifyy-my3u.onrender.com/api/property/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedProperties = response.data.properties.map((property) => ({
        ...property,
        id: property._id,
        imageUrls: Array.isArray(property.imageUrls) && property.imageUrls.length > 0
          ? property.imageUrls
          : ['https://placehold.co/100x70/E0E7FF/4338CA?text=Prop'],
        price: `₹ ${property.rent.toLocaleString()}/month`,
        location: property.city,
      }));
      setProperties(formattedProperties);
      setLoading(false);
      trackInteraction('data_fetch', 'admin_properties_success', { count: formattedProperties.length });
    } catch (err) {
      console.error('Fetch properties error:', err);
      setError(err.response?.data?.message || 'Failed to load properties. Please try again later.');
      setLoading(false);
      trackInteraction('data_fetch', 'admin_properties_failure', { error: err.message });
    }
  };

  const handleViewProperty = (id) => {
    trackInteraction('click', 'admin_view_property', { propertyId: id });
    window.location.href = `/property/${id}`;
  };

  const confirmRemoveProperty = (id) => {
    setPropertyToRemoveId(id);
    setShowConfirmModal(true);
    trackInteraction('click', 'admin_confirm_remove_property', { propertyId: id });
  };

  const executeRemoveProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://nestifyy-my3u.onrender.com/api/property/${propertyToRemoveId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) => prev.filter((property) => property.id !== propertyToRemoveId));
      setShowConfirmModal(false);
      trackInteraction('action', 'admin_property_removed', { propertyId: propertyToRemoveId });
    } catch (err) {
      console.error('Remove property error:', err);
      setError(err.response?.data?.message || 'Failed to remove property. Please try again.');
      trackInteraction('action', 'admin_property_remove_failure', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const cancelRemoveProperty = () => {
    setShowConfirmModal(false);
    setPropertyToRemoveId(null);
    trackInteraction('click', 'admin_cancel_remove_property');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-card-shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Home size={28} className="text-maroon" />
        Manage Properties
      </h2>

      {loading && (
        <div className="text-center text-gray-600 text-lg py-10 flex flex-col items-center justify-center">
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

      {!loading && !error && properties.length === 0 && (
        <div className="text-center text-gray-600 text-lg py-10">
          <p>No properties found.</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border border-warm-gray">
            <thead className="bg-cream">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-warm-gray last:border-b-0 hover:bg-cream transition-colors duration-150">
                  <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">
                    <img src={property.imageUrls[0]} alt={property.title} className="w-20 h-14 object-cover rounded-md shadow-sm" />
                  </td>
                  <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{property.title}</td>
                  <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{property.location}</td>
                  <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap">{property.price}</td>
                  <td className="py-3 px-4 text-gray-800 text-base whitespace-nowrap flex gap-3 flex-wrap">
                    <button
                      className="text-blue-600 transition-colors duration-200 text-sm font-medium inline-flex items-center gap-1 bg-none border-none cursor-pointer p-1 rounded hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleViewProperty(property.id)}
                    >
                      <Eye size={16} /><span>View</span>
                    </button>
                    <button
                      className="text-red-600 transition-colors duration-200 text-sm font-medium inline-flex items-center gap-1 bg-none border-none cursor-pointer p-1 rounded hover:text-red-800 hover:bg-red-100"
                      onClick={() => confirmRemoveProperty(property.id)}
                    >
                      <Trash2 size={16} /><span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-11/12 text-center animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Removal</h3>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">Are you sure you want to remove this property? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelRemoveProperty}
                className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={executeRemoveProperty}
                className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 bg-red-600 text-white border border-transparent hover:bg-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bg-maroon { background-color: #004dc3; }
        .bg-cream { background-color: #f8fafc; }
        .bg-warm-gray { background-color: #e5e7eb; }
        .text-maroon { color: #004dc3; }
        .border-warm-gray { border-color: #e5e7eb; }
        .shadow-card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Properties;