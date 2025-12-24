import React, { useEffect, useState } from "react";
import { getPengurus } from "./services/api";
import FooterLatestNews from "./FooterLatestNews";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 flex flex-col items-center">
      {/* Judul dan papan nama */}
      <div className="flex flex-col items-center mb-8 w-full px-4 md:px-8">
        <img src="/tempat.webp" alt="Papan Nama Panti Surya" className="w-full max-w-md rounded-lg shadow mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-[#4D273F] mb-4 text-center">Rumah Usiawan Panti Surya</h1>
      </div>
      {/* Sejarah singkat, visi, misi, pengurus */}
      <section className="max-w-6xl w-full mb-10 text-justify px-4 md:px-8">
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

      {/* Our History Section */}
      <section className="w-full max-w-6xl mb-10 text-justify px-4 md:px-8">
        <h2 className="text-5xl font-bold text-[#6B3B56] mb-6 text-center">Our History</h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6 justify-center items-center">
          <img src="/papannama.webp" alt="Papan Nama Tampak Depan" className="w-full max-w-xs rounded-lg shadow" />
          <img src="tampakdepan2.webp" alt="Papan Nama Tampak Depan" className="w-full max-w-xs rounded-lg shadow" />
          {/* <img
            src="/"
            alt="Gedung Lama Panti Surya"
            className="w-full max-w-xs rounded-lg shadow"
            
          /> */}
        </div>
        <div className="text-gray-800 text-lg leading-relaxed space-y-4">
          <p>
            Pdt. Han Beng Kong di tahun 1970, mendapat hak cuti 3 bulan, dan berlibur ke Belanda. Selama berlibur di negeri Belanda, beliau mendekati satu yayasan yang mengelola Rumah Usiawan "Het Zonne Huis". Dari perjumpaan Pdt. Han Beng Kong
            dengan Pengurus "Het Zonne Huis" itu, diutarakan maksud GKI Jatim Surabaya untuk mendirikan rumah Usiawan di Surabaya, namun terbentur oleh kurangnya dana. Maksud yang baik ini didukung oleh Pengurus "Het Zonne Huis" dan mereka
            menjanjikan, bertepatan dengan HUT "Het Zonne Huis" yang ke 50, akan menyumbang GKI Jatim Surabaya untuk mewujudkan terbentuknya Rumah Usiawan di Surabaya.
          </p>
          <p>
            Maka sepulangnya Pdt. Han Beng Kong dari cutinya dan kembali ke Surabaya, beliau menugaskan Majelis Gereja GKI Jatim Surabaya yang saat itu terdiri dari 5 daerah yaitu GKI Residen Sudirman, GKI Ngagel, GKI Emaus, GKI Diponegoro dan GKI
            Sulung untuk membuat gambar desain rumah usiawan yang dimaksud.
          </p>
          <p>
            Meskipun pada saat itu GKI Jatim Surabaya belum mempunyai sebidang tanah untuk pembangunan rumah usiawan tersebut namun rencana gambar tetap dibuat di atas tanah yang fiktif. Setelah gambar tersebut selesai, segera dikirim ke negeri
            Belanda melalui Pdt. Han Beng Kong, untuk meminta persetujuan pengurus "Het Zonne Huis", agar dapat dibantu pendanaannya.
          </p>
          <p>
            Pada th. 1971 PPPK Petra Surabaya membeli sebidang tanah di daerah Siwalan Kerto (Sekarang Jl. Jemur Andayani) untuk keperluan pembangunan STM seluas 3,35 HA (33.500 m2). Sesuai peraturan tata kota Surabaya, tanah Petra tersebut terpotong
            oleh rencana jalan Umum Kodya Surabaya. Dan bagian Timur tanah yang terpotong rencana jalan tersebut seluas ± 2000 m2 yang kemudian dibeli oleh GKI Jatim Surabaya dari PPPK Petra dengan harga Rp. 250,-/m2 (harga pokok pembelian Petra).
          </p>
        </div>
      </section>

      {/* Our Administrator Section - Dynamic from API */}
      <section className="w-full max-w-6xl mb-10 px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-[#6B3B56] mb-2 text-center">
          Our <span className="text-[#4D273F]">Administrator</span>
        </h2>
        <div className="w-full flex justify-center mb-2">
          <div className="h-1 w-24 bg-[#6B3B56] rounded mb-4"></div>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#222] text-center mb-2">SUSUNAN PEMBINA, PENGAWAS & PENGURUS</h3>
        <p className="text-center font-semibold text-[#4D273F] mb-6">YAYASAN PANTI SURYA PERIODE 2021 – 2026</p>

        {/* Fetch and render admin data */}
        {(() => {
          type PengurusItem = {
            id: string;
            nama: string;
            jabatan?: string | { value1?: string };
            gereja?: string | { value1?: string } | null;
            divisi?: string | { value1?: string };
            status?: boolean;
          };
          const [pengurus, setPengurus] = useState<PengurusItem[]>([]);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            const fetchPengurus = async () => {
              try {
                const data = await getPengurus();
                setPengurus(Array.isArray(data) ? data : []);
              } catch (error) {
                console.error("Error fetching pengurus:", error);
              } finally {
                setLoading(false);
              }
            };

            fetchPengurus();
          }, []);

          // Helper: extract value from nested or flat structure
          const extractValue = (field?: string | { value1?: string }): string => {
            if (!field) return "-";
            if (typeof field === "string") return field;
            return field.value1 || "-";
          };

          // Helper: get gereja name
          const getGereja = (item: PengurusItem) => extractValue(item.gereja);

          // Group by divisi and filter active (status === true)
          const groupByDivisi = (divisiName: string) =>
            pengurus.filter((item) => {
              const divisi = extractValue(item.divisi).toLowerCase();
              return divisi === divisiName.toLowerCase() && item.status !== false;
            });

          // Render table - group by jabatan
          const renderTable = (title: string, items: PengurusItem[]) => {
            // Group items by jabatan
            const groupedByJabatan: { [key: string]: PengurusItem[] } = {};
            items.forEach((item) => {
              const jabatan = extractValue(item.jabatan);
              if (!groupedByJabatan[jabatan]) {
                groupedByJabatan[jabatan] = [];
              }
              groupedByJabatan[jabatan].push(item);
            });

            return (
              <>
                <h4 className={`text-xl font-bold text-[#6B3B56] mt-6 mb-2`}>{title}</h4>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-[700px] w-full border-y border-gray-300 text-base table-fixed">
                    <colgroup>
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "44%" }} />
                      <col style={{ width: "28%" }} />
                    </colgroup>
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-3 border-b border-gray-300 font-semibold text-left">Jabatan</th>
                        <th className="py-2 px-4 border-b border-gray-300 font-semibold text-left">Nama</th>
                        <th className="py-2 px-3 border-b border-gray-300 font-semibold text-left">Gereja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedByJabatan).map(([jabatan, jabatanItems]) => (
                        <React.Fragment key={jabatan}>
                          {jabatanItems.map((item, idx) => (
                            <tr key={item.id}>
                              {idx === 0 && (
                                <td className="py-2 px-3 border-b border-gray-300 align-top font-semibold" rowSpan={jabatanItems.length}>
                                  {jabatan}
                                </td>
                              )}
                              <td className="py-2 px-4 border-b border-gray-300 align-top whitespace-pre-line text-left font-medium">{item.nama}</td>
                              <td className="py-2 px-3 border-b border-gray-300 align-top">{getGereja(item)}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          };

          if (loading) return <div className="text-center">Loading...</div>;

          return (
            <>
              {renderTable("SUSUNAN PEMBINA", groupByDivisi("Pembina"))}
              {renderTable("SUSUNAN PENGAWAS", groupByDivisi("Pengawas"))}
              <h4 className="text-2xl font-bold text-[#222] mt-8 mb-2">SUSUNAN PENGURUS</h4>
              {renderTable("", groupByDivisi("Pengurus"))}
              <div className="w-full flex justify-center mb-4">
                <img src="/pelantikan-2021.jpeg" alt="Pelantikan 2021" className="rounded-lg shadow" />
              </div>
            </>
          );
        })()}
      </section>
      {/* Footer - Redesigned */}
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

export default About;
