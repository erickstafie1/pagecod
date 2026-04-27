// api/shopify/publish.js - Creeaza pagina in Shopify
const https = require("https");

function createShopifyPage(shop, token, title, bodyHtml) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      page: {
        title: title,
        body_html: bodyHtml,
        published: true
      }
    });
    const req = https.request({
      hostname: shop,
      path: "/admin/api/2024-01/pages.json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function getShopifyProducts(shop, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: shop,
      path: "/admin/api/2024-01/products.json?limit=50&fields=id,title,images,variants",
      method: "GET",
      headers: { "X-Shopify-Access-Token": token }
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, shop, token, title, bodyHtml } = req.body || req.query;

  if (!shop || !token) return res.status(400).json({ error: "Missing shop or token" });

  try {
    if (action === "get_products" || req.method === "GET") {
      const data = await getShopifyProducts(shop, token);
      return res.status(200).json({ success: true, products: data.products || [] });
    }

    if (action === "publish_page") {
      const data = await createShopifyPage(shop, token, title, bodyHtml);
      if (data.page) {
        return res.status(200).json({ 
          success: true, 
          page: data.page,
          url: `https://${shop}/pages/${data.page.handle}`
        });
      }
      throw new Error(JSON.stringify(data.errors || "Unknown error"));
    }

    res.status(400).json({ error: "Unknown action" });
  } catch(e) {
    console.error("Shopify publish error:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
};
