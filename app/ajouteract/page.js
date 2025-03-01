"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import HeaderAdminA from '@/components/HeaderAdminA';

export default function ActivitiesManager() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('list');
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupérer les activités existantes
  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tour_announcements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setActivities(data);
    }
    setLoading(false);
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Gestion des images
  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, images: e.target.files[0] }));
  };

  // Upload d'image
  const uploadImage = async (file) => {
    const filePath = `${formData.name}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('tour_photos')
      .upload(filePath, file);

    if (error) throw error;

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      let imageUrl = formData.images;

      // Upload nouvelle image si nécessaire
      if (formData.images instanceof File) {
        imageUrl = await uploadImage(formData.images);
      }

      // Données à sauvegarder
      const activityData = {
        ...formData,
        images: imageUrl,
        price: parseFloat(formData.price),
        user_id: user.id
      };

      if (editingActivity) {
        // Mise à jour
        const { error } = await supabase
          .from('tour_announcements')
          .update(activityData)
          .eq('tour_announcement_id', editingActivity.tour_announcement_id);

        if (error) throw error;
        setSuccess('Activité mise à jour avec succès !');
      } else {
        // Création
        const { error } = await supabase
          .from('tour_announcements')
          .insert([activityData]);

        if (error) throw error;
        setSuccess('Activité créée avec succès !');
      }

      fetchActivities();
      setViewMode('list');
      setEditingActivity(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discount_percentage: '',
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'une activité
  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('tour_announcements')
      .delete()
      .eq('tour_announcement_id', id);

    if (error) {
      setError(error.message);
    } else {
      fetchActivities();
      setSuccess('Activité supprimée avec succès !');
    }
    setLoading(false);
  };

  // Préparation de l'édition
  const setupEdit = (activity) => {
    // Exclure new_price des données éditées
    const { new_price, ...activityData } = activity;
    setEditingActivity(activity);
    setFormData({
      ...activityData,
      images: activity.images
    });
    setViewMode('form');
  };

  // Vérification initiale des permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || data?.role !== 'tour_organizer') {
        router.push('/');
      } else {
        fetchActivities();
      }
    };

    checkPermissions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeaderAdminA />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-center">Gestion des activités</h1>
          <button
            onClick={() => {
              setViewMode(viewMode === 'list' ? 'form' : 'list');
              setEditingActivity(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                discount_percentage: '',
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
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {viewMode === 'list' ? 'Nouvelle activité +' : 'Retour à la liste'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 bg-green-100 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map(activity => (
              <div key={activity.tour_announcement_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {activity.images && (
                  <img 
                    src={activity.images} 
                    alt={activity.name} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-600 font-bold">{activity.price} DZD</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      activity.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                      activity.difficulty_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.difficulty_level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setupEdit(activity)}
                      className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(activity.tour_announcement_id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom de l'activité */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  required
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium mb-2">Date de début *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de fin *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-sm font-medium mb-2">Difficulté</label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Facile</option>
                  <option value="moderate">Modérée</option>
                  <option value="difficult">Difficile</option>
                </select>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium mb-2">Participants max</label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Image */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>

              {/* Localisation */}
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-2">Localisation</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Boutons de soumission */}
              <div className="col-span-full flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingActivity ? 'Mettre à jour' : 'Créer activité'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}