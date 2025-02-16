"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeaderAdminH from "@/components/HeaderAdminH";
import Footer from "@/components/Footer";

// Fonction d'upload d'image vers Supabase Storage (si vous utilisez un bucket "hotels-images")
const uploadImage = async (hotelName, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${hotelName}-${Date.now()}.${fileExt}`;
  const filePath = fileName; // Vous pouvez organiser le chemin comme vous le souhaitez
  const { data, error } = await supabase.storage
    .from('hotels-images')
    .upload(filePath, file);
  if (error) {
    console.error("Erreur lors de l'upload de l'image", error.message);
    return null;
  }
  return data.path;
};

// Composant PopupMessage pour afficher les messages (succès ou échec)
const PopupMessage = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
      <p className="text-lg mb-4 text-blue-900">{message}</p>
      <button onClick={onClose} className="bg-blue-900 text-white px-4 py-2 rounded">
        OK
      </button>
    </div>
  </div>
);

// Formulaire pour créer ou modifier un hôtel
const HotelFormModal = ({ hotel, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    hotel || {
      name: "",
      description: "",
      location: "",
      wilaya: "",
      phone_number: "",
      email: "",
      history: "",
      star_rating: 3,
      images: "",
      amenities: "",
      additional_notes: "",
      payment_methods: "",
    }
  );
  const [file, setFile] = useState(null);

  const wilayas = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa",
    "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa",
    "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel",
    "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
    "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès",
    "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras",
    "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
    "Relizane"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "images" && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">
          {hotel ? "Modifier l'hôtel" : "Nouvel hôtel"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champs du formulaire d'hôtel */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Localisation</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Wilaya</label>
              <select name="wilaya" value={formData.wilaya} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                <option value="">Sélectionnez votre wilaya</option>
                {wilayas.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Téléphone</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Historique</label>
              <textarea name="history" value={formData.history} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Étoiles</label>
              <input type="number" name="star_rating" min="1" max="5" value={formData.star_rating} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Images (déposez vos fichiers)</label>
              <input type="file" name="images" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Équipements</label>
              <textarea name="amenities" value={formData.amenities} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Notes supplémentaires</label>
              <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Méthodes de paiement</label>
              <textarea name="payment_methods" value={formData.payment_methods} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              Annuler
            </button>
            <button type="submit" className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              {hotel ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Formulaire pour gérer les offres (hotel_offers)
const HotelOfferFormModal = ({ hotelOffer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    hotelOffer || {
      name: "",
      description: "",
      price: 0,
      room_type: "",
      number_of_rooms: 1,
      wifi_included: false,
      breakfast_included: false,
      lunch_included: false,
      dinner_included: false,
      parking_included: false,
      pool_access: false,
      gym_access: false,
      spa_access: false,
      additional_notes: "",
      max_occupancy: 1,
      is_refundable: false,
      old_price: 0,
      discount_percentage: 0,
      images: "",
      start_date: "",
      end_date: "",
    }
  );

  useEffect(() => {
    const priceVal = parseFloat(formData.price);
    const oldPriceVal = parseFloat(formData.old_price);
    if (oldPriceVal > 0) {
      const computed = ((oldPriceVal - priceVal) / oldPriceVal) * 100;
      setFormData(prev => ({ ...prev, discount_percentage: computed.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, discount_percentage: 0 }));
    }
  }, [formData.price, formData.old_price]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">
          {hotelOffer ? "Modifier l'offre" : "Nouvelle offre"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champs du formulaire d'offre */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Prix</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Type de chambre</label>
              <input type="text" name="room_type" value={formData.room_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Nombre de chambres</label>
              <input type="number" name="number_of_rooms" value={formData.number_of_rooms} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {[
                { name: "wifi_included", label: "Wifi inclus" },
                { name: "breakfast_included", label: "Petit déj inclus" },
                { name: "lunch_included", label: "Déjeuner inclus" },
                { name: "dinner_included", label: "Dîner inclus" },
                { name: "parking_included", label: "Parking inclus" },
                { name: "pool_access", label: "Accès piscine" },
                { name: "gym_access", label: "Accès gym" },
                { name: "spa_access", label: "Accès spa" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2">
                  <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} />
                  {label}
                </label>
              ))}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Notes additionnelles</label>
              <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Capacité maximale</label>
              <input type="number" name="max_occupancy" value={formData.max_occupancy} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Ancien prix</label>
              <input type="number" step="0.01" name="old_price" value={formData.old_price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Remise (%)</label>
              <input type="number" name="discount_percentage" value={formData.discount_percentage} disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Images (déposez vos fichiers)</label>
              <input type="file" name="images" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Date de début</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Date de fin</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              Annuler
            </button>
            <button type="submit" className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              {hotelOffer ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Formulaire pour gérer les services (hotel_services)
const ServiceFormModal = ({ service, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    service || {
      name: "",
      description: "",
      price: 0,
      service_type: "",
      duration_type: "once",
      old_price: 0,
      discount_percentage: 0,
    }
  );

  useEffect(() => {
    const priceVal = parseFloat(formData.price);
    const oldPriceVal = parseFloat(formData.old_price);
    if (oldPriceVal > 0) {
      const computed = ((oldPriceVal - priceVal) / oldPriceVal) * 100;
      setFormData(prev => ({ ...prev, discount_percentage: computed.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, discount_percentage: 0 }));
    }
  }, [formData.price, formData.old_price]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const serviceTypes = ['pool', 'gym', 'spa', 'restaurant', 'room_service', 'bar', 'conference_room', 'parking'];
  const durationTypes = ['once', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">
          {service ? "Modifier le service" : "Nouveau service"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Prix</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Type de service</label>
              <select name="service_type" value={formData.service_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                <option value="">Sélectionnez</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Durée</label>
              <select name="duration_type" value={formData.duration_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required>
                {durationTypes.map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Ancien prix</label>
              <input type="number" step="0.01" name="old_price" value={formData.old_price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Remise (%)</label>
              <input type="number" name="discount_percentage" value={formData.discount_percentage} disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              Annuler
            </button>
            <button type="submit" className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg">
              {service ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GestionHPage = () => {
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [hotelOffers, setHotelOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // États de contrôle des modales
  const [isOfferPopupOpen, setIsOfferPopupOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isHotelPopupOpen, setIsHotelPopupOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isServicePopupOpen, setIsServicePopupOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    const fetchUserAndHotel = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Récupérer éventuellement un hôtel existant associé à l'admin
      const { data: hotelData } = await supabase
        .from("hotels")
        .select("*")
        .eq("admin_id", user.id)
        .maybeSingle();

      if (!hotelData) {
        setHotels([]);
        setPopupMessage("Aucun hôtel associé n'a été trouvé. Veuillez créer un hôtel.");
        setShowPopup(true);
        setIsHotelPopupOpen(true);
      } else {
        setHotels([hotelData]);
      }
      setLoading(false);
    };
    fetchUserAndHotel();
  }, [router]);

  useEffect(() => {
    if (hotels.length > 0) {
      const currentHotel = hotels[0];
      const fetchOffers = async () => {
        
        const { data: offersData, error: offersError } = await supabase
          .from("hotel_offers")
          .select("*")
          .eq("hotel_id", currentHotel.hotel_id);
        if (offersError) {
          console.error("Erreur chargement offres :", offersError.message);
        } else {
          setHotelOffers(offersData);
        }
      };
      fetchOffers();
    } else {
      setHotelOffers([]);
    }
  }, [hotels]);

  useEffect(() => {
    if (hotels.length > 0) {
      const currentHotel = hotels[0];
      const fetchServices = async () => {
        const { data: servicesData, error: servicesError } = await supabase
          .from("hotel_services")
          .select("*")
          .eq("hotel_id", currentHotel.hotel_id);
        if (servicesError) {
          console.error("Erreur chargement services :", servicesError.message);
        } else {
          setServices(servicesData);
        }
      };
      fetchServices();
    } else {
      setServices([]);
    }
  }, [hotels]);

  const handleOfferSubmit = async (offerData) => {
    if (editingOffer) {
      const dataToUpdate = { ...offerData };
      delete dataToUpdate.new_price;
      const { data, error } = await supabase
        .from("hotel_offers")
        .update(dataToUpdate)
        .eq("hotel_offer_id", offerData.hotel_offer_id)
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de la mise à jour de l'offre: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setHotelOffers(prevOffers =>
        prevOffers.map(o => o.hotel_offer_id === offerData.hotel_offer_id ? data : o)
      );
      setPopupMessage("Offre mise à jour avec succès !");
      setShowPopup(true);
    } else {
      const { data, error } = await supabase
        .from("hotel_offers")
        .insert([{ ...offerData, hotel_id: hotels[0].hotel_id }])
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de l'ajout de l'offre: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setHotelOffers(prevOffers => [...prevOffers, data]);
      setPopupMessage("Offre créée avec succès !");
      setShowPopup(true);
    }
    setIsOfferPopupOpen(false);
  };

  const handleHotelSubmit = async (hotelDataInput, file) => {
    let imagePath = hotelDataInput.images || "";
    if (file && hotelDataInput.name) {
      const path = await uploadImage(hotelDataInput.name, file);
      if (path) imagePath = path;
    }
    const finalData = { ...hotelDataInput, images: imagePath };

    if (editingHotel) {
      const { data, error } = await supabase
        .from("hotels")
        .update(finalData)
        .eq("hotel_id", hotelDataInput.hotel_id)
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de la mise à jour de l'hôtel: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setHotels(prevHotels =>
        prevHotels.map(h => h.hotel_id === hotelDataInput.hotel_id ? data : h)
      );
      setPopupMessage("Hôtel mis à jour avec succès !");
      setShowPopup(true);
    } else {
      if (hotels.length > 0) {
        setPopupMessage("Vous avez déjà ajouté un hôtel. Vous pouvez le modifier.");
        setShowPopup(true);
        return;
      }
      finalData.admin_id = user.id;
      const { data, error } = await supabase
        .from("hotels")
        .insert([finalData])
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de l'ajout de l'hôtel: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setHotels(prevHotels => [...prevHotels, data]);
      setPopupMessage("Hôtel créé avec succès !");
      setShowPopup(true);
    }
    setIsHotelPopupOpen(false);
  };

  const handleServiceSubmit = async (serviceData) => {
    const dataToSend = { ...serviceData };
    delete dataToSend.new_price;
    
    if (editingService) {
      const { data, error } = await supabase
        .from("hotel_services")
        .update(dataToSend)
        .eq("hotel_service_id", serviceData.hotel_service_id)
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de la mise à jour du service: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setServices(prevServices =>
        prevServices.map(s => s.hotel_service_id === serviceData.hotel_service_id ? data : s)
      );
      setPopupMessage("Service mis à jour avec succès !");
      setShowPopup(true);
    } else {
      const { data, error } = await supabase
        .from("hotel_services")
        .insert([{ ...dataToSend, hotel_id: hotels[0].hotel_id }])
        .select()
        .single();
      if (error) {
        setPopupMessage(`Erreur lors de l'ajout du service: ${error.message}`);
        setShowPopup(true);
        return;
      }
      setServices(prevServices => [...prevServices, data]);
      setPopupMessage("Service créé avec succès !");
      setShowPopup(true);
    }
    setIsServicePopupOpen(false);
  };

  const deleteOffer = async (id) => {
    const { error } = await supabase
      .from("hotel_offers")
      .delete()
      .eq("hotel_offer_id", id);
    if (error) {
      setPopupMessage(`Erreur lors de la suppression de l'offre: ${error.message}`);
      setShowPopup(true);
      return;
    }
    setHotelOffers(prevOffers => prevOffers.filter(o => o.hotel_offer_id !== id));
    setPopupMessage("Offre supprimée avec succès !");
    setShowPopup(true);
  };

  const deleteHotel = async (id) => {
    const { error } = await supabase
      .from("hotels")
      .delete()
      .eq("hotel_id", id);
    if (error) {
      setPopupMessage(`Erreur lors de la suppression de l'hôtel: ${error.message}`);
      setShowPopup(true);
      return;
    }
    setHotels(prevHotels => prevHotels.filter(h => h.hotel_id !== id));
    setPopupMessage("Hôtel supprimé avec succès !");
    setShowPopup(true);
  };

  const deleteService = async (id) => {
    const { error } = await supabase
      .from("hotel_services")
      .delete()
      .eq("hotel_service_id", id);
    if (error) {
      setPopupMessage(`Erreur lors de la suppression du service: ${error.message}`);
      setShowPopup(true);
      return;
    }
    setServices(prevServices => prevServices.filter(s => s.hotel_service_id !== id));
    setPopupMessage("Service supprimé avec succès !");
    setShowPopup(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center text-blue-900">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderAdminH />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">
          Gestion des Hôtels, Offres et Services
        </h2>

        {/* Section Gestion des Hôtels */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-900">Gestion des Hôtels</h3>
            <button
              disabled={hotels.length > 0}
              onClick={() => {
                setEditingHotel(null);
                setIsHotelPopupOpen(true);
              }}
              className={`bg-transparent border-2 px-4 py-2 rounded-lg ${
                hotels.length > 0
                  ? "border-gray-400 text-gray-400 cursor-not-allowed"
                  : "border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
              }`}
              title={hotels.length > 0 ? "Vous avez déjà ajouté un hôtel" : ""}
            >
              ＋ Ajouter un hôtel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.filter(hotel => hotel !== null).map(hotel => (
              <div key={hotel.hotel_id} className="bg-gray-100 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-blue-900">{hotel.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingHotel(hotel);
                        setIsHotelPopupOpen(true);
                      }}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteHotel(hotel.hotel_id)}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="text-blue-900">{hotel.description}</p>
                <div className="mt-4 flex items-center">
                  <span className="text-blue-900">★ {hotel.star_rating}/5</span>
                  <span className="ml-4 text-blue-900">
                    📍 {hotel.location} - {hotel.wilaya}
                  </span>

                </div>
                
                {hotels.map((hotel) => (

<div key={hotel.hotel_id}> <h3>{hotel.name}</h3> <img src={hotel.images} alt="Image de l'hôtel" className="w-full rounded" /> </div> ))}
              </div>
            ))}
          </div>
        </div>

        {/* Section Gestion des Offres */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-900">Gestion des Offres</h3>
            <button
              onClick={() => {
                setEditingOffer(null);
                setIsOfferPopupOpen(true);
              }}
              className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg"
            >
              ＋ Ajouter une offre
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelOffers.filter(offer => offer !== null).map(hotelOffer => (
              <div key={hotelOffer.hotel_offer_id} className="bg-gray-100 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-blue-900">{hotelOffer.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingOffer(hotelOffer);
                        setIsOfferPopupOpen(true);
                      }}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteOffer(hotelOffer.hotel_offer_id)}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="text-blue-900">{hotelOffer.description}</p>
                <div className="mt-4">
                  <span className="text-blue-900">💶 {hotelOffer.price}dzd</span>
                  <span className="ml-4 text-blue-900">🛏 {hotelOffer.room_type}</span>
                  <div className="mt-2 text-sm text-gray-600">
                    Remise : {hotelOffer.discount_percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Gestion des Services */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-900">Gestion des Services</h3>
            <button
              onClick={() => {
                setEditingService(null);
                setIsServicePopupOpen(true);
              }}
              className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-4 py-2 rounded-lg"
            >
              ＋ Ajouter un service
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(service => service !== null).map(service => (
              <div key={service.hotel_service_id} className="bg-gray-100 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-blue-900">{service.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setIsServicePopupOpen(true);
                      }}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteService(service.hotel_service_id)}
                      className="bg-transparent border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-2 py-1 rounded-lg"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="text-blue-900">{service.description}</p>
                <div className="mt-4">
                  <span className="text-blue-900">💶 {service.price}dzd</span>
                  <span className="ml-4 text-blue-900">{service.service_type}</span>
                  <div className="mt-2 text-sm text-gray-600">
                    Remise : {service.discount_percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modales */}
        {isOfferPopupOpen && (
          <HotelOfferFormModal
            hotelOffer={editingOffer}
            onClose={() => setIsOfferPopupOpen(false)}
            onSubmit={handleOfferSubmit}
          />
        )}
        {isHotelPopupOpen && (
          <HotelFormModal
            hotel={editingHotel}
            onClose={() => setIsHotelPopupOpen(false)}
            onSubmit={handleHotelSubmit}
          />
        )}
        {isServicePopupOpen && (
          <ServiceFormModal
            service={editingService}
            onClose={() => setIsServicePopupOpen(false)}
            onSubmit={handleServiceSubmit}
          />
        )}
        {showPopup && (
          <PopupMessage message={popupMessage} onClose={() => setShowPopup(false)} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GestionHPage;