"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('restaurant_id', id)
          .single();

        if (error) throw error;
        setRestaurant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        Erreur : {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="relative h-96 rounded-xl overflow-hidden">
            <img
              src={restaurant.images }
              alt={restaurant.name}
              className="w-full h-full object-cover"
              
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-black">{restaurant.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {restaurant.cuisine_type}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < Math.floor(restaurant.star_rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600">
                  ({restaurant.star_rating?.toFixed(1)})
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-8">{restaurant.description}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg h-fit sticky top-8 text-black">
            <h2 className="text-2xl font-bold mb-4">Coordonnées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">📍 Adresse</h3>
                <p className="text-gray-600">{restaurant.location}</p>
              </div>

              <div>
                <h3 className="font-semibold">📞 Téléphone</h3>
                <p className="text-gray-600">
                  {restaurant.phone_number || 'Non disponible'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">🕒 Horaires d'ouverture</h3>
                <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                  {restaurant.opening_hours || "Horaires non disponibles"}
                </pre>
              </div>
            </div>

            {/* Bouton pour afficher le menu en popup */}
            {restaurant.menu && (
              <button
                onClick={() => setShowMenu(true)}
                className="mt-6 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Voir le menu
              </button>
            )}
          </div>
        </div>
        
      </main>

      {/* Popup pour afficher la photo du menu */}
      {showMenu && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Menu</h2>
            <img
              src={restaurant.menu}
              alt="Menu du restaurant"
              className="w-full h-auto object-contain mb-4"
              onError={(e) => {
                e.target.onerror = null;
          
              }}
            />
            <button
              onClick={() => setShowMenu(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
