"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            restaurant_id,
            name,
            location,
            cuisine_type,
            star_rating,
            images,
            description,
            phone_number,
            opening_hours
          `)
          .order('star_rating', { ascending: false });

        if (error) throw error;
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      Erreur de chargement : {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="relative h-96 bg-gray-900 text-white">
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <h1 className="text-4xl md:text-6xl font-bold text-center px-4">
            Découvrez les Meilleurs Restaurants
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.restaurant_id} 
              restaurant={restaurant} 
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

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
          src={restaurant.images || '/default-restaurant.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-restaurant.jpg';
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
            Voir les détails
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantsPage;