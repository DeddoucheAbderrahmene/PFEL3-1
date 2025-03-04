"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityOfferCard from "@/components/ActivityOfferCard";
export default function HotelsPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const animatedPhrase = "TROUVER DES ACTIVITÉS OÙ QUE VOUS SOYEZ";
  const getColor = (percentage) => {
    const colors = [
      { r: 0, g: 217, b: 255 },
      { r: 148, g: 0, b: 211 },
      { r: 255, g: 0, b: 106 },
      { r: 255, g: 69, b: 0 },
    ];
    const index = Math.floor(percentage * (colors.length - 1));
    const { r, g, b } = colors[index];
    return `rgb(${r}, ${g}, ${b})`;
  };
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('tour_announcements')
          .select(`
            tour_announcement_id,
            name,
            description,
            price,
            new_price,
            discount_percentage,
            start_date,
            end_date,
            location,
            images,
            duration,
            difficulty_level
          `)
          .eq('is_available', true);

        if (error) throw error;
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="bg-gray-50 flex-grow">
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
          <img
            src="https://mariamhamli.files.wordpress.com/2015/11/cc.png"
            alt="Hôtel"
            className="absolute z-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-4">
            <div className="relative flex flex-wrap justify-center">
              {animatedPhrase.split("").map((char, i) => (
                <span
                  key={i}
                  className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{
                    animation: `fadeInOut 2s ${i * 0.1}s infinite`,
                    textShadow: `0 0 10px ${getColor(i / (animatedPhrase.length - 1))},
                                 0 0 20px ${getColor(i / (animatedPhrase.length - 1))},
                                 0 0 30px ${getColor(i / (animatedPhrase.length - 1))}`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-[80%] sm:top-auto sm:bottom-[-40px] z-20 w-[90%] max-w-3xl">{/* ... (garder le même formulaire) */}
          </div>
        </div>
        <section className="px-6 py-16 mt-20">
          <div className="max-w-screen-xl mx-auto text-center">
            {loading ? (
              <div className="text-center py-8">Chargement des activités...</div>
            ) : error ? (
              <div className="text-red-500 py-8">Erreur : {error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activities.map((activity) => (
                  <ActivityOfferCard 
                    key={activity.tour_announcement_id} 
                    activity={activity} 
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div> );}