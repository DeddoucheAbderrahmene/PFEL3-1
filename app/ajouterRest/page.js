"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const AddRestaurantPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cuisine_type: '',
    description: '',
    phone_number: '',
    email: '',
    speciality: '',
    opening_hours: '',
    star_rating:'',
    dress_code: '',
    payment_methods: [],
    additional_notes: ''
  });
  const [mainImage, setMainImage] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sanitizeFileName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user || authError) {
        throw new Error('Vous devez être connecté pour ajouter un restaurant');
      }
  
      // Validation
      if (!formData.name || !mainImage || !menuImage) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }
  
      // Préparation du chemin de stockage
      const sanitizedName = sanitizeFileName(formData.name);
      const folderPath = `Restaurants_photos/${user.id}/${sanitizedName}/`;
  
      // Upload de l'image principale
      const mainExt = mainImage.name.split('.').pop();
      const mainImagePath = `${folderPath}main.${mainExt}`;
      
      const { error: mainError } = await supabase.storage
        .from('Restaurants_photos')
        .upload(mainImagePath, mainImage);
  
      if (mainError) throw new Error(`Erreur upload image : ${mainError.message}`);
  
      // Upload de l'image du menu
      const menuExt = menuImage.name.split('.').pop();
      const menuImagePath = `${folderPath}menu.${menuExt}`;
  
      const { error: menuError } = await supabase.storage
        .from('Restaurants_photos')
        .upload(menuImagePath, menuImage);
  
      if (menuError) throw new Error(`Erreur upload menu : ${menuError.message}`);
  
      // Récupération des URLs
      const { data: { publicUrl: mainImageUrl } } = supabase.storage
        .from('Restaurants_photos')
        .getPublicUrl(mainImagePath);
  
      const { data: { publicUrl: menuImageUrl } } = supabase.storage
        .from('Restaurants_photos')
        .getPublicUrl(menuImagePath);
  
      // Insertion dans la base de données
      const { error: dbError } = await supabase
  .from('restaurants')
  .insert([{
    ...formData,
    owner_id: user.id,
    images: mainImageUrl,
    menu: menuImageUrl,
    status: 'pending', // Ajout du statut
    restaurant_id: crypto.randomUUID()
  }]);
      if (dbError) throw dbError;
  
      router.push('/reject');
    } catch (err) {
      setError(err.message);
      console.error('Erreur complète :', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
  <Header />
  
  <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-3xl font-bold mb-8 text-gray-900">Ajouter un nouveau restaurant</h1>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border-2 border-red-200">
          {error}
        </div>
      )}

      {/* Champ nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du restaurant *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   transition-all text-gray-900 bg-white"
          required
        />
      </div>
      <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Email de contact
    </label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
    />
  </div>
{/* Horaires d'ouverture */}
<div>
   
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Horaires d'ouverture *
  </label>
  <textarea
    name="opening_hours"
    value={formData.opening_hours}
    onChange={handleInputChange}
    className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
             transition-all text-gray-900 bg-white"
    rows="4"
    placeholder="Exemple : 
Lundi: 11h30 - 14h30, 19h - 23h
Mardi: Fermé
Mercredi à Vendredi: 12h - 14h30, 19h - 00h
Samedi-Dimanche: 11h - 00h"
  />
</div>
  </div>

  {/* Nombre d'étoiles */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nombre d'étoiles (1-5)
    </label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => setFormData({ ...formData, star_rating: rating })}
          className={`text-3xl ${
            rating <= formData.star_rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-500 transition-colors`}
        >
          ★
        </button>
      ))}
    </div>
    </div>
  {/* Spécialité */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Spécialité culinaire
    </label>
    <input
      type="text"
      name="speciality"
      value={formData.speciality}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
    />
  </div>

  {/* Code vestimentaire */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Code vestimentaire
    </label>
    <select
      name="dress_code"
      value={formData.dress_code}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
    >
      <option value="">Non spécifié</option>
      <option value="Casual">Décontracté</option>
      <option value="Smart Casual">Smart casual</option>
      <option value="Formal">Formel</option>
    </select>
  </div>

  {/* Moyens de paiement */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Moyens de paiement acceptés
    </label>
    <div className="grid grid-cols-2 gap-2 text-black">
      {['Espèces', 'Carte bancaire', 'Mobile'].map((method) => (
        <label key={method} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
          <input
            type="checkbox"
            name="payment_methods"
            value={method}
            checked={formData.payment_methods.includes(method)}
            onChange={(e) => {
              const newMethods = e.target.checked
                ? [...formData.payment_methods, e.target.value]
                : formData.payment_methods.filter(m => m !== e.target.value);
              setFormData({ ...formData, payment_methods: newMethods });
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">{method}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Notes supplémentaires */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Informations complémentaires
    </label>
    <textarea
      name="additional_notes"
      value={formData.additional_notes}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white"
      rows="3"
      placeholder="Services spéciaux, restrictions alimentaires, etc."
    />
  </div>
  
      {/* Image principale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image principale *
        </label>
        <div className="flex items-center gap-4 p-2 border-2 border-gray-400 rounded-lg bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainImage(e.target.files[0])}
            className="block w-full text-sm text-gray-900
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-2 file:border-gray-400
                     file:text-gray-900 file:bg-gray-100 
                     hover:file:bg-gray-200 file:transition-colors"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Formats acceptés: JPG, PNG, WEBP</p>
      </div>

      {/* Image du menu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image du menu *
        </label>
        <div className="flex items-center gap-4 p-2 border-2 border-gray-400 rounded-lg bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMenuImage(e.target.files[0])}
            className="block w-full text-sm text-gray-900
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-2 file:border-gray-400
                     file:text-gray-900 file:bg-gray-100 
                     hover:file:bg-gray-200 file:transition-colors"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Photo/scan du menu (format image)</p>
      </div>

      {/* Autres champs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   transition-all text-gray-900 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de cuisine
        </label>
        <input
          type="text"
          name="cuisine_type"
          value={formData.cuisine_type}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   transition-all text-gray-900 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border-2 border-gray-400 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   transition-all text-gray-900 bg-white"
          rows="4"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                 hover:bg-blue-700 disabled:bg-gray-400 transition-colors 
                 font-semibold text-lg border-2 border-blue-700"
      >
        {loading ? 'Envoi en cours...' : 'Ajouter le restaurant'}
      </button>
    </form>
  </main>
</div>
  );
};

export default AddRestaurantPage;