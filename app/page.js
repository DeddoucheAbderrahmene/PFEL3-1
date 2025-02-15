
"use client";

import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import HotelOfferCard from "./components/HotelOfferCard";

// Fonction pour obtenir la date actuelle au format YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Liste des 58 wilayas d'Algérie
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

const hotels = [
  {
    id: 1,
    name: "Hôtel El Aurassi",
    location: "Alger, Algérie",
    price: "20,000 ",
    rating: 4.5,
    image: "https://www.leguidetouristique.com/wp-content/uploads/2022/02/parc-ahaggar-1024x684.jpg",
    description: "Un hôtel 5 étoiles offrant une vue imprenable sur la baie d'Alger."
  },
  {
    id: 2,
    name: "Hôtel Sheraton Club des Pins",
    location: "Alger, Algérie",
    price: "25,000 ",
    rating: 4.7,
    image: "/images/sheraton.jpg",
    description: "Un resort luxueux en bord de mer avec des équipements modernes."
  },
  {
    id: 3,
    name: "Hôtel Constantine Marriott",
    location: "Constantine, Algérie",
    price: "18,000 ",
    rating: 4.6,
    image: "/images/marriott.jpg",
    description: "Un hébergement de prestige avec une architecture élégante."
  }
];

export default function Page() {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isError, setIsError] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(getCurrentDate());
  const [isDateError, setIsDateError] = useState(false);

  // Gérer la saisie de l'utilisateur
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setIsError(false); // Réinitialiser l'erreur lors de la saisie

    // Filtrer les suggestions
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
    setIsError(false); // Réinitialiser l'erreur lors de la sélection
  };

  // Gérer le changement de date
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setArrivalDate(selectedDate);

    if (new Date(selectedDate) < new Date(getCurrentDate())) {
      setIsDateError(true);
    } else {
      setIsDateError(false);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier si la destination est valide
    if (!wilayas.includes(destination)) {
      setIsError(true);
      return;
    }

    // Vérifier la validité de la date
    if (isDateError) {
      return;
    }

    // Logique de soumission du formulaire
    console.log("Destination sélectionnée :", destination);
    console.log("Date d'arrivée :", arrivalDate);
  };

  return (
    <div>
      <Header />
      <main className="bg-gray-50">
        <div className="relative">
          <Carousel />
          <div className="absolute left-1/2 transform -translate-x-1/2 top-[70%] sm:top-auto sm:bottom-[-40px] z-20 w-[90%] max-w-3xl">
            <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full relative">
                  <label htmlFor="destination" className="text-blue-200 font-medium">
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
                <div className="w-full relative">
                  <label htmlFor="arrivee-date" className="text-blue-200 font-medium">
                    Date d'arrivée
                  </label>
                  <input
                    id="arrivee-date"
                    type="date"
                    value={arrivalDate}
                    onChange={handleDateChange}
                    onClick={(e) => e.target.showPicker()}
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
        <section className="px-6 py-16 mt-20">
          <div className="max-w-screen-xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-8">
              Découvrez nos offres de réservation d'hôtels en Algérie.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <HotelOfferCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
