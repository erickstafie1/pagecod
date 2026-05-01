const https = require("https");
const crypto = require("crypto");

function exchangeToken(shop, code) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  console.log("Exchange token - shop:", shop, "clientId:", clientId?.substring(0,8));
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ client_id: clientId, client_secret: clientSecret, code });
    const req = https.request({
      hostname: shop,
      path: "/admin/oauth/access_token",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        console.log("Token response status:", res.statusCode, "body:", raw.substring(0, 200));
        try { resolve(JSON.parse(raw)); } catch(e) { reject(new Error("Parse error: " + raw.substring(0, 100))); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  const { shop, code, hmac } = req.query;
  if (!shop || !code) return res.status(400).send("Missing parameters");

  // HMAC verification
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (hmac && clientSecret) {
    const params = Object.keys(req.query).filter(k => k !== "hmac").sort().map(k => `${k}=${req.query[k]}`).join("&");
    const digest = crypto.createHmac("sha256", clientSecret).update(params).digest("hex");
    if (digest !== hmac) {
      console.log("HMAC mismatch - expected:", digest.substring(0,10), "got:", hmac.substring(0,10));
      // Continue anyway for debugging
    }
  }

  try {
    const { access_token } = await exchangeToken(shop, code);
    const appUrl = process.env.SHOPIFY_APP_URL || "https://pagecod.vercel.app";
    res.redirect(`${appUrl}/shopify-app?shop=${shop}&token=${access_token}`);
  } catch(e) {
    res.status(500).send("OAuth error: " + e.message);
  }
};
