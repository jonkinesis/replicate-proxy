import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const prediction = await replicate.predictions.create({
      version: "meta/meta-llama-3-8b-instruct", // Use the correct model version or ID here
      input: { prompt },
    });

    return res.status(200).json(prediction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

