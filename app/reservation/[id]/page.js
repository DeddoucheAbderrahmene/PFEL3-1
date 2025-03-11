"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ReservationForm from '@/components/ReservationForm';

export default function ReservationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentification requise');

      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          user_id: user.id,
          reservation_type: 'tour_activity',
          reservation_type_id: id,
          ...formData,
          payment_status: 'to_pay',
          status: 'confirmed'
        }])
        .select(`
          *,
          tour_announcements:reservation_type_id (
            name,
            start_date,
            meeting_point
          )
        `);

      if (error) throw error;

      setReservationDetails(data[0]);
      setShowConfirmation(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🎉 Réservation confirmée !</h2>
          <button 
            onClick={() => setShowConfirmation(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {reservationDetails && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{reservationDetails.tour_announcements.name}</h3>
              <p className="text-sm">
                📅 Le {new Date(reservationDetails.tour_announcements.start_date).toLocaleDateString()}
              </p>
              <p className="text-sm">
                📍 {reservationDetails.tour_announcements.meeting_point}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Référence : {reservationDetails.reservation_id}</p>
              <p className="text-sm">👥 Participants : {reservationDetails.number_of_people}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm">💵 Paiement : À régler sur place</p>
              <p className="text-xs mt-2">Présentez cette confirmation à votre guide</p>
            </div>

            <button
              onClick={() => {
                setShowConfirmation(false);
                router.push('/');
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">Réserver cette activité</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <ReservationForm 
          onSubmit={handleSubmit} 
          loading={loading}
        />

        {showConfirmation && <ConfirmationModal />}
      </main>
    </div>
  );
}