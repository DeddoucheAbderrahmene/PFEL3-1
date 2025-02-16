"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import du client Supabase configuré
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";
import HotelOfferCard from "@/components/HotelOfferCard";
import HotelServiceCard from "@/components/HotelServiceCard";

function HotelaffContent() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotelId");

  const [hotel, setHotel] = useState(null);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hotelId || hotelId === "undefined") {
      setError("Aucun hôtel sélectionné");
      setLoading(false);
      return;
    }

    async function fetchData() {
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

        // Récupérer les services associés à cet hôtel
        const { data: servicesData, error: servicesError } = await supabase
          .from("hotel_services")
          .select("*")
          .eq("hotel_id", hotelId);

        if (servicesError) throw servicesError;

        setHotel(hotelData);
        setOffers(offersData);
        setServices(servicesData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    fetchData();
  }, [hotelId]);

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

        {/* Section Offres disponibles */}
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6">Offres disponibles</h2>
          {offers.length === 0 ? (
            <p className="text-xl text-gray-700">
              Aucune offre disponible pour cet hôtel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, index) => (
                <HotelOfferCard key={offer.id || index} hotel={offer} />
              ))}
            </div>
          )}
        </div>

        {/* Section Services disponibles */}
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6">Services disponibles</h2>
          {services.length === 0 ? (
            <p className="text-xl text-gray-700">
              Aucun service disponible pour cet hôtel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <HotelServiceCard key={service.hotel_service_id || index} service={service} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <Link href="/hotels">
            <span className="text-blue-600 underline cursor-pointer text-xl">
              Retour aux hôtels
            </span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Hotelaff() {
  return (
    <Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
      <HotelaffContent />
    </Suspense>
  );
}
