"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function AddActivityPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
    old_price: '',
    start_date: '',
    end_date: '',
    difficulty_level: 'moderate',
    duration: '',
    what_to_bring: '',
    meeting_point: '',
    images: null, // Pour stocker un fichier image unique
    max_participants: 10,
    language: 'Français',
    is_guided: false,
    location: '',
    contact: '', // Nouveau champ pour le numéro du guide touristique
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gérer les changements des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Gérer le changement de fichier pour l'image (uniquement une image)
  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: e.target.files[0],
    }));
  };

  // Fonction pour uploader l'image dans Supabase Storage dans le bucket "tour_photos"
  // et retourner le lien public.
  const handleImageUpload = async () => {
    if (!formData.images) return null;

    // Créer un chemin de fichier avec le nom de l'activité et un timestamp
    const file = formData.images;
    const filePath = `${formData.name}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('tour_photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tour_photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Récupération de l'utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Vous devez être connecté pour effectuer cette action.");
      setLoading(false);
      return;
    }

    // Validation des champs obligatoires
    if (!formData.name || !formData.price || !formData.start_date || !formData.end_date) {
      setError("Veuillez remplir les champs obligatoires (Nom, Prix, Date de début et Date de fin).");
      setLoading(false);
      return;
    }

    let imageLink = null;
    try {
      imageLink = await handleImageUpload();
    } catch (err) {
      setError(`Erreur lors de l'upload de l'image: ${err.message}`);
      setLoading(false);
      return;
    }

    // Insertion dans la base de données
    const { error: insertError } = await supabase
      .from('tour_announcements')
      .insert([{
        ...formData,
        user_id: user.id,
        price: parseFloat(formData.price),
        images: imageLink, // Stocker le lien public de l'image
        is_available: true,
      }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("L'activité a bien été enregistrée dans la base de données !");
      // Réinitialiser le formulaire après succès
      setFormData({
        name: '',
        description: '',
        price: '',
        discount_percentage: '',
        old_price: '',
        start_date: '',
        end_date: '',
        difficulty_level: 'moderate',
        duration: '',
        what_to_bring: '',
        meeting_point: '',
        images: null,
        max_participants: 10,
        language: 'Français',
        is_guided: false,
        location: '',
        contact: '',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user || authError) {
        setError("Vous devez être connecté pour accéder à cette page.");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        setError("Erreur lors de la récupération du rôle utilisateur.");
        setLoading(false);
        return;
      }

      if (data?.role !== "tour_organizer") {
        setError("Accès refusé. Vous n'êtes pas autorisé à ajouter une activité.");
        setLoading(false);
        return;
      }

      setUserRole(data.role);
      setLoading(false);
    };

    checkUserRole();
  }, [router]);

  if (loading) return <div className="text-center p-8">Vérification des permissions...</div>;

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        {error} <br />
        <a href="/auth" className="text-blue-500 underline">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ajouter une nouvelle activité</h1>
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-100 p-6 rounded-lg shadow">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom de l'activité */}
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'activité *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                required
              />
            </div>
            {/* Prix */}
            <div>
              <label className="block text-sm font-medium mb-2">Prix (DZD) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                step="0.01"
                required
              />
            </div>
            {/* Pourcentage de remise */}
            <div>
              <label className="block text-sm font-medium mb-2">Pourcentage de remise (%)</label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                step="0.01"
              />
            </div>
            {/* Ancien Prix */}
            <div>
              <label className="block text-sm font-medium mb-2">Ancien Prix (DZD)</label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                step="0.01"
              />
            </div>
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium mb-2">Date de début *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                required
              />
            </div>
            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium mb-2">Date de fin *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                required
              />
            </div>
            {/* Niveau de difficulté */}
            <div>
              <label className="block text-sm font-medium mb-2">Niveau de difficulté</label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              >
                <option value="easy">Facile</option>
                <option value="moderate">Modérée</option>
                <option value="difficult">Difficile</option>
              </select>
            </div>
            {/* Durée */}
            <div>
              <label className="block text-sm font-medium mb-2">Durée</label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
                placeholder="Ex: 2 heures"
              />
            </div>
            {/* Langue */}
            <div>
              <label className="block text-sm font-medium mb-2">Langue</label>
              <input
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Nombre maximum de participants */}
            <div>
              <label className="block text-sm font-medium mb-2">Nombre maximum de participants</label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Point de rendez-vous */}
            <div>
              <label className="block text-sm font-medium mb-2">Point de rendez-vous</label>
              <input
                name="meeting_point"
                value={formData.meeting_point}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium mb-2">Localisation</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Contact du guide touristique */}
            <div>
              <label className="block text-sm font-medium mb-2">Contact du guide touristique</label>
              <input
                type="tel"
                name="contact"
                maxLength={10}
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Description */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded h-32"
              />
            </div>
            {/* Ce qu'il faut apporter */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Ce qu'il faut apporter</label>
              <textarea
                name="what_to_bring"
                value={formData.what_to_bring}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-400 rounded h-24"
              />
            </div>
            {/* Image */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            {/* Visite guidée */}
            <div className="col-span-full">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_guided"
                  checked={formData.is_guided}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Visite guidée incluse
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Publier l'activité
          </button>
        </form>
      </main>
    </div>
  );
}
