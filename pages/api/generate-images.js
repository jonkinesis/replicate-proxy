// /api/generate.js

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { model = "black-forest-labs/flux-dev", prompt, guidance = 3.5 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter" });
    }

    // Run model without specifying version ID
    const output = await replicate.run(model, {
      input: { prompt, guidance },
    });

    res.status(200).json({ output });
  } catch (error) {
    console.error("Error calling Replicate:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}


