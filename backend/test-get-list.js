import http from "http";

// Test GET list endpoint
function testGetList() {
  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/dynamic/user_default?page=1&limit=10",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:");
      try {
        const parsed = JSON.parse(body);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("Raw:", body);
      }
    });
  });

  req.on("error", (e) => console.error("Error:", e.message));

  console.log("Sending GET request to /api/dynamic/user_default");
  req.end();
}

testGetList();
