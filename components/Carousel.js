"use client";
import { useState, useEffect } from "react";

const images = [
  "https://www.leguidetouristique.com/wp-content/uploads/2022/02/parc-ahaggar-1024x684.jpg",
  "https://www.leguidetouristique.com/wp-content/uploads/2022/02/timgad.jpg",
  "https://www.leguidetouristique.com/wp-content/uploads/2022/02/casba-1536x1024.jpg",
  "https://www.leguidetouristique.com/wp-content/uploads/2022/02/m-ont-chelia-1024x638.jpg",
  "https://www.leguidetouristique.com/wp-content/uploads/2022/02/parc-ahaggar-1024x684.jpg",
  "https://content.r9cdn.net/rimg/dimg/92/01/0c6091fc-city-20461-167be288f16.jpg?crop=true&width=1020&height=498",
];

const staticPhrase = "TROUVER VOTRE";
const dynamicPhrases = ["HÔTEL", "RESTAURANT", "ACTIVITÉ TOURISTIQUE"];
const colors = [
  { r: 0, g: 217, b: 255 }, // Bleu
  { r: 148, g: 0, b: 211 }, // Violet
  { r: 255, g: 0, b: 106 }, // Rose
  { r: 255, g: 69, b: 0 },  // Orange
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Animation du carrousel
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(carouselInterval);
  }, []);

  // Animation du texte
  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
    }, 3000);

    return () => clearInterval(textInterval);
  }, []);

  // Fonction pour générer un dégradé de couleur
  const getColor = (percentage) => {
    const segments = 1 / (colors.length - 1);
    const index = Math.min(Math.floor(percentage / segments), colors.length - 2);
    const segmentPercent = (percentage - index * segments) / segments;
    const start = colors[index];
    const end = colors[index + 1];
    const r = start.r + (end.r - start.r) * segmentPercent;
    const g = start.g + (end.g - start.g) * segmentPercent;
    const b = start.b + (end.b - start.b) * segmentPercent;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Carrousel d'images */}
      <div
        className="flex transition-transform duration-600 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full h-[500px] flex-shrink-0">
            <img
              src={img}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlay de texte néon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
        {/* Texte statique "TROUVER VOTRE" */}
        <div className="flex flex-wrap justify-center">
          {staticPhrase.split("").map((char, i) => (
            <span
              key={`static-${i}`}
              className="font-bold text-white sm:text-3xl text-4xl md:text-5xl lg:text-6xl"
              style={{
                textShadow: `0 0 10px ${getColor(i / (staticPhrase.length - 1))},
                             0 0 20px ${getColor(i / (staticPhrase.length - 1))},
                             0 0 30px ${getColor(i / (staticPhrase.length - 1))}`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>

        {/* Texte dynamique avec animation */}
        <div className="mt-4 flex justify-center">
          {dynamicPhrases[currentPhraseIndex].split("").map((char, i) => (
            <span
              // On inclut currentPhraseIndex dans la clé pour forcer le re-mount à chaque changement
              key={`dynamic-${currentPhraseIndex}-${i}`}
              className="font-bold text-white sm:text-3xl text-4xl md:text-5xl lg:text-6xl"
              style={{
                animation: `fadeIn 0.5s ${i * 0.1}s forwards`,
                textShadow: `0 0 10px ${getColor(i / (dynamicPhrases[currentPhraseIndex].length - 1))},
                              0 0 20px ${getColor(i / (dynamicPhrases[currentPhraseIndex].length - 1))},
                              0 0 30px ${getColor(i / (dynamicPhrases[currentPhraseIndex].length - 1))}`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      
      
    </div>
  );
}
