import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <svg
                className="w-11 h-12 text-white"
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
              <span className="self-center text-2xl font-semibold whitespace-nowrap font-mono uppercase">TripDzAir</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-300 uppercase">Resources</h2>
              <ul className="font-medium">
                <li className="mb-4"><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/hotels" className="hover:underline">Hotels</a></li>
                <li><a href="/restaurants" className="hover:underline">Restaurants</a></li>
                <li><a href="/activities" className="hover:underline">Activities</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-300 uppercase">Je suis </h2>
              <ul className="font-medium">
                <li className="mb-4"><a href="/AdminH" className="hover:underline">admin hotel </a></li>
                <li><a href="#" className="hover:underline">guide touristique</a></li>
                <li><a href="#" className="hover:underline">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-300 uppercase">Newsletter</h2>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-gray-600 rounded hover:bg-gray-700 transition-all"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">© 2025 TripDzAir. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}