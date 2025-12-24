import http from "http";

function testGetByIdGeneric(id) {
  const options = {
    hostname: "localhost",
    port: 3000,
    path: `/api/user_default/${id}`,
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      try {
        console.log("Body:", JSON.stringify(JSON.parse(body), null, 2));
      } catch (e) {
        console.log("Body (raw):", body);
      }
      process.exit(0);
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e.message);
    process.exit(1);
  });
  req.end();
}

const id = "39b6c820-9a5b-4dc4-9a98-957a2b4db1d4";
testGetByIdGeneric(id);
