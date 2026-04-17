import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Generator from './pages/Generator.jsx'
import Pricing from './pages/Pricing.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('landing')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) setPage('dashboard')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setPage('dashboard')
      else setPage('landing')
    })
    return () => subscription.unsubscribe()
  }, [])

  // URL-based routing simplu
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/pricing') setPage('pricing')
    else if (path === '/login') setPage('auth')
    else if (path === '/dashboard' && user) setPage('dashboard')
    else if (path === '/generate' && user) setPage('generator')
  }, [user])

  const navigate = (p) => {
    window.history.pushState({}, '', '/' + (p === 'landing' ? '' : p))
    setPage(p)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:40, height:40, border:'3px solid #e53e3e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const props = { user, navigate }

  if (page === 'auth') return <Auth {...props} />
  if (page === 'dashboard') return <Dashboard {...props} />
  if (page === 'generator') return <Generator {...props} />
  if (page === 'pricing') return <Pricing {...props} />
  return <Landing {...props} />
}
