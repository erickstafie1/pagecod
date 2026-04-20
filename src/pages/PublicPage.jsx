import { useState, useEffect, useRef } from 'react'
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

function SafeImg({ src, alt, style }) {
  const [err, setErr] = useState(false)
  if (!src || err) return null
  return <img src={src} alt={alt||''} style={{ ...style, objectFit:'cover' }} onError={()=>setErr(true)} />
}

export default function PublicPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [order, setOrder] = useState({ nume:'', telefon:'', judet:'', localitate:'', adresa:'', bump:false })
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState(false)
  const formRef = useRef()

  useEffect(() => {
    const slug = window.location.pathname.replace('/p/', '').replace('/', '')
    if (!slug) { setNotFound(true); setLoading(false); return }
    supabase.from('pages').select('page_data, product_name').eq('slug', slug).single()
      .then(({ data: row, error }) => {
        if (error || !row) { setNotFound(true); }
        else { setData(row.page_data); }
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#fff' }}>
      <div style={{ width:36, height:36, border:'3px solid #dc2626', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#fff', flexDirection:'column', gap:12, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ fontSize:48 }}>😕</div>
      <h2 style={{ fontSize:22, fontWeight:700 }}>Pagina nu a fost găsită</h2>
      <p style={{ color:'#888' }}>Linkul poate fi expirat sau incorect.</p>
    </div>
  )

  const price = data.price||149, oldPrice = data.oldPrice||Math.round(price*1.6), bumpPrice = data.bumpPrice||29
  const disc = Math.round((1-price/oldPrice)*100)
  const total = price*qty + (order.bump&&data.bumpProduct ? bumpPrice : 0)
  const imgs = data.images||[], hero = imgs[0], ctx = imgs.slice(1)
  const inp = { padding:'12px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:15, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' }
  const imgH = { width:'100%', height:300, display:'block' }

  if (done) return (
    <div style={{ fontFamily:'system-ui,sans-serif', padding:'60px 24px', textAlign:'center', background:'#fff', minHeight:'100vh' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <h2 style={{ color:'#16a34a', fontSize:24, fontWeight:800 }}>Comandă plasată!</h2>
      <p style={{ color:'#555', fontSize:16, lineHeight:1.7, marginTop:8 }}>Te vom contacta în maxim <strong>24 ore</strong>. Plata la livrare.</p>
    </div>
  )

  return (
    <div style={{ fontFamily:'system-ui,sans-serif', background:'#fff', color:'#111', maxWidth:600, margin:'0 auto' }}>
      <div style={{ background:'#111', color:'#fff', textAlign:'center', padding:'10px 16px', fontSize:13, fontWeight:600 }}>🚚 LIVRARE GRATUITĂ peste 200 lei &nbsp;·&nbsp; ☎ 0700 000 000</div>
      <div style={{ background:'#dc2626', color:'#fff', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:13, fontWeight:700 }}>⚡ Doar <strong>{data.stock||7} bucăți</strong> rămase!</div>
        <Timer minutes={data.timerMinutes||14} />
      </div>

      <SafeImg src={hero} alt={data.productName} style={imgH} />

      <div style={{ padding:'24px 20px 16px' }}>
        <div style={{ display:'inline-block', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700, marginBottom:12 }}>OFERTĂ SPECIALĂ · -{disc}% REDUCERE</div>
        <h1 style={{ fontSize:24, fontWeight:900, lineHeight:1.25, margin:'0 0 10px' }}>{data.headline}</h1>
        <p style={{ fontSize:15, color:'#555', lineHeight:1.7, margin:'0 0 20px' }}>{data.subheadline}</p>

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

      <div style={{ background:'#f9fafb', borderTop:'1px solid #f3f4f6', borderBottom:'1px solid #f3f4f6', padding:'16px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[['🔒','Plată securizată','100% sigur'],['🚚','Livrare rapidă','2–4 zile'],['↩️','Retur gratuit','30 de zile'],['⭐','Clienți mulțumiți','4.9/5 stele']].map(([ic,t,s])=>(
            <div key={t} style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:22 }}>{ic}</span><div><div style={{ fontSize:13, fontWeight:700 }}>{t}</div><div style={{ fontSize:12, color:'#9ca3af' }}>{s}</div></div></div>
          ))}
        </div>
      </div>

      <SafeImg src={ctx[0]} alt="produs" style={imgH} />
      <div style={{ padding:'24px 20px' }}>
        <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>De ce să alegi {data.productName}?</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {(data.benefits||[]).slice(0,3).map((b,i)=>(
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 14px' }}>
              <span style={{ color:'#16a34a', fontWeight:900, fontSize:17, flexShrink:0 }}>✓</span>
              <span style={{ fontSize:14, color:'#166534', lineHeight:1.6 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <SafeImg src={ctx[1]} alt="utilizare" style={imgH} />
      {data.howItWorks?.length > 0 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 18px' }}>Cum funcționează?</h2>
          {data.howItWorks.map((step,i)=>(
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ minWidth:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, flexShrink:0 }}>{i+1}</div>
              <div style={{ paddingTop:4 }}>
                <strong style={{ fontSize:15, fontWeight:700, display:'block', marginBottom:3 }}>{step.title}</strong>
                <span style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <SafeImg src={ctx[2]} alt="rezultat" style={imgH} />
      {(data.benefits||[]).length > 3 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>Mai multe motive să comanzi azi</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(data.benefits||[]).slice(3).map((b,i)=>(
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 14px' }}>
                <span style={{ color:'#16a34a', fontWeight:900, fontSize:17, flexShrink:0 }}>✓</span>
                <span style={{ fontSize:14, color:'#166534', lineHeight:1.6 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <strong style={{ fontSize:14, fontWeight:700, display:'block' }}>{t.name}</strong>
                      <span style={{ fontSize:12, color:'#9ca3af' }}>{t.city}</span>
                    </div>
                  </div>
                  <span style={{ color:'#fbbf24', fontSize:16 }}>{'★'.repeat(t.stars||5)}</span>
                </div>
                <p style={{ fontSize:14, color:'#374151', lineHeight:1.6, margin:0 }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.faq?.length > 0 && (
        <div style={{ padding:'24px 20px' }}>
          <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 16px' }}>Întrebări frecvente</h2>
          {data.faq.map((item,i)=>(
            <details key={i} style={{ marginBottom:10, border:'1.5px solid #f3f4f6', borderRadius:12, overflow:'hidden' }}>
              <summary style={{ padding:'14px 16px', fontSize:14, fontWeight:700, cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                {item.q} <span style={{ color:'#dc2626', fontSize:20, marginLeft:12 }}>+</span>
              </summary>
              <div style={{ padding:'12px 16px' }}>
                <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.7, margin:0 }}>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      )}

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
        </div>
      </div>
      <div style={{ background:'#111', color:'#6b7280', padding:'20px', textAlign:'center', fontSize:12 }}>
        <p style={{ margin:'0 0 4px', color:'#9ca3af', fontWeight:600 }}>© 2025 {data.productName}</p>
        <p style={{ margin:0 }}>Termeni · Confidențialitate · ANPC</p>
      </div>
    </div>
  )
}
