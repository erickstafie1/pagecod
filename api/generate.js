const https = require("https");
const http = require("http");

function fetchWithScraper(url) {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) return fetchDirect(url);
  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=false`;
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
        const loc = res.headers.location.startsWith("http") ? res.headers.location : "https://www.aliexpress.com" + res.headers.location;
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
    req.on("error", () => resolve(""));
    req.on("timeout", () => { req.destroy(); resolve(""); });
  });
}

function extractImages(html) {
  const images = new Set();
  try {
    const m = html.match(/"imagePathList"\s*:\s*(\[.*?\])/s);
    if (m) JSON.parse(m[1]).forEach(u => { if (u && u.startsWith("http")) images.add(u); });
  } catch(e) {}
  const patterns = [
    /https:\/\/ae\d*\.alicdn\.com\/kf\/[A-Za-z0-9_\-]+\.jpg/gi,
    /https:\/\/ae01\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
    /https:\/\/ae02\.alicdn\.com\/kf\/[^"'\s<>\\]+\.jpg/gi,
  ];
  for (const p of patterns) {
    (html.match(p) || []).forEach(url => {
      const clean = url.replace(/\\u002F/g, "/").replace(/\\/g, "").split(/["'<>\s]/)[0];
      if (clean.length > 40 && !clean.includes("icon") && !clean.includes("50x50")) images.add(clean);
    });
  }
  return [...images].slice(0, 8);
}

function extractMeta(html) {
  let title = "", priceUSD = 0;
  const tm = html.match(/"subject"\s*:\s*"([^"]{10,200})"/) || html.match(/<title[^>]*>([^<|]+)/i);
  if (tm?.[1]) title = tm[1].replace(/\s*[-|]\s*AliExpress.*$/i, "").replace(/&amp;/g, "&").trim();
  const pm = html.match(/"discountPrice"\s*:\s*\{"value"\s*:\s*"([0-9.]+)"/) || html.match(/US \$\s*([0-9.]+)/);
  if (pm?.[1]) priceUSD = parseFloat(pm[1]);
  return { title, priceUSD };
}

// Genereaza imagine cu Gemini Imagen
async function generateImageWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return new Promise((resolve) => {
    const body = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        responseMimeType: "image/jpeg"
      }
    });

    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      },
      timeout: 30000
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          // Extrage imaginea base64
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
              const base64 = part.inlineData.data;
              resolve(`data:${part.inlineData.mimeType};base64,${base64}`);
              return;
            }
          }
          resolve(null);
        } catch(e) {
          console.error("Gemini parse error:", e.message);
          resolve(null);
        }
      });
    });
    req.on("error", (e) => { console.error("Gemini request error:", e.message); resolve(null); });
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

// Genereaza 4 imagini contextuale cu Gemini
async function generateContextImages(productName, benefits) {
  const b1 = benefits?.[0] || "calitate superioara";
  const b2 = benefits?.[1] || "usor de folosit";
  
  const prompts = [
    // Poza 1: produs pe fundal alb, professional product photography
    `Professional product photography of ${productName}, white background, studio lighting, high quality, commercial photo, 4K, sharp focus`,
    // Poza 2: lifestyle - persoana folosind produsul
    `Lifestyle photo of a happy Romanian person using ${productName} at home, natural lighting, warm atmosphere, realistic`,
    // Poza 3: close-up detaliu produs  
    `Close-up detail shot of ${productName}, macro photography, showing quality and craftsmanship, white background`,
    // Poza 4: rezultat pozitiv - persoana fericita
    `Happy satisfied customer with ${productName}, Romanian family home setting, smiling, natural lighting, lifestyle photography`
  ];

  console.log("Generating images with Gemini for:", productName);
  
  // Genereaza toate imaginile in paralel
  const results = await Promise.all(
    prompts.map((prompt, i) => 
      generateImageWithGemini(prompt)
        .then(img => { console.log(`Image ${i+1}:`, img ? "OK" : "FAILED"); return img; })
        .catch(e => { console.log(`Image ${i+1} error:`, e.message); return null; })
    )
  );

  return results.filter(Boolean);
}

function callClaude(productInfo) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nu e setat");
  const rp = productInfo.priceUSD > 0 ? Math.round(productInfo.priceUSD * 5 * 2.5 / 10) * 10 : 149;
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    system: "Expert marketing COD România. DOAR JSON valid, fără backtick-uri.",
    messages: [{ role: "user", content: `Pagina vânzare COD pentru: "${productInfo.title||"produs"}" (~${productInfo.priceUSD} USD). Returnează DOAR JSON:
{
  "productName":"nume scurt comercial",
  "headline":"titlu captivant max 10 cuvinte",
  "subheadline":"2 propoziții convingătoare",
  "price":${rp},"oldPrice":${Math.round(rp*1.6)},"bumpPrice":${Math.round(rp*0.2)},
  "stock":7,"timerMinutes":14,"reviewCount":1247,
  "benefits":["b1 detaliat","b2 detaliat","b3 detaliat","b4 detaliat","b5 detaliat","b6 detaliat"],
  "howItWorks":[{"title":"Pas 1","desc":"desc 1"},{"title":"Pas 2","desc":"desc 2"},{"title":"Pas 3","desc":"desc 3"}],
  "bumpProduct":"produs complementar",
  "testimonials":[
    {"text":"testimonial credibil","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"t2","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"t3","name":"Prenume Nume","city":"Oraș","stars":5},
    {"text":"t4","name":"Prenume Nume","city":"Oraș","stars":5}
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

    console.log("=== GENERATE START ===");
    console.log("URL:", aliUrl);
    console.log("SCRAPER_API_KEY:", process.env.SCRAPER_API_KEY ? "SET" : "NOT SET");
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");

    // Fetch AliExpress + Claude in paralel
    const [html, copy] = await Promise.all([
      fetchWithScraper(aliUrl).catch(() => ""),
      callClaude({ title: "", priceUSD: 0 })
    ]);

    console.log("HTML length:", html.length);

    let aliImages = [];
    if (html.length > 1000) {
      aliImages = extractImages(html);
      const meta = extractMeta(html);
      if (meta.title?.length > 5) copy.productName = meta.title.substring(0, 60);
      if (meta.priceUSD > 0) {
        const rp = Math.round(meta.priceUSD * 5 * 2.5 / 10) * 10;
        copy.price = rp; copy.oldPrice = Math.round(rp * 1.6); copy.bumpPrice = Math.round(rp * 0.2);
      }
      console.log("AliExpress images:", aliImages.length);
    }

    // Genereaza imagini cu Gemini
    const geminiImages = await generateContextImages(copy.productName || "product", copy.benefits);
    console.log("Gemini images generated:", geminiImages.length);

    // Combina: poza hero din AliExpress (daca exista) + pozele Gemini
    let finalImages = [];
    if (aliImages.length > 0) {
      // Prima poza = din AliExpress (produsul real)
      // Restul = generate de Gemini
      finalImages = [aliImages[0], ...geminiImages];
    } else {
      // Toate din Gemini
      finalImages = geminiImages;
    }

    copy.images = finalImages;
    copy.aliImages = aliImages; // pastram si originalele

    console.log("Final images:", finalImages.length);
    console.log("=== GENERATE END ===");

    res.status(200).json({ success: true, data: copy });
  } catch(err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
