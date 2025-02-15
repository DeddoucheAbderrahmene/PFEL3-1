"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import Link from "next/link";
import Footer from "../components/Footer";

// Vérification des variables d'environnement
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Les clés Supabase sont manquantes dans .env.local");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Hotelaff() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotelId");

  const [hotel, setHotel] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // États pour le formulaire de recherche
  const [adultes, setAdultes] = useState("1");
  const [enfants, setEnfants] = useState("0");
  const [arriveeDate, setArriveeDate] = useState("");

  // Calculer la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!hotelId || hotelId === "undefined") {
      setError("Aucun hôtel sélectionné");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Récupérer les détails de l'hôtel
        const { data: hotelData, error: hotelError } = await supabase
          .from("hotels")
          .select("*")
          .eq("hotel_id", hotelId)
          .single();

        if (hotelError) throw hotelError;

        // Récupérer les offres associées à cet hôtel
        const { data: offersData, error: offersError } = await supabase
          .from("hotel_offers")
          .select("*")
          .eq("hotel_id", hotelId);

        if (offersError) throw offersError;

        setHotel(hotelData);
        setOffers(offersData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [hotelId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation : l'utilisateur doit saisir la date d'arrivée
    if (!arriveeDate) {
      alert("Veuillez saisir la date d'arrivée.");
      return;
    }
    // Ici, vous pouvez ajouter la logique de recherche ou de réservation
    alert(
      `Recherche effectuée pour ${adultes} adulte(s) et ${enfants} enfant(s) le ${arriveeDate}.`
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-black">
        Chargement des données...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">{error}</div>
    );
  }

  return (
    <div className="w-full bg-white text-black">
      <Header />

      <div className="w-full">
        {/* Section Détails de l'hôtel */}
        {hotel && (
          <div className="w-full p-6 bg-gray-50 shadow-md">
            <h1 className="text-4xl font-bold text-black mb-4 text-center">
              {hotel.name}
            </h1>
            <img
              src={hotel.images || "/default-hotel.jpg"}
              alt={hotel.name}
              className="w-full h-auto rounded-lg mb-4 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-hotel.jpg";
              }}
            />
            <p className="text-lg text-gray-700 mb-4">
              {hotel.description}
            </p>
            {hotel.history && (
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Histoire</h2>
                <p className="text-gray-700">{hotel.history}</p>
              </div>
            )}
            {hotel.location && (
              <p className="text-gray-600 mb-4">
                Localisation : {hotel.location}
              </p>
            )}
          </div>
        )}

        {/* Formulaire de recherche */}
        <div className="p-6">
          <div className="mb-8">
            <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <form
                className="flex flex-col sm:flex-row items-center gap-4"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full">
                    <label htmlFor="adultes" className="text-black font-medium">
                      Adultes
                    </label>
                    <select
                      id="adultes"
                      value={adultes}
                      onChange={(e) => setAdultes(e.target.value)}
                      className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <label htmlFor="enfants" className="text-black font-medium">
                      Enfants
                    </label>
                    <select
                      id="enfants"
                      value={enfants}
                      onChange={(e) => setEnfants(e.target.value)}
                      className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="arrivee-date" className="text-black font-medium">
                    Date d'arrivée
                  </label>
                  <input
                    id="arrivee-date"
                    type="date"
                    value={arriveeDate}
                    onChange={(e) => setArriveeDate(e.target.value)}
                    min={today}
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

          {/* Section Offres disponibles */}
          <h2 className="text-3xl font-bold mb-6">Offres disponibles</h2>
          {offers.length === 0 ? (
            <p className="text-xl text-gray-700">
              Aucune offre disponible pour cet hôtel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, index) => (
                <div
                  key={offer.id || index}
                  className="p-6 bg-gray-100 border rounded-lg shadow hover:shadow-xl transition duration-300"
                >
                  <h3 className="text-2xl font-semibold mb-3">
                    {offer.name}
                  </h3>
                  <p className="text-gray-700 mb-3">
                    {offer.description}
                  </p>
                  <p className="text-green-600 font-bold text-xl mb-4">
                    {offer.price} DZD / nuit
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition duration-300">
                    Réserver cette offre
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link href="/hotels">
              <span className="text-blue-600 underline cursor-pointer text-xl">
                Retour aux hôtels
              </span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
