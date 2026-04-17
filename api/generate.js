const https = require("https");
const http = require("http");

function fetchWithScraper(url) {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) return fetchDirect(url);
  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=false&country_code=us`;
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
      },
      timeout: 25000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith("http") ? res.headers.location : "https://www.aliexpress.com" + res.headers.location;
        return fetchDirect(loc).then(resolve);
      }
      const chunks = [];
      const enc = res.headers["content-encoding"];
      const done = () => resolve(Buffer.concat(chunks).toString("utf8"));
      if (enc === "gzip") {
        const g = require("zlib").createGunzip();
        res.pipe(g); g.on("data", c => chunks.push(c)); g.on("end", done); g.on("error", () => resolve(""));
      } else if (enc === "br") {
        const b = require("zlib").createBrotliDecompress();
        res.pipe(b); b.on("data", c => chunks.push(c)); b.on("end", done); b.on("error", () => resolve(""));
      } else {
        res.on("data", c => chunks.push(c)); res.on("end", done);
      }
    });
    req.on("error", () => resolve(""));
    req.on("timeout", () => { req.destroy(); resolve(""); });
  });
}

function extractImages(html) {
  const images = new Set();
  try {
    const listMatch = html.match(/"imagePathList"\s*:\s*(\[.*?\])/s);
    if (listMatch) {
      JSON.parse(listMatch[1]).forEach(u => { if (u && u.startsWith("http")) images.add(u); });
    }
  } catch(e) {}
  try {
    const skuMatch = html.match(/"skuImageList"\s*:\s*(\[.*?\])/s);
    if (skuMatch) {
      JSON.parse(skuMatch[1]).forEach(item => {
        if (item.imageUrl) images.add(item.imageUrl);
        if (item.imgUrl) images.add(item.imgUrl);
      });
    }
  } catch(e) {}
  const patterns = [
    /https:\/\/ae\d*\.alicdn\.com\/kf\/[A-Za-z0-9_\-]+\.jpg/gi,
    /https:\/\/ae01\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
    /https:\/\/ae02\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
    /https:\/\/ae03\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
  ];
  for (const p of patterns) {
    (html.match(p) || []).forEach(url => {
      const clean = url.replace(/\\u002F/g, "/").replace(/\\/g, "").split(/["'<>\s]/)[0];
      if (clean.length > 40 && !clean.includes("icon") && !clean.includes("avatar") && !clean.includes("50x50")) {
        images.add(clean);
      }
    });
  }
  return [...images].slice(0, 8);
}

function extractMeta(html) {
  let title = "", priceUSD = 0, description = "";
  const tm = html.match(/"subject"\s*:\s*"([^"]{10,200})"/) || html.match(/<title[^>]*>([^<|]+)/i);
  if (tm?.[1]) title = tm[1].replace(/\s*[-|]\s*AliExpress.*$/i, "").replace(/&amp;/g, "&").trim();
  const pm = html.match(/"discountPrice"\s*:\s*\{"value"\s*:\s*"([0-9.]+)"/) || html.match(/US \$\s*([0-9.]+)/);
  if (pm?.[1]) priceUSD = parseFloat(pm[1]);
  const dm = html.match(/"description"\s*:\s*"([^"]{20,300})"/);
  if (dm?.[1]) description = dm[1].replace(/\\n/g, " ").trim();
  return { title, priceUSD, description };
}

function callClaude(productInfo) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nu e setat");
  const ronPrice = productInfo.priceUSD > 0 ? Math.round(productInfo.priceUSD * 5 * 2.5 / 10) * 10 : 149;
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    system: "Ești expert în marketing direct COD din România. Răspunzi DOAR cu JSON valid, fără backtick-uri.",
    messages: [{ role: "user", content: `Pagina COD pentru: "${productInfo.title||"produs"}" (~${productInfo.priceUSD} USD). JSON:
{
  "productName":"nume comercial scurt",
  "headline":"titlu captivant max 10 cuvinte română",
  "subheadline":"2 propoziții convingătoare",
  "price":${ronPrice},"oldPrice":${Math.round(ronPrice*1.6)},"bumpPrice":${Math.round(ronPrice*0.2)},
  "stock":7,"timerMinutes":14,"reviewCount":1247,
  "benefits":["b1","b2","b3","b4","b5","b6"],
  "howItWorks":[{"title":"P1","desc":"d1"},{"title":"P2","desc":"d2"},{"title":"P3","desc":"d3"}],
  "bumpProduct":"produs complementar",
  "testimonials":[
    {"text":"testimonial detaliat credibil","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"testimonial 2","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"testimonial 3","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"testimonial 4","name":"Prenume Nume","city":"Oraș","stars":5}
  ],
  "faq":[
    {"q":"Întrebare produs?","a":"Răspuns detaliat."},
    {"q":"Cum se face plata?","a":"La livrare, direct curierului. Nu plătești nimic în avans."},
    {"q":"Cât durează livrarea?","a":"2-4 zile lucrătoare în toată România."},
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
          const data = JSON.parse(Buffer.concat(chunks).toString());
          if (data.error) throw new Error(data.error.message);
          const text = (data.content || []).map(c => c.text || "").join("");
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
    console.log("Fetching:", aliUrl);
    console.log("ScraperAPI:", process.env.SCRAPER_API_KEY ? "SET" : "NOT SET");
    const [html, copy] = await Promise.all([
      fetchWithScraper(aliUrl).catch(() => ""),
      callClaude({ title: "", priceUSD: 0, description: "" })
    ]);
    console.log("HTML length:", html.length);
    let images = [];
    if (html.length > 1000) {
      images = extractImages(html);
      const meta = extractMeta(html);
      console.log("Images:", images.length, "Title:", meta.title, "Price:", meta.priceUSD);
      if (meta.title?.length > 5) { copy.productName = meta.title.substring(0, 60); }
      if (meta.priceUSD > 0) {
        const rp = Math.round(meta.priceUSD * 5 * 2.5 / 10) * 10;
        copy.price = rp; copy.oldPrice = Math.round(rp * 1.6); copy.bumpPrice = Math.round(rp * 0.2);
      }
    }
    copy.images = images;
    res.status(200).json({ success: true, data: copy });
  } catch(err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
