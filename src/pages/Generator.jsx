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

function E({ val, set, tag='span', textarea=false, style={}, em }) {
  if (!em) { const Tag=tag; return <Tag style={style}>{val}</Tag> }
  const base = { ...style, background:'rgba(99,102,241,0.1)', border:'1.5px dashed #6366f1', borderRadius:4, outline:'none', fontFamily:'inherit', color:'inherit', fontSize:'inherit', fontWeight:'inherit', lineHeight:'inherit', padding:'2px 6px', width:'100%', boxSizing:'border-box' }
  if (textarea) return <textarea value={val} onChange={e=>set(e.target.value)} rows={3} style={{ ...base, resize:'vertical', display:'block' }} />
  return <input value={val} onChange={e=>set(e.target.value)} style={{ ...base, display:'block' }} />
}

function SafeImg({ src, alt, style }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ ...style, background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}><span style={{ fontSize:32 }}>🖼️</span><span style={{ fontSize:11, color:'#666' }}>Imagine indisponibilă</span></div>
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

  if (done) return <div style={{ fontFamily:"'Inter',system-ui,sans-serif", padding:'60px 24px', textAlign:'center', background:'#fff' }}><div style={{ fontSize:64, marginBottom:16 }}>✅</div><h2 style={{ color:'#16a34a', fontSize:24, fontWeight:800 }}>Comandă plasată!</h2><p style={{ color:'#555', fontSize:16, lineHeight:1.7, marginTop:8 }}>Te vom contacta în maxim <strong>24 ore</strong>. Plata la livrare.</p></div>

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:'#fff', color:'#111' }}>
      <div style={{ background:'#111', color:'#fff', textAlign:'center', padding:'10px 16px', fontSize:13, fontWeight:600 }}>🚚 LIVRARE GRATUITĂ peste 200 lei &nbsp;·&nbsp; ☎ 0700 000 000</div>
      <div style={{ background:'#dc2626', color:'#fff', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:13, fontWeight:700 }}>⚡ Doar <strong>{data.stock||7} bucăți</strong> rămase!</div>
        <Timer minutes={data.timerMinutes||14} />
      </div>

      <SafeImg src={hero} alt={data.productName} style={imgH} />

      <div style={{ padding:'24px 20px 16px' }}>
        <div style={{ display:'inline-block', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700, marginBottom:12 }}>OFERTĂ SPECIALĂ · -{disc}% REDUCERE</div>
        <E val={data.headline} set={upd('headline')} tag="h1" em={em} style={{ fontSize:24, fontWeight:900, lineHeight:1.25, margin:'0 0 10px', color:'#111' }} />
        <E val={data.subheadline} set={upd('subheadline')} tag="p" textarea em={em} style={{ fontSize:15, color:'#555', lineHeight:1.7, margin:'0 0 20px' }} />
        <div style={{ background:'#fafafa', border:'1.5px solid #e5e7eb', borderRadius:16, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:8 }}>
            <span style={{ fontSize:38, fontWeight:900, color:'#dc2626' }}>{(price*qty).toFixed(0)} lei</span>
            <span style={{ fontSize:20, color:'#d1d5db', textDecoration:'line-through' }}>{(oldPrice*qty).toFixed(0)} lei</span>
            <span style={{ background:'#dc2626', color:'#fff', borderRadius:8, padding:'3px 10px', fontSize:13, fontWeight:800 }}>-{disc}%</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
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
              <E val={b} set={v=>updB(i,v)} em={em} style={{ fontSize:14, color:'#166534', lineHeight:1.6 }} />
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
                <E val={step.title} set={v=>updH(i,'title',v)} em={em} style={{ fontSize:15, fontWeight:700, display:'block', marginBottom:3 }} tag="strong" />
                <E val={step.desc} set={v=>updH(i,'desc',v)} em={em} style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }} />
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
                <E val={b} set={v=>updB(i+3,v)} em={em} style={{ fontSize:14, color:'#166534', lineHeight:1.6 }} />
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
                      <E val={t.name} set={v=>updT(i,'name',v)} em={em} style={{ fontSize:14, fontWeight:700, display:'block' }} tag="strong" />
                      <E val={t.city} set={v=>updT(i,'city',v)} em={em} style={{ fontSize:12, color:'#9ca3af' }} />
                    </div>
                  </div>
                  <span style={{ color:'#fbbf24', fontSize:16 }}>{'★'.repeat(t.stars||5)}</span>
                </div>
                <E val={t.text} set={v=>updT(i,'text',v)} em={em} textarea style={{ fontSize:14, color:'#374151', lineHeight:1.6, margin:0 }} tag="p" />
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
                <E val={item.q} set={v=>updF(i,'q',v)} em={em} style={{ fontSize:14, fontWeight:700 }} />
                <span style={{ color:'#dc2626', fontSize:20, marginLeft:12, flexShrink:0 }}>+</span>
              </summary>
              <div style={{ padding:'12px 16px' }}>
                <E val={item.a} set={v=>updF(i,'a',v)} em={em} textarea style={{ fontSize:14, color:'#6b7280', lineHeight:1.7 }} tag="p" />
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
          <button onClick={()=>{if(!order.nume||!order.telefon||!order.judet||!order.adresa){alert('Completează toate câmpurile *');return;}setDone(true)}} style={{ padding:17, borderRadius:14, background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'#fff', border:'none', fontSize:18, fontWeight:900, cursor:'pointer', boxShadow:'0 6px 20px rgba(220,38,38,0.4)' }}>
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
  const [aliUrl, setAliUrl] = useState('')
  const [screen, setScreen] = useState('input') // input | loading | result
  const [loadMsg, setLoadMsg] = useState('')
  const [loadPct, setLoadPct] = useState(0)
  const [pageData, setPageData] = useState(null)
  const [em, setEm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedSlug, setSavedSlug] = useState('')

  const G = { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',system-ui,sans-serif", color:'#fff' }

  const STEPS = [
    [10,'🔍 Accesez pagina AliExpress...'],
    [35,'🖼️ Extrag pozele produsului...'],
    [60,'✍️ Generez copywriting în română...'],
    [80,'📦 Construiesc pagina COD...'],
    [95,'✅ Finalizez...'],
  ]

  async function generate() {
    if (!aliUrl.trim()) return
    setScreen('loading'); setError(''); setLoadPct(5); setSaved(false)
    let si = 0; setLoadMsg(STEPS[0][1])
    const tid = setInterval(() => { si = Math.min(si+1, STEPS.length-1); setLoadMsg(STEPS[si][1]); setLoadPct(STEPS[si][0]) }, 2800)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliUrl: aliUrl.trim() })
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||`Error ${res.status}`) }
      const { data } = await res.json()
      setPageData(data); setLoadPct(100)
      setTimeout(() => setScreen('result'), 400)
    } catch(e) {
      setError(e.message); setScreen('input')
    }
    clearInterval(tid)
  }

  async function savePage() {
    if (!pageData || saving) return
    setSaving(true)
    try {
      const slug = Math.random().toString(36).substr(2,8)
      const { error: err } = await supabase.from('pages').insert({
        user_id: user.id,
        slug,
        product_name: pageData.productName,
        price: pageData.price,
        hero_image: pageData.images?.[0] || null,
        page_data: pageData
      })
      if (err) throw err
      // Scade 1 credit
      await supabase.rpc('decrement_credits', { user_id: user.id })
      setSavedSlug(slug); setSaved(true)
    } catch(e) {
      alert('Eroare la salvare: ' + e.message)
    }
    setSaving(false)
  }

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

  if (screen === 'result' && pageData) return (
    <div style={G}>
      <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', position:'sticky', top:0, zIndex:20 }}>
        <button onClick={()=>setScreen('input')} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:8 }}>← Înapoi</button>
        <span style={{ flex:1, fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pageData.productName}</span>
        <button onClick={()=>setEm(e=>!e)}
          style={{ padding:'7px 14px', borderRadius:10, border:`1.5px solid ${em?'#6366f1':'rgba(255,255,255,0.15)'}`, background:em?'rgba(99,102,241,0.15)':'transparent', color:em?'#a5b4fc':'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {em?'✏️ Editare ON':'✏️ Editează'}
        </button>
        {saved ? (
          <div style={{ display:'flex', gap:8 }}>
            <a href={`/p/${savedSlug}`} target="_blank" rel="noreferrer"
              style={{ padding:'7px 16px', borderRadius:10, border:'none', background:'rgba(104,211,145,0.15)', color:'#68d391', fontSize:13, fontWeight:700, textDecoration:'none' }}>
              🔗 Deschide pagina
            </a>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.origin+'/p/'+savedSlug);alert('Link copiat!')}}
              style={{ padding:'7px 14px', borderRadius:10, border:'1px solid rgba(104,211,145,0.3)', background:'transparent', color:'#68d391', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              📋 Copiază
            </button>
          </div>
        ) : (
          <button onClick={savePage} disabled={saving}
            style={{ padding:'7px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(229,62,62,0.3)', opacity:saving?0.6:1 }}>
            {saving ? 'Se salvează...' : '🚀 Publică pagina'}
          </button>
        )}
      </div>
      {em && <div style={{ padding:'10px 20px', background:'rgba(99,102,241,0.1)', borderBottom:'1px solid rgba(99,102,241,0.2)', display:'flex', gap:8, alignItems:'center', fontSize:13, color:'#a5b4fc', fontWeight:500 }}>✏️ Modul editare activ — click pe orice text pentru a-l modifica direct</div>}
      <div style={{ border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden', margin:16, boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
        <LandingPreview data={pageData} setData={setPageData} em={em} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px 28px' }}>
        <button onClick={generate} style={{ padding:12, borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:14, cursor:'pointer', fontWeight:600, color:'#fff' }}>🔄 Regenerează</button>
        {!saved && <button onClick={savePage} disabled={saving} style={{ padding:12, borderRadius:12, border:'none', background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(229,62,62,0.3)', opacity:saving?0.6:1 }}>{saving?'Se salvează...':'🚀 Publică pagina'}</button>}
      </div>
    </div>
  )

  return (
    <div style={G}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div onClick={()=>navigate('dashboard')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🛒</div>
          <span style={{ fontSize:18, fontWeight:800 }}>PageCOD</span>
        </div>
        <button onClick={()=>navigate('dashboard')} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', borderRadius:10, padding:'8px 18px', fontSize:14, cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'48px 20px' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:8, letterSpacing:-0.5 }}>Generează pagină nouă</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.6 }}>Pune linkul AliExpress — serverul extrage pozele reale și AI-ul scrie tot în română.</p>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
          <label style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:10 }}>Link produs AliExpress</label>
          <input
            value={aliUrl} onChange={e=>setAliUrl(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&aliUrl.trim()&&generate()}
            placeholder="https://www.aliexpress.com/item/..."
            style={{ width:'100%', padding:'13px 16px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }}
            onFocus={e=>e.target.style.borderColor='rgba(229,62,62,0.5)'}
            onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:'8px 0 0', lineHeight:1.6 }}>Serverul accesează pagina AliExpress, extrage pozele și generează copywriting complet în română.</p>

          {error && <div style={{ marginTop:14, padding:'12px 16px', background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:10, fontSize:13, color:'#fc8181' }}>⚠️ {error}</div>}

          <button onClick={generate} disabled={!aliUrl.trim()}
            style={{ width:'100%', marginTop:20, padding:16, borderRadius:12, background:aliUrl.trim()?'linear-gradient(135deg,#e53e3e,#c53030)':'rgba(255,255,255,0.08)', color:'#fff', border:'none', fontSize:16, fontWeight:800, cursor:aliUrl.trim()?'pointer':'not-allowed', boxShadow:aliUrl.trim()?'0 4px 16px rgba(229,62,62,0.35)':'none', opacity:aliUrl.trim()?1:0.5 }}>
            Generează pagina →
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:20 }}>
          {[['🖼️','Poze reale','Extrase direct de pe AliExpress'],['✍️','Copy în română','Titlu, beneficii, testimoniale COD'],['✏️','Editor inline','Modifici orice text pe pagină'],['🚀','Publică instant','Link gata de reclame Facebook']].map(([ic,t,d])=>(
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
