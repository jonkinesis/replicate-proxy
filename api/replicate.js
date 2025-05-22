export default async function handler(req, res) {
  // Add CORS headers to allow requests from any origin (adjust origin as needed)
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or specify your domain instead of '*'
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ping, apiKey, prompt, checkPrediction } = req.body;

  if (ping) {
    return res.status(200).json({ status: "pong" });
  }

  if (checkPrediction) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${checkPrediction}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(500).json({ error: "Replicate API error", details: errorText });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const replicateResponse = await fetch("https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          max_new_tokens: 512,
          prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        },
        stream: false,
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      return res.status(500).json({ error: "Replicate API error", details: errorText });
    }

    const data = await replicateResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


