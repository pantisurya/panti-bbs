import React, { useState } from "react";
import { Stethoscope, Home, Activity, Users, Heart, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

const services = [
  {
    icon: <Stethoscope className="h-8 w-8 text-white" />, title: "Layanan Kesehatan", desc: "Pemeriksaan kesehatan rutin 1 minggu sekali, perawatan medis, dan pendampingan caregiver 24 jam"
  },
  {
    icon: <Home className="h-8 w-8 text-white" />, title: "Tempat Tinggal", desc: "Kamar bersih dan nyaman, ruang pertemuan luas dan ruang santai yang menyenangkan untuk Oma dan Opa"
  },
  {
    icon: <Activity className="h-8 w-8 text-white" />, title: "Kegiatan Harian", desc: "Program aktivitas yang beragam untuk menjaga kesehatan fisik, mental, sosial, dan spiritual"
  },
  {
    icon: <Users className="h-8 w-8 text-white" />, title: "Kegiatan Kemandirian", desc: "Ruang rekreasi, aktivitas keterampilan seperti origami, haken, pembuatan barang kerajinan dari batang es krim, dll."
  },
  {
    icon: <Heart className="h-8 w-8 text-white" />, title: "Ruang Ibadah", desc: "Kegiatan rohani dilengkapi dengan persekutuan doa bersama, dan pendalaman Alkitab untuk menumbuhkan iman penghuni."
  },
];

export default function ServiceSlider() {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const maxIndex = services.length - visible;
  const next = () => setIndex(i => Math.min(i + 1, maxIndex));
  const prev = () => setIndex(i => Math.max(i - 1, 0));

  return (
    <div className="relative flex items-center">
      {/* Left Arrow */}
      <button
        onClick={prev}
        disabled={index === 0}
        className={`absolute left-0 z-10 top-1/2 -translate-y-1/2 rounded-full bg-[#4D273F] p-2 transition-opacity ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6B3B56]'}`}
        style={{ marginLeft: '-24px' }}
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </button>
      {/* Cards */}
      <div className="flex gap-8 overflow-hidden w-full justify-center">
        {services.slice(index, index + visible).map((service, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-2xl text-center min-w-[300px] flex-1">
            <div className="bg-[#4D273F] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              {service.icon}
            </div>
            <h3 className="text-2xl font-bold text-[#4D273F] mb-4">{service.title}</h3>
            <p className="text-gray-600 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
      {/* Right Arrow */}
      <button
        onClick={next}
        disabled={index === maxIndex}
        className={`absolute right-0 z-10 top-1/2 -translate-y-1/2 rounded-full bg-[#4D273F] p-2 transition-opacity ${index === maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6B3B56]'}`}
        style={{ marginRight: '-24px' }}
      >
        <ArrowRight className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
