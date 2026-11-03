module.exports = async (req, res) => {
  const base = (process.env.OTT_BOT || "").replace(/\/+$/, "");
  res.setHeader("Cache-Control", "no-store");
  if (!base) return res.status(500).json({ err: "Chưa đặt biến môi trường OTT_BOT trên Vercel" });
  const p = req.query.p === "act" ? "act" : "sync";
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(`${base}/${p}?key=${encodeURIComponent(req.query.key || "")}`, {
      method: p === "act" ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: p === "act" ? JSON.stringify(req.body || {}) : undefined,
      signal: ctl.signal,
    });
    res.status(r.status).setHeader("Content-Type", "application/json; charset=utf-8").send(await r.text());
  } catch (e) {
    res.status(502).json({ err: "Không nối được bot: " + e.message });
  } finally { clearTimeout(timer); }
};
