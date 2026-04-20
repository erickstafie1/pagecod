function generateHTML(data) {
  const price = data.price || 149
  const oldPrice = data.oldPrice || Math.round(price * 1.6)
  const bumpPrice = data.bumpPrice || 29
  const disc = Math.round((1 - price / oldPrice) * 100)
  const imgs = data.images || []
  const hero = imgs[0] || ''
  const ctx = imgs.slice(1)
  const JUDETE = ["Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București","Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Sălaj","Satu Mare","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea"]
  const bHtml = (data.benefits||[]).slice(0,3).map(b=>`<div style="display:flex;gap:12px;align-items:flex-start;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px 14px;margin-bottom:10px"><span style="color:#16a34a;font-weight:900;font-size:17px;flex-shrink:0">✓</span><span style="font-size:14px;color:#166534;line-height:1.6">${b}</span></div>`).join('')
  const b2Html = (data.benefits||[]).slice(3).map(b=>`<div style="display:flex;gap:12px;align-items:flex-start;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px 14px;margin-bottom:10px"><span style="color:#16a34a;font-weight:900;font-size:17px;flex-shrink:0">✓</span><span style="font-size:14px;color:#166534;line-height:1.6">${b}</span></div>`).join('')
  const hwHtml = (data.howItWorks||[]).map((s,i)=>`<div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:16px"><div style="min-width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex-shrink:0">${i+1}</div><div style="padding-top:4px"><strong style="font-size:15px;font-weight:700;display:block;margin-bottom:3px">${s.title}</strong><span style="font-size:13px;color:#6b7280;line-height:1.6">${s.desc}</span></div></div>`).join('')
  const tHtml = (data.testimonials||[]).map(t=>`<div style="background:#fff;border:1px solid #f3f4f6;border-radius:14px;padding:14px 16px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px"><div style="display:flex;gap:10px;align-items:center"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#fecaca,#fca5a5);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#dc2626">${(t.name||'?').charAt(0)}</div><div><strong style="font-size:14px;font-weight:700;display:block">${t.name}</strong><span style="font-size:12px;color:#9ca3af">${t.city}</span></div></div><span style="color:#fbbf24;font-size:16px">${'★'.repeat(t.stars||5)}</span></div><p style="font-size:14px;color:#374151;line-height:1.6;margin:0">"${t.text}"</p></div>`).join('')
  const fHtml = (data.faq||[]).map(f=>`<details style="margin-bottom:10px;border:1.5px solid #f3f4f6;border-radius:12px;overflow:hidden"><summary style="padding:14px 16px;font-size:14px;font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;background:#fafafa">${f.q} <span style="color:#dc2626;font-size:20px;margin-left:12px">+</span></summary><div style="padding:12px 16px"><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0">${f.a}</p></div></details>`).join('')
  const imgS = (src,alt) => src ? `<img src="${src}" alt="${alt}" style="width:100%;height:300px;object-fit:cover;display:block" onerror="this.style.display='none'">` : ''
  const jOpts = JUDETE.map(j=>`<option value="${j}">${j}</option>`).join('')
  return `<!DOCTYPE html>\n<html lang="ro">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>${data.productName}</title>\n<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#fff;color:#111;max-width:600px;margin:0 auto}.inp{padding:12px 14px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;outline:none;width:100%;font-family:inherit}.btn{width:100%;padding:16px;border-radius:12px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;font-size:17px;font-weight:800;cursor:pointer}.timer{display:flex;gap:8px;justify-content:center}.tv{background:#111;color:#fff;border-radius:8px;padding:10px 18px;font-size:26px;font-weight:900;font-family:monospace;min-width:56px;display:block;text-align:center}.tl{font-size:10px;color:#999;margin-top:3px;letter-spacing:2px;display:block;text-align:center}#success{display:none;text-align:center;padding:60px 24px}</style>\n</head>\n<body>\n<div id="page">\n<div style="background:#111;color:#fff;text-align:center;padding:10px 16px;font-size:13px;font-weight:600">🚚 LIVRARE GRATUITĂ peste 200 lei · ☎ 0700 000 000</div>\n<div style="background:#dc2626;color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px"><div style="font-size:13px;font-weight:700">⚡ Doar <strong>${data.stock||7} bucăți</strong> rămase!</div><div class="timer" id="t1"></div></div>\n${imgS(hero,data.productName)}\n<div style="padding:24px 20px 16px"><div style="display:inline-block;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:12px">OFERTĂ SPECIALĂ · -${disc}% REDUCERE</div><h1 style="font-size:24px;font-weight:900;line-height:1.25;margin:0 0 10px">${data.headline}</h1><p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${data.subheadline}</p><div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:16px"><div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px"><span id="pd" style="font-size:38px;font-weight:900;color:#dc2626">${price} lei</span><span style="font-size:20px;color:#d1d5db;text-decoration:line-through">${oldPrice} lei</span><span style="background:#dc2626;color:#fff;border-radius:8px;padding:3px 10px;font-size:13px;font-weight:800">-${disc}%</span></div><div style="display:flex;align-items:center;gap:12px"><span style="font-size:14px;color:#6b7280">Cantitate:</span><div style="display:flex;align-items:center;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden"><button onclick="cq(-1)" style="width:38px;height:38px;border:none;background:#f9fafb;font-size:18px;cursor:pointer">−</button><span id="qty" style="width:40px;text-align:center;font-size:17px;font-weight:800">1</span><button onclick="cq(1)" style="width:38px;height:38px;border:none;background:#f9fafb;font-size:18px;cursor:pointer">+</button></div></div></div><button class="btn" onclick="document.getElementById('form').scrollIntoView({behavior:'smooth'})">🛒 COMANDĂ ACUM — PLATĂ LA LIVRARE</button><p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:8px">Nu plătești nimic acum · Livrare 2–4 zile · Ramburs curier</p></div>\n<div style="background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;padding:16px 20px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">🔒</span><div><div style="font-size:13px;font-weight:700">Plată securizată</div><div style="font-size:12px;color:#9ca3af">100% sigur</div></div></div><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">🚚</span><div><div style="font-size:13px;font-weight:700">Livrare rapidă</div><div style="font-size:12px;color:#9ca3af">2–4 zile</div></div></div><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">↩️</span><div><div style="font-size:13px;font-weight:700">Retur gratuit</div><div style="font-size:12px;color:#9ca3af">30 de zile</div></div></div><div style="display:flex;gap:10px;align-items:center"><span style="font-size:22px">⭐</span><div><div style="font-size:13px;font-weight:700">Clienți mulțumiți</div><div style="font-size:12px;color:#9ca3af">4.9/5 stele</div></div></div></div></div>\n${imgS(ctx[0],'produs')}\n<div style="padding:24px 20px"><h2 style="font-size:20px;font-weight:800;margin:0 0 16px">De ce să alegi ${data.productName}?</h2>${bHtml}</div>\n${imgS(ctx[1],'utilizare')}\n<div style="padding:24px 20px"><h2 style="font-size:20px;font-weight:800;margin:0 0 18px">Cum funcționează?</h2>${hwHtml}</div>\n${imgS(ctx[2],'rezultat')}\n<div style="padding:24px 20px"><h2 style="font-size:20px;font-weight:800;margin:0 0 16px">Mai multe motive</h2>${b2Html}</div>\n${imgS(ctx[3],'clienti')}\n<div style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 20px"><h2 style="font-size:20px;font-weight:800;margin:0 0 6px">Ce spun clienții</h2><p style="font-size:13px;color:#9ca3af;margin-bottom:18px">Peste ${(data.reviewCount||1200).toLocaleString()} recenzii ⭐⭐⭐⭐⭐</p>${tHtml}</div>\n<div style="padding:24px 20px"><h2 style="font-size:20px;font-weight:800;margin:0 0 16px">Întrebări frecvente</h2>${fHtml}</div>\n<div id="form" style="background:linear-gradient(180deg,#fef2f2,#fff);border-top:3px solid #dc2626;padding:24px 20px"><div style="text-align:center;margin-bottom:20px"><p style="font-size:13px;font-weight:700;color:#dc2626;margin:0 0 8px">⏰ Oferta expiră în curând:</p><div class="timer" id="t2"></div></div><h2 style="font-size:22px;font-weight:900;margin:0 0 6px">Comandă acum — Plată la livrare</h2><p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6">Nu plătești nimic acum.</p><div style="display:flex;flex-direction:column;gap:12px"><input class="inp" id="fn" placeholder="Nume și prenume *"><input class="inp" id="ft" placeholder="Număr de telefon *"><select class="inp" id="fj" style="color:#9ca3af"><option value="">Selectează județul *</option>${jOpts}</select><input class="inp" id="fl" placeholder="Localitatea *"><textarea class="inp" id="fa" rows="2" placeholder="Strada, număr *" style="resize:none"></textarea>${data.bumpProduct?`<label style="display:flex;gap:12px;align-items:flex-start;background:#fffbeb;border:2px dashed #fcd34d;border-radius:12px;padding:14px 16px;cursor:pointer"><input type="checkbox" id="bc" onchange="ut()" style="margin-top:3px;width:18px;height:18px;accent-color:#dc2626"><div><div style="font-size:14px;font-weight:800;color:#92400e;margin-bottom:3px">DA! Adaugă și ${data.bumpProduct}</div><div style="font-size:13px;color:#b45309">Doar +${bumpPrice} lei</div></div></label>`:''}<div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;font-size:14px"><div style="font-weight:700;font-size:12px;color:#9ca3af;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Sumar</div><div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#374151"><span>${data.productName} <span id="ql">×1</span></span><span id="lp" style="font-weight:600">${price} lei</span></div>${data.bumpProduct?`<div id="br" style="display:none;justify-content:space-between;margin-bottom:8px;color:#374151"><span>${data.bumpProduct}</span><span style="font-weight:600">${bumpPrice} lei</span></div>`:''}<div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#374151"><span>Livrare</span><span style="color:#16a34a;font-weight:700">GRATUITĂ</span></div><div style="border-top:1.5px solid #f3f4f6;padding-top:10px;display:flex;justify-content:space-between;font-weight:900;font-size:18px"><span>Total</span><span id="tp" style="color:#dc2626">${price} lei</span></div></div><div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:10px 14px;font-size:13px;color:#15803d;display:flex;gap:8px;align-items:center"><span>🔒</span><span>Plata <strong>doar la livrare</strong>.</span></div><button style="padding:17px;border-radius:14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(220,38,38,0.4);width:100%" onclick="sub()">🛒 FINALIZEAZĂ — <span id="bt">${price}</span> LEI LA LIVRARE</button><p style="font-size:12px;color:#9ca3af;text-align:center">Prin plasarea comenzii ești de acord cu T&C</p></div></div></div>\n<div style="background:#111;color:#6b7280;padding:20px;text-align:center;font-size:12px"><p style="margin:0 0 4px;color:#9ca3af;font-weight:600">© 2025 ${data.productName}</p><p style="margin:0">Termeni · Confidențialitate · ANPC</p></div>\n</div>\n<div id="success"><div style="font-size:64px;margin-bottom:16px">✅</div><h2 style="color:#16a34a;font-size:24px;font-weight:800">Comandă plasată!</h2><p style="color:#555;font-size:16px;line-height:1.7;margin-top:8px">Te vom contacta în maxim <strong>24 ore</strong>.</p></div>\n<script>let P=${price},BP=${bumpPrice},q=1,ts=${(data.timerMinutes||14)*60};function r(){const m=String(Math.floor(ts/60)).padStart(2,'0'),s=String(ts%60).padStart(2,'0'),h='<div class=\'tv\'>'+m+'</div><div class=\'tl\'>MIN</div></div><div><span class=\'tv\'>'+s+'</span><span class=\'tl\'>SEC</span></div>';['t1','t2'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=h})}setInterval(()=>{if(ts>0)ts--;r()},1000);r();function cq(d){q=Math.max(1,q+d);document.getElementById('qty').textContent=q;document.getElementById('ql').textContent='×'+q;ut()}function ut(){const b=document.getElementById('bc')?.checked?BP:0,br=document.getElementById('br');if(br)br.style.display=b?'flex':'none';const t=P*q+b;document.getElementById('pd').textContent=(P*q)+' lei';document.getElementById('lp').textContent=(P*q)+' lei';document.getElementById('tp').textContent=t+' lei';document.getElementById('bt').textContent=t}function sub(){const n=document.getElementById('fn')?.value.trim(),t=document.getElementById('ft')?.value.trim(),j=document.getElementById('fj')?.value,a=document.getElementById('fa')?.value.trim();if(!n||!t||!j||!a){alert('Completează toate câmpurile *');return}document.getElementById('page').style.display='none';document.getElementById('success').style.display='block'}<\/script>\n</body>\n</html>`
}

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const JUDETE = ["Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București","Buzău","Călărași","Caraș-Severin","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Sălaj","Satu Mare","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vâlcea","Vaslui","Vrancea"]

