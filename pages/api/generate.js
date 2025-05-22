const fetch = require('node-fetch');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function handler(req, res) {
  // Enable CORS for all origins (adjust if you want to restrict)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const { model, input } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Model is required in request body' });
  }

  if (!input) {
    return res.status(400).json({ error: 'Input data is required in request body' });
  }

  try {
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model,  // model should be full version string like "black-forest-labs/flux-dev@version-hash"
        input,
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API error:', errorText);
      return res.status(500).json({ error: 'Failed to create prediction', details: errorText });
    }

    const prediction = await replicateResponse.json();
    return res.status(200).json(prediction);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;



