export default function handler(req, res) {
  // CORS headers — adjust "*" to your frontend domain in production!
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  res.status(200).json({
    message: "✅ This is a test endpoint. API works! Use /api/generate for actual content generation."
  });
}
