import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const HotelOfferCard = ({ hotel }) => {
  const router = useRouter();
  // Détecter si c'est une offre via la présence de hotel_offer_id
  const isOffer = !!hotel.hotel_offer_id;
  // Pour l'ID, utiliser hotel_offer_id si c'est une offre, sinon hotel_id
  const id = isOffer ? hotel.hotel_offer_id : hotel.hotel_id;

  // Fonction d'affichage du prix
  const getLowestPrice = () =>
    hotel.price ? `À partir de ${hotel.price} DZD / nuit` : "Sur demande";

  // Affichage du rating pour une carte d'hôtel (non offre)
  const displayRating = hotel.star_rating
    ? `${hotel.star_rating} ★`
    : "N/A ★";

  // Traitement de la description (découpage par ". ")
  const sentences = hotel.description ? hotel.description.split(". ") : [];
  const truncatedDescription =
    sentences.length > 0
      ? sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "")
      : "";

  // Fonction pour récupérer la liste des services inclus dans une offre
  const getAmenities = () => {
    const amenities = [];
    if (hotel.wifi_included) amenities.push("WiFi");
    if (hotel.breakfast_included) amenities.push("Petit-déjeuner");
    if (hotel.lunch_included) amenities.push("Déjeuner");
    if (hotel.dinner_included) amenities.push("Dîner");
    if (hotel.parking_included) amenities.push("Parking");
    if (hotel.pool_access) amenities.push("Piscine");
    if (hotel.gym_access) amenities.push("Gym");
    if (hotel.spa_access) amenities.push("Spa");
    return amenities;
  };

  // États pour le formulaire de réservation (pour les offres uniquement)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [duration, setDuration] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");

  // États pour la soumission du formulaire
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // État pour l'utilisateur
  const [user, setUser] = useState(null);

  // Récupérer l'utilisateur via Supabase Auth (pour pré-remplir nom/prénom)
  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFirstName(user.user_metadata.first_name || "");
        setLastName(user.user_metadata.last_name || "");
      }
    }
    if (isOffer) {
      fetchUser();
    }
  }, [isOffer]);

  // Gestion de la soumission du formulaire de réservation
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    // Vérifier que l'utilisateur est authentifié
    if (!user) {
      router.push("/auth");
      return;
    }

    // Optionnel : mise à jour du profil utilisateur si modifié
    const { error: updateError } = await supabase
      .from("users")
      .update({ first_name: firstName, last_name: lastName })
      .eq("user_id", user.id);
    if (updateError) {
      setSubmissionError("Erreur lors de la mise à jour de votre profil : " + updateError.message);
      setSubmissionLoading(false);
      return;
    }

    // Insérer la réservation dans la table reservations
    const { error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: user.id,
          reservation_type: isOffer ? "hotel_offer" : "hotel_service",
          reservation_type_id: id,
          number_of_people: Number(numberOfPeople),
          duration: Number(duration),
          special_request: specialRequest,
        },
      ]);
    if (error) {
      setSubmissionError("Erreur lors de la réservation : " + error.message);
    } else {
      setSubmissionSuccess("Votre réservation a bien été enregistrée. Nous allons vous contacter très bientôt.");
      // Fermer le popup en retirant le hash de l'URL
      window.location.hash = "";
    }
    setSubmissionLoading(false);
  };

  return (
    <div className="group relative w-[22rem] mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-amber-100 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-amber-300/50">
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>
        <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>

        <div className="relative p-6">
          {/* Affichage de l'image ou du SVG selon le type */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex h-74 w-74 items-center justify-center rounded-2xl bg-white p-2">
              {isOffer ? (
                <svg
                  className="w-[45px] h-[45px] text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M18 17v2M12 5.5V10m-6 7v2m15-2v-4c0-1.6569-1.3431-3-3-3H6c-1.65685 0-3 1.3431-3 3v4h18Zm-2-7V8c0-1.65685-1.3431-3-3-3H8C6.34315 5 5 6.34315 5 8v2h14Z"
                  />
                </svg>
              ) : (
                <img
                  src={hotel.images || "/default-hotel.jpg"}
                  alt={hotel.name}
                  className="h-60 w-65 rounded-xl object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-hotel.jpg";
                  }}
                />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800">{hotel.name}</h3>
              <p className="text-sm text-slate-400">{hotel.location}</p>
              <p className="mt-4 text-sm text-slate-400">
                {truncatedDescription}
                {sentences.length > 1 && (
                  <a
                    href={`#popup-description-${id}`}
                    className="text-blue-500 underline ml-1"
                  >
                    Voir plus
                  </a>
                )}
              </p>
            </div>
          </div>

          {/* Prix et services / rating */}
          <div className="mt-6 flex justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
              {getLowestPrice()}
            </span>
            {isOffer ? (
              <div className="flex flex-wrap gap-1">
                {getAmenities().map((amenity, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-500">
                {displayRating}
              </span>
            )}
          </div>

          {/* Boutons */}
          <div className="mt-8 flex flex-col gap-3">
            {id ? (
              isOffer ? (
                <a
                  href={`#popup-reservation-${id}`}
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      router.push("/auth");
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white font-semibold transition-all hover:shadow-lg w-full"
                >
                  Réserver maintenant
                </a>
              ) : (
                <Link href={`/Hotelaff?hotelId=${id}`}>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white font-semibold transition-all hover:shadow-lg w-full">
                    Voir l'hôtel
                  </button>
                </Link>
              )
            ) : (
              <span className="text-red-500">ID non disponible</span>
            )}
            <button className="flex items-center justify-center gap-2 rounded-xl border border-amber-500 px-4 py-3 text-amber-500 transition-colors hover:bg-amber-500/10">
              <svg
                className="w-6 h-6 text-gray-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12l4 4m-4-4L8 8"
                />
              </svg>
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Popup pour afficher la description complète */}
      {sentences.length > 2 && (
        <div id={`popup-description-${id}`} className="popup">
          <div className="popup-content">
            <a href="#" className="close">&times;</a>
            <h3 className="text-lg font-semibold text-blue-800">{hotel.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{hotel.description}</p>
          </div>
          <style jsx>{`
            .popup {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              display: none;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .popup:target {
              display: flex;
            }
            .popup-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
              position: relative;
            }
            .close {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              text-decoration: none;
              color: #333;
            }
          `}</style>
        </div>
      )}

      {/* Popup pour le formulaire de réservation (pour les offres) */}
      {isOffer && (
        <div id={`popup-reservation-${id}`} className="popup">
          <div className="popup-content">
            <a href="#" className="close">&times;</a>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Formulaire de réservation
            </h3>
            <form onSubmit={handleReservationSubmit} className="flex flex-col gap-4">
              {/* Champs cachés */}
              <input type="hidden" name="reservation_type" value="hotel_offer" />
              <input type="hidden" name="reservation_type_id" value={id} />
              {/* Champs pour nom et prénom */}
              <div className="flex flex-col">
                <label htmlFor={`first_name_${id}`} className="text-sm font-medium">
                  Nom
                </label>
                <input
                  id={`first_name_${id}`}
                  name="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="p-2 border rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor={`last_name_${id}`} className="text-sm font-medium">
                  Prénom
                </label>
                <input
                  id={`last_name_${id}`}
                  name="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="p-2 border rounded-md"
                />
              </div>
              {/* Nombre de personnes */}
              <div className="flex flex-col">
                <label htmlFor={`number_of_people_${id}`} className="text-sm font-medium">
                  Nombre de personnes
                </label>
                <input
                  id={`number_of_people_${id}`}
                  name="number_of_people"
                  type="number"
                  min="1"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  required
                  className="p-2 border rounded-md"
                />
              </div>
              {/* Durée modifiable */}
              <div className="flex flex-col">
                <label htmlFor={`duration_${id}`} className="text-sm font-medium">
                  Durée (en nuits)
                </label>
                <input
                  id={`duration_${id}`}
                  name="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="p-2 border rounded-md"
                />
              </div>
              {/* Demande spéciale */}
              <div className="flex flex-col">
                <label htmlFor={`special_request_${id}`} className="text-sm font-medium">
                  Demande spéciale
                </label>
                <textarea
                  id={`special_request_${id}`}
                  name="special_request"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="Vos demandes particulières (optionnel)"
                  className="p-2 border rounded-md"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submissionLoading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {submissionLoading ? "Envoi en cours..." : "Envoyer la réservation"}
              </button>
            </form>
          </div>
          <style jsx>{`
            .popup {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              display: none;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .popup:target {
              display: flex;
            }
            .popup-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
              position: relative;
            }
            .close {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              text-decoration: none;
              color: #333;
            }
          `}</style>
        </div>
      )}

      {/* Popup de succès */}
      {submissionSuccess && (
        <div id={`popup-reservation-success-${id}`} className="popup">
          <div className="popup-content">
            <a
              href="#"
              className="close"
              onClick={() => setSubmissionSuccess(null)}
            >
              &times;
            </a>
            <h3 className="text-lg font-semibold text-green-800">Réservation réussie</h3>
            <p className="mt-2 text-sm text-slate-400">{submissionSuccess}</p>
          </div>
          <style jsx>{`
            .popup {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .popup-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
              position: relative;
            }
            .close {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              text-decoration: none;
              color: #333;
            }
          `}</style>
        </div>
      )}

      {/* Popup d'erreur */}
      {submissionError && (
        <div id={`popup-reservation-error-${id}`} className="popup">
          <div className="popup-content">
            <a
              href="#"
              className="close"
              onClick={() => setSubmissionError(null)}
            >
              &times;
            </a>
            <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
            <p className="mt-2 text-sm text-slate-400">{submissionError}</p>
          </div>
          <style jsx>{`
            .popup {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .popup-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
              position: relative;
            }
            .close {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              text-decoration: none;
              color: #333;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};


export default HotelOfferCard;
