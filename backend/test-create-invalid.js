import http from "http";

// Test CREATE dengan empty name - should fail
function testCreateWithoutName() {
  const data = JSON.stringify({
    username: "testuser",
    password: "testpass",
    status: true,
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/dynamic/user_default",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("✓ Status:", res.statusCode);
      console.log("Response:", body);
      try {
        console.log("Parsed:", JSON.stringify(JSON.parse(body), null, 2));
      } catch (e) {
        console.log("Could not parse JSON");
      }
      process.exit(0);
    });
  });

  req.on("error", (e) => {
    console.error("✗ Error:", e.message);
    process.exit(1);
  });

  console.log("→ Sending POST /api/dynamic/user_default WITHOUT name (should fail)");
  req.write(data);
  req.end();

  setTimeout(() => {
    console.error("✗ Request timeout");
    process.exit(1);
  }, 5000);
}

testCreateWithoutName();
