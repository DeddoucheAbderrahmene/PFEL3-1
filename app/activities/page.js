"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelOfferCard from "@/components/HotelOfferCard";

const colors = [
  { r: 0, g: 217, b: 255 },   // Bleu
  { r: 148, g: 0, b: 211 },   // Violet
  { r: 255, g: 0, b: 106 },   // Rose
  { r: 255, g: 69, b: 0 },    // Orange
];

const hotels = [
  {
    id: 1,
    name: "Excursion une Journee a Oran avec un Expert Local",

    price: "2,000 DZD",
    rating: 4.5,
    image: "https://tourismetvoyages.dz/wp-content/uploads/2022/07/Oran-22.jpg",
    description:"",
  },
  {
    id: 2,
    name: "Hôtel Sheraton Club des Pins",
    location: "Alger, Algérie",
    price: "25,000 DZD",
    rating: 4.7,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/f7/e6/74/hotel-exterior-entrance.jpg?w=700&h=-1&s=1",
    description: "",
  },
  {
    id: 3,
    name: "Hôtel Constantine Marriott",
    location: "Constantine, Algérie",
    price: "18,000 DZD",
    rating: 4.6,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/ec/db/e3/hotel-facade.jpg?w=700&h=-1&s=1",
    description: "",
  },
];

export default function HotelsPage() {
  const fullPhrase = "Trouvez des activités où que vous soyez";

  const getColor = (percentage) => {
    const segments = 1 / (colors.length - 1);
    const idx = Math.min(Math.floor(percentage / segments), colors.length - 2);
    const segmentPercent = (percentage - idx * segments) / segments;
    const start = colors[idx];
    const end = colors[idx + 1];
    const r = start.r + (end.r - start.r) * segmentPercent;
    const g = start.g + (end.g - start.g) * segmentPercent;
    const b = start.b + (end.b - start.b) * segmentPercent;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  return (
    <div>
      <Header />

      <main className="bg-gray-50">
        <div className="relative w-full h-[500px] overflow-hidden">
          <img
            src="https://mariamhamli.files.wordpress.com/2015/11/cc.png"
            alt="Hôtel"
            className="absolute z-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-4">
            <div className="flex justify-center whitespace-nowrap">
              {fullPhrase.split("").map((char, i) => (
                <span
                  key={`full-${i}`}
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

          {/* Formulaire positionné comme dans l'exemple */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-[70%] sm:top-auto sm:bottom-[-40px] z-20 w-[90%] max-w-3xl">
            <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <form className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full">
                  <label htmlFor="destination" className="text-blue-200 font-medium">
                    Où allez-vous ?
                  </label>
                  <input
                    id="destination"
                    type="text"
                    placeholder="Entrez une destination"
                    className="w-full p-3 mt-1 rounded-lg border border-white/50 bg-white/20 placeholder-gray-700 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>

                <div className="w-full relative">
                  <label htmlFor="arrivee-date" className="text-blue-200 font-medium">
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
              {hotels.map((hotel) => (
                <HotelOfferCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
      `}</style>
    </div>
  );
}