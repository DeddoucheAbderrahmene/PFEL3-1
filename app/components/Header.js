"use client";

import { useState } from "react";
import Link from "next/link";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 border-gray-200 dark:bg-gray-800 shadow-lg">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"> {/* Reduced back to p-4 for small screens */}
        <Link href="/" className="flex items-center space-x-2"> {/* Reduced space-x */}
          {/* Logo */}
          <svg
            className="w-8 h-8 text-white"  // Reduced size
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
          <span className="self-center text-xl font-bold text-white tracking-wider font-mono uppercase">  {/* Reduced font size */}
            TripDzAir
          </span>
        </Link>

        <div className="flex md:order-2 space-x-2 items-center"> {/* Reduced space-x */}
          {/*  Mes Reservations Button */}
          <Link
            href="/reservations"
            title="Mes réservations"
            passHref
            className="flex items-center justify-center p-0 text-white hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-100 dark:text-white" // Reduced size
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

          {/* Get Started Button */}
          <Link href="/auth" passHref>
            <button
              type="button"
              className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-2 transition-all duration-300 ease-in-out" // Reduced font size and padding
            >
              Get started
            </button>
          </Link>
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

        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "block mt-2" : "hidden"
          }`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                href="/"
                className="block py-2 px-3 md:p-0 text-white bg-gray-700 rounded-lg md:bg-transparent md:text-gray-300 hover:text-gray-100 dark:text-white md:dark:text-gray-400 relative group transition-colors duration-200"
              >
                Home
                 <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 md:group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/hotels"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white dark:hover:bg-gray-700 relative group transition-colors duration-200"
              >
                Hotels
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 md:group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/restaurant"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white dark:hover:bg-gray-700 relative group transition-colors duration-200"
              >
                Restaurants
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 md:group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/activities"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white dark:hover:bg-gray-700 relative group transition-colors duration-200"
              >
                Activities
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 md:group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block py-2 px-3 md:p-0 text-white hover:text-gray-100 dark:text-white dark:hover:bg-gray-700 relative group transition-colors duration-200"
              >
                Contact
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 md:group-hover:scale-x-100"></span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;