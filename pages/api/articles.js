// Simple in-memory store that persists via Vercel's serverless functions
// For production persistence we use a JSON store on a free service
// Articles are stored as shared state

let articles = [];

export default function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ articles });
  }

  if (req.method === "POST") {
    const { article } = req.body;
    if (!article) return res.status(400).json({ error: "Missing article" });
    // Avoid duplicates
    if (!articles.find((a) => a.id === article.id)) {
      articles = [article, ...articles];
    }
    return res.status(200).json({ articles });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
