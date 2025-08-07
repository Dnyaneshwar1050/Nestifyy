import React from 'react';

const StatsCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`p-6 rounded-xl shadow-card-shadow ${bgColor} flex items-center gap-4 transform hover:scale-105 transition-transform duration-200`}>
      <div className="p-3 bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>

      <style>{`
        .shadow-card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
      `}</style>
    </div>
  );
};

export default StatsCard;