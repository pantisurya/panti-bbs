import http from "http";

// Test UPDATE endpoint
function testUpdate() {
  const data = JSON.stringify({
    name: "Test User Update",
    username: "testupdate",
    status: true,
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/dynamic/user_default/39b6c820-9a5b-4dc4-9a98-957a2b4db1d4", // ID dari "tes"
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:", body);
      try {
        console.log("Parsed:", JSON.parse(body));
      } catch (e) {
        console.log("Could not parse JSON");
      }
    });
  });

  req.on("error", (e) => console.error("Error:", e.message));

  console.log("Sending PUT request with data:", data);
  req.write(data);
  req.end();
}

testUpdate();
