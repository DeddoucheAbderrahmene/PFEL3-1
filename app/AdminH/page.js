"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeaderAdminH from "@/components/HeaderAdminH";
import Footer from "@/components/Footer";

// Composant pour afficher un message popup
const PopupMessage = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
      <p className="text-lg mb-4">{message}</p>
      <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">
        OK
      </button>
    </div>
  </div>
);

const AdminH = () => {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Pour modification d'une réservation
  const [isReservationPopupOpen, setIsReservationPopupOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Récupération de l'utilisateur et de l'hôtel associé
  useEffect(() => {
    const fetchUserAndHotel = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const { data: hotelData } = await supabase
        .from("hotels")
        .select("*")
        .eq("admin_id", user.id)
        .maybeSingle();

      if (!hotelData) {
        setHotels([]);
        setPopupMessage("Aucun hôtel associé n'a été trouvé. Veuillez créer un hôtel.");
        setShowPopup(true);
        // Ici, vous pourriez déclencher l'ouverture d'un formulaire de création d'hôtel
      } else {
        setHotels([hotelData]);
      }
      setLoading(false);
    };
    fetchUserAndHotel();
  }, [router]);

  // Chargement des offres de l'hôtel
  useEffect(() => {
    if (hotels.length > 0) {
      const currentHotel = hotels[0];
      const fetchOffers = async () => {
        const { data: offersData, error: offersError } = await supabase
          .from("hotel_offers")
          .select("*")
          .eq("hotel_id", currentHotel.hotel_id);
        if (offersError) {
          console.error("Erreur chargement offres :", offersError);
        } else {
          setOffers(offersData);
        }
      };
      fetchOffers();
    } else {
      setOffers([]);
    }
  }, [hotels]);

  // Chargement des services de l'hôtel
  useEffect(() => {
    if (hotels.length > 0) {
      const currentHotel = hotels[0];
      const fetchServices = async () => {
        const { data: servicesData, error: servicesError } = await supabase
          .from("hotel_services")
          .select("*")
          .eq("hotel_id", currentHotel.hotel_id);
        if (servicesError) {
          console.error("Erreur chargement services :", servicesError);
        } else {
          setServices(servicesData);
        }
      };
      fetchServices();
    } else {
      setServices([]);
    }
  }, [hotels]);

  // Chargement des réservations liées aux offres et services de l'hôtel
  useEffect(() => {
    if (offers.length > 0 || services.length > 0) {
      const fetchReservations = async () => {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from("reservations")
          .select("*")
          .in("reservation_type", ["hotel_offer", "hotel_service"]);
        if (reservationsError) {
          console.error("Erreur chargement réservations :", reservationsError);
        } else {
          const offerIds = offers.map(o => o.hotel_offer_id);
          const serviceIds = services.map(s => s.hotel_service_id);
          const filteredReservations = reservationsData.filter(r => {
            if (r.reservation_type === "hotel_offer") {
              return offerIds.includes(r.reservation_type_id);
            } else if (r.reservation_type === "hotel_service") {
              return serviceIds.includes(r.reservation_type_id);
            }
            return false;
          });
          setReservations(filteredReservations);
        }
      };
      fetchReservations();
    } else {
      setReservations([]);
    }
  }, [offers, services]);

  // Modification d'une réservation
  const handleReservationSubmit = async (reservationData) => {
    if (editingReservation) {
      const { data, error } = await supabase
        .from("reservations")
        .update(reservationData)
        .eq("reservation_id", reservationData.reservation_id)
        .single();
      if (error) {
        console.error("Erreur lors de la mise à jour de la réservation", error);
        return;
      }
      setReservations(
        reservations.map(r =>
          r.reservation_id === reservationData.reservation_id ? data : r
        )
      );
    }
    setIsReservationPopupOpen(false);
  };

  const deleteReservation = async (id) => {
    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("reservation_id", id);
    if (error) {
      console.error("Erreur lors de la suppression de la réservation", error);
      return;
    }
    setReservations(reservations.filter(r => r.reservation_id !== id));
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <HeaderAdminH />
      <div className="container mx-auto p-6 min-h-screen bg-amber-50">
        <h2 className="text-2xl font-semibold text-amber-800 mb-6">
          Tableau de bord
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <h3 className="text-xl font-semibold text-amber-800 mb-4">
            Gestion des Réservations (Offres & Services)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-amber-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">ID Type</th>
                  <th className="px-4 py-2"># Pers.</th>
                  <th className="px-4 py-2">Payement</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Demande</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {reservations.map((reservation) => (
                  <tr key={reservation.reservation_id} className="hover:bg-amber-200">
                    <td className="px-4 py-2 text-sm">{reservation.reservation_id}</td>
                    <td className="px-4 py-2 text-sm">{reservation.reservation_type}</td>
                    <td className="px-4 py-2 text-sm">{reservation.booking_date}</td>
                    <td className="px-4 py-2 text-sm">{reservation.user_id}</td>
                    <td className="px-4 py-2 text-sm">{reservation.reservation_type_id}</td>
                    <td className="px-4 py-2 text-sm">{reservation.number_of_people}</td>
                    <td className="px-4 py-2 text-sm">{reservation.payment_status}</td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          reservation.status === "confirmed"
                            ? "bg-green-500 text-white"
                            : reservation.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{reservation.special_request}</td>
                    <td className="px-4 py-2 text-sm space-x-2">
                      <button
                        onClick={() => {
                          setEditingReservation(reservation);
                          setIsReservationPopupOpen(true);
                        }}
                        className="border border-amber-500 text-amber-500 px-2 py-1 rounded hover:bg-amber-500 hover:text-white"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteReservation(reservation.reservation_id)}
                        className="border border-amber-500 text-amber-500 px-2 py-1 rounded hover:bg-amber-500 hover:text-white"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isReservationPopupOpen && (
          <ReservationFormModal
            reservation={editingReservation}
            onClose={() => setIsReservationPopupOpen(false)}
            onSubmit={handleReservationSubmit}
            offers={offers}
            services={services}
            defaultUserId={user.id}
          />
        )}
        {showPopup && <PopupMessage message={popupMessage} onClose={() => setShowPopup(false)} />}
      </div>
      <Footer />
    </div>
  );
};

const ReservationFormModal = ({ reservation, onClose, onSubmit, offers, services, defaultUserId }) => {
  const [formData, setFormData] = useState(
    reservation || {
      user_id: defaultUserId || "",
      reservation_type: "hotel_offer",
      reservation_type_id: "",
      booking_date: new Date().toISOString().slice(0, 16),
      number_of_people: 1,
      special_request: "",
      payment_status: "pending",
      status: "pending",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "reservation_type") {
      setFormData({ ...formData, [name]: value, reservation_type_id: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Selon le type de réservation, les options proviennent des offres ou services
  const typeOptions = formData.reservation_type === "hotel_offer" ? offers : services;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-amber-900 mb-6">
          {reservation ? "Modifier la réservation" : "Nouvelle réservation"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Utilisateur ID
              </label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Type de réservation
              </label>
              <select
                name="reservation_type"
                value={formData.reservation_type}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              >
                <option value="hotel_offer">Offre hôtel</option>
                <option value="hotel_service">Service hôtel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                ID du type de réservation
              </label>
              <select
                name="reservation_type_id"
                value={formData.reservation_type_id}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              >
                <option value="">Sélectionnez</option>
                {typeOptions.map((item) => (
                  <option
                    key={item.hotel_offer_id || item.hotel_service_id}
                    value={item.hotel_offer_id || item.hotel_service_id}
                  >
                    {item.name || item.title || item.service_type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Date de réservation
              </label>
              <input
                type="datetime-local"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Nombre de personnes
              </label>
              <input
                type="number"
                name="number_of_people"
                value={formData.number_of_people}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Statut du paiement
              </label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              >
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Statut de la réservation
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg"
                required
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="canceled">Annulé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-2">
              Demande spéciale
            </label>
            <textarea
              name="special_request"
              value={formData.special_request}
              onChange={handleChange}
              className="w-full p-2 border border-amber-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg"
            >
              {reservation ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminH;