export default function handler(req, res) {
  res.status(200).json({
    message: "✅ This is a test endpoint. API works! Use /api/replicate for actual content generation."
  });
}


