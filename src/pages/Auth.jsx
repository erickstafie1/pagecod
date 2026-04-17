import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Auth({ navigate }) {
  const [mode, setMode] = useState('signup') // signup | login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const G = { minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Inter',system-ui,sans-serif" }
  const inp = { width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
  const btn = { width:'100%', padding:'13px', background:'linear-gradient(135deg,#e53e3e,#c53030)', color:'#fff', border:'none', borderRadius:10, fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(229,62,62,0.3)' }

  async function handleSubmit() {
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
        if (err) throw err
        if (data.user) {
          // Creeaza profilul cu 1 credit gratuit
          await supabase.from('profiles').upsert({ id: data.user.id, name, email, credits: 1, total_pages: 0 })
          setSuccess('Cont creat! Verifică emailul pentru confirmare.')
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      }
    } catch(e) {
      setError(e.message === 'Invalid login credentials' ? 'Email sau parolă greșită.' : e.message)
    }
    setLoading(false)
  }

  return (
    <div style={G}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div onClick={() => navigate('landing')} style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:24 }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🛒</div>
            <span style={{ fontSize:22, fontWeight:800 }}>PageCOD</span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:8 }}>
            {mode === 'signup' ? 'Creează cont gratuit' : 'Bine ai revenit'}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15 }}>
            {mode === 'signup' ? '1 pagină gratuită — fără card' : 'Intră în contul tău PageCOD'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28 }}>
          {/* Tabs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:4, marginBottom:24 }}>
            {[['signup','Cont nou'],['login','Intră']].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('')}}
                style={{ padding:'9px', borderRadius:8, border:'none', background: mode===m ? 'rgba(229,62,62,0.8)' : 'transparent', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize:13, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>Nume</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Numele tău" style={inp} />
              </div>
            )}
            <div>
              <label style={{ fontSize:13, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemplu.ro" style={inp}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            </div>
            <div>
              <label style={{ fontSize:13, color:'rgba(255,255,255,0.5)', display:'block', marginBottom:6 }}>Parolă</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minim 6 caractere" style={inp}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            </div>

            {error && <div style={{ background:'rgba(229,62,62,0.12)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fc8181' }}>⚠️ {error}</div>}
            {success && <div style={{ background:'rgba(104,211,145,0.12)', border:'1px solid rgba(104,211,145,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#68d391' }}>✅ {success}</div>}

            <button onClick={handleSubmit} disabled={loading || !email || !password}
              style={{ ...btn, opacity: loading||!email||!password ? 0.5 : 1, marginTop:4 }}>
              {loading ? 'Se procesează...' : mode === 'signup' ? 'Creează cont gratuit →' : 'Intră în cont →'}
            </button>

            {mode === 'signup' && (
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:1.5 }}>
                Prin creare cont ești de acord cu Termenii și Condițiile. Prima pagină este gratuită, fără card necesar.
              </p>
            )}
          </div>
        </div>

        <button onClick={() => navigate('landing')} style={{ display:'block', margin:'16px auto 0', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:14, cursor:'pointer' }}>
          ← Înapoi la pagina principală
        </button>
      </div>
    </div>
  )
}
