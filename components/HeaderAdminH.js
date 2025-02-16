'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Assure-toi que ce fichier existe et est bien configuré

const HeaderAdminH = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 border-gray-200 dark:bg-gray-800 shadow-lg">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-2">
          {/* Logo */}
          <svg
            className="w-8 h-8 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M5 9a7 7 0 1 1 8 6.93V21a1 1 0 1 1-2 0v-5.07A7.001 7.001 0 0 1 5 9Zm5.94-1.06A1.5 1.5 0 0 1 12 7.5a1 1 0 1 0 0-2A3.5 3.5 0 0 0 8.5 9a1 1 0 0 0 2 0c0-.398.158-.78.44-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="self-center text-xl font-bold text-white tracking-wider font-mono uppercase">
            TripDzAir Admin
          </span>
        </Link>

        <div className="flex md:order-2 space-x-2 items-center">
          {/* Menu Toggle Button */}
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-white rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
            aria-controls="navbar-cta"
            aria-expanded={isMenuOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          {/* Déconnecter Button for Large Screens */}
          <button
            onClick={handleLogout}
            className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-2 transition-all duration-300 ease-in-out md:block hidden"
          >
            Déconnecter
          </button>
        </div>

        {/* Menu for Small Screens */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "block mt-2" : "hidden"
          }`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                href="/AdminH"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white transition-colors duration-200"
              >
                Réservations
              </Link>
            </li>
            <li>
              <Link
                href="/gestionH"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white transition-colors duration-200"
              >
                Gérer Mes Offres
              </Link>
            </li>
            <li>
              <Link
                href="/gestionH"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white transition-colors duration-200"
              >
                Mon Hôtel
              </Link>
            </li>
            {/* Déconnecter Button in the mobile menu */}
            <li>
              <button
                onClick={handleLogout}
                className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-2 transition-all duration-300 ease-in-out md:hidden block"
              >
                Déconnecter
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default HeaderAdminH;