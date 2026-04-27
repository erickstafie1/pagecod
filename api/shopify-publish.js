const https = require("https");

// Upload imagine base64 in Shopify Files
function uploadImageToShopify(shop, token, base64Data, filename) {
  return new Promise((resolve) => {
    // Extrage mime type si data din base64 string
    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) { resolve(null); return; }
    const mimeType = match[1];
    const data = match[2];

    const body = JSON.stringify({
      file: {
        filename: filename,
        mimeType: mimeType,
        originalSource: `data:${mimeType};base64,${data}`
      }
    });

    // Shopify Files API via GraphQL
    const query = JSON.stringify({
      query: `mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            ... on MediaImage {
              image { url }
            }
          }
          userErrors { field message }
        }
      }`,
      variables: {
        files: [{
          filename: filename,
          mimeType: mimeType,
          originalSource: `data:${mimeType};base64,${data}`
        }]
      }
    });

    const req = https.request({
      hostname: shop,
      path: "/admin/api/2024-01/graphql.json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
        "Content-Length": Buffer.byteLength(query)
      },
      timeout: 30000
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          const result = JSON.parse(Buffer.concat(chunks).toString());
          const url = result?.data?.fileCreate?.files?.[0]?.image?.url;
          console.log("Upload result:", url ? "OK" : "FAILED", result?.data?.fileCreate?.userErrors);
          resolve(url || null);
        } catch(e) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(query);
    req.end();
  });
}

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
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function buildPageHTML(data, images) {
  const price = data.price || 149
  const oldPrice = data.oldPrice || Math.round(price * 1.6)
  const bumpPrice = data.bumpPrice || 29
  const disc = Math.round((1 - price/oldPrice) * 100)
  const JUDETE = ["Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București","Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Sălaj","Satu Mare","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea"]
  
  const imgTag = (src) => src ? `<img src="${src}" style="width:100%;height:300px;object-fit:cover;display:block" onerror="this.style.display='none'">` : ''
  const benefitRow = (b) => `<div style="display:flex;gap:12px;align-items:flex-start;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px 14px;margin-bottom:10px"><span style="color:#16a34a;font-weight:900;font-size:17px">✓</span><span style="font-size:14px;color:#166534;line-height:1.6">${b}</span></div>`
  const jOpts = JUDETE.map(j=>`<option value="${j}">${j}</option>`).join('')

  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff">
<div style="background:#111;color:#fff;text-align:center;padding:10px;font-size:13px;font-weight:600">🚚 LIVRARE GRATUITĂ peste 200 lei</div>
<div style="background:#dc2626;color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between">
  <div style="font-size:13px;font-weight:700">⚡ Doar <strong>${data.stock||7} bucăți</strong> rămase!</div>
  <div id="pc-timer"></div>
</div>
${imgTag(images[0])}
<div style="padding:24px 20px">
  <div style="display:inline-block;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:12px">OFERTĂ SPECIALĂ · -${disc}% REDUCERE</div>
  <h1 style="font-size:24px;font-weight:900;line-height:1.25;margin:0 0 10px">${data.headline}</h1>
  <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${data.subheadline}</p>
  <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:16px">
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:12px">
      <span style="font-size:38px;font-weight:900;color:#dc2626">${price} lei</span>
      <span style="font-size:20px;color:#d1d5db;text-decoration:line-through">${oldPrice} lei</span>
      <span style="background:#dc2626;color:#fff;border-radius:8px;padding:3px 10px;font-size:13px;font-weight:800">-${disc}%</span>
    </div>
  </div>
  <button onclick="document.getElementById('pc-form').scrollIntoView({behavior:'smooth'})" style="width:100%;padding:16px;border-radius:12px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;font-size:17px;font-weight:800;cursor:pointer">🛒 COMANDĂ ACUM</button>
</div>
${imgTag(images[1])}
<div style="padding:24px 20px">
  <h2 style="font-size:20px;font-weight:800;margin:0 0 16px">De ce să alegi ${data.productName}?</h2>
  ${(data.benefits||[]).map(benefitRow).join('')}
</div>
${imgTag(images[2])}
${imgTag(images[3])}
<div style="background:#f9fafb;padding:24px 20px">
  <h2 style="font-size:20px;font-weight:800;margin:0 0 16px">Ce spun clienții</h2>
  ${(data.testimonials||[]).map(t=>`<div style="background:#fff;border:1px solid #f3f4f6;border-radius:14px;padding:14px;margin-bottom:12px"><strong>${t.name}</strong> — ${t.city}<br><span style="color:#fbbf24">${'★'.repeat(t.stars||5)}</span><p style="margin:8px 0 0;font-size:14px;color:#374151">"${t.text}"</p></div>`).join('')}
</div>
<div id="pc-form" style="background:#fef2f2;border-top:3px solid #dc2626;padding:24px 20px">
  <h2 style="font-size:22px;font-weight:900;margin:0 0 16px">Comandă — Plată la livrare</h2>
  <div style="display:flex;flex-direction:column;gap:12px">
    <input id="pc-n" placeholder="Nume și prenume *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;width:100%;box-sizing:border-box">
    <input id="pc-t" placeholder="Telefon *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;width:100%;box-sizing:border-box">
    <select id="pc-j" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;width:100%;box-sizing:border-box;color:#9ca3af">
      <option value="">Județ *</option>${jOpts}
    </select>
    <textarea id="pc-a" rows="2" placeholder="Adresa *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;resize:none;width:100%;box-sizing:border-box"></textarea>
    <button onclick="(function(){var n=document.getElementById('pc-n').value,t=document.getElementById('pc-t').value,j=document.getElementById('pc-j').value,a=document.getElementById('pc-a').value;if(!n||!t||!j||!a){alert('Completează toate câmpurile');return;}document.getElementById('pc-form').innerHTML='<div style=text-align:center;padding:40px><div style=font-size:56px>✅</div><h2 style=color:#16a34a;margin-top:12px>Comandă plasată!</h2><p>Te contactăm în 24 ore.</p></div>';})()" style="padding:17px;border-radius:14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;font-size:18px;font-weight:900;cursor:pointer;width:100%">🛒 FINALIZEAZĂ — ${price} LEI LA LIVRARE</button>
  </div>
</div>
<script>
(function(){var ts=${(data.timerMinutes||14)*60};function r(){var m=String(Math.floor(ts/60)).padStart(2,'0'),s=String(ts%60).padStart(2,'0');var el=document.getElementById('pc-timer');if(el)el.innerHTML='<div style="display:flex;gap:6px"><div style="text-align:center"><span style="background:#111;color:#fff;border-radius:6px;padding:6px 12px;font-size:20px;font-weight:900;font-family:monospace">'+m+'</span><div style="font-size:9px;color:rgba(255,255,255,0.7);margin-top:2px">MIN</div></div><div style="text-align:center"><span style="background:#111;color:#fff;border-radius:6px;padding:6px 12px;font-size:20px;font-weight:900;font-family:monospace">'+s+'</span><div style="font-size:9px;color:rgba(255,255,255,0.7);margin-top:2px">SEC</div></div></div>';}setInterval(function(){if(ts>0)ts--;r();},1000);r();})();
</script>
</div>`
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, shop, token, title, bodyHtml, pageData } = req.body || {};
  if (!shop || !token) return res.status(400).json({ error: "Missing shop or token" });

  try {
    if (action === "get_products") {
      const data = await shopifyRequest(shop, token, "/products.json?limit=50&fields=id,title,images,variants", "GET");
      return res.status(200).json({ success: true, products: data.products || [] });
    }

    if (action === "publish_page") {
      // Daca avem pageData cu imagini Gemini, le uploadam in Shopify Files
      let finalImages = []
      
      if (pageData && pageData.images) {
        console.log("Uploading", pageData.images.length, "images to Shopify Files...");
        
        // Upload fiecare imagine in Shopify Files
        const uploadPromises = pageData.images.map(async (img, i) => {
          if (!img) return null;
          if (img.startsWith('data:')) {
            // Imagine Gemini base64 - o uploadam in Shopify
            const url = await uploadImageToShopify(shop, token, img, `pagecod-img-${i+1}-${Date.now()}.jpg`);
            console.log(`Image ${i+1} upload:`, url ? "OK - " + url.substring(0, 50) : "FAILED");
            return url;
          }
          // URL normal (AliExpress) - il pastram
          return img;
        });
        
        finalImages = await Promise.all(uploadPromises);
        finalImages = finalImages.filter(Boolean);
        console.log("Final images after upload:", finalImages.length);
      }

      // Genereaza HTML cu imaginile uploadate
      const html = pageData ? buildPageHTML(pageData, finalImages) : bodyHtml;
      
      const data = await shopifyRequest(shop, token, "/pages.json", "POST", {
        page: { title: title || pageData?.productName || 'Pagina COD', body_html: html, published: true }
      });
      
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
