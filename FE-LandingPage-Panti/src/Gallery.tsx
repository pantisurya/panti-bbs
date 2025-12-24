import React, { useState, useEffect } from "react";
import { getGalery } from "./services/api";
import FooterLatestNews from "./FooterLatestNews";

// Images will be fetched from API

const Gallery: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<Array<{ gambar: string; judul: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await getGalery();
        if (Array.isArray(data)) {
          setGalleryImages(data.filter((item: any) => item.gambar).map((item: any) => ({ gambar: item.gambar, judul: item.judul })));
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-[#4D273F] mb-8">Photo Gallery</h1>
      {loading ? (
        <div className="text-center py-20 text-lg text-gray-500">Loading gallery...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {galleryImages.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 text-xl py-20">No images found.</div>
          ) : (
            galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-50 group cursor-pointer"
                onClick={() => {
                  setPhotoIndex(idx);
                  setIsOpen(true);
                }}
              >
                <img src={img.gambar.startsWith("http") ? img.gambar : img.gambar} alt={img.judul || `Gallery ${idx + 1}`} className="object-cover w-full h-72 transition-transform duration-300 group-hover:scale-105" />
                {/* Overlay with icon */}
                <div className="absolute inset-0 bg-[#4D273F]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.828 12.828a4 4 0 015.656 0M15 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            ))
          )}
          {/* Hidden images for preloading */}
          <div style={{ display: "none" }}>
            {galleryImages.map((img, idx) => (
              <img key={idx} src={img.gambar} alt="preload" />
            ))}
          </div>
        </div>
      )}
      {isOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <button className="absolute top-6 right-8 text-white hover:text-red-500 text-4xl font-bold z-50" onClick={() => setIsOpen(false)} aria-label="Close">
            &times;
          </button>
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            <div className="relative w-full flex items-center justify-center" style={{ minHeight: "350px" }}>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4D273F] text-white rounded-full p-2 shadow-lg hover:bg-pink-700 z-10"
                onClick={() => setPhotoIndex((photoIndex + galleryImages.length - 1) % galleryImages.length)}
                aria-label="Previous"
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="overflow-hidden w-full flex items-center justify-center">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${photoIndex * 100}%)`, width: `${galleryImages.length * 100}%` }}>
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="w-full flex-shrink-0 flex flex-col items-center justify-center">
                      <img src={img.gambar} alt={img.judul || `Gallery ${idx + 1}`} className="object-contain max-h-[70vh] w-full mb-2 rounded shadow-lg" />
                      <div className="text-lg font-semibold text-white mb-2 text-center drop-shadow-lg">{img.judul || `Gallery ${idx + 1}`}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#4D273F] text-white rounded-full p-2 shadow-lg hover:bg-pink-700 z-10" onClick={() => setPhotoIndex((photoIndex + 1) % galleryImages.length)} aria-label="Next">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center mt-4">
              {galleryImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.gambar.startsWith("http") ? img.gambar : `${BASE_URL}/${img.gambar}`}
                  alt={`thumb-${idx + 1}`}
                  className={`w-12 h-12 object-cover rounded border-2 ${idx === photoIndex ? "border-[#4D273F]" : "border-transparent"} cursor-pointer transition-transform duration-200 ${idx === photoIndex ? "scale-110" : "scale-100"}`}
                  onClick={() => setPhotoIndex(idx)}
                  style={{ margin: 2 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <footer id="contact" className="w-full bg-[#222] text-white py-6 xs:py-10 sm:py-16 mt-10">
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

export default Gallery;
// Removed react-image-lightbox spinner hiding
