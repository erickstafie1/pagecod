const https = require("https");

function shopifyRequest(shop, token, path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: shop,
      path: `/admin/api/2024-01${path}`,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e) { reject(e); } });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, shop, token, title, bodyHtml } = req.body || {};
  if (!shop || !token) return res.status(400).json({ error: "Missing shop or token" });

  try {
    if (action === "get_products") {
      const data = await shopifyRequest(shop, token, "/products.json?limit=50&fields=id,title,images,variants", "GET");
      return res.status(200).json({ success: true, products: data.products || [] });
    }
    if (action === "publish_page") {
      const data = await shopifyRequest(shop, token, "/pages.json", "POST", {
        page: { title, body_html: bodyHtml, published: true }
      });
      if (data.page) {
        return res.status(200).json({ success: true, page: data.page, url: `https://${shop}/pages/${data.page.handle}` });
      }
      throw new Error(JSON.stringify(data.errors || "Unknown error"));
    }
    res.status(400).json({ error: "Unknown action" });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
