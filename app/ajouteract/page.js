"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import HeaderAdminA from "@/components/HeaderAdminA";
import Footer from '@/components/Footer';

const initialFormState = {
  name: '',
  description: '',
  price: 0,
  discount_percentage: null,
  start_date: '',
  end_date: '',
  difficulty_level: 'moderate',
  duration: '',
  what_to_bring: '',
  meeting_point: '',
  images: null,
  Contact: '',
  max_participants: 10,
  language: 'Français',
  is_guided: false,
  location: '',
  is_available: true
};

export default function ActivitiesManager() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('list');
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fetchReservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          tour_announcements:reservation_type_id (
            name,
            price
          )
        `)
        .eq('reservation_type', 'tour_activity')
        .eq('tour_announcements.user_id', user.id);

      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const confirmPayment = async (reservationId) => {
    if (!confirm('Marquer ce paiement comme reçu ?')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ payment_status: 'paid_onsite' })
        .eq('reservation_id', reservationId);

      if (error) throw error;

      await fetchReservations();
      setSuccess('Paiement confirmé avec succès !');
    } catch (error) {
      setError(error.message);
    }
  };

  // Ajouter dans useEffect après checkPermissions
  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);
  const fetchActivities = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentification requise');

      const { data, error } = await supabase
        .from('tour_announcements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data);
    } catch (error) {
      setError(error.message || 'Erreur de chargement des activités');
      console.error('fetchActivities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${formData.name}/${fileName}`;

    const { error } = await supabase.storage
      .from('tour_photos')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error("Échec de l'upload de l'image");
    }

    return supabase.storage
      .from('tour_photos')
      .getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.Contact.match(/^0\d{9}$/)) {
        throw new Error('Format de contact invalide (ex: 0794553778)');
      }
      // Validation des champs obligatoires
      if (!formData.name || !formData.price || !formData.start_date || !formData.end_date) {
        throw new Error('Veuillez remplir tous les champs obligatoires (*)');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Utilisateur non connecté');

      // Conversion des données numériques
      const numericData = {
        price: parseFloat(formData.price),
        discount_percentage: formData.discount_percentage
          ? Math.min(100, Math.max(0, parseFloat(formData.discount_percentage)))
          : null,
        max_participants: Math.max(1, parseInt(formData.max_participants) || 10)
      };

      // Gestion de l'image
      let imageUrl = formData.images;
      if (formData.images instanceof File) {
        imageUrl = await uploadImage(formData.images);
      }
      const { new_price, ...formDataWithoutNewPrice } = formData;
      // Préparation des données finales
      const activityData = {
        ...formDataWithoutNewPrice,
        ...formData,
        ...numericData,
        images: imageUrl,
        user_id: user.id,
        is_available: !!formData.is_available,
        is_guided: !!formData.is_guided
      };

      // Envoi des données
      const { data, error: dbError } = editingActivity
        ? await supabase
          .from('tour_announcements')
          .update(activityData)
          .eq('tour_announcement_id', editingActivity.tour_announcement_id)
          .select()
        : await supabase
          .from('tour_announcements')
          .insert([activityData])
          .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Erreur base de données: ${dbError.message}`);
      }

      setSuccess(editingActivity
        ? 'Activité mise à jour avec succès !'
        : 'Activité créée avec succès !');

      await fetchActivities();
      setViewMode('list');
      setFormData(initialFormState);
      setEditingActivity(null);

    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tour_announcements')
        .delete()
        .eq('tour_announcement_id', id);

      if (error) throw error;

      setSuccess('Activité supprimée avec succès !');
      fetchActivities();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupEdit = (activity) => {
    // Vérifier que l'activité existe
    if (!activity) return;

    setEditingActivity({
      ...activity,
      tour_announcement_id: activity.tour_announcement_id // S'assurer que l'ID existe
    });

    setFormData({
      ...initialFormState,
      ...activity
    });
    setViewMode('form');
  };


  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth');

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (data?.role !== 'tour_organizer') router.push('/');
      else fetchActivities();
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
    <div className="min-h-screen bg-white text-gray-900" suppressHydrationWarning>
      <HeaderAdminA />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-center">Gestion des activités</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              Activités
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'reservations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              Réservations
            </button>
          </div>
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

        {activeTab === 'activities' ? (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setViewMode(v => (v === 'list' ? 'form' : 'list'));
                  setEditingActivity(null);
                  setFormData(initialFormState);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {viewMode === 'list' ? 'Nouvelle activité +' : 'Retour à la liste'}
              </button>
            </div>

            {viewMode === 'list' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map(activity => (
                  <ActivityCard
                    key={activity.tour_announcement_id}
                    activity={activity}
                    onEdit={setupEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <ActivityForm
                formData={formData}
                isEditing={!!editingActivity}
                onChange={handleInputChange}
                onImageChange={e =>
                  setFormData(p => ({ ...p, images: e.target.files[0] }))
                }
                onSubmit={handleSubmit}
                onCancel={() => setViewMode('list')}
              />
            )}
          </>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Activité</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Participants</th>
                  <th className="px-6 py-4 text-left">Statut Paiement</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(reservation => (
                  <tr key={reservation.reservation_id} className="border-t">
                    <td className="px-6 py-4">
                      {reservation.tour_announcements?.name || 'Activité supprimée'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(reservation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{reservation.number_of_people}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${reservation.payment_status === 'paid_onsite'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {reservation.payment_status === 'paid_onsite' ? 'Payé' : 'À payer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reservation.payment_status !== 'paid_onsite' && (
                        <button
                          onClick={() => confirmPayment(reservation.reservation_id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Marquer comme payé
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Aucune réservation pour le moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const ActivityCard = ({ activity, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
        <span className="text-blue-600 font-bold">
          {activity.discount_percentage > 0 ? (
            <>
              {Math.round(activity.price * (1 - activity.discount_percentage / 100))} DZD
              <span className="line-through text-gray-400 ml-2">
                {activity.price} DZD
              </span>
            </>
          ) : (
            <>{activity.price} DZD</>
          )}
        </span>
        <span className={`px-2 py-1 rounded-full text-sm ${{
          'easy': 'bg-green-100 text-green-800',
          'moderate': 'bg-yellow-100 text-yellow-800',
          'difficult': 'bg-red-100 text-red-800'
        }[activity.difficulty_level]
          }`}>
          {activity.difficulty_level}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {activity.description}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(activity)}
          className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(activity.tour_announcement_id)}
          className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
);

const ActivityForm = ({ formData, isEditing, onChange, onImageChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="bg-gray-50 p-6 rounded-xl shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Nom *" name="name" value={formData.name} onChange={onChange} required />
      <InputField label="Prix (DZD) *" type="number" name="price" value={formData.price} onChange={onChange} step="0.01" required />
      <InputField label="Date de début *" type="date" name="start_date" value={formData.start_date} onChange={onChange} required />
      <InputField label="Date de fin *" type="date" name="end_date" value={formData.end_date} onChange={onChange} required />
      <InputField label="Durée" name="duration" value={formData.duration} onChange={onChange} />
      <InputField label="Participants max" type="number" name="max_participants" value={formData.max_participants} onChange={onChange} min="1" />
      <InputField label="Remise (%)" type="number" name="discount_percentage" value={formData.discount_percentage ?? ''} onChange={onChange} step="0.01" min="0" max="100" />
      <InputField label="Localisation *" name="location" value={formData.location} onChange={onChange} required />
      <InputField
        label="Contact *"
        type="tel"
        name="Contact"
        value={formData.Contact}
        onChange={onChange}
        required
        pattern="^0\d{9}$"
        placeholder="Ex: 0794553778"
      />
      <SelectField
        label="Difficulté"
        name="difficulty_level"
        value={formData.difficulty_level}
        onChange={onChange}
        options={[
          { value: 'easy', label: 'Facile' },
          { value: 'moderate', label: 'Modérée' },
          { value: 'difficult', label: 'Difficile' }
        ]}
      />

      <SelectField
        label="Langue"
        name="language"
        value={formData.language}
        onChange={onChange}
        options={[
          { value: 'Français', label: 'Français' },
          { value: 'Anglais', label: 'Anglais' },
          { value: 'Arabe', label: 'Arabe' }
        ]}
      />

      <div className="col-span-full">
        <label className="block text-sm font-medium mb-2">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="col-span-full">
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
          required
        />
      </div>

      <div className="col-span-full">
        <label className="block text-sm font-medium mb-2">Matériel à apporter</label>
        <textarea
          name="what_to_bring"
          value={formData.what_to_bring}
          onChange={onChange}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
        />
      </div>

      <InputField label="Point de rencontre" name="meeting_point" value={formData.meeting_point} onChange={onChange} />

      <CheckboxField
        label="Guide inclus"
        name="is_guided"
        checked={formData.is_guided}
        onChange={onChange}
      />

      <CheckboxField
        label="Disponible"
        name="is_available"
        checked={formData.is_available}
        onChange={onChange}
      />

      <div className="col-span-full flex gap-4 mt-6">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
          {isEditing ? 'Mettre à jour' : 'Créer activité'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  </form>
);

const InputField = ({ label, type = 'text', name, value, onChange, required, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
      {...props}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center space-x-2  border-black ">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 border-black rounded focus:ring-blue-500 "
    />
    <label className="text-sm font-medium">{label}</label>
  </div>
);