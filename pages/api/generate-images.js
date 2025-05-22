import fetch from "node-fetch";

export default async function handler(req, res) {
  // Validate method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { model, prompt, ...otherParams } = req.body;

  if (!model) {
    return res.status(400).json({ error: "Missing model parameter" });
  }
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt parameter" });
  }

  try {
    // Build Replicate API body
    const body = {
      input: { prompt, ...otherParams }
    };

    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait", // Wait for the prediction to complete before returning
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Replicate API error:", data);
      return res.status(500).json({ error: "Failed to generate image", details: data });
    }

    // Send back the full prediction response from Replicate
    return res.status(200).json(data);

  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


