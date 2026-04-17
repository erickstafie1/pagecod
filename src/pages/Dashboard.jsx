import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Dashboard({ user, navigate }) {
  const [profile, setProfile] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: pgs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('pages').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])
      setProfile(prof)
      setPages(pgs || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const G = { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',system-ui,sans-serif", color:'#fff' }
  const card = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16 }

  async function logout() {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ ...G, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #e53e3e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={G}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🛒</div>
          <span style={{ fontSize:18, fontWeight:800 }}>PageCOD</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Credits badge */}
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.25)', borderRadius:20, padding:'6px 14px' }}>
            <span style={{ fontSize:16 }}>⚡</span>
            <span style={{ fontSize:14, fontWeight:700, color:'#fc8181' }}>{profile?.credits || 0} credite</span>
          </div>
          <button onClick={() => navigate('pricing')}
            style={{ background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', borderRadius:10, padding:'8px 18px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            + Cumpără credite
          </button>
          <button onClick={logout} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', borderRadius:10, padding:'8px 16px', fontSize:14, cursor:'pointer' }}>
            Ieși
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Bună, {profile?.name || 'utilizator'}! 👋</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>
            {profile?.credits > 0 ? `Ai ${profile.credits} credit${profile.credits !== 1 ? 'e' : ''} disponibil${profile.credits !== 1 ? 'e' : ''}` : 'Creditele s-au terminat — cumpără mai multe'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:32 }}>
          {[
            ['⚡', 'Credite rămase', profile?.credits || 0, '#fc8181'],
            ['📄', 'Pagini create', profile?.total_pages || 0, '#68d391'],
            ['🎁', 'Trial folosit', profile?.trial_used ? 'Da' : 'Nu', '#fbd38d'],
          ].map(([ic, label, val, color]) => (
            <div key={label} style={{ ...card, padding:'20px' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{ic}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:24, fontWeight:800, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div style={{ ...card, padding:'28px', marginBottom:32, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>Generează pagină nouă</h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>
              {profile?.credits > 0 ? 'Pune linkul AliExpress și pagina e gata în 15 secunde' : 'Cumpără credite pentru a continua'}
            </p>
          </div>
          <button
            onClick={() => profile?.credits > 0 ? navigate('generator') : navigate('pricing')}
            style={{ background: profile?.credits > 0 ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'rgba(255,255,255,0.08)', color:'#fff', border:'none', borderRadius:12, padding:'13px 28px', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow: profile?.credits > 0 ? '0 4px 20px rgba(229,62,62,0.3)' : 'none', whiteSpace:'nowrap' }}>
            {profile?.credits > 0 ? '+ Pagină nouă →' : 'Cumpără credite →'}
          </button>
        </div>

        {/* Pages list */}
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Paginile tale ({pages.length})</h2>
          {pages.length === 0 ? (
            <div style={{ ...card, padding:'48px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>Nu ai nicio pagină încă.</p>
              <button onClick={() => navigate('generator')}
                style={{ marginTop:16, background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Generează prima pagină →
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pages.map(page => (
                <div key={page.id} style={{ ...card, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    {page.hero_image && (
                      <img src={page.hero_image} alt="" onError={e=>e.target.style.display='none'}
                        style={{ width:56, height:56, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                    )}
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{page.product_name}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                        {new Date(page.created_at).toLocaleDateString('ro-RO')} · {page.price} lei
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer"
                      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, textDecoration:'none', cursor:'pointer' }}>
                      🔗 Deschide
                    </a>
                    <button onClick={() => {navigator.clipboard.writeText(window.location.origin + '/p/' + page.slug); alert('Link copiat!')}}
                      style={{ background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.25)', color:'#fc8181', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      📋 Copiază link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
