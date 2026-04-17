import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const PACKAGES = [
  { credits: 1, price: 35, label: '1 pagină', popular: false },
  { credits: 2, price: 50, label: '2 pagini', popular: false },
  { credits: 3, price: 70, label: '3 pagini', popular: true },
  { credits: 4, price: 90, label: '4 pagini', popular: false },
  { credits: 5, price: 110, label: '5 pagini', popular: false },
  { credits: 10, price: 210, label: '10 pagini', popular: false },
]

export default function Pricing({ user, navigate }) {
  const [loading, setLoading] = useState(null)

  const G = { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',system-ui,sans-serif", color:'#fff', padding:'40px 20px' }

  async function handleBuy(pkg) {
    if (!user) { navigate('auth'); return }
    setLoading(pkg.credits)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: pkg.credits,
          price: pkg.price,
          userId: user.id,
          userEmail: user.email
        })
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch(e) {
      alert('Eroare la procesarea plății: ' + e.message)
    }
    setLoading(null)
  }

  return (
    <div style={G}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate(user ? 'dashboard' : 'landing')}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', marginBottom:32, display:'flex', alignItems:'center', gap:6 }}>
          ← Înapoi
        </button>

        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h1 style={{ fontSize:40, fontWeight:900, letterSpacing:-1, marginBottom:12 }}>Prețuri simple</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:17 }}>Plătești doar ce folosești. Fără abonament.</p>
          {!user && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(104,211,145,0.1)', border:'1px solid rgba(104,211,145,0.25)', borderRadius:20, padding:'6px 16px', fontSize:13, color:'#68d391', marginTop:12 }}>
              🎁 Prima pagină GRATUITĂ la creare cont
            </div>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:48 }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.credits} style={{
              background: pkg.popular ? 'rgba(229,62,62,0.08)' : 'rgba(255,255,255,0.04)',
              border: pkg.popular ? '1px solid rgba(229,62,62,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius:20, padding:'28px 24px', position:'relative',
              transform: pkg.popular ? 'scale(1.03)' : 'scale(1)', transition:'transform 0.2s'
            }}>
              {pkg.popular && (
                <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#e53e3e,#c53030)', borderRadius:12, padding:'4px 16px', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
                  ⭐ CEL MAI POPULAR
                </div>
              )}
              <div style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>{pkg.label}</div>
              <div style={{ fontSize:42, fontWeight:900, color: pkg.popular ? '#fc8181' : '#fff', marginBottom:4 }}>
                {pkg.price}<span style={{ fontSize:18, fontWeight:500 }}> lei</span>
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:24 }}>
                = {Math.round(pkg.price / pkg.credits)} lei / pagină
              </div>
              <ul style={{ listStyle:'none', marginBottom:24, display:'flex', flexDirection:'column', gap:8 }}>
                {['Pozele reale de pe AliExpress','Copywriting în română','Editor inline','Link permanent','Formular COD complet'].map(f => (
                  <li key={f} style={{ fontSize:13, color:'rgba(255,255,255,0.6)', display:'flex', gap:8 }}>
                    <span style={{ color:'#68d391' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuy(pkg)} disabled={loading === pkg.credits}
                style={{
                  width:'100%', padding:'12px', borderRadius:10,
                  background: pkg.popular ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'rgba(255,255,255,0.08)',
                  border: pkg.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
                  boxShadow: pkg.popular ? '0 4px 20px rgba(229,62,62,0.3)' : 'none',
                  opacity: loading === pkg.credits ? 0.6 : 1
                }}>
                {loading === pkg.credits ? 'Se procesează...' : `Cumpără ${pkg.label} →`}
              </button>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13 }}>
          <div style={{ marginBottom:8 }}>Plată securizată prin Stripe</div>
          <div style={{ display:'flex', gap:12, justifyContent:'center', fontSize:22 }}>
            💳 🏦 📱
          </div>
          <div style={{ marginTop:8 }}>Visa · Mastercard · PayPal · Google Pay · Apple Pay</div>
        </div>
      </div>
    </div>
  )
}
