import React, { useContext } from 'react';
import { MapPin, User, MessageCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const RoommateListingCard = ({ roommate }) => {
  const { trackInteraction } = useContext(AppContext);

  return (
    <div
      className="bg-white rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-transform duration-300 cursor-pointer border border-gray-100 flex flex-col group hover:scale-105 hover:border-green-200"
      onClick={() => trackInteraction('click', `roommate_card_${roommate.id}`)}
    >
      <img
        src={roommate.imageUrl}
        alt={roommate.name}
        className="w-full h-52 object-cover transition-all duration-300 group-hover:brightness-90"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/400x260/D1FAE5/065F46?text=Roommate+Image';
        }}
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{roommate.name}</h3>
        <p className="text-gray-600 flex items-center mb-3 text-sm">
          <MapPin size={16} className="mr-1 text-green-500" /> {roommate.location}
        </p>
        <p className="text-base text-gray-700 mb-2 flex items-center">
          <User size={16} className="mr-2 text-gray-500" /> Gender: <span className="font-semibold ml-1">{roommate.gender || 'Not specified'}</span>
        </p>
        <p className="text-base text-gray-700 mb-2 flex items-center">
        Budget: <span className="font-semibold ml-1">₹{roommate.budget}</span>
        </p>
        <button
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl border-none cursor-pointer transition-all duration-300 text-lg font-semibold shadow-md flex items-center justify-center gap-2 hover:bg-green-700 hover:shadow-xl hover:scale-[1.01] active:scale-98"
          onClick={(e) => {
            e.stopPropagation();
            trackInteraction('click', `connect_button_${roommate.id}`);
          }}
        >
          <MessageCircle size={20} />
          <span>Connect</span>
        </button>
      </div>
    </div>
  );
};

export default RoommateListingCard;