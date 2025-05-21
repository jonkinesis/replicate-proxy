export default function handler(req, res) {
  console.log("API test route hit");
  res.status(200).json({ message: "API route works!" });
}

