export default function Landing({ navigate }) {
  const G = {
    minHeight: '100vh', background: '#0a0a0f', color: '#fff',
    fontFamily: "'Inter',system-ui,sans-serif"
  }
  const btn = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg,#e53e3e,#c53030)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '14px 28px', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 8px 32px rgba(229,62,62,0.35)',
    transition: 'all 0.2s'
  }
  const card = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '24px'
  }

  return (
    <div style={G}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 40px', borderBottom:'1px solid rgba(255,255,255,0.06)', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛒</div>
          <span style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>PageCOD</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <button onClick={() => navigate('pricing')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', fontSize:15, cursor:'pointer', padding:'8px 16px' }}>Prețuri</button>
          <button onClick={() => navigate('auth')} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:10, padding:'9px 20px', fontSize:15, cursor:'pointer', fontWeight:500 }}>Intră în cont</button>
          <button onClick={() => navigate('auth')} style={btn}>Începe gratuit →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 40px 60px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.25)', borderRadius:20, padding:'6px 16px', fontSize:13, color:'#fc8181', marginBottom:24, fontWeight:500 }}>
          ⚡ Prima pagină GRATUITĂ — fără card
        </div>

        <h1 style={{ fontSize:'clamp(36px,5vw,72px)', fontWeight:900, lineHeight:1.08, letterSpacing:-2, marginBottom:24 }}>
          Pagini de vânzare COD<br />
          <span style={{ background:'linear-gradient(135deg,#e53e3e,#f687b3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>generate în 15 secunde</span>
        </h1>

        <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'rgba(255,255,255,0.55)', lineHeight:1.7, maxWidth:600, margin:'0 auto 40px', fontWeight:400 }}>
          Pune linkul AliExpress — AI-ul extrage pozele produsului, scrie tot copywriting-ul în română și îți dă pagina COD gata de reclame Facebook.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('auth')} style={{ ...btn, padding:'16px 36px', fontSize:17 }}>
            🚀 Generează prima pagină gratuit
          </button>
          <button onClick={() => navigate('pricing')} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', borderRadius:12, padding:'16px 28px', fontSize:16, fontWeight:600, cursor:'pointer' }}>
            Vezi prețurile →
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop:40, flexWrap:'wrap' }}>
          {[['500+','Pagini generate'],['4.9★','Rating utilizatori'],['15s','Timp mediu generare'],['0 lei','Prima pagină']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#fc8181' }}>{v}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DEMO PREVIEW */}
      <div style={{ maxWidth:900, margin:'0 auto 80px', padding:'0 40px' }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', padding:'12px 20px', display:'flex', gap:6 }}>
            {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:12,height:12,borderRadius:'50%',background:c }}/>)}
            <div style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:6, height:24, marginLeft:8, display:'flex', alignItems:'center', paddingLeft:12 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>pagecod.ro/p/centura-masaj-ab123</span>
            </div>
          </div>
          <div style={{ padding:'32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={{ background:'rgba(229,62,62,0.08)', border:'1px solid rgba(229,62,62,0.15)', borderRadius:12, padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ height:120, background:'rgba(255,255,255,0.05)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🛍️</div>
              <div style={{ height:12, background:'rgba(255,255,255,0.1)', borderRadius:6, width:'80%' }}/>
              <div style={{ height:10, background:'rgba(255,255,255,0.06)', borderRadius:6, width:'60%' }}/>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ fontSize:24, fontWeight:800, color:'#fc8181' }}>149 lei</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>249 lei</div>
              </div>
              <div style={{ background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:8, padding:'10px', textAlign:'center', fontSize:13, fontWeight:700 }}>COMANDĂ ACUM</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {['✓ Pozele reale de pe AliExpress','✓ Copywriting în română','✓ Timer urgență + stoc','✓ Formular COD cu județe','✓ Order bump / upsell','✓ FAQ + Testimoniale','✓ Editor inline'].map(t=>(
                <div key={t} style={{ display:'flex', gap:8, alignItems:'center', fontSize:13, color:'rgba(255,255,255,0.7)' }}>
                  <span style={{ color:'#68d391' }}>{t.split(' ')[0]}</span>
                  <span>{t.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth:1200, margin:'0 auto 80px', padding:'0 40px' }}>
        <h2 style={{ fontSize:36, fontWeight:800, textAlign:'center', marginBottom:48, letterSpacing:-1 }}>Cum funcționează</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
          {[
            ['01','Pune linkul AliExpress','Copiezi linkul produsului pe care vrei să îl vinzi în România.'],
            ['02','AI extrage totul','Serverul nostru accesează pagina, extrage pozele reale și datele produsului.'],
            ['03','Claude scrie copy-ul','AI-ul generează titlu, beneficii, testimoniale, FAQ — tot în română COD style.'],
            ['04','Pagina e gata','Primești un URL unic pe care îl pui direct în reclame Facebook/TikTok.'],
          ].map(([n,t,d])=>(
            <div key={n} style={card}>
              <div style={{ fontSize:12, fontWeight:700, color:'#fc8181', marginBottom:12, letterSpacing:2 }}>{n}</div>
              <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{t}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING PREVIEW */}
      <div style={{ maxWidth:900, margin:'0 auto 80px', padding:'0 40px', textAlign:'center' }}>
        <h2 style={{ fontSize:36, fontWeight:800, marginBottom:12, letterSpacing:-1 }}>Prețuri simple și corecte</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:40, fontSize:16 }}>Prima pagină gratuită. Plătești doar ce folosești.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
          {[['1 pagină','35 lei',false],['2 pagini','50 lei',false],['3 pagini','70 lei',true],['4 pagini','90 lei',false],['5 pagini','110 lei',false]].map(([p,pr,pop])=>(
            <div key={p} style={{ ...card, border: pop ? '1px solid rgba(229,62,62,0.5)' : card.border, background: pop ? 'rgba(229,62,62,0.08)' : card.background, position:'relative' }}>
              {pop && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'#e53e3e', borderRadius:10, padding:'2px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>POPULAR</div>}
              <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{p}</div>
              <div style={{ fontSize:26, fontWeight:900, color: pop ? '#fc8181' : '#fff' }}>{pr}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('auth')} style={{ ...btn, marginTop:32, padding:'14px 32px' }}>Începe cu pagina gratuită →</button>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'32px 40px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:13 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:24, height:24, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🛒</div>
          <span style={{ fontWeight:700, color:'rgba(255,255,255,0.6)' }}>PageCOD</span>
        </div>
        © 2025 PageCOD · Termeni · Confidențialitate · ANPC
      </div>
    </div>
  )
}
