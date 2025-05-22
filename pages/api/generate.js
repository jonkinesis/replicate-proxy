// pages/api/generate.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, version, input } = req.body;

  if (!model || !input) {
    return res.status(400).json({ error: 'Missing required fields: model and input' });
  }

  try {
    // Build the URL to call replicate prediction
    // If version provided, use model/version, else just model (latest version)
    const versionPath = version ? `/versions/${version}` : '';
    const url = `https://api.replicate.com/v1/models/${model}${versionPath}/predictions`;

    const replicateResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // waits for prediction to complete
      },
      body: JSON.stringify({ input }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      return res.status(replicateResponse.status).json({ error: errorText });
    }

    const prediction = await replicateResponse.json();

    // Return the entire replicate prediction response to client
    res.status(200).json(prediction);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




