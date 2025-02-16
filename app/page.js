"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Importation du hook useRouter
import { supabase } from "@/lib/supabase"; // Assurez-vous que le chemin est correct
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import HotelOfferCard from "@/components/HotelOfferCard";

// Fonction pour obtenir la date actuelle au format YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
};

// Liste des wilayas d'Algérie
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi",
  "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"
];

export default function Page() {
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isError, setIsError] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(getCurrentDate());
  const [isDateError, setIsDateError] = useState(false);

  // Récupérer les hôtels avec leur offre la plus basse et le rating
  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select(`
          hotel_id, name, location, images, star_rating,
          hotel_offers(price)
        `)
        .order("price", { foreignTable: "hotel_offers", ascending: true })
        .limit(1, { foreignTable: "hotel_offers" });

      if (error) {
        setError(error.message);
      } else {
        const hotelsWithData = data.map((hotel) => ({
          ...hotel,
          images: hotel.images && hotel.images.startsWith("http")
            ? hotel.images
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hotels-images/${hotel.images}`,
          price:
            hotel.hotel_offers && hotel.hotel_offers.length > 0
              ? ` ${hotel.hotel_offers[0].price}`
              : "Sur demande",
        }));
        setHotels(hotelsWithData);
      }
      setLoading(false);
    };

    fetchHotels();
  }, []);

  // Gestion de la saisie de la destination
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setIsError(false);
    if (value.length > 0) {
      const filteredSuggestions = wilayas.filter((wilaya) =>
        wilaya.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Sélectionner une suggestion
  const handleSuggestionClick = (wilaya) => {
    setDestination(wilaya);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsError(false);
  };

  // Gestion du changement de date
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setArrivalDate(selectedDate);
    setIsDateError(new Date(selectedDate) < new Date(getCurrentDate()));
  };

  // Soumission du formulaire avec redirection vers la page rechercheH
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wilayas.includes(destination)) {
      setIsError(true);
      return;
    }
    if (isDateError) return;
    // Redirection vers la page rechercheH avec les paramètres
    router.push(
      `/rechercheH?destination=${encodeURIComponent(
        destination
      )}&arrivalDate=${encodeURIComponent(arrivalDate)}`
    );
  };

  if (loading)
    return <div className="text-center py-8">Chargement...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Erreur: {error}</div>;

  return (
    <div>
      <Header />
      <main className="bg-gray-50">
        <div className="relative">
          <Carousel />
          <div className="absolute left-1/2 transform -translate-x-1/2 top-[70%] sm:top-auto sm:bottom-[-40px] z-20 w-[90%] max-w-3xl">
            <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                {/* Sélection de la destination */}
                <div className="w-full relative">
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
                    value={destination}
                    onChange={handleInputChange}
                    className={`w-full p-3 mt-1 rounded-lg border ${
                      isError ? "border-red-500" : "border-white/50"
                    } bg-white/20 placeholder-gray-700 text-gray-700 focus:outline-none focus:ring-2 ${
                      isError ? "focus:ring-red-500" : "focus:ring-white/70"
                    }`}
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto">
                      {suggestions.map((wilaya, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(wilaya)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {wilaya}
                        </li>
                      ))}
                    </ul>
                  )}
                  {isError && (
                    <p className="text-red-500 text-sm mt-1">
                      Veuillez choisir une wilaya valide.
                    </p>
                  )}
                </div>
                {/* Sélection de la date */}
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
                    value={arrivalDate}
                    onChange={handleDateChange}
                    min={getCurrentDate()}
                    className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                    required
                  />
                  {isDateError && (
                    <p className="text-red-500 text-sm mt-1">
                      Veuillez choisir une date valide (pas dans le passé).
                    </p>
                  )}
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
        {/* Section des hôtels */}
        <section className="px-6 py-16 mt-20">
          <div className="max-w-screen-xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              Découvrez nos offres de réservation d'hôtels en Algérie.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <HotelOfferCard key={hotel.hotel_id} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
