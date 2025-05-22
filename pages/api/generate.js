// pages/api/generate.js
const fetch = require('node-fetch').default;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, version, input } = req.body;

  if (!model || !input) {
    return res.status(400).json({ error: 'Missing model or input in request body' });
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: version || undefined,  // optional version, if you want to specify
        model: model,                  // required model string like "black-forest-labs/flux-dev"
        input: input                   // required input object for the model
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      return res.status(response.status).json({ error: errorDetails });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}



