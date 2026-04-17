const https = require("https");
const crypto = require("crypto");

function verifyStripeSignature(body, signature, secret) {
  const elements = signature.split(",");
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1];
  const sig = elements.find(e => e.startsWith("v1="))?.split("=")[1];
  if (!timestamp || !sig) return false;
  const payload = `${timestamp}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

async function addCredits(userId, credits) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase env vars missing");

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ p_user_id: userId, p_credits: parseInt(credits) });
    const url = new URL(`${supabaseUrl}/rest/v1/rpc/add_credits`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        console.log("Credits added, status:", res.statusCode);
        resolve();
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Citeste body-ul raw
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString();

  // Verifica semnatura Stripe
  if (webhookSecret) {
    if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
      return res.status(400).json({ error: "Invalid signature" });
    }
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const credits = session.metadata?.credits;
      if (userId && credits) {
        await addCredits(userId, credits);
        console.log(`Added ${credits} credits to user ${userId}`);
      }
    }
    res.status(200).json({ received: true });
  } catch(err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
