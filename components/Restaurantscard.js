"use client";

import Link from 'next/link';

const RestaurantCard = ({ restaurant }) => {
  const renderRatingStars = () => {
    const rating = restaurant.star_rating || 0;
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < Math.floor(rating)
            ? 'text-yellow-400'
            : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative h-48">
        <img
          src={restaurant.images}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null
          }}
        />
        <div className="absolute bottom-2 right-2 bg-black/90 px-3 py-1 rounded-full text-sm font-semibold text-white">
          ⭐ {restaurant.star_rating?.toFixed(1) || 'N/A'}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
        <div className="flex items-center mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2">
            {restaurant.cuisine_type || 'Cuisine non spécifiée'}
          </span>
          <span className="text-gray-600 text-sm">📍 {restaurant.location}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {restaurant.description || 'Aucune description disponible'}
        </p>
        <Link href={`/restaurantsaff/${restaurant.restaurant_id}`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Voir les détail
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;