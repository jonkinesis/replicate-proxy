export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Restrict to POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { model, prompt, ...rest } = req.body;

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "Missing Replicate API token" });
  }

  if (!model) {
    return res.status(400).json({ error: "Missing model name" });
  }

  try {
    // Step 1: Fetch latest version for the given model name
    const versionRes = await fetch(`https://api.replicate.com/v1/models/${model}/versions`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const versionData = await versionRes.json();

    if (!versionRes.ok) {
      return res.status(versionRes.status).json({ error: versionData.detail || "Failed to fetch model version" });
    }

    const latestVersion = versionData?.results?.[0]?.id;
    if (!latestVersion) {
      return res.status(500).json({ error: "No version ID found for this model" });
    }

    // Step 2: Make prediction request
    const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: latestVersion,
        input: { prompt, ...rest },
      }),
    });

    const prediction = await predictionRes.json();

    if (!predictionRes.ok) {
      return res.status(predictionRes.status).json({ error: prediction.detail || "Prediction failed" });
    }

    return res.status(200).json(prediction);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


