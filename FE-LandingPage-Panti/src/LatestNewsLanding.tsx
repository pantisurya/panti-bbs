import React, { useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getBerita } from "./services/api";

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

const LatestNewsLanding: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getBerita();
        if (Array.isArray(data)) {
          setNewsList(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-500">Loading news...</div>;
  }

  if (newsList.length === 0) {
    return <div className="col-span-3 text-center text-gray-400 text-xl py-20">No news found.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 xs:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
      {newsList.map((news, index) => (
        <div key={news.id || index} className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          {news.gambar ? (
            <img src={news.gambar} alt={news.judul} className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 bg-gradient-to-br from-[#4D273F] to-[#6B3B56] flex items-center justify-center text-white text-lg font-bold">{news.kategori?.value1 || "Berita"}</div>
          )}
          <div className="p-6">
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar className="h-4 w-4 mr-2" />
              {news.createdAt}
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
  );
};

export default LatestNewsLanding;
