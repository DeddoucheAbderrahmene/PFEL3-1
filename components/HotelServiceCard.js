import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const HotelServiceCard = ({ service }) => {
  const router = useRouter();
  const id = service.hotel_service_id;

  // Fonction pour formater le prix (avec éventuel rabais)
  const getServicePrice = () => {
    if (service.new_price && Number(service.new_price) < Number(service.price)) {
      return `À partir de ${service.new_price} DZD`;
    }
    return service.price ? `À partir de ${service.price} DZD` : "Sur demande";
  };

  // Découpage de la description en phrases
  const sentences = service.description ? service.description.split(". ") : [];
  const truncatedDescription =
    sentences.length > 0
      ? sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "")
      : "";

  // États pour le formulaire de réservation
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [duration, setDuration] = useState(1); // Champ désactivé, toujours 1
  const [specialRequest, setSpecialRequest] = useState("");

  // États pour la soumission
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // État pour l'utilisateur
  const [user, setUser] = useState(null);

  // Récupérer l'utilisateur via Supabase Auth
  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFirstName(user.user_metadata.first_name || "");
        setLastName(user.user_metadata.last_name || "");
      }
    }
    fetchUser();
  }, []);

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

    // Mise à jour du profil utilisateur si nécessaire
    const { error: updateError } = await supabase
      .from("users")
      .update({ first_name: firstName, last_name: lastName })
      .eq("user_id", user.id);
    if (updateError) {
      setSubmissionError("Erreur lors de la mise à jour de votre profil: " + updateError.message);
      setSubmissionLoading(false);
      return;
    }

    // Insérer la réservation dans la table reservations
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: user.id,
          reservation_type: "hotel_service",
          reservation_type_id: id,
          number_of_people: Number(numberOfPeople),
          duration: Number(duration),
          special_request: specialRequest,
        },
      ]);
    if (error) {
      setSubmissionError("Erreur lors de la réservation: " + error.message);
    } else {
      setSubmissionSuccess("Votre réservation a bien été enregistrée. Nous allons vous contacter très bientôt.");
      // Fermer le popup actuel en retirant le hash de l'URL
      window.location.hash = "";
    }
    setSubmissionLoading(false);
  };

  return (
    <div className="group relative w-[22rem] mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-green-100 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-green-300/50">
        {/* Effets de gradient */}
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/30 to-green-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>
        <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-300/30 to-green-100/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>

        <div className="relative p-6">
          {/* Zone pour l'icône ou l'image du service */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white shadow p-2">
              {service.service_type === "spa" && (
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.104.448 2.104 1.172 2.828C10.896 15.552 12 16 12 16s1.104-.448 1.828-2.172C14.552 13.104 15 12.104 15 11c0-1.657-1.343-3-3-3z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h2M20 12h2M4.93 4.93l1.414 1.414M17.657 17.657l1.414 1.414M12 2v2M12 20v2M4.93 19.07l1.414-1.414M17.657 6.343l1.414-1.414"></path>
                </svg>
              )}
              {service.service_type === "gym" && (
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 2a2 2 0 00-2 2v3H5a2 2 0 00-2 2v3h18V9a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"></path>
                </svg>
              )}
              {service.service_type === "pool" && (
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 014-4h10a4 4 0 014 4v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a4 4 0 014-4h10a4 4 0 014 4"></path>
                </svg>
              )}
              {!(service.service_type === "spa" || service.service_type === "gym" || service.service_type === "pool") && (
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                </svg>
              )}
            </div>
            {/* Informations principales du service */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800">{service.name}</h3>
              <p className="text-sm text-slate-400 capitalize">{service.service_type}</p>
              <p className="mt-4 text-sm text-slate-400">
                {truncatedDescription}
                {sentences.length > 2 && (
                  <a
                    href={`#popup-service-${id}`}
                    className="text-green-500 underline ml-1"
                  >
                    Voir plus
                  </a>
                )}
              </p>
            </div>
          </div>

          {/* Affichage du prix */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
              {getServicePrice()}
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex flex-col gap-3">
            {id ? (
              <a
                href={`#popup-reservation-service-${id}`}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    router.push("/auth");
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 text-white font-semibold transition-all hover:shadow-lg w-full"
              >
                Réserver service
              </a>
            ) : (
              <span className="text-red-500">ID service non disponible</span>
            )}
            <button className="flex items-center justify-center gap-2 rounded-xl border border-green-500 px-4 py-3 text-green-500 transition-colors hover:bg-green-500/10">
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
        <div id={`popup-service-${id}`} className="popup">
          <div className="popup-content">
            <a href="#" className="close">&times;</a>
            <h3 className="text-lg font-semibold text-green-800">{service.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{service.description}</p>
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

      {/* Popup pour le formulaire de réservation (pour le service) */}
      {id && (
        <div id={`popup-reservation-service-${id}`} className="popup">
          <div className="popup-content">
            <a href="#" className="close">&times;</a>
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Formulaire de réservation
            </h3>
            <form
              onSubmit={handleReservationSubmit}
              className="flex flex-col gap-4"
            >
              {/* Champs cachés */}
              <input type="hidden" name="reservation_type" value="hotel_service" />
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
              {/* Durée (désactivé) */}
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
                  disabled
                  className="p-2 border rounded-md bg-gray-100 cursor-not-allowed"
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
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
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

export default HotelServiceCard;
