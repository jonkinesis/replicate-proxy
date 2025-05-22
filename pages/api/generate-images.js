// pages/api/generate-images.js

import Replicate from "replicate";

// Initialize Replicate with your API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Set CORS header for main request
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const { model = "black-forest-labs/flux-dev", prompt, guidance = 3.5 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' parameter" });
    }

    const input = { prompt, guidance };

    console.log("➡️ Generating with model:", model);
    console.log("➡️ Input:", input);

    const output = await replicate.run(model, { input });

    console.log("✅ Replicate output:", output);

    if (!output || output.length === 0) {
      return res.status(500).json({ error: "Replicate returned no output" });
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error("❌ Error calling Replicate:", error);
    res.status(500).json({ error: error.message || "Unknown error generating image" });
  }
}


