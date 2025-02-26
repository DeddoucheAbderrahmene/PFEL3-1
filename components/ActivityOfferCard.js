"use client";

import Image from 'next/image';

const ActivityOfferCard = ({ activity }) => {
  const calculateDiscount = () => {
    if (!activity.discount_percentage) return null;
    return (
      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
        -{activity.discount_percentage}%
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <Image
          src={activity.images}
          alt={activity.name}
          fill
          className="object-cover"
          onError={(e) => {
            
            e.target.onerror = null;
          }}
        />
        {calculateDiscount()}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-black">{activity.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
            {activity.difficulty_level}
          </span>
          <span className="text-gray-600">📍 {activity.location}</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            {activity.discount_percentage > 0 && (
              <span className="text-gray-400 line-through mr-2">
                {activity.price} DZD
              </span>
            )}
            <span className="text-xl font-bold text-green-600">
              {activity.new_price || activity.price} DZD
            </span>
          </div>
          <span className="text-sm text-gray-500">{activity.duration}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3">
          {activity.description}
        </p>

        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>
            📅 {new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityOfferCard;