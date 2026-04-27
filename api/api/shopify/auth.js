// api/shopify/auth.js - Porneste OAuth flow
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  const { shop } = req.query;
  if (!shop) return res.status(400).send("Missing shop parameter");

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const appUrl = process.env.SHOPIFY_APP_URL || "https://pagecod.vercel.app";
  const redirectUri = `${appUrl}/api/shopify/callback`;
  const scopes = "write_online_store_pages,read_online_store_pages,read_products";
  const state = crypto.randomBytes(16).toString("hex");

  // Salveaza state in cookie pentru verificare
  res.setHeader("Set-Cookie", `shopify_state=${state}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=600`);

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  
  res.redirect(authUrl);
};
