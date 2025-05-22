import fetch from "node-fetch";

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Enable CORS for actual request
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { model, prompt, guidance } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({ error: "Missing required fields: model and prompt" });
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
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          ...(guidance !== undefined && { guidance }),
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Replicate API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


