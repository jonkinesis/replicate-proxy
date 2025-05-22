export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  res.status(200).json({
    message: "✅ API test endpoint works. Use POST /api/generate to call Replicate.",
  });
}
