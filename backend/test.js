// Quick test script untuk backend API
import http from "http";

const tests = [
  { name: "Health Check", method: "GET", path: "/health" },
  { name: "Get All Angpao", method: "GET", path: "/api/angpao" },
  { name: "Get All Berita", method: "GET", path: "/api/berita" },
];

function makeRequest(method, path) {
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
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      console.error("Request error details:", error);
      reject(error);
    });
    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 Testing Backend API...\n");

  for (const test of tests) {
    try {
      const result = await makeRequest(test.method, test.path);
      console.log(`✅ ${test.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${result.body}\n`);
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
      if (error.code) console.log(`   Code: ${error.code}`);
      console.log();
    }
  }
}

// Wait a moment for server to start
setTimeout(runTests, 500);
