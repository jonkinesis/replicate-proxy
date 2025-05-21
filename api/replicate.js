export default async function handler(req, res) {
  console.log("API route called with method:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(data));
      req.on("error", err => reject(err));
    });

    console.log("Raw body:", body);

    const json = JSON.parse(body);
    console.log("Parsed JSON body:", json);

    if (!json.prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Return simple JSON echoing prompt for test
    return res.status(200).json({ message: `Received prompt: ${json.prompt}` });
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: error.message });
  }
}


