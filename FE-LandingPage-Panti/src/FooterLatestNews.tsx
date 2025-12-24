import React, { useEffect, useState } from "react";
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

const FooterLatestNews: React.FC = () => {
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

  return (
    <div>
      <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-4">Latest News</h3>
      <div className="border-b border-pink-900 mb-2 xs:mb-4 w-2/3" />
      <div className="space-y-2 xs:space-y-4">
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : newsList.length === 0 ? (
          <div className="text-gray-400 text-sm">No news found.</div>
        ) : (
          newsList.map((news) => (
            <div key={news.id} className="flex gap-4 items-center">
              <div className="w-16 h-16 xs:w-20 xs:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                <img src={news.gambar ? news.gambar : "/logo.png"} alt={news.judul} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-base xs:text-lg">{news.judul}</p>
                <p className="text-gray-300 text-xs xs:text-sm">{news.createdAt}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FooterLatestNews;
