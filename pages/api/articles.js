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
  if (req.method === "GET") {
    try {
      const raw = await redisCommand("GET", "articles");
      const articles = raw ? JSON.parse(raw) : [];
      return res.status(200).json(articles);
    } catch {
      return res.status(200).json([]);
    }
  }

  if (req.method === "POST") {
    try {
      const article = req.body;
      const raw = await redisCommand("GET", "articles");
      const articles = raw ? JSON.parse(raw) : [];
      articles.unshift(article);
      await redisCommand("SET", "articles", JSON.stringify(articles));
      return res.status(200).json({ ok: true });
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
