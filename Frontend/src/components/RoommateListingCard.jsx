import React, { useContext} from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, MessageCircle, ChevronRight, IndianRupee } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const RoommateListingCard = ({ roommate }) => {
  const { trackInteraction } = useContext(AppContext);

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 cursor-pointer border border-gray-200 flex flex-col group hover:shadow-md hover:border-gray-300"
      onClick={() => trackInteraction('click', `roommate_card_${roommate.id}`)}
    >
      {/* Profile Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={roommate.imageUrl}
          alt={roommate.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x400/F8FAFC/64748B?text=Profile';
          }}
        />
        {/* Online status indicator */}
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {roommate.name}
        </h3>
        
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2.5 text-indigo-600 flex-shrink-0" />
            <span className="text-sm truncate">{roommate.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <User size={16} className="mr-2.5 text-indigo-600 flex-shrink-0" />
            <span className="text-sm">{roommate.gender || 'Not specified'}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <IndianRupee size={16} className="mr-2.5 text-indigo-600 flex-shrink-0" />
            <span className="text-sm font-medium">{roommate.budget}</span>
          </div>
        </div>

        {/* Connect Button */}
        <Link
          to={`/roommate/${roommate.id}`}
          className="mt-auto w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg border-none cursor-pointer transition-all duration-200 font-medium text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 group/button"
          onClick={(e) => {
            e.stopPropagation();
            trackInteraction('click', `connect_button_${roommate.id}`);
          }}
        >
          <MessageCircle size={16} />
          Connect
          <ChevronRight size={16} className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
        </Link>
        {/* <button
          className="mt-auto w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg border-none cursor-pointer transition-all duration-200 font-medium text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 group/button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/roommate/${roommate.id}`);
            trackInteraction('click', `connect_button_${roommate.id}`);
          }}
        >
          <MessageCircle size={16} />
          Connect
          <ChevronRight size={16} className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
        </button> */}
      </div>
    </div>
  );
};

export default RoommateListingCard;