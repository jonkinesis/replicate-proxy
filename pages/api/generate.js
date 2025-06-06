export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Enable CORS for POST
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { model, input } = req.body;

  if (!model) {
    return res.status(400).json({ error: "Missing model name" });
  }
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "Missing Replicate API token" });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || "Replicate API error" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}


