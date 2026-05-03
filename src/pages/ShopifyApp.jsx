import { useState, useEffect } from 'react'

function SafeImg({ src, alt, style }) {
  const [err, setErr] = useState(false)
  if (!src || err) return null
  return <img src={src} alt={alt||''} style={style} onError={()=>setErr(true)} />
}

export default function ShopifyApp() {
  const [shop, setShop] = useState('')
  const [token, setToken] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState('connect') // connect | products | generate | publishing | done
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [aliUrl, setAliUrl] = useState('')
  const [pageData, setPageData] = useState(null)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('shop')
    const t = params.get('token')
    
    if (s && t) {
      // Avem shop si token - merge direct
      setShop(s)
      setToken(t)
      setScreen('products')
      loadProducts(s, t)
    } else if (s && !t) {
      // Avem shop dar nu token - redirectam la OAuth
      window.top.location.href = `/api/shopify-auth?shop=${s}`
    } else {
      // Nu avem nimic - incercam sa luam shop din referrer sau param
      const shopParam = params.get('shop') || 
        document.referrer.match(/admin\.shopify\.com\/store\/([^/]+)/)?.[1]
      if (shopParam) {
        const fullShop = shopParam.includes('.myshopify.com') 
          ? shopParam 
          : `${shopParam}.myshopify.com`
        window.top.location.href = `/api/shopify-auth?shop=${fullShop}`
      }
      // Altfel arata connect screen
    }
  }, [])

  async function loadProducts(s, t) {
    setLoading(true)
    try {
      const res = await fetch('/api/shopify-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_products', shop: s, token: t })
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch(e) {
      setError('Eroare la încărcarea produselor: ' + e.message)
    }
    setLoading(false)
  }

  async function generatePage() {
    if (!aliUrl.trim() && !selectedProduct) return
    setScreen('generate')
    setError('')
    setPageData(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliUrl: aliUrl.trim() || '' })
      })
      if (!res.ok) throw new Error('Server error ' + res.status)
      const json = await res.json()
      if (!json.data) throw new Error('No data returned')
      setPageData(json.data)
    } catch(e) {
      setError('Eroare la generare: ' + e.message)
      setScreen('products')
    }
  }

  async function publishToShopify() {
    if (!pageData) return
    setScreen('publishing')
    try {
      // Genereaza HTML-ul paginii
      const html = buildPageHTML(pageData)
      
      const res = await fetch('/api/shopify-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_page',
          shop,
          token,
          title: pageData.productName,
          bodyHtml: html
        })
      })
      const data = await res.json()
      if (data.success) {
        setPublishedUrl(data.url)
        setScreen('done')
      } else {
        throw new Error(data.error)
      }
    } catch(e) {
      setError('Eroare la publicare: ' + e.message)
      setScreen('generate')
    }
  }

  function buildPageHTML(data) {
    const price = data.price || 149
    const oldPrice = data.oldPrice || Math.round(price * 1.6)
    const disc = Math.round((1 - price/oldPrice) * 100)
    const imgs = data.images || []
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
${imgTag(imgs[0])}
<div style="padding:24px 20px">
  <h1 style="font-size:24px;font-weight:900;margin:0 0 10px">${data.headline}</h1>
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
${imgTag(imgs[1])}
<div style="padding:24px 20px">
  <h2 style="font-size:20px;font-weight:800;margin:0 0 16px">De ce să alegi ${data.productName}?</h2>
  ${(data.benefits||[]).map(benefitRow).join('')}
</div>
${imgTag(imgs[2])}
${imgTag(imgs[3])}
<div style="background:#f9fafb;padding:24px 20px">
  <h2 style="font-size:20px;font-weight:800;margin:0 0 16px">Ce spun clienții</h2>
  ${(data.testimonials||[]).map(t=>`<div style="background:#fff;border:1px solid #f3f4f6;border-radius:14px;padding:14px;margin-bottom:12px"><strong>${t.name}</strong> — ${t.city}<br><span style="color:#fbbf24">${'★'.repeat(t.stars||5)}</span><p style="margin:8px 0 0;font-size:14px;color:#374151">"${t.text}"</p></div>`).join('')}
</div>
<div id="pc-form" style="background:#fef2f2;border-top:3px solid #dc2626;padding:24px 20px">
  <h2 style="font-size:22px;font-weight:900;margin:0 0 16px">Comandă — Plată la livrare</h2>
  <div style="display:flex;flex-direction:column;gap:12px">
    <input id="pc-n" placeholder="Nume și prenume *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none">
    <input id="pc-t" placeholder="Telefon *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none">
    <select id="pc-j" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;color:#9ca3af">
      <option value="">Județ *</option>${jOpts}
    </select>
    <textarea id="pc-a" rows="2" placeholder="Adresa *" style="padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;resize:none"></textarea>
    <button onclick="(function(){var n=document.getElementById('pc-n').value,t=document.getElementById('pc-t').value,j=document.getElementById('pc-j').value,a=document.getElementById('pc-a').value;if(!n||!t||!j||!a){alert('Completează toate câmpurile');return;}document.getElementById('pc-form').innerHTML='<div style=text-align:center;padding:40px><div style=font-size:56px>✅</div><h2 style=color:#16a34a;margin-top:12px>Comandă plasată!</h2><p>Te contactăm în 24 ore.</p></div>';})()" style="padding:17px;border-radius:14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;font-size:18px;font-weight:900;cursor:pointer">🛒 FINALIZEAZĂ — ${price} LEI LA LIVRARE</button>
  </div>
</div>
<script>
(function(){var ts=${(data.timerMinutes||14)*60};function r(){var m=String(Math.floor(ts/60)).padStart(2,'0'),s=String(ts%60).padStart(2,'0');var el=document.getElementById('pc-timer');if(el)el.innerHTML='<div style="display:flex;gap:6px"><div style="text-align:center"><span style="background:#111;color:#fff;border-radius:6px;padding:6px 12px;font-size:20px;font-weight:900;font-family:monospace">'+m+'</span><div style="font-size:9px;color:rgba(255,255,255,0.7);margin-top:2px">MIN</div></div><div style="text-align:center"><span style="background:#111;color:#fff;border-radius:6px;padding:6px 12px;font-size:20px;font-weight:900;font-family:monospace">'+s+'</span><div style="font-size:9px;color:rgba(255,255,255,0.7);margin-top:2px">SEC</div></div></div>';}setInterval(function(){if(ts>0)ts--;r();},1000);r();})();
</script>
</div>`
  }

  const G = { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',system-ui,sans-serif", color:'#fff', padding:'24px' }

  // CONNECT SCREEN
  if (screen === 'connect') return (
    <div style={G}>
      <div style={{ maxWidth:480, margin:'0 auto', textAlign:'center', paddingTop:40 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#e53e3e,#c53030)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 20px' }}>🛒</div>
        <h1 style={{ fontSize:26, fontWeight:900, marginBottom:8 }}>PageCOD pentru Shopify</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, marginBottom:32 }}>Generează pagini de vânzare COD direct în magazinul tău Shopify.</p>
        
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:8 }}>URL magazin Shopify</label>
          <input value={shop} onChange={e=>setShop(e.target.value)} placeholder="magazinul-tau.myshopify.com"
            style={{ width:'100%', padding:'12px 16px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none' }} />
          <button onClick={() => window.location.href = `/api/shopify/auth?shop=${shop}`}
            disabled={!shop.trim()}
            style={{ width:'100%', marginTop:16, padding:14, borderRadius:10, background: shop.trim() ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'rgba(255,255,255,0.08)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor: shop.trim() ? 'pointer' : 'not-allowed' }}>
            Conectează magazinul →
          </button>
        </div>
      </div>
    </div>
  )

  // LOADING
  if (screen === 'generate') return (
    <div style={{ ...G, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:60, height:60, border:'3px solid #e53e3e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:16 }}>Se generează pagina COD...</p>
        {pageData && (
          <div style={{ marginTop:24 }}>
            <p style={{ color:'#68d391', marginBottom:16 }}>✅ Pagina generată! Publici în Shopify?</p>
            <button onClick={publishToShopify} style={{ padding:'12px 32px', borderRadius:10, background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              🚀 Publică în Shopify
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // PUBLISHING
  if (screen === 'publishing') return (
    <div style={{ ...G, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:60, height:60, border:'3px solid #68d391', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:16 }}>Se publică în Shopify...</p>
      </div>
    </div>
  )

  // DONE
  if (screen === 'done') return (
    <div style={{ ...G, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:440 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Pagina e live în Shopify!</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:24 }}>Pagina COD a fost creată în magazinul tău.</p>
        <a href={publishedUrl} target="_blank" rel="noreferrer"
          style={{ display:'inline-block', padding:'12px 24px', borderRadius:10, background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', textDecoration:'none', fontSize:15, fontWeight:700, marginBottom:12 }}>
          🔗 Vezi pagina live
        </a>
        <br/>
        <button onClick={() => { setScreen('products'); setPageData(null); setAliUrl(''); setSelectedProduct(null) }}
          style={{ padding:'10px 24px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', fontSize:14, cursor:'pointer', marginTop:8 }}>
          + Generează altă pagină
        </button>
      </div>
    </div>
  )

  // PRODUCTS SCREEN
  return (
    <div style={G}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#e53e3e,#c53030)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛒</div>
            <div>
              <div style={{ fontSize:16, fontWeight:700 }}>PageCOD</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{shop}</div>
            </div>
          </div>
        </div>

        {error && <div style={{ padding:'10px 16px', background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:10, fontSize:13, color:'#fc8181', marginBottom:16 }}>⚠️ {error}</div>}

        {/* Genereaza cu link AliExpress */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>🔗 Generează din link AliExpress</h2>
          <input value={aliUrl} onChange={e=>setAliUrl(e.target.value)}
            placeholder="https://www.aliexpress.com/item/..."
            style={{ width:'100%', padding:'12px 16px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:12 }} />
          <button onClick={generatePage} disabled={!aliUrl.trim()}
            style={{ width:'100%', padding:12, borderRadius:10, background: aliUrl.trim() ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'rgba(255,255,255,0.08)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor: aliUrl.trim() ? 'pointer' : 'not-allowed' }}>
            Generează pagină COD →
          </button>
        </div>

        {/* Sau din produse Shopify */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>🛍️ Sau alege un produs din magazin</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:16 }}>Pozele și descrierea vin direct din Shopify</p>
          
          {loading ? (
            <div style={{ textAlign:'center', padding:20, color:'rgba(255,255,255,0.4)' }}>Se încarcă produsele...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:20, color:'rgba(255,255,255,0.4)' }}>Nu s-au găsit produse</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {products.map(p => (
                <div key={p.id} onClick={() => { setSelectedProduct(p); setAliUrl(''); }}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, border: selectedProduct?.id === p.id ? '1.5px solid #e53e3e' : '1px solid rgba(255,255,255,0.08)', background: selectedProduct?.id === p.id ? 'rgba(229,62,62,0.08)' : 'rgba(255,255,255,0.02)', cursor:'pointer' }}>
                  {p.images?.[0] && <img src={p.images[0].src} alt={p.title} style={{ width:48, height:48, borderRadius:8, objectFit:'cover' }} onError={e=>e.target.style.display='none'} />}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600 }}>{p.title}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{p.variants?.[0]?.price} RON</div>
                  </div>
                  {selectedProduct?.id === p.id && <span style={{ color:'#e53e3e', fontSize:18 }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {selectedProduct && (
            <button onClick={generatePage} style={{ width:'100%', marginTop:16, padding:12, borderRadius:10, background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Generează pagină pentru {selectedProduct.title} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
