const https = require("https");

function stripeRequest(path, body) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY nu e setat");
  const data = new URLSearchParams(body).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.stripe.com",
      path,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(data)
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
    req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { credits, price, userId, userEmail } = req.body;
    const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${req.headers.host}`;

    // Pret in bani (RON in cents pentru Stripe - folosim RON * 100)
    const session = await stripeRequest("/v1/checkout/sessions", {
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "ron",
      "line_items[0][price_data][product_data][name]": `PageCOD — ${credits} pagini`,
      "line_items[0][price_data][product_data][description]": `${credits} credite pentru generare pagini COD`,
      "line_items[0][price_data][unit_amount]": price * 100,
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "customer_email": userEmail,
      "success_url": `${baseUrl}/dashboard?payment=success&credits=${credits}&session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${baseUrl}/pricing`,
      "metadata[user_id]": userId,
      "metadata[credits]": credits,
      "allow_promotion_codes": "true",
    });

    if (session.error) throw new Error(session.error.message);
    res.status(200).json({ url: session.url });
  } catch(err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
