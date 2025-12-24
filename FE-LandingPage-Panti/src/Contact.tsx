import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FooterLatestNews from "./FooterLatestNews";

const Contact: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col items-center justify-center">
      {/* Mobile Navbar */}
      <nav className="md:hidden w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <button className="text-[#4D273F] focus:outline-none" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="bg-white shadow-lg px-4 py-2 w-full absolute left-0 top-full z-50">
            <Link to="/" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/" ? "font-bold" : ""}`}>
              Beranda
            </Link>
            <Link to="/tentang" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/tentang" ? "font-bold" : ""}`}>
              Tentang
            </Link>
            <Link to="/gallery" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/gallery" ? "font-bold" : ""}`}>
              Gallery
            </Link>
            <Link to="/news" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/news" ? "font-bold" : ""}`}>
              News
            </Link>
            <Link to="/contact" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/contact" ? "font-bold" : ""}`}>
              Contact
            </Link>
          </div>
        )}
      </nav>
      <h1 className="text-4xl font-bold text-[#4D273F] mb-8">Contact Us</h1>
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-8 mb-12">
          {/* Call Now */}
          <div className="bg-gray-100 rounded-2xl shadow flex flex-col md:flex-row items-center p-6 gap-4 md:gap-6 min-h-[140px]">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4D273F] shrink-0">
              <i className="fas fa-phone text-white text-3xl" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-lg text-gray-500 font-medium mb-1">Call Now</span>
              <span className="text-sm md:text-base font-semibold text-[#003049] tracking-wide">(031) 8420756</span>
            </div>
          </div>
          {/* Email Now */}
          <div className="bg-gray-100 rounded-2xl shadow flex flex-col md:flex-row items-center p-6 gap-4 md:gap-6 min-h-[140px]">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4D273F] shrink-0">
              <i className="fas fa-envelope text-white text-3xl" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left overflow-x-auto w-full">
              <span className="text-lg text-gray-500 font-medium mb-1">Email Now</span>
              <span className="text-lg md:text-base font-semibold text-[#003049] tracking-wide max-w-full whitespace-nowrap truncate">rumahusiawanpantisurya@gmail.com</span>
            </div>
          </div>
          {/* Visit Now */}
          <div className="bg-gray-100 rounded-2xl shadow flex flex-col md:flex-row items-center p-6 gap-4 md:gap-6 min-h-[140px]">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4D273F] shrink-0">
              <i className="fas fa-map-marker-alt text-white text-3xl" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-lg text-gray-500 font-medium mb-1">Visit Now</span>
              <span className="text-lg md:text-base font-semibold text-[#003049] tracking-wide leading-tight">Panti Wedha Surya</span>
            </div>
          </div>
        </div>
        <div className="text-lg text-gray-700 mb-8 leading-relaxed">
          Rumah Usiawan Panti Surya terletak di Surabaya Selatan tepatnya di Jl. Jemur Andayani XVII/19 Surabaya.
          <br />
          Jemur Andayani dapat disebut juga Jemur Andayani.
        </div>
        <div className="space-y-5 text-base text-gray-700">
          <div>
            <span className="font-semibold">DARI KOTA :</span>
            <span className="ml-2">Darmo – Wonokromo – Jenderal Ahmad Yani – Belok kiri ke Raya Jemur Andayani, Pomp Bensin (kiri) – menyeberang/Belok kanan ke Jl. Jemur Andayani XVII.19 – Panti Surya (Depan Sekolah Petra Jemursari)</span>
          </div>
          <div>
            <span className="font-semibold">DARI MANYAR :</span>
            <span className="ml-2">
              Raya Manyar – Raya Nginden – Raya Prapen (Panjangjiwo) – Raya Jemursari – Belok kiri ke Raya Jemur Andayani, Pomp Bensin (kiri) – menyeberang/Belok kanan ke kompleks Jemur Handayani – Panti Surya (depan Sekolah Petra Jemursari)
            </span>
          </div>
          <div>
            <span className="font-semibold">DARI RUNGKUT :</span>
            <span className="ml-2">Kali Rungkut – Belok kiri Rungkut Industri Raya – Kendangsari – Raya Jemur Andayani – Belok kiri ke kompleks Jemur Handayani – Panti Surya (Depan Sekolah Petra Jemursari)</span>
          </div>
        </div>
        {/* Google Maps Embed */}
        <div className="w-full pb-20 flex justify-center mt-12">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7496.556775569473!2d112.73872!3d-7.330403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb40354956bf%3A0xa0887439d7094756!2sPanti%20Werdha%20Surya!5e0!3m2!1sen!2sen!4v1562002563953!5m2!1sen!2sbd"
            width="1000"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Panti Werdha Surya"
          ></iframe>
        </div>
      </div>
      <footer id="contact" className="w-full bg-[#222] text-white py-6 xs:py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 xs:gap-6 sm:grid-cols-2 md:grid-cols-4 sm:gap-8 md:gap-12">
            {/* Left: Logo, Address, Social */}
            <div className="flex flex-col items-start">
              <img src="/logo.png" alt="Panti Surya Logo" className="mb-4 xs:mb-6 h-10 xs:h-14 sm:h-20 w-auto" />
              <p className="mb-4 xs:mb-6 text-base xs:text-lg leading-relaxed">
                Jl. Jemur Andayani XVII No.19,
                <br />
                Siwalankerto, Kec. Wonocolo,
                <br />
                Surabaya, Jawa Timur 60237
              </p>
              <div className="flex gap-2 xs:gap-4">
                <a href="https://www.facebook.com/profile.php?id=100010573608055" className="bg-[#4D273F] p-3 rounded-lg hover:bg-pink-700 transition-colors">
                  <i className="fab fa-facebook-f text-white text-xl" />
                </a>
                <a href="https://www.tiktok.com/@panti.surya?" className="bg-[#4D273F] p-3 rounded-lg hover:bg-pink-700 transition-colors">
                  <i className="fab fa-tiktok text-white text-xl" />
                </a>
                <a href="https://www.youtube.com/@PantiSurya" className="bg-[#4D273F] p-3 rounded-lg hover:bg-pink-700 transition-colors">
                  <i className="fab fa-youtube text-white text-xl" />
                </a>
                <a href="https://www.instagram.com/pantisurya?" className="bg-[#4D273F] p-3 rounded-lg hover:bg-pink-700 transition-colors">
                  <i className="fab fa-instagram text-white text-xl" />
                </a>
              </div>
            </div>
            {/* Center Left: Latest News */}
            <div>
              <FooterLatestNews />
            </div>
            {/* Center Right: Donation */}
            <div>
              <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-4">Donation</h3>
              <div className="border-b border-pink-900 mb-2 xs:mb-4 w-2/3" />
              <p className="mb-1 xs:mb-2 text-sm xs:text-base">No. Rek. An. Yayasan Panti Surya</p>
              <p className="font-bold text-sm xs:text-base">BCA : 464 311 4103</p>
            </div>
            {/* Right: Opening Hours */}
            <div>
              <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-4">Opening Hours</h3>
              <div className="border-b border-pink-900 mb-2 xs:mb-4 w-2/3" />
              <div className="space-y-1 xs:space-y-2">
                {[
                  { day: "Senin", time: "08.00 - 16.00" },
                  { day: "Selasa", time: "08.00 - 16.00" },
                  { day: "Rabu", time: "08.00 - 16.00" },
                  { day: "Kamis", time: "08.00 - 16.00" },
                  { day: "Jumat", time: "08.00 - 16.00" },
                  { day: "Sabtu - Minggu", time: "08.00 - 13.00" },
                ].map((row, idx) => (
                  <div key={idx} className="flex justify-between border-b border-gray-700 py-0.5 xs:py-1 text-sm xs:text-base">
                    <span>{row.day}</span>
                    <span>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-pink-900 mt-6 xs:mt-12 pt-4 xs:pt-8 text-center">
            <p className="text-gray-300 text-xs xs:text-sm">© 2025 Rumah Usiawan Panti Surya. Dibuat dengan ❤️ untuk Oma dan Opa tercinta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
