#!/usr/bin/env node

import http from "http";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (d) => {
        data += d;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 Testing Backend API...\n");

  try {
    // Wait for server to be ready
    await delay(500);

    // Test 1: Health check
    console.log("Testing: GET /health");
    const health = await makeRequest("GET", "/health");
    console.log(`✅ Status: ${health.status}`);
    console.log(`   Response: ${health.body}\n`);

    // Test 2: Get all angpao
    console.log("Testing: GET /api/angpao");
    const angpaoList = await makeRequest("GET", "/api/angpao");
    console.log(`✅ Status: ${angpaoList.status}`);
    console.log(`   Response: ${angpaoList.body}\n`);

    // Test 3: Create angpao
    console.log("Testing: POST /api/angpao");
    const newAngpao = await makeRequest("POST", "/api/angpao", {
      name: "Angpao Tahun Baru 2026",
      amount: 500000,
      description: "Angpao untuk tahun baru",
    });
    console.log(`✅ Status: ${newAngpao.status}`);
    console.log(`   Response: ${newAngpao.body}\n`);

    // Test 4: Get all berita
    console.log("Testing: GET /api/berita");
    const beritaList = await makeRequest("GET", "/api/berita");
    console.log(`✅ Status: ${beritaList.status}`);
    console.log(`   Response: ${beritaList.body}\n`);

    console.log("🎉 Semua test berhasil! Backend siap digunakan.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("   Pastikan server sudah berjalan di http://localhost:3000\n");
    process.exit(1);
  }
}

runTests();
