"use client";

import Header from '@/components/Header';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            ✅ Soumission réussie !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre restaurant est en attente de validation par nos administrateurs.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}