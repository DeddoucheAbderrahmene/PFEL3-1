"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

const AdminRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Vérification directe dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (!userData || userError || userData.role !== 'site_admin') {
        window.location.href = '/';
      }
    };

    const fetchPendingRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('status', 'pending');

        if (error) throw error;
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
    fetchPendingRestaurants();
  }, []);


 // Dans votre page admin/restaurants/page.jsx
const handleApproval = async (id, status) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          status: status,
    
        })
        .eq('restaurant_id', id); // Vérifiez que c'est bien le nom de colonne dans votre table
  
      if (error) {
        throw new Error(`Erreur de mise à jour : ${error.message}`);
      }
      
      // Rafraîchissement optimiste
      setRestaurants(prev => prev.filter(r => r.restaurant_id !== id));
      
    } catch (err) {
      setError(err.message);
      console.error('Erreur complète:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="text-center py-8">Vérification des permissions...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-black">
        <h1 className="text-2xl font-bold mb-6">Restaurants en attente de validation ({restaurants.length})</h1>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 text-black">
          {restaurants.map(restaurant => (
            <div key={restaurant.restaurant_id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Images */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Image principale</h3>
                    <img 
                      src={restaurant.images} 
                      alt={restaurant.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Menu</h3>
                    <img 
                      src={restaurant.menu} 
                      alt={`Menu ${restaurant.name}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Détails */}
                <div className="space-y-2 text-black">
                  <h2 className="text-xl font-bold">{restaurant.name}</h2>
                  <p className="text-gray-600">{restaurant.location}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {restaurant.cuisine_type}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${i < Math.floor(restaurant.star_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-black">{restaurant.description}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold text-black">Horaires d'ouverture :</h4>
                    <pre className="whitespace-pre-wrap font-sans">
                      {restaurant.opening_hours}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 ">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApproval(restaurant.restaurant_id,'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approuver le restaurant
                    </button>
                    <button
                      onClick={() => handleApproval(restaurant.restaurant_id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Rejeter la soumission
                    </button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-black">
                    <h4 className="font-semibold mb-2">Informations de contact :</h4>
                    <p>Téléphone : {restaurant.phone_number}</p>
                    <p>Propriétaire : {restaurant.owner_id}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Soumis le : {new Date(restaurant.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {restaurants.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Aucun restaurant en attente de validation
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminRestaurantsPage;