"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('tour_announcements')
          .select('*')
          .eq('tour_announcement_id', id)
          .single();

      
        
        setActivity(data);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erreur : {error}
        <button 
          onClick={() => router.push('/activities')}
          className="block mt-4 text-blue-600 hover:underline"
        >
          Retour aux activités
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="relative h-96 rounded-xl overflow-hidden">
            <Image
              src={activity.images}
              alt={activity.name}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.target.src = '/default-activity.jpg';
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-black">{activity.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Difficulté : {activity.difficulty_level}
              </span>
              <span className="text-gray-600">📍 {activity.location}</span>
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6 text-gray-500">
              <h2 className="text-xl font-bold mb-2">Tarifs</h2>
              {activity.discount_percentage > 0 && (
                <p className="text-gray-500 line-through">
                  {activity.price} DZD
                </p>
              )}
              <p className="text-2xl font-bold text-green-600">
                {activity.new_price || activity.price} DZD
              </p>
              {activity.discount_percentage > 0 && (
                <p className="text-sm text-green-500 mt-1">
                  Économisez {activity.discount_percentage}%
                </p>
              )}
            </div>

            <p className="text-gray-600 mb-8 whitespace-pre-line">{activity.description}</p>

            <div className="bg-yellow-50 p-4 rounded-lg text-gray-500">
              <h2 className="text-xl font-bold mb-2">Dates</h2>
              <p className="text-gray-600">
                Du {new Date(activity.start_date).toLocaleDateString()} 
                au {new Date(activity.end_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Durée : {activity.duration}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className=" p-4 rounded-lg text-gray-500">
    <h2 className="text-xl font-bold mb-2">Informations complémentaires</h2>
    <div className="space-y-2">
      <p>
        <span className="font-semibold">Langue :</span> {activity.language}
      </p>
      <p>
        <span className="font-semibold">Participants maximum :</span> {activity.max_participants}
      </p>
      <p>
        <span className="font-semibold">Contact :</span> {activity.Contact}
      </p>
      <p>
        <span className="font-semibold">Visite guidée :</span> 
        {activity.is_guided ? ' Oui' : ' Non'}
      </p>
    </div>
  </div>
  <div className="bg-blue-50 p-4 rounded-lg mb-6">
  <h2 className="text-xl font-bold mb-2">Services inclus</h2>
  <ul className="list-disc pl-4">
    {activity.includes && activity.includes.split(',').length > 0 ? (
      activity.includes.split(',').map((item, index) => (
        <li key={index} className="text-gray-600">{item.trim()}</li>
      ))
    ) : (
      <li className="text-gray-600">Aucun service spécifié</li>
    )}
  </ul>
</div>
  <div className="bg-orange-50 p-4 rounded-lg text-gray-500">
    <h2 className="text-xl font-bold mb-2">Matériel requis</h2>
    <div className="whitespace-pre-line">
      {activity.what_to_bring || 'Aucun matériel spécifique requis'}
    </div>
  </div>
</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg h-fit sticky top-8 text-black">
          <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold">Informations pratiques</h2>
    <span className={`px-3 py-1 rounded-full text-sm ${
      activity.is_available 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {activity.is_available ? 'Disponible' : 'Complet'}
    </span>
  </div>
            <h2 className="text-2xl font-bold mb-4">Informations pratiques</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">📍 Lieu de rendez-vous</h3>
                <p className="text-gray-600">{activity.meeting_point || activity.location}</p>
              </div>

              <div>
                <h3 className="font-semibold">⏱ Horaires</h3>
                <p className="text-gray-600">
                  {activity.schedule || 'À confirmer lors de la réservation'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">📋 Ce qui est inclus</h3>
                <ul className="list-disc pl-4 text-gray-600">
                  {activity.includes?.split(',').map((item, index) => (
                    <li key={index}>{item.trim()}</li>
                  )) || <li>Non spécifié</li>}
                </ul>
              </div>
            </div>

            <button
              onClick={() => router.push(`/reservation/${activity.tour_announcement_id}`)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Réserver maintenant
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActivityDetailPage;