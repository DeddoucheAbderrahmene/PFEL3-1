"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Import du client configuré
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelOfferCard from "@/components/HotelOfferCard";

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fullPhrase = "TROUVER VOTRE HÔTEL";

  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase.from("hotels").select("*");
      if (error) setError(error.message);
      else setHotels(data);
      setLoading(false);
    };
    fetchHotels();
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
    return <div className="text-center py-8">Chargement des hôtels...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-500">Erreur: {error}</div>
    );

  return (
    <div>
      <Header />

      <main className="bg-gray-50">
        <div className="relative w-full h-[500px] overflow-hidden">
          <img
            src="https://www.fabrispartners.it/public/explorer/Progetti/immagini%20galleria/sheraton_orano/03.jpg"
            alt="Hôtel"
            className="absolute z-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-4">
            <div className="flex justify-center whitespace-nowrap">
              {fullPhrase.split("").map((char, i) => (
                <span
                  key={i}
                  className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{
                    animation: `fadeInOut 2s ${i * 0.1}s infinite`,
                    textShadow: `0 0 10px ${getColor(
                      i / (fullPhrase.length - 1)
                    )},
                                 0 0 20px ${getColor(i / (fullPhrase.length - 1))},
                                 0 0 30px ${getColor(i / (fullPhrase.length - 1))}`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 top-[70%] sm:top-auto sm:bottom-[-40px] z-20 w-[90%] max-w-3xl">
            <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <form className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full">
                  <label
                    htmlFor="destination"
                    className="text-blue-200 font-medium"
                  >
                    Où allez-vous ?
                  </label>
                  <input
                    id="destination"
                    type="text"
                    placeholder="Entrez une destination"
                    className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 placeholder-gray-700 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="arrivee-date"
                    className="text-blue-200 font-medium"
                  >
                    Date d'arrivée
                  </label>
                  <input
                    id="arrivee-date"
                    type="date"
                    className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </div>

        <section className="px-6 py-16 mt-20">
          <div className="max-w-screen-xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              Découvrez nos offres de réservation d'hôtels en Algérie.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {hotels.map((hotel, index) => (
                <HotelOfferCard key={hotel.id || index} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

     
    </div>
  );
}
