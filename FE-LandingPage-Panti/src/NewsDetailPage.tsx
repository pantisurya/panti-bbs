import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { getBeritaById } from "./services/api";
import FooterLatestNews from "./FooterLatestNews";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchNews = async () => {
      try {
        const data = await getBeritaById(id);
        setNews(data);
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }

  if (!news) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">Berita tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center py-6 md:py-10 px-3 md:px-2">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <Link to="/news" className="inline-flex items-center gap-2 text-[#4D273F] font-semibold hover:text-[#6B3B56] mb-6 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            ← Kembali ke Berita
          </Link>

          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">
            {/* Image */}
            {news.gambar && <img src={news.gambar.startsWith("http") ? news.gambar : news.gambar} alt={news.judul} className="w-full max-h-80 object-contain rounded-xl mb-6 border" />}
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-[#4D273F] mb-4 leading-tight">{news.judul}</h1>
            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
              <span className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-4 w-4" />
                {news.createdAt}
              </span>
              {news.kategori?.value1 && <span className="px-2 py-1 bg-[#4D273F] text-white rounded text-xs font-semibold">{news.kategori.value1}</span>}
            </div>
            {/* Content */}
            <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{news.isi_berita || "Konten berita tidak tersedia."}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-[#222] text-white py-6 xs:py-10 sm:py-16 mt-auto">
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

export default NewsDetail;
