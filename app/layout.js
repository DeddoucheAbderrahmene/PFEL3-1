import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'flowbite';  // Importer Flowbite
import './globals.css'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  icons: {
    icon: './pin-map-location-svgrepo-com.png',
},
  title: "TRIPDZAIR",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
