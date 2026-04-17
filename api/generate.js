const https = require("https");
const http = require("http");

// ScraperAPI - trece de blocarea AliExpress
function fetchWithScraper(url) {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    console.log("No ScraperAPI key, trying direct");
    return fetchDirect(url);
  }
  // ScraperAPI endpoint
  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=false`;
  console.log("Using ScraperAPI");
  return fetchDirect(scraperUrl);
}

function fetchDirect(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith("http")
          ? res.headers.location
          : "https://www.aliexpress.com" + res.headers.location;
        return fetchDirect(loc).then(resolve);
      }
      const chunks = [];
      const enc = res.headers["content-encoding"];
      const done = () => resolve(Buffer.concat(chunks).toString("utf8"));
      if (enc === "gzip") {
        const g = require("zlib").createGunzip();
        res.pipe(g); g.on("data", c => chunks.push(c)); g.on("end", done); g.on("error", () => resolve(""));
      } else {
        res.on("data", c => chunks.push(c)); res.on("end", done);
      }
    });
    req.on("error", (e) => { console.log("Fetch error:", e.message); resolve(""); });
    req.on("timeout", () => { req.destroy(); resolve(""); });
  });
}

function extractImages(html) {
  const images = new Set();

  // Metoda 1: imagePathList JSON (cel mai fiabil)
  try {
    const m = html.match(/"imagePathList"\s*:\s*(\[.*?\])/s);
    if (m) {
      const urls = JSON.parse(m[1]);
      urls.forEach(u => {
        if (u && typeof u === 'string' && u.startsWith("http")) {
          images.add(u.replace(/\\/g, ""));
        }
      });
    }
  } catch(e) {}

  // Metoda 2: skuImageList
  try {
    const m = html.match(/"skuImageList"\s*:\s*(\[.*?\])/s);
    if (m) {
      const items = JSON.parse(m[1]);
      items.forEach(item => {
        if (item.imageUrl) images.add(item.imageUrl);
        if (item.imgUrl) images.add(item.imgUrl);
      });
    }
  } catch(e) {}

  // Metoda 3: regex alicdn
  const patterns = [
    /https:\/\/ae\d*\.alicdn\.com\/kf\/[A-Za-z0-9_\-]+\.jpg/gi,
    /https:\/\/ae01\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
    /https:\/\/ae02\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
    /https:\/\/ae03\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
  ];
  for (const p of patterns) {
    (html.match(p) || []).forEach(url => {
      const clean = url.replace(/\\u002F/g, "/").replace(/\\/g, "");
      if (clean.length > 40 && !clean.includes("icon") && !clean.includes("50x50")) {
        images.add(clean);
      }
    });
  }

  console.log("Total images found:", images.size);
  return [...images].slice(0, 8);
}

function extractMeta(html) {
  let title = "", priceUSD = 0;
  const tm = html.match(/"subject"\s*:\s*"([^"]{10,200})"/) ||
             html.match(/"title"\s*:\s*"([^"]{10,200})"/) ||
             html.match(/<title[^>]*>([^<|]+)/i);
  if (tm?.[1]) {
    title = tm[1].replace(/\s*[-|]\s*AliExpress.*$/i, "")
      .replace(/&amp;/g, "&").replace(/\\u[\dA-F]{4}/gi, "").trim();
  }
  const pm = html.match(/"discountPrice"\s*:\s*\{"value"\s*:\s*"([0-9.]+)"/) ||
             html.match(/US \$\s*([0-9.]+)/);
  if (pm?.[1]) priceUSD = parseFloat(pm[1]);
  return { title, priceUSD };
}

function callClaude(productInfo) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nu e setat");
  const rp = productInfo.priceUSD > 0 ? Math.round(productInfo.priceUSD * 5 * 2.5 / 10) * 10 : 149;
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    system: "Expert marketing COD România. DOAR JSON valid, fără backtick-uri.",
    messages: [{ role: "user", content: `Pagina vânzare COD pentru: "${productInfo.title || "produs"}" (~${productInfo.priceUSD} USD).
Returnează DOAR JSON:
{
  "productName":"nume scurt",
  "headline":"titlu captivant max 10 cuvinte",
  "subheadline":"2 propoziții convingătoare",
  "price":${rp},"oldPrice":${Math.round(rp*1.6)},"bumpPrice":${Math.round(rp*0.2)},
  "stock":7,"timerMinutes":14,"reviewCount":1247,
  "benefits":["b1 detaliat","b2 detaliat","b3 detaliat","b4 detaliat","b5 detaliat","b6 detaliat"],
  "howItWorks":[{"title":"Pas 1","desc":"desc 1"},{"title":"Pas 2","desc":"desc 2"},{"title":"Pas 3","desc":"desc 3"}],
  "bumpProduct":"produs complementar",
  "testimonials":[
    {"text":"testimonial credibil","name":"Nume1","city":"Oraș1","stars":5},
    {"text":"testimonial 2","name":"Nume2","city":"Oraș2","stars":5},
    {"text":"testimonial 3","name":"Nume3","city":"Oraș3","stars":5},
    {"text":"testimonial 4","name":"Nume4","city":"Oraș4","stars":5}
  ],
  "faq":[
    {"q":"Întrebare produs?","a":"Răspuns."},
    {"q":"Cum se face plata?","a":"La livrare, direct curierului."},
    {"q":"Cât durează livrarea?","a":"2-4 zile în toată România."},
    {"q":"Pot returna?","a":"Da, 30 zile retur gratuit."}
  ]
}` }]
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Length": Buffer.byteLength(body) },
      timeout: 25000
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          const d = JSON.parse(Buffer.concat(chunks).toString());
          if (d.error) throw new Error(d.error.message);
          const text = (d.content || []).map(c => c.text || "").join("");
          const match = text.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("No JSON");
          resolve(JSON.parse(match[0]));
        } catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Claude timeout")); });
    req.write(body); req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { aliUrl } = req.body;
    if (!aliUrl) return res.status(400).json({ error: "aliUrl lipseste" });

    console.log("=== START GENERATE ===");
    console.log("URL:", aliUrl);
    console.log("SCRAPER_API_KEY:", process.env.SCRAPER_API_KEY ? "SET ✓" : "NOT SET ✗");
    console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "SET ✓" : "NOT SET ✗");

    // Fetch HTML + Claude in paralel
    const [html, copy] = await Promise.all([
      fetchWithScraper(aliUrl).catch(e => { console.log("Fetch failed:", e.message); return ""; }),
      callClaude({ title: "", priceUSD: 0 })
    ]);

    console.log("HTML length:", html.length);

    let images = [];
    if (html.length > 500) {
      images = extractImages(html);
      const meta = extractMeta(html);
      console.log("Meta:", { title: meta.title?.substring(0, 50), priceUSD: meta.priceUSD });
      if (meta.title?.length > 5) copy.productName = meta.title.substring(0, 60);
      if (meta.priceUSD > 0) {
        const rp = Math.round(meta.priceUSD * 5 * 2.5 / 10) * 10;
        copy.price = rp; copy.oldPrice = Math.round(rp * 1.6); copy.bumpPrice = Math.round(rp * 0.2);
      }
    } else {
      console.log("HTML too short - AliExpress blocked or ScraperAPI issue");
    }

    console.log("Final images count:", images.length);
    console.log("=== END GENERATE ===");

    copy.images = images;
    res.status(200).json({ success: true, data: copy });
  } catch(err) {
    console.error("Handler error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
