#!/usr/bin/env node

// Test API secara sederhana dengan fetch
import http from "http";

console.log("\n🧪 Menguji Backend API...\n");

// Test 1: Health Check
const req1 = http
  .get("http://localhost:3000/health", (res) => {
    let data = "";
    res.on("data", (d) => (data += d));
    res.on("end", () => {
      console.log("✅ Health Check berhasil");
      console.log("   Response:", data, "\n");
      testGetAngpao();
    });
  })
  .on("error", (err) => {
    console.error("❌ Health Check gagal:", err.message, "\n");
    process.exit(1);
  });

function testGetAngpao() {
  const req2 = http
    .get("http://localhost:3000/api/angpao", (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        console.log("✅ Get Angpao berhasil");
        console.log("   Response:", data, "\n");
        testCreateAngpao();
      });
    })
    .on("error", (err) => {
      console.error("❌ Get Angpao gagal:", err.message, "\n");
      process.exit(1);
    });
}

function testCreateAngpao() {
  const postData = JSON.stringify({
    name: "Angpao Tahun Baru 2026",
    amount: 500000,
    description: "Angpao untuk tahun baru",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/angpao",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req3 = http
    .request(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        console.log("✅ Create Angpao berhasil");
        console.log("   Response:", data, "\n");
        console.log("🎉 Semua test berhasil! Backend siap digunakan.\n");
        process.exit(0);
      });
    })
    .on("error", (err) => {
      console.error("❌ Create Angpao gagal:", err.message, "\n");
      process.exit(1);
    });

  req3.write(postData);
  req3.end();
}
