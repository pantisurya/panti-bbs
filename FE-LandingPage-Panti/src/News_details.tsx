import React from "react";
import { Calendar } from "lucide-react";
import { ArrowRight } from "lucide-react";

const News: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-16 flex flex-col items-center justify-center">
      {/* Judul dan papan nama */}
      <div className="flex flex-col items-center mb-8">
        <img src="/tempat.webp" alt="Papan Nama Panti Surya" className="w-full max-w-md rounded-lg shadow mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-[#4D273F] mb-4 text-center">Rumah Usiawan Panti Surya</h1>
      </div>
      {/* Sejarah singkat, visi, misi, pengurus */}
      <section className="max-w-6xl w-full mb-10 text-justify">
        <p className="text-gray-800 text-lg leading-relaxed mb-4">
          <span className="font-semibold text-[#4D273F]">Rumah Usiawan Panti Surya</span> didirikan dan diresmikan penggunaannya pada tanggal <span className="font-semibold text-[#4D273F]">31 Oktober 1974</span>.{" "}
          <span className="font-semibold">Terdaftar di Departemen Sosial yang diumumkan pada Lembaran Tambahan No.1026 dari Berita Negara Republik Indonesia tanggal 9 November 2007 no. 90.</span> Nama Panti Surya diambil dari nama Panti Jompo di
          negeri Belanda yang bernama <span className="font-semibold text-[#4D273F]">Het Zonnehuis</span>. Bertepatan di HUT nya yang ke 50 memberikan sumbangan yang dipergunakan untuk membangun Panti Surya ini. Semula Rumah Usiawan ini didirikan
          untuk memenuhi kebutuhan akan rumah penampungan bagi orang tua yang tidak mempunyai rumah tinggal sendiri dan sebatang kara, namun dengan berjalannya waktu dan perkembangan jaman, sekarang penghuni Rumah Usiawan Panti Surya tidak hanya yang
          sebatang kara saja tetapi juga mereka yang punya anak/keluarga namun karena satu dan lain hal tidak bisa tinggal bersama keluarganya.
        </p>
        <div className="mb-4">
          <span className="font-bold text-[#4D273F]">Visi</span> : Menjadi Berkat bagi Lansia.
          <br />
          <span className="font-bold text-[#4D273F]">Misi</span> : Mengenal, Mengasihi, dan Melayani sepenuh hati.
        </div>
        <p className="text-gray-800 text-lg leading-relaxed mb-4">
          Pengurusnya terdiri dari wakil-wakil 5 gereja GKI di Surabaya yaitu <span className="font-semibold text-[#4D273F]">GKI Diponegoro, GKI Argopuro (Sekarang menjadi GKI Emaus), GKI Ngagel, GKI Residen Sudirman</span> dan{" "}
          <span className="font-semibold text-[#4D273F]">GKI Sulung</span> yang disebut sebagai gereja pendukung. Oleh partisipasi dan sumbangan-sumbangan baik moril maupun material dari para simpatisan, Rumah Usiawan Panti Surya sudah berkembang
          cukup pesat yang semula kapasitas penampungan 25 orang sekarang menjadi 81 orang dan fasilitas yang tersedia juga semakin beragam.
        </p>
        <p className="text-gray-800 text-lg leading-relaxed">
          Jumlah karyawan yang melayani ada 35 orang terdiri dari bagian kantor, perawat, dapur, kebersihan, satpam dan sopir yang keseluruhannya digaji. Adapun pengurus total ada 15 orang dengan komposisi perwakilan masing-masing 3 orang dari 5
          gereja GKI (Gereja Kristen Indonesia) yang total bekerja secara sukarela.
        </p>
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
              <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-4">Latest News</h3>
              <div className="border-b border-pink-900 mb-2 xs:mb-4 w-2/3" />
              <div className="space-y-2 xs:space-y-4">
                {[
                  {
                    img: "/news1.jpg",
                    title: "Customer Focused",
                    date: "April 15, 2019",
                  },
                  {
                    img: "/news2.jpg",
                    title: "School For Poor",
                    date: "June 15, 2019",
                  },
                  {
                    img: "/news3.jpg",
                    title: "Shelter For Homeless",
                    date: "November 15, 2019",
                  },
                ].map((news, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={news.img} alt={news.title} className="h-10 xs:h-14 w-14 xs:w-20 object-cover rounded-lg" />
                    <div>
                      <p className="font-bold text-base xs:text-lg">{news.title}</p>
                      <p className="text-gray-300 text-xs xs:text-sm">{news.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
