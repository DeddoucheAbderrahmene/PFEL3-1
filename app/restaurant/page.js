"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/Restaurantscard";

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fullPhrase = "TROUVER VOTRE RESTAURANT";

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
       // Dans votre page restaurants/page.jsx
const { data, error } = await supabase
.from('restaurants')
.select('*')
.eq('status', 'approved') // Seulement les approuvés
.order('created_at', { ascending: false });

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

  const getColor = (percentage) => {
    const colors = [
      { r: 0, g: 217, b: 255 },
      { r: 148, g: 0, b: 211 },
      { r: 255, g: 0, b: 106 },
      { r: 255, g: 69, b: 0 },
    ];
    const index = Math.floor(percentage * (colors.length - 1));
    const { r, g, b } = colors[index];
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        Erreur de chargement : {error}
      </div>
    );

  // Filtrer les restaurants par nom ou location
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(lowerSearch) ||
      restaurant.location.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Section Hero */}
      <div className="relative w-full h-[500px] overflow-hidden">
        {/* Image de fond principale */}
        <img
          src="https://www.oran-memoire.fr/wp-content/uploads/AFcvGhidNp8hHGoHN0O9A.jpg"
          alt="Fond Restaurant"
          className="absolute z-0 w-full h-full object-cover"
        />

        {/* Overlay avec image additionnelle et texte */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          {/* Image supplémentaire en arrière-plan */}
          <img
            src="https://source.unsplash.com/random/800x600?food"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          {/* Overlay sombre */}
          <div className="absolute inset-0 bg-black/30"></div>
          {/* Texte animé */}
          <div className="relative flex justify-center whitespace-nowrap">
            {fullPhrase.split("").map((char, i) => (
              <span
                key={i}
                className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                style={{
                  animation: `fadeInOut 2s ${i * 0.1}s infinite`,
                  textShadow: `0 0 10px ${getColor(i / (fullPhrase.length - 1))},
                               0 0 20px ${getColor(i / (fullPhrase.length - 1))},
                               0 0 30px ${getColor(i / (fullPhrase.length - 1))}`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de recherche personnalisée */}
      <div className="flex justify-center my-8">
        <div className="relative w-[480px] bg-gray-100 rounded-2xl shadow-md p-1.5 transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg">
          {/* Icône de recherche */}
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          {/* Input de recherche */}
          <input
            type="text"
            className="w-full pl-8 pr-24 py-3 text-base text-gray-700 bg-transparent rounded-lg focus:outline-none"
            placeholder="Recherche par nom ou location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Bouton de recherche avec hauteur ajustée */}
         
        </div>
      </div>

      {/* Affichage des restaurants filtrés */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700">Aucun restaurant trouvé.</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;
