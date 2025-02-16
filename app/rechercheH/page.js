"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelOfferCard from "@/components/HotelOfferCard";
import HotelServiceCard from "@/components/HotelServiceCard";

function RechercheHContent() {
  // Récupération des paramètres dans l'URL
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination") || "";
  const arrivalDate = searchParams.get("arrivalDate") || "";

  // États pour les hôtels
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);

  // États pour les services
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorServices, setErrorServices] = useState(null);

  // États pour les filtres avancés sur les hôtels
  const [sortFilter, setSortFilter] = useState("none"); // "priceAsc", "priceDesc", "ratingAsc", "ratingDesc"
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [starRatings, setStarRatings] = useState([]); // Tableau des étoiles sélectionnées

  // Récupération des hôtels dont la localisation correspond à la destination
  useEffect(() => {
    async function fetchOffers() {
      setLoadingOffers(true);
      const { data, error } = await supabase
        .from("hotels")
        .select(`
          hotel_id,
          name,
          location,
          images,
          star_rating,
          description,
          hotel_offers (
            hotel_offer_id, price, name, description
          )
        `)
        .ilike("location", `%${destination}%`);
      if (error) {
        setErrorOffers(error.message);
      } else {
        setOffers(data);
      }
      setLoadingOffers(false);
    }
    if (destination) {
      fetchOffers();
    }
  }, [destination]);

  // Récupération des services associés aux hôtels (via la jointure sur la table hotels)
  useEffect(() => {
    async function fetchServices() {
      setLoadingServices(true);
      const { data, error } = await supabase
        .from("hotel_services")
        .select(`
          hotel_service_id,
          name,
          description,
          price,
          service_type,
          hotels ( location )
        `)
        .ilike("hotels.location", `%${destination}%`);
      if (error) {
        setErrorServices(error.message);
      } else {
        setServices(data);
      }
      setLoadingServices(false);
    }
    if (destination) {
      fetchServices();
    }
  }, [destination]);

  // Fonction utilitaire pour obtenir le prix minimum d'un hôtel (basé sur ses offres)
  const getMinPrice = (hotel) => {
    if (!hotel.hotel_offers || hotel.hotel_offers.length === 0) return Infinity;
    return Math.min(...hotel.hotel_offers.map((offer) => offer.price));
  };

  // Application des filtres sur les hôtels
  const filteredOffers = useMemo(() => {
    let filtered = [...offers];

    // Filtrage par plage de prix (basé sur le prix minimum de l'offre)
    if (priceMin !== "" || priceMax !== "") {
      filtered = filtered.filter((hotel) => {
        const minPrice = getMinPrice(hotel);
        if (priceMin !== "" && minPrice < Number(priceMin)) return false;
        if (priceMax !== "" && minPrice > Number(priceMax)) return false;
        return true;
      });
    }

    // Filtrage par note (si des étoiles sont sélectionnées)
    if (starRatings.length > 0) {
      filtered = filtered.filter((hotel) => starRatings.includes(hotel.star_rating));
    }

    // Tri des résultats
    if (sortFilter === "priceAsc") {
      filtered.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sortFilter === "priceDesc") {
      filtered.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    } else if (sortFilter === "ratingAsc") {
      filtered.sort((a, b) => a.star_rating - b.star_rating);
    } else if (sortFilter === "ratingDesc") {
      filtered.sort((a, b) => b.star_rating - a.star_rating);
    }
    return filtered;
  }, [offers, priceMin, priceMax, starRatings, sortFilter]);

  return (
    <div>
      <Header />
      <main className="container mx-auto py-8 px-4">
        {/* En-tête de la recherche */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Résultats pour <span className="text-blue-600">{destination}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Date d'arrivée : <span className="text-blue-600">{arrivalDate}</span>
          </p>
        </div>

        {/* Barre de filtres avancés pour les hôtels */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Tous", value: "none" },
              { label: "Prix croissant", value: "priceAsc" },
              { label: "Prix décroissant", value: "priceDesc" },
              { label: "Meilleures notes", value: "ratingDesc" },
              { label: "Moins bien notés", value: "ratingAsc" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSortFilter(filter.value)}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  sortFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-blue-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Filtres supplémentaires : plage de prix et sélection d'étoiles */}
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex-1 p-4 bg-white rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Plage de prix</h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 p-4 bg-white rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      starRatings.includes(rating)
                        ? setStarRatings(starRatings.filter((r) => r !== rating))
                        : setStarRatings([...starRatings, rating])
                    }
                    className={`px-3 py-2 rounded-full border transition-colors duration-200 ${
                      starRatings.includes(rating)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {rating} ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section d'affichage des hôtels et offres */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Hôtels et Offres</h2>
          {filteredOffers.length === 0 ? (
            <p className="text-center text-gray-600">
              Aucun hôtel ne correspond à ces critères.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOffers.map((hotel) => (
                <HotelOfferCard key={hotel.hotel_id} hotel={hotel} />
              ))}
            </div>
          )}
        </section>

        {/* Section d'affichage des services */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Services Disponibles
          </h2>
          {loadingServices ? (
            <div className="text-center py-8">Chargement des services...</div>
          ) : errorServices ? (
            <div className="text-center py-8 text-red-500">
              Erreur : {errorServices}
            </div>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-600">
              Aucun service trouvé pour cette destination.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <HotelServiceCard key={service.hotel_service_id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function RechercheHPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
      <RechercheHContent />
    </Suspense>
  );
}
