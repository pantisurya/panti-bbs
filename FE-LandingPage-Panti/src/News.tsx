import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getBerita } from "./services/api";
import FooterLatestNews from "./FooterLatestNews";

const News: React.FC = () => {
  type NewsItem = {
    id: string;
    judul: string;
    isi_berita?: string;
    gambar?: string | null;
    kategori_id?: string;
    status?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    kategori?: {
      id: string;
      value1?: string;
    };
  };
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getBerita();
        if (Array.isArray(data)) {
          setNewsList(data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(newsList.map((n) => n.kategori?.value1 || "").filter((v): v is string => !!v)));
  const tabList = ["Semua", ...categories];

  // Filter news by active tab
  const filteredNews = activeCategory === "Semua" ? newsList : newsList.filter((n) => n.kategori?.value1 === activeCategory);

  return (
    <div className="min-h-screen bg-white pt-16 flex flex-col items-center justify-center">
      <section className="py-6 xs:py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-[#4D273F] mb-6">Latest News</h2>
            {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore Our Completed Projects! Consectetur adipiscing elit tellus, luctus pulvinar dapibus leo consectetur luctus nec.</p> */}
            <div className="w-24 h-1 bg-[#4D273F] mx-auto"></div>
          </div>

          {/* Tab Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {tabList.map((cat) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full font-semibold border transition-colors duration-200 ${
                  activeCategory === cat ? "bg-[#4D273F] text-white border-[#4D273F]" : "bg-white text-[#4D273F] border-[#4D273F] hover:bg-[#4D273F] hover:text-white"
                }`}
                onClick={() => setActiveCategory(cat || "")}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-lg text-gray-500">Loading news...</div>
          ) : filteredNews.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 text-xl py-20">No news found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xs:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
              {filteredNews.map((news, index) => (
                <div key={news.id || index} className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  {news.gambar ? (
                    <img src={news.gambar} alt={news.judul} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#4D273F] to-[#6B3B56] flex items-center justify-center text-white text-lg font-bold">{news.kategori?.value1 || "Berita"}</div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {news.createdAt || "N/A"}
                      {news.kategori?.value1 && <span className="ml-3 px-2 py-1 bg-[#4D273F] text-white rounded text-xs">{news.kategori.value1}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-[#4D273F] mb-3 leading-tight">{news.judul || "Untitled"}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{(news.isi_berita || "").length > 180 ? (news.isi_berita || "").slice(0, 180) + "..." : news.isi_berita || "No description"}</p>
                    <Link to={`/news_detail/${news.id}`} className="text-[#4D273F] font-semibold hover:text-[#6B3B56] flex items-center group">
                      Baca Selengkapnya
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
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

export default News;
