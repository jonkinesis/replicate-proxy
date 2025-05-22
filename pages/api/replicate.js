export default async function handler(req, res) {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS for actual POST request
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    // Step 1: Initiate prediction
    const initiate = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'cf13d88c4b3f1c13011e178f37562bb8a21b09561f041aef25eb6b5592d55f51', // LLaMA 3 (8B Instruct)
        input: {
          prompt,
          max_new_tokens: 500
        }
      }),
    });

    const prediction = await initiate.json();

    if (initiate.status !== 201) {
      return res.status(500).json({ error: 'Failed to start prediction', details: prediction });
    }

    // Step 2: Poll for result
    let result;
    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      result = await statusResponse.json();

      if (result.status === 'succeeded') {
        return res.status(200).json({ output: result.output });
      } else if (result.status === 'failed') {
        return res.status(500).json({ error: 'Prediction failed', details: result });
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 sec
      attempt++;
    }

    return res.status(504).json({ error: 'Prediction timed out', status: result.status });

  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
}