function Timer({ minutes = 14 }) {
  const [s, setS] = useState(minutes * 60)
  useEffect(() => { const t = setInterval(() => setS(x => x > 0 ? x - 1 : 0), 1000); return () => clearInterval(t) }, [])
  const p = n => String(n).padStart(2, '0')
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {[[p(Math.floor(s/60)),'MIN'],[p(s%60),'SEC']].map(([v,l],i)=>(
        <div key={i} style={{ textAlign:'center' }}>
          <div style={{ background:'#111', color:'#fff', borderRadius:8, padding:'10px 18px', fontSize:26, fontWeight:900, fontFamily:'monospace', minWidth:56 }}>{v}</div>
          <div style={{ fontSize:10, color:'#999', marginTop:3, letterSpacing:2 }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

// Text editabil inline
function E({ val, set, tag='p', textarea=false, style={}, em }) {
  if (!em) { const Tag=tag; return <Tag style={style}>{val}</Tag> }
  const base = { ...style, background:'rgba(99,102,241,0.1)', border:'2px dashed #6366f1', borderRadius:4, outline:'none', fontFamily:'inherit', color:'inherit', fontSize:'inherit', fontWeight:'inherit', lineHeight:'inherit', padding:'2px 6px', width:'100%', boxSizing:'border-box', cursor:'text' }
  if (textarea) return <textarea value={val} onChange={e=>set(e.target.value)} rows={3} style={{ ...base, resize:'vertical', display:'block' }} />
  return <input value={val} onChange={e=>set(e.target.value)} style={{ ...base, display:'block' }} />
}

function SafeImg({ src, alt, style }) {
  const [err, setErr] = useState(false)
  if (!src || err) return (
    <div style={{ ...style, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}>
      <span style={{ fontSize:32 }}>🖼️</span>
      <span style={{ fontSize:11, color:'#999' }}>Imagine indisponibilă</span>
    </div>
  )
  return <img src={src} alt={alt||''} style={{ ...style, objectFit:'cover' }} onError={()=>setErr(true)} />
}

function LandingPreview({ data, setData, em }) {
  const [order, setOrder] = useState({ nume:'', telefon:'', judet:'', localitate:'', adresa:'', bump:false })
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState(false)
  const formRef = useRef()

  const price = data.price||149, oldPrice = data.oldPrice||Math.round(price*1.6), bumpPrice = data.bumpPrice||29
  const disc = Math.round((1-price/oldPrice)*100)
  const total = price*qty + (order.bump&&data.bumpProduct ? bumpPrice : 0)
  const imgs = data.images||[], hero = imgs[0], ctx = imgs.slice(1)

  const upd = k=>v=>setData(d=>({...d,[k]:v}))
  const updB = (i,v)=>setData(d=>{const b=[...(d.benefits||[])];b[i]=v;return{...d,benefits:b}})
  const updT = (i,k,v)=>setData(d=>{const t=[...(d.testimonials||[])];t[i]={...t[i],[k]:v};return{...d,testimonials:t}})
  const updH = (i,k,v)=>setData(d=>{const h=[...(d.howItWorks||[])];h[i]={...h[i],[k]:v};return{...d,howItWorks:h}})
  const updF = (i,k,v)=>setData(d=>{const f=[...(d.faq||[])];f[i]={...f[i],[k]:v};return{...d,faq:f}})

  const inp = { padding:'12px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:15, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' }
  const imgH = { width:'100%', height:300, display:'block' }

  if (done) return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", padding:'60px 24px', textAlign:'center', background:'#fff' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <h2 style={{ color:'#16a34a', fontSize:24, fontWeight:800 }}>Comandă plasată!</h2>
      <p style={{ color:'#555', fontSize:16, lineHeight:1.7, marginTop:8 }}>Te vom contacta în maxim <strong>24 ore</strong>. Plata la livrare.</p>
    </div>
  )

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:'#fff', color:'#111' }}>
      <div style={{ background:'#111', color:'#fff', textAlign:'center', padding:'10px 16px', fontSize:13, fontWeight:600 }}>🚚 LIVRARE GRATUITĂ peste 200 lei &nbsp;·&nbsp; ☎ 0700 000 000</div>
      <div style={{ background:'#dc2626', color:'#fff', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:13, fontWeight:700 }}>⚡ Doar <strong>{data.stock||7} bucăți</strong> rămase!</div>
        <Timer minutes={data.timerMinutes||14} />
      </div>

      {/* HERO IMAGE */}
      <SafeImg src={hero} alt={data.productName} style={imgH} />

      <div style={{ padding:'24px 20px 16px' }}>
        <div style={{ display:'inline-block', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700, marginBottom:12 }}>OFERTĂ SPECIALĂ · -{disc}% REDUCERE</div>
        <E val={data.headline} set={upd('headline')} tag="h1" em={em} style={{ fontSize:24, fontWeight:900, lineHeight:1.25, margin:'0 0 10px', color:'#111' }} />
        <E val={data.subheadline} set={upd('subheadline')} textarea em={em} style={{ fontSize:15, color:'#555', lineHeight:1.7, margin:'0 0 20px' }} />

        <div style={{ background:'#fafafa', border:'1.5px solid #e5e7eb', borderRadius:16, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:8 }}>
            <span style={{ fontSize:38, fontWeight:900, color:'#dc2626' }}>{(price*qty).toFixed(0)} lei</span>
            <span style={{ fontSize:20, color:'#d1d5db', textDecoration:'line-through' }}>{(oldPrice*qty).toFixed(0)} lei</span>
            <span style={{ background:'#dc2626', color:'#fff', borderRadius:8, padding:'3px 10px', fontSize:13, fontWeight:800 }}>-{disc}%</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:14, color:'#6b7280' }}>Cantitate:</span>
            <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:38, height:38, border:'none', background:'#f9fafb', fontSize:18, cursor:'pointer' }}>−</button>
              <span style={{ width:40, textAlign:'center', fontSize:17, fontWeight:800 }}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{ width:38, height:38, border:'none', background:'#f9fafb', fontSize:18, cursor:'pointer' }}>+</button>
            </div>
          </div>
        </div>

        <button onClick={()=>formRef.current?.scrollIntoView({behavior:'smooth'})} style={{ width:'100%', padding:16, borderRadius:12, background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'#fff', border:'none', fontSize:17, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 14px rgba(220,38,38,0.35)' }}>🛒 COMANDĂ ACUM — PLATĂ LA LIVRARE</button>
        <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:8, marginBottom:0 }}>Nu plătești nimic acum · Livrare 2–4 zile · Ramburs curier</p>
      </div>

      {/* TRUST */}
      <div style={{ background:'#f9fafb', borderTop:'1px solid #f3f4f6', borderBottom:'1px solid #f3f4f6', padding:'16px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[['🔒','Plată securizată','100% sigur'],['🚚','Livrare rapidă','2–4 zile'],['↩️','Retur gratuit','30 de zile'],['⭐','Clienți mulțumiți','4.9/5 stele']].map(([ic,t,s])=>(
            <div key={t} style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:22 }}>{ic}</span><div><div style={{ fontSize:13, fontWeight:700 }}>{t}</div><div style={{ fontSize:12, color:'#9ca3af' }}>{s}</div></div></div>
          ))}
        </div>
      </div>

      {/* POZA 1 + BENEFICII */}
      <SafeImg src={ctx[0]} alt="produs" style={imgH} />
      <div style={{ padding:'24px 20px' }}>
        <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>De ce să alegi {data.productName}?</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {(data.benefits||[]).slice(0,3).map((b,i)=>(
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 14px' }}>
              <span style={{ color:'#16a34a', fontWeight:900, fontSize:17, flexShrink:0 }}>✓</span>
              <E val={b} set={v=>updB(i,v)} em={em} style={{ fontSize:14, color:'#166534', lineHeight:1.6 }} />
            </div>
          ))}
        </div>
      </div>

      {/* POZA 2 + CUM FUNCTIONEAZA */}
      <SafeImg src={ctx[1]} alt="utilizare" style={imgH} />
      {data.howItWorks?.length > 0 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 18px' }}>Cum funcționează?</h2>
          {data.howItWorks.map((step,i)=>(
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ minWidth:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, flexShrink:0 }}>{i+1}</div>
              <div style={{ paddingTop:4 }}>
                <E val={step.title} set={v=>updH(i,'title',v)} em={em} tag="strong" style={{ fontSize:15, fontWeight:700, display:'block', marginBottom:3 }} />
                <E val={step.desc} set={v=>updH(i,'desc',v)} em={em} style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POZA 3 + BENEFICII 4-6 */}
      <SafeImg src={ctx[2]} alt="rezultat" style={imgH} />
      {(data.benefits||[]).length > 3 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>Mai multe motive să comanzi azi</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(data.benefits||[]).slice(3).map((b,i)=>(
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 14px' }}>
                <span style={{ color:'#16a34a', fontWeight:900, fontSize:17, flexShrink:0 }}>✓</span>
                <E val={b} set={v=>updB(i+3,v)} em={em} style={{ fontSize:14, color:'#166534', lineHeight:1.6 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POZA 4 + TESTIMONIALE */}
      <SafeImg src={ctx[3]} alt="clienti" style={imgH} />
      {data.testimonials?.length > 0 && (
        <div style={{ background:'#f9fafb', borderTop:'1px solid #f3f4f6', padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 6px' }}>Ce spun clienții noștri</h2>
          <p style={{ fontSize:13, color:'#9ca3af', marginBottom:18, marginTop:0 }}>Peste {(data.reviewCount||1200).toLocaleString()} recenzii ⭐⭐⭐⭐⭐</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {data.testimonials.map((t,i)=>(
              <div key={i} style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:14, padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#fecaca,#fca5a5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'#dc2626' }}>{t.name?.charAt(0)}</div>
                    <div>
                      <E val={t.name} set={v=>updT(i,'name',v)} em={em} tag="strong" style={{ fontSize:14, fontWeight:700, display:'block' }} />
                      <E val={t.city} set={v=>updT(i,'city',v)} em={em} style={{ fontSize:12, color:'#9ca3af' }} />
                    </div>
                  </div>
                  <span style={{ color:'#fbbf24', fontSize:16 }}>{'★'.repeat(t.stars||5)}</span>
                </div>
                <E val={t.text} set={v=>updT(i,'text',v)} em={em} textarea style={{ fontSize:14, color:'#374151', lineHeight:1.6, margin:0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {data.faq?.length > 0 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>Întrebări frecvente</h2>
          {data.faq.map((item,i)=>(
            <details key={i} style={{ marginBottom:10, border:'1.5px solid #f3f4f6', borderRadius:12, overflow:'hidden' }}>
              <summary style={{ padding:'14px 16px', fontSize:14, fontWeight:700, cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                <E val={item.q} set={v=>updF(i,'q',v)} em={em} style={{ fontSize:14, fontWeight:700 }} />
                <span style={{ color:'#dc2626', fontSize:20, marginLeft:12, flexShrink:0 }}>+</span>
              </summary>
              <div style={{ padding:'12px 16px' }}>
                <E val={item.a} set={v=>updF(i,'a',v)} em={em} textarea style={{ fontSize:14, color:'#6b7280', lineHeight:1.7 }} />
              </div>
            </details>
          ))}
        </div>
      )}

      {/* COD FORM */}
      <div ref={formRef} style={{ background:'linear-gradient(180deg,#fef2f2,#fff)', borderTop:'3px solid #dc2626', padding:'24px 20px' }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#dc2626', margin:'0 0 8px' }}>⏰ Oferta expiră în curând:</p>
          <Timer minutes={data.timerMinutes||14} />
        </div>
        <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 6px' }}>Comandă acum — Plată la livrare</h2>
        <p style={{ fontSize:14, color:'#6b7280', margin:'0 0 20px', lineHeight:1.6 }}>Nu plătești nimic acum — curierul îți aduce produsul și plătești la ușă.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input placeholder="Nume și prenume *" value={order.nume} onChange={e=>setOrder(o=>({...o,nume:e.target.value}))} style={inp} />
          <input placeholder="Număr de telefon *" value={order.telefon} onChange={e=>setOrder(o=>({...o,telefon:e.target.value}))} style={inp} />
          <select value={order.judet} onChange={e=>setOrder(o=>({...o,judet:e.target.value}))} style={{ ...inp, color:order.judet?'#111':'#9ca3af' }}>
            <option value="">Selectează județul *</option>
            {JUDETE.map(j=><option key={j} value={j}>{j}</option>)}
          </select>
          <input placeholder="Localitatea *" value={order.localitate} onChange={e=>setOrder(o=>({...o,localitate:e.target.value}))} style={inp} />
          <textarea placeholder="Strada, număr, bloc, apartament *" value={order.adresa} onChange={e=>setOrder(o=>({...o,adresa:e.target.value}))} rows={2} style={{ ...inp, resize:'none' }} />
          {data.bumpProduct && (
            <label style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#fffbeb', border:'2px dashed #fcd34d', borderRadius:12, padding:'14px 16px', cursor:'pointer' }}>
              <input type="checkbox" checked={order.bump} onChange={e=>setOrder(o=>({...o,bump:e.target.checked}))} style={{ marginTop:3, accentColor:'#dc2626', width:18, height:18 }} />
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:'#92400e', marginBottom:3 }}>DA! Adaugă și {data.bumpProduct}</div>
                <div style={{ fontSize:13, color:'#b45309' }}>Doar +{bumpPrice} lei — ofertă exclusivă</div>
              </div>
            </label>
          )}
          <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:14, padding:16, fontSize:14 }}>
            <div style={{ fontWeight:700, fontSize:12, color:'#9ca3af', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>Sumar comandă</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, color:'#374151' }}><span>{data.productName} ×{qty}</span><span style={{ fontWeight:600 }}>{(price*qty).toFixed(0)} lei</span></div>
            {order.bump && data.bumpProduct && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, color:'#374151' }}><span>{data.bumpProduct}</span><span style={{ fontWeight:600 }}>{bumpPrice} lei</span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, color:'#374151' }}><span>Livrare</span><span style={{ color:'#16a34a', fontWeight:700 }}>GRATUITĂ</span></div>
            <div style={{ borderTop:'1.5px solid #f3f4f6', paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:18 }}><span>Total la livrare</span><span style={{ color:'#dc2626' }}>{total.toFixed(0)} lei</span></div>
          </div>
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#15803d', display:'flex', gap:8, alignItems:'center' }}><span>🔒</span><span>Plata se face <strong>doar la livrare</strong>. Datele tale sunt în siguranță.</span></div>
          <button onClick={()=>{ if(!order.nume||!order.telefon||!order.judet||!order.adresa){alert('Completează toate câmpurile *');return;} setDone(true) }} style={{ padding:17, borderRadius:14, background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'#fff', border:'none', fontSize:18, fontWeight:900, cursor:'pointer', boxShadow:'0 6px 20px rgba(220,38,38,0.4)' }}>
            🛒 FINALIZEAZĂ — {total.toFixed(0)} LEI LA LIVRARE
          </button>
          <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', margin:0 }}>Prin plasarea comenzii ești de acord cu T&C</p>
        </div>
      </div>
      <div style={{ background:'#111', color:'#6b7280', padding:'20px', textAlign:'center', fontSize:12 }}>
        <p style={{ margin:'0 0 4px', color:'#9ca3af', fontWeight:600 }}>© 2025 {data.productName}</p>
        <p style={{ margin:0 }}>Termeni · Confidențialitate · ANPC</p>
      </div>
    </div>
  )
}

export default function Generator({ user, navigate }) {
  const [aliUrl, setAliUrl] = useState(() => sessionStorage.getItem('gen_url') || '')
  const [screen, setScreen] = useState(() => sessionStorage.getItem('gen_screen') || 'input')
  const [loadMsg, setLoadMsg] = useState('')
  const [loadPct, setLoadPct] = useState(0)
  const [pageDataRaw, setPageDataRaw] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gen_data') || 'null') } catch { return null }
  })
  const pageData = pageDataRaw
  const setPageData = (d) => {
    const val = typeof d === 'function' ? d(pageDataRaw) : d
    try { sessionStorage.setItem('gen_data', JSON.stringify(val)) } catch {}
    setPageDataRaw(val)
  }
  const [em, setEm] = useState(false)
  const [device, setDevice] = useState('mobile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(() => !!sessionStorage.getItem('gen_slug'))
  const [savedSlug, setSavedSlug] = useState(() => sessionStorage.getItem('gen_slug') || '')
  const [error, setError] = useState('')
  const [credits, setCredits] = useState(null)
  const [regenCount, setRegenCount] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('gen_regens') || '{}')
      return saved[sessionStorage.getItem('gen_url') || ''] || 0
    } catch { return 0 }
  })

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('credits').eq('id', user.id).single()
        .then(({ data }) => setCredits(data?.credits ?? 0))
    }
  }, [user])

  const STEPS = [
    [10,'🔍 Accesez pagina AliExpress...'],
    [35,'🖼️ Extrag pozele produsului...'],
    [60,'✍️ Generez copywriting în română...'],
    [80,'📦 Construiesc pagina COD...'],
    [95,'✅ Finalizez...'],
  ]

  async function generate() {
    if (!aliUrl.trim()) return
    if (credits !== null && credits <= 0) {
      navigate('pricing')
      return
    }
    setScreen('loading'); setError(''); setLoadPct(5); setSaved(false); setSavedSlug('')
    let si = 0; setLoadMsg(STEPS[0][1])
    const tid = setInterval(() => {
      si = Math.min(si+1, STEPS.length-1)
      setLoadMsg(STEPS[si][1])
      setLoadPct(STEPS[si][0])
    }, 2800)
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ aliUrl: aliUrl.trim() })
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||`Error ${res.status}`) }
      const { data } = await res.json()
      setPageData(data)
      setLoadPct(100)
      sessionStorage.setItem('gen_screen','result')
      sessionStorage.setItem('gen_url', aliUrl.trim())
      // Track regen count per URL
      try {
        const regens = JSON.parse(sessionStorage.getItem('gen_regens') || '{}')
        const key = aliUrl.trim()
        regens[key] = (regens[key] || 0) + 1
        sessionStorage.setItem('gen_regens', JSON.stringify(regens))
        setRegenCount(regens[key])
      } catch {}
      setTimeout(() => setScreen('result'), 400)
    } catch(e) {
      setError(e.message)
      sessionStorage.setItem('gen_screen','input')
      setScreen('input')
    }
    clearInterval(tid)
  }

  async function savePage() {
    if (!pageData || saving) return
    setSaving(true)
    try {
      // Verifica credite
      const { data: prof } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
      if (!prof || prof.credits <= 0) {
        alert('Nu ai credite disponibile. Cumpără mai multe!')
        navigate('pricing')
        setSaving(false)
        return
      }

      const slug = Math.random().toString(36).substr(2, 8)
      const { error: insertErr } = await supabase.from('pages').insert({
        user_id: user.id,
        slug,
        product_name: pageData.productName || 'Produs',
        price: pageData.price || 149,
        hero_image: pageData.images?.[0] || null,
        page_data: pageData
      })
      if (insertErr) throw insertErr

      // Scade 1 credit
      const { error: rpcErr } = await supabase.rpc('decrement_credits', { user_id: user.id })
      if (rpcErr) console.error('RPC error:', rpcErr)

      setCredits(c => Math.max(0, (c||1) - 1))
      sessionStorage.setItem('gen_slug', slug)
      setSavedSlug(slug)
      setSaved(true)
    } catch(e) {
      alert('Eroare la salvare: ' + e.message)
    }
    setSaving(false)
  }

  const G = { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',system-ui,sans-serif", color:'#fff' }

  // LOADING
  if (screen === 'loading') return (
    <div style={{ ...G, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:440, padding:24 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#e53e3e,#c53030)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 24px', boxShadow:'0 8px 24px rgba(229,62,62,0.3)' }}>🤖</div>
        <h2 style={{ fontSize:22, fontWeight:800, margin:'0 0 8px' }}>Se generează pagina ta...</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, margin:'0 0 32px', lineHeight:1.6 }}>{loadMsg}</p>
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:100, height:10, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#e53e3e,#f87171)', borderRadius:100, width:`${loadPct}%`, transition:'width 0.8s ease' }} />
        </div>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:10 }}>{loadPct}%</p>
      </div>
    </div>
  )

  // RESULT
  if (screen === 'result' && pageData) return (
    <div style={{ ...G, display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* TOOLBAR */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,10,15,0.95)', flexShrink:0, flexWrap:'wrap' }}>
        <button onClick={()=>{ sessionStorage.removeItem('gen_data'); sessionStorage.removeItem('gen_screen'); sessionStorage.removeItem('gen_slug'); sessionStorage.removeItem('gen_url'); setScreen('input') }} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:8, whiteSpace:'nowrap' }}>← Înapoi</button>

        <span style={{ fontSize:14, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>{pageData.productName}</span>

        {/* Device selector */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:10, padding:3, gap:2, flexShrink:0 }}>
          {[['mobile','📱'],['desktop','🖥️']].map(([d, ic]) => (
            <button key={d} onClick={()=>setDevice(d)}
              style={{ padding:'5px 12px', borderRadius:8, border:'none', background: device===d ? 'rgba(229,62,62,0.8)' : 'transparent', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              {ic}
            </button>
          ))}
        </div>

        {/* Edit toggle */}
        <button onClick={()=>setEm(e=>!e)}
          style={{ padding:'6px 12px', borderRadius:10, border:`1.5px solid ${em?'#6366f1':'rgba(255,255,255,0.15)'}`, background:em?'rgba(99,102,241,0.15)':'transparent', color:em?'#a5b4fc':'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
          {em ? '✏️ Editare ON' : '✏️ Editează'}
        </button>

        {/* Publish / Share */}
        {saved ? (
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <a href={`/p/${savedSlug}`} target="_blank" rel="noreferrer"
              style={{ padding:'6px 14px', borderRadius:10, border:'none', background:'rgba(104,211,145,0.15)', color:'#68d391', fontSize:13, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
              🔗 Deschide
            </a>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.origin+'/p/'+savedSlug);alert('Link copiat!')}}
              style={{ padding:'6px 12px', borderRadius:10, border:'1px solid rgba(104,211,145,0.3)', background:'transparent', color:'#68d391', fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
              📋 Copiază
            </button>
          </div>
        ) : (
          <button onClick={savePage} disabled={saving}
            style={{ padding:'6px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(229,62,62,0.3)', opacity:saving?0.6:1, whiteSpace:'nowrap', flexShrink:0 }}>
            {saving ? '⏳ Se salvează...' : '🚀 Publică pagina'}
          </button>
        )}
      </div>

      {em && (
        <div style={{ padding:'8px 16px', background:'rgba(99,102,241,0.1)', borderBottom:'1px solid rgba(99,102,241,0.2)', fontSize:13, color:'#a5b4fc', fontWeight:500, flexShrink:0 }}>
          ✏️ Modul editare activ — click pe orice text din pagină pentru a-l modifica direct
        </div>
      )}

      {/* PREVIEW AREA */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'20px', display:'flex', justifyContent:'center', background:'#13131a', WebkitOverflowScrolling:'touch' }}>
        <div style={{
          width: device === 'mobile' ? 390 : '100%',
          maxWidth: device === 'mobile' ? 390 : 1200,
          border: device === 'mobile' ? '8px solid #333' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: device === 'mobile' ? 40 : 12,
          overflow:'visible',
          boxShadow: device === 'mobile' ? '0 20px 60px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.3)',
          background:'#fff',
          transition: 'all 0.3s ease',
          alignSelf:'flex-start'
        }}>
          <LandingPreview data={pageData} setData={setPageData} em={em} />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,10,15,0.95)', display:'flex', gap:10, flexShrink:0 }}>
        <button onClick={() => {
          const html = generateHTML(pageData)
          const blob = new Blob([html], { type: 'text/html' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = (pageData.productName || 'pagina-cod').replace(/\s+/g, '-').toLowerCase() + '.gempages'
          a.click()
        }} style={{ padding:11, borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, cursor:'pointer', fontWeight:600, color:'#fff', whiteSpace:'nowrap' }}>
          ⬇️ Export HTML
        </button>
        <button onClick={generate} disabled={regenCount >= 3}
          style={{ flex:1, padding:11, borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, cursor: regenCount >= 3 ? 'not-allowed' : 'pointer', fontWeight:600, color: regenCount >= 3 ? 'rgba(255,255,255,0.3)' : '#fff', opacity: regenCount >= 3 ? 0.5 : 1 }}>
          {regenCount >= 3 ? `🔄 Regenerări epuizate (${regenCount}/3)` : `🔄 Regenerează (${regenCount}/3)`}
        </button>
        {!saved && (
          <button onClick={savePage} disabled={saving}
            style={{ flex:2, padding:11, borderRadius:12, border:'none', background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(229,62,62,0.3)', opacity:saving?0.6:1 }}>
            {saving ? '⏳ Se salvează...' : '🚀 Publică și obține link'}
          </button>
        )}
        {saved && (
          <button onClick={()=>{navigator.clipboard.writeText(window.location.origin+'/p/'+savedSlug);alert('Link copiat!')}}
            style={{ flex:2, padding:11, borderRadius:12, border:'none', background:'rgba(104,211,145,0.2)', color:'#68d391', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            📋 Copiază link pagină
          </button>
        )}
      </div>
    </div>
  )

  // INPUT
  return (
    <div style={G}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div onClick={()=>navigate('dashboard')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🛒</div>
          <span style={{ fontSize:18, fontWeight:800 }}>PageCOD</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {credits !== null && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.25)', borderRadius:20, padding:'5px 12px', fontSize:13, color:'#fc8181', fontWeight:600 }}>
              ⚡ {credits} credite
            </div>
          )}
          <button onClick={()=>navigate('dashboard')} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', borderRadius:10, padding:'8px 18px', fontSize:14, cursor:'pointer' }}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'48px 20px' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:8, letterSpacing:-0.5 }}>Generează pagină nouă</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.6 }}>
            Pune linkul AliExpress — serverul extrage pozele reale și AI-ul scrie tot în română.
          </p>
          {credits !== null && credits <= 0 && (
            <div style={{ marginTop:12, padding:'10px 16px', background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:10, fontSize:14, color:'#fc8181' }}>
              ⚠️ Nu ai credite disponibile. <button onClick={()=>navigate('pricing')} style={{ background:'none', border:'none', color:'#f87171', textDecoration:'underline', cursor:'pointer', fontSize:14 }}>Cumpără credite →</button>
            </div>
          )}
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:10 }}>Link produs AliExpress</label>
          <input
            value={aliUrl} onChange={e=>setAliUrl(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&aliUrl.trim()&&generate()}
            placeholder="https://www.aliexpress.com/item/..."
            style={{ width:'100%', padding:'13px 16px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }}
          />
          {error && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:10, fontSize:13, color:'#fc8181' }}>
              ⚠️ {error}
            </div>
          )}
          <button onClick={generate} disabled={!aliUrl.trim() || (credits !== null && credits <= 0)}
            style={{ width:'100%', marginTop:18, padding:16, borderRadius:12, background: (!aliUrl.trim() || (credits !== null && credits <= 0)) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', fontSize:16, fontWeight:800, cursor: (!aliUrl.trim() || (credits !== null && credits <= 0)) ? 'not-allowed' : 'pointer', boxShadow: (!aliUrl.trim() || (credits !== null && credits <= 0)) ? 'none' : '0 4px 16px rgba(229,62,62,0.35)', opacity: (!aliUrl.trim() || (credits !== null && credits <= 0)) ? 0.5 : 1 }}>
            Generează pagina →
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:20 }}>
          {[['🖼️','Poze reale AliExpress','Extrase prin ScraperAPI'],['✍️','Copy în română','Titlu, beneficii, testimoniale'],['📱','Preview mobil/desktop','Selector de device'],['✏️','Editor inline','Click pe text să îl modifici']].map(([ic,t,d])=>(
            <div key={t} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:16 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{ic}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{t}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
