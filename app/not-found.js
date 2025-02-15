import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="relative bg-blue-900">
      <Header />
      <main className="flex items-center justify-center min-h-screen text-white relative overflow-hidden">
        <div className="text-center z-10">
          {/* Animated dots */}
          <div className="flex justify-center gap-2 mb-4 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          {/* Animated 404 text */}
          <h1 className="text-6xl font-bold tracking-wider text-yellow-400 animate-bounce">
            404
          </h1>
          <p className="mt-4 text-xl font-medium text-gray-400 animate-fade-in">
            Oops! The page you're looking for isn't available.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4 animate-slide-in">
            <a 
              href="/" 
              className="px-6 py-3 mb-20 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-600 transition-all duration-500 transform hover:scale-105"
            >
              Go Home
            </a>
            <a 
              href="/contact" 
              className="px-6 py-3 mb-20 border border-yellow-500 text-yellow-500 font-semibold rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-500 transform hover:scale-105"
            >
              Contact Support
            </a>
          </div>
          
          {/* Background Animations */}
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            {/* Glowing circles */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-20 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 opacity-30 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-20 rounded-full animate-bounce"></div>
            {/* Pulsing background */}
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-500 opacity-10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
