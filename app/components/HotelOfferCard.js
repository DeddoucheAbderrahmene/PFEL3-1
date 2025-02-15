import Link from "next/link";

const HotelOfferCard = ({ hotel }) => {
  // Utilise hotel.id ou, si non défini, hotel.hotel_id
  const id = hotel.id || hotel.hotel_id;

  const rating = hotel.star_rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  const renderStars = () => (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={i} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">½</span>}
    </div>
  );

  const getLowestPrice = () => {
    if (!hotel.offers?.length) return "Sur demande";
    const prices = hotel.offers.map((offer) => offer.price);
    return `${Math.min(...prices)} DZD / nuit`;
  };

  return (
    <div className="group relative w-[22rem] mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-amber-100 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-amber-300/50">
        {/* Effets de fond */}
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
        <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />

        <div className="relative p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex h-74 w-74 items-center justify-center rounded-2xl bg-white p-2">
              <img
                src={hotel.images || "/default-hotel.jpg"}
                alt={hotel.name}
                className="h-60 w-65 rounded-xl object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-hotel.jpg";
                }}
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800">{hotel.name}</h3>
              <p className="text-sm text-slate-400">{hotel.location}</p>
              <p className="mt-4 text-sm text-slate-400 text-center">
  {hotel.description.length > 60
    ? hotel.description.substring(0, 30) + "..."
    : hotel.description}
</p>


            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
              {getLowestPrice()}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-500">
              {renderStars()} ({hotel.star_rating})
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {id ? (
              <Link href={`/Hotelaff?hotelId=${id}`}>
               <button 
  className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white font-semibold transition-all hover:shadow-lg w-full">
  Réserver maintenant
</button>
              </Link>
            ) : (
              <span className="text-red-500">ID hôtel non disponible</span>
            )}
            <button
  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500 px-4 py-3 text-amber-500 transition-colors hover:bg-amber-500/10">
  Partager
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOfferCard;
