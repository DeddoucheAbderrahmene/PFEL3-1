"use client";
import { useState } from 'react';

export default function ReservationForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    number_of_people: 1,
    special_request: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md text-black">
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Nombre de participants *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          required
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={formData.number_of_people}
          onChange={(e) => setFormData({ ...formData, number_of_people: e.target.value })}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Demandes spéciales
        </label>
        <textarea
          className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500"
          placeholder="Préférences alimentaires, besoins spécifiques..."
          value={formData.special_request}
          onChange={(e) => setFormData({ ...formData, special_request: e.target.value })}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
      >
        {loading ? 'Validation...' : 'Confirmer la réservation'}
      </button>
    </form>
  );
}