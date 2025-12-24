import React, { useState } from "react";
import { Heart, Users, Calendar, MapPin, Phone, Mail, Star, ArrowRight, Home, Activity, Stethoscope } from "lucide-react";
import ServiceSlider from "./ServiceSlider";
import LatestNewsLanding from "./LatestNewsLanding";
import FooterLatestNews from "./FooterLatestNews";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import About from "./About";
import NewsDetailPage from "./NewsDetailPage";
import Gallery from "./Gallery";
import News from "./News";
import Contact from "./Contact";

import { useLocation } from "react-router-dom";

function MainContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Panti Surya Logo" className="h-10 w-auto" />
            </div>
            {/* Desktop menu */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className={`text-gray-700 hover:text-[#4D273F] transition-colors ${location.pathname === "/" ? "font-bold" : ""}`}>
                Beranda
              </Link>
              <Link to="/tentang" className={`text-gray-700 hover:text-[#4D273F] transition-colors ${location.pathname === "/tentang" ? "font-bold" : ""}`}>
                Tentang
              </Link>
              <Link to="/gallery" className={`text-gray-700 hover:text-[#4D273F] transition-colors ${location.pathname === "/gallery" ? "font-bold" : ""}`}>
                Gallery
              </Link>
              <Link to="/news" className={`text-gray-700 hover:text-[#4D273F] transition-colors ${location.pathname === "/news" ? "font-bold" : ""}`}>
                News
              </Link>
              <Link to="/contact" className={`text-gray-700 hover:text-[#4D273F] transition-colors ${location.pathname === "/contact" ? "font-bold" : ""}`}>
                Contact
              </Link>
            </div>
            {/* Burger bar for mobile */}
            <div className="md:hidden flex items-center">
              <button className="text-[#4D273F] focus:outline-none" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg px-4 py-2 absolute w-full left-0 top-16 z-50">
            <Link to="/" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/" ? "font-bold" : ""}`} onClick={() => setMenuOpen(false)}>
              Beranda
            </Link>
            <Link to="/tentang" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/tentang" ? "font-bold" : ""}`} onClick={() => setMenuOpen(false)}>
              Tentang
            </Link>
            <Link to="/gallery" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/gallery" ? "font-bold" : ""}`} onClick={() => setMenuOpen(false)}>
              Gallery
            </Link>
            <Link to="/news" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/news" ? "font-bold" : ""}`} onClick={() => setMenuOpen(false)}>
              News
            </Link>
            <Link to="/contact" className={`block py-2 text-gray-700 hover:text-[#4D273F] ${location.pathname === "/contact" ? "font-bold" : ""}`} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </div>
        )}
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4D273F] to-[#6B3B56]">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url("/panti1.jpg")',
                  }}
                ></div>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="relative z-10 text-center px-2 xs:px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                      Rumah Usiawan
                      <br />
                      <span className="text-pink-200">Panti Surya</span>
                    </h1>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-pink-100 mb-8 leading-relaxed">Rumah yang penuh kasih untuk Oma dan Opa tercinta</p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center w-full sm:w-auto">
                      <Link
                        to="/tentang"
                        className="bg-white text-[#4D273F] px-6 xs:px-8 py-3 xs:py-4 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:bg-[#4D273F] hover:text-white hover:scale-105 hover:shadow-2xl border-2 border-[#4D273F]"
                      >
                        Pelajari Lebih Lanjut
                      </Link>
                      <a
                        href="https://wa.me/085888022475"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-white text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg font-semibold hover:bg-white hover:text-[#4D273F] transition-colors text-center"
                      >
                        Hubungi Kami
                      </a>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="animate-bounce">
                    <ArrowRight className="h-6 w-6 text-white rotate-90" />
                  </div>
                </div>
              </section>

              {/* Welcome Section */}
              <section id="about" className="py-6 xs:py-10 sm:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#4D273F] mb-6">Selamat Datang di Rumah Usiawan Panti Surya</h2>
                    <div className="w-24 h-1 bg-[#4D273F] mx-auto mb-8"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-8 lg:gap-12 items-center">
                    <div>
                      <div className="bg-white p-4 xs:p-6 sm:p-8 rounded-2xl shadow-lg">
                        <p className="text-lg leading-relaxed text-gray-700 mb-6">
                          Rumah Usiawan Panti Surya didirikan dan diresmikan penggunaannya pada tanggal
                          <span className="font-semibold text-[#4D273F]"> 31 Oktober 1974</span>. Terdaftar di Departemen Sosial yang diumumkan pada Lembaran Tambahan No.1026 dari Berita Negara Republik Indonesia tanggal 9 November 2007 no. 90.
                        </p>

                        <p className="text-lg leading-relaxed text-gray-700 mb-6">
                          Nama Panti Surya diambil dari nama Panti Jompo di negeri Belanda yang bernama
                          <span className="font-semibold text-[#4D273F]"> Het Zonnehuis</span>. Bertepatan di HUT nya yang ke 50 memberikan sumbangan yang dipergunakan untuk membangun Panti Surya ini.
                        </p>

                        <p className="text-lg leading-relaxed text-gray-700">
                          Rumah Usiawan ini didirikan untuk memenuhi kebutuhan akan rumah penampungan bagi orang tua yang tidak mempunyai rumah tinggal sendiri dan sebatang kara, namun dengan berjalannya waktu dan perkembangan jaman, sekarang
                          penghuni Rumah Usiawan Panti Surya tidak hanya yang sebatang kara saja tetapi juga mereka yang punya anak/keluarga namun karena satu dan lain hal tidak bisa tinggal bersama keluarganya.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 xs:space-y-6">
                      <div className="bg-[#4D273F] p-6 rounded-2xl text-white">
                        <div className="flex items-center mb-4">
                          <Calendar className="h-8 w-8 mr-3" />
                          <h3 className="text-xl font-bold">Didirikan</h3>
                        </div>
                        <p className="text-lg">31 Oktober 1974</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#4D273F]">
                        <div className="flex items-center mb-4">
                          <Users className="h-8 w-8 mr-3 text-[#4D273F]" />
                          <h3 className="text-xl font-bold text-[#4D273F]">Melayani</h3>
                        </div>
                        <p className="text-lg text-gray-700">Lansia dari berbagai latar belakang</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#4D273F]">
                        <div className="flex items-center mb-4">
                          <Heart className="h-8 w-8 mr-3 text-[#4D273F]" />
                          <h3 className="text-xl font-bold text-[#4D273F]">Misi</h3>
                        </div>
                        <p className="text-lg text-gray-700">Memberikan rumah yang penuh kasih</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activities Section */}
              <section id="activities" className="py-6 xs:py-10 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#4D273F] mb-6">Aktivitas Kegiatan Panti Surya</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">Kegiatan yang dilakukan Oma dan Opa di Panti Surya untuk menjaga kesehatan fisik, mental, dan spiritual mereka</p>
                    <div className="w-24 h-1 bg-[#4D273F] mx-auto mt-8"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xs:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
                    {[
                      { icon: Heart, title: "Persekutuan Doa", description: "Kegiatan spiritual bersama" },
                      { icon: Activity, title: "Pendalaman Alkitab", description: "Memperdalam iman dan pengetahuan" },
                      { icon: Users, title: "Edukasi Psikologi", description: "Kesehatan mental dan emosional" },
                      { icon: Activity, title: "Senam Yoga Lansia", description: "Olahraga yang disesuaikan dengan usia" },
                      { icon: Heart, title: "Memasak, Membuat Kue", description: "Aktivitas kreatif di dapur" },
                      { icon: Users, title: "Latihan Paduan Suara", description: "Mengasah bakat bernyanyi" },
                      { icon: MapPin, title: "Kunjungan ke Gereja", description: "Kegiatan ibadah bersama" },
                      { icon: Activity, title: "Bermain Game", description: "Hiburan dan rekreasi" },
                      { icon: MapPin, title: "Rekreasi, Jalan-jalan", description: "Wisata dan refreshing" },
                      { icon: Heart, title: "Merajut", description: "Kegiatan kerajinan tangan" },
                      { icon: Heart, title: "Doa Pagi ke Gereja", description: "Ibadah pagi bersama" },
                      { icon: Activity, title: "Senam Kesehatan", description: "Untuk hipertensi, diabetes, dan otak" },
                      { icon: Users, title: "Keterampilan Tangan", description: "Mengasah kreativitas dan motorik" },
                    ].map((activity, index) => (
                      <div key={index} className="bg-gray-50 p-4 xs:p-6 rounded-2xl hover:bg-[#4D273F] hover:text-white transition-all duration-300 group shadow-lg">
                        <activity.icon className="h-12 w-12 text-[#4D273F] group-hover:text-white mb-4 transition-colors" />
                        <h3 className="text-xl font-bold mb-2 text-[#4D273F] group-hover:text-white transition-colors">{activity.title}</h3>
                        <p className="text-gray-600 group-hover:text-pink-100 transition-colors">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section id="services" className="py-6 xs:py-10 sm:py-20 bg-gradient-to-br from-[#4D273F] to-[#6B3B56]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Services and Facility</h2>
                    <p className="text-xl text-pink-100 max-w-4xl mx-auto leading-relaxed">
                      Rumah Usiawan Panti Surya menyediakan fasilitas lengkap dan pelayanan berkualitas untuk Oma dan Opa. Dari pemeriksaan kesehatan rutin hingga kegiatan rohani dan jasmani, kami berkomitmen untuk memberikan kenyamanan dan
                      kesejahteraan terbaik.
                    </p>
                  </div>

                  {/* Simple slider for 6 cards */}
                  <ServiceSlider />
                </div>
              </section>

              {/* Testimonials Section - Redesigned */}
              <section className="py-6 xs:py-10 sm:py-20 bg-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 gap-0 md:grid-cols-2 items-stretch rounded-2xl overflow-hidden shadow-2xl min-h-[200px] md:min-h-[500px]">
                    {/* Left: Text & Testimonials */}
                    <div className="bg-[#4D273F] p-4 xs:p-6 md:p-10 flex flex-col justify-center text-white">
                      <h2 className="text-4xl md:text-4xl font-bold mb-8">Testimoni Oma dan Opa</h2>
                      <div className="space-y-6">
                        {[
                          "Senang sekali, seru, banyak teman, karena ada kegiatan bersama dan persekutuan. Kemudian ada juga pergi rekreasi ke luar, misalnya 3 bulan sekali dulu pernah ke Tretes, daerah Malang.",
                          "Senang sekali tinggal di panti, menemukan teman baru. Jadi walaupun sedih ditinggalkan, ada Tuhan yang menghibur saya.",
                          "Panti Surya tetap jaya, semakin banyak penghuni yang sebaya dan baik, selalu rukun dan damai sejahtera.",
                          "Sudah 13 tahun 3 bulan tinggal di panti, punya keterampilan menyanyi. Bisa disalurkan lewat paduan suara ke gereja-gereja misalnya GKI. Terus di sini juga suka berdoa tiap bangun pagi jam setengah 6 terus ada ibadah bersama.",
                        ].map((text, idx) => (
                          <p key={idx} className="italic text-lg leading-relaxed text-pink-100">
                            "{text}"
                          </p>
                        ))}
                      </div>
                      {/* Stats */}
                      <div className="flex gap-6 xs:gap-8 md:gap-12 mt-8 xs:mt-12 flex-wrap justify-center">
                        <div className="flex flex-col items-center">
                          <Heart className="h-8 w-8 text-pink-200 mb-2" />
                          <span className="text-3xl font-bold text-pink-200">15</span>
                          <span className="font-semibold text-pink-100 mt-1">Pengurus</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Users className="h-8 w-8 text-pink-200 mb-2" />
                          <span className="text-3xl font-bold text-pink-200">31</span>
                          <span className="font-semibold text-pink-100 mt-1">Pengasuh</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Star className="h-8 w-8 text-pink-200 mb-2" />
                          <span className="text-3xl font-bold text-pink-200">80</span>
                          <span className="font-semibold text-pink-100 mt-1">Orang Tua</span>
                        </div>
                      </div>
                    </div>
                    {/* Right: Full Photo, no card */}
                    <div className="relative w-full h-[200px] xs:h-[300px] md:h-full">
                      <img src="/image1.jpg" alt="Oma Opa Testimoni" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Latest News Section */}
              <section className="py-6 xs:py-10 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#4D273F] mb-6">Latest News</h2>
                    {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore Our Completed Projects! Consectetur adipiscing elit tellus, luctus pulvinar dapibus leo consectetur luctus nec.</p> */}
                    <div className="w-24 h-1 bg-[#4D273F] mx-auto mt-8"></div>
                  </div>
                  <LatestNewsLanding />
                  {/* <div className="grid grid-cols-1 gap-4 xs:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
                    {[
                      {
                        title: "Perayaan HUT Ke-50 Panti Surya",
                        excerpt: "Perayaan istimewa bersama seluruh penghuni dan keluarga besar Panti Surya",
                        date: "15 November 2024",
                      },
                      {
                        title: "Program Senam Pagi Baru",
                        excerpt: "Memulai program senam pagi khusus untuk menjaga kesehatan Oma dan Opa",
                        date: "10 November 2024",
                      },
                      {
                        title: "Kunjungan Relawan Mahasiswa",
                        excerpt: "Mahasiswa dari universitas lokal mengadakan kegiatan bakti sosial",
                        date: "5 November 2024",
                      },
                    ].map((news, index) => (
                      <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                        <div className="h-48 bg-gradient-to-br from-[#4D273F] to-[#6B3B56]"></div>
                        <div className="p-6">
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Calendar className="h-4 w-4 mr-2" />
                            {news.date}
                          </div>
                          <h3 className="text-xl font-bold text-[#4D273F] mb-3 leading-tight">{news.title}</h3>
                          <p className="text-gray-600 leading-relaxed mb-4">{news.excerpt}</p>
                          <Link to="/news_detail" className="text-[#4D273F] font-semibold hover:text-[#6B3B56] flex items-center group">
                            Baca Selengkapnya
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div> */}
                </div>
              </section>

              {/* Dikelola Oleh Section */}
              <section className="py-4 xs:py-8 sm:py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#4D273F] mb-8">Dikelola Oleh</h3>
                  <div className="flex flex-wrap justify-center items-center gap-2 xs:gap-4 sm:gap-8 bg-[#4D273F] py-4 xs:py-6 sm:py-8 rounded-2xl">
                    {/* Ganti src logo sesuai file logo yang tersedia di public/ */}
                    <img src="/gki_emaus.png" alt="Logo 1" className="h-20 xs:h-32 sm:h-48 w-auto object-contain" />
                    <img src="/gki_ngagel.png" alt="Logo 2" className="h-20 xs:h-32 sm:h-48 w-auto object-contain" />
                    <img src="/gki_sulung.png" alt="Logo 3" className="h-20 xs:h-32 sm:h-48 w-auto object-contain" />
                    <img src="/gki_resud.jpg" alt="Logo 4" className="h-20 xs:h-32 sm:h-48 w-auto object-contain" />
                    <img src="/gki_dipo.png" alt="Logo 5" className="h-20 xs:h-32 sm:h-48 w-auto object-contain" />
                  </div>
                </div>
              </section>

              {/* Footer - Redesigned */}
              <footer id="contact" className="bg-[#222] text-white py-6 xs:py-10 sm:py-16">
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
                    {/* Center Left: Latest News - Dynamic from API */}
                    <FooterLatestNews />
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
            </>
          }
        />
        <Route path="/tentang" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/news_detail/:id" element={<NewsDetailPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}

export default App;
