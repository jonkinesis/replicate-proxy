export default function handler(req, res) {
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Enable CORS for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    message: "✅ This is a test endpoint. API works! Use /api/generate for actual content generation."
  });
}
