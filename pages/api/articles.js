const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

async function redisCommand(...args) {
  const response = await fetch(`${UPSTASH_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await response.json();
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const raw = await redisCommand("GET", "articles");
      const articles = raw ? JSON.parse(raw) : [];
      return res.status(200).json({ articles });
    } catch {
      return res.status(200).json({ articles: [] });
    }
  }

  if (req.method === "POST") {
    try {
      const { article } = req.body;
      if (!article) return res.status(400).json({ error: "Missing article" });
      const raw = await redisCommand("GET", "articles");
      const articles = raw ? JSON.parse(raw) : [];
      if (!articles.find((a) => a.id === article.id)) {
        articles.unshift(article);
      }
      await redisCommand("SET", "articles", JSON.stringify(articles));
      return res.status(200).json({ articles });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    await redisCommand("DEL", "articles");
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
