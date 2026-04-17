import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Generator from './pages/Generator.jsx'
import Pricing from './pages/Pricing.jsx'

function getPage(path, user) {
  if (path === '/' || path === '') return user ? 'dashboard' : 'landing'
  if (path === '/login' || path === '/auth') return 'auth'
  if (path === '/dashboard') return 'dashboard'
  if (path === '/generate') return 'generator'
  if (path === '/pricing') return 'pricing'
  return user ? 'dashboard' : 'landing'
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(() => getPage(window.location.pathname, null))

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      // Seteaza pagina bazata pe URL curent si user
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '') {
        setPage(u ? 'dashboard' : 'landing')
      } else {
        setPage(getPage(currentPath, u))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u && (page === 'landing' || page === 'auth')) {
        navigate('dashboard')
      } else if (!u) {
        navigate('landing')
      }
    })

    // Ascult la back/forward browser
    const handlePop = () => {
      setPage(getPage(window.location.pathname, user))
    }
    window.addEventListener('popstate', handlePop)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('popstate', handlePop)
    }
  }, [])

  const navigate = (p) => {
    const paths = {
      landing: '/', auth: '/login', dashboard: '/dashboard',
      generator: '/generate', pricing: '/pricing'
    }
    const path = paths[p] || '/'
    window.history.pushState({}, '', path)
    setPage(p)
    window.scrollTo(0, 0)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:40, height:40, border:'3px solid #e53e3e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const props = { user, navigate }

  if (page === 'auth') return <Auth {...props} />
  if (page === 'dashboard') return user ? <Dashboard {...props} /> : <Auth {...props} />
  if (page === 'generator') return user ? <Generator {...props} /> : <Auth {...props} />
  if (page === 'pricing') return <Pricing {...props} />
  return <Landing {...props} />
}
