"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

const HeaderAdminA = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Nouvel état pour le rôle
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        // Récupération du rôle depuis la table users
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (userData) setUserRole(userData.role);
      }
      setUser(user);
    };

    fetchUserAndRole();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        setUserRole(userData?.role);
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuOpen && !e.target.closest('.profile-menu')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 border-gray-200 shadow-lg relative z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo et nom du site */}
        <Link href="/ajouteract" className="flex items-center space-x-2">
          <svg
            className="w-8 h-8 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
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
            TripDzAir
          </span>
           <span className="self-center text-xl font-bold text-white tracking-wider font-mono uppercase">
            Admin 
          </span>
        </Link>
       
        <div className="flex md:order-2 space-x-2 items-center">
          {/* Icône Réservations */}
          <Link
            href="/reservations"
            title="Mes réservations"
            passHref
            className="flex items-center justify-center p-0 text-white hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-100"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 3v4a1 1 0 0 1-1 1H5m4 6 2 2 4-4m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
              />
            </svg>
          </Link>

          {/* Gestion utilisateur */}
          {user ? (
            <div className="relative profile-menu">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-1 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">
                  {user.email?.split('@')[0] || 'Mon compte'}
                </span>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </button>

              {profileMenuOpen && (
    <div 
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Ajout du lien Admin */}
      
     
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Déconnexion
      </button>
    </div>
  )}
            </div>
          ) : (
            <Link href="/auth" passHref>
              <button
                type="button"
                className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-2 transition-all duration-300 ease-in-out"
              >
                Get started
              </button>
            </Link>
          )}

          {/* Bouton menu mobile */}
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
        </div>

        {/* Menu principal */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "block mt-2" : "hidden"
          }`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-8 md:flex-row md:mt-0 md:border-0">
            <li>
              <Link
                href="/adminactivité"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 relative group transition-colors duration-200"
              >
                Ajouter une activité
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 relative group transition-colors duration-200"
              >
                Gérer mes offres
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/restaurant"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 relative group transition-colors duration-200"
              >
                Restaurants
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/activities"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 relative group transition-colors duration-200"
              >
                Activities
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 relative group transition-colors duration-200"
              >
                Contact
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default HeaderAdminA;