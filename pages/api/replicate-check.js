export default async function handler(req, res) {
  // Handle preflight OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");  // or restrict to your frontend domain
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET method is allowed" });
  }

  // Enable CORS for GET
  res.setHeader("Access-Control-Allow-Origin", "*"); // or restrict to your frontend domain

  try {
    const response = await fetch("https://api.replicate.com/v1/models", {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Replicate" });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

