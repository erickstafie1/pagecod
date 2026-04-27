import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Generator from './pages/Generator.jsx'
import Pricing from './pages/Pricing.jsx'
import PublicPage from './pages/PublicPage.jsx'
import ShopifyApp from './pages/ShopifyApp.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('loading')

  useEffect(() => {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)

    // Shopify app — nu necesita auth PageCOD
    if (path === '/shopify-app') {
      setLoading(false)
      setPage('shopify')
      return
    }

    // Pagina publica
    if (path.startsWith('/p/')) {
      setLoading(false)
      setPage('public')
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)

      if (path === '/generate') setPage(u ? 'generator' : 'auth')
      else if (path === '/dashboard') setPage(u ? 'dashboard' : 'auth')
      else if (path === '/pricing') setPage('pricing')
      else if (path === '/login' || path === '/auth') setPage('auth')
      else setPage(u ? 'dashboard' : 'landing')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      const p = window.location.pathname
      if (!u && p !== '/pricing' && !p.startsWith('/p/') && p !== '/shopify-app') {
        navigate('landing')
      }
    })

    const handlePop = () => {
      const p = window.location.pathname
      if (p === '/shopify-app') setPage('shopify')
      else if (p.startsWith('/p/')) setPage('public')
      else if (p === '/generate') setPage(user ? 'generator' : 'auth')
      else if (p === '/dashboard') setPage(user ? 'dashboard' : 'auth')
      else if (p === '/pricing') setPage('pricing')
      else setPage(user ? 'dashboard' : 'landing')
    }
    window.addEventListener('popstate', handlePop)
    return () => { subscription?.unsubscribe(); window.removeEventListener('popstate', handlePop) }
  }, [])

  const navigate = (p) => {
    const paths = { landing:'/', auth:'/login', dashboard:'/dashboard', generator:'/generate', pricing:'/pricing' }
    window.history.pushState({}, '', paths[p] || '/')
    setPage(p)
    window.scrollTo(0, 0)
  }

  if (loading || page === 'loading') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:40, height:40, border:'3px solid #e53e3e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const props = { user, navigate }
  if (page === 'shopify') return <ShopifyApp />
  if (page === 'public') return <PublicPage />
  if (page === 'auth') return <Auth {...props} />
  if (page === 'dashboard') return <Dashboard {...props} />
  if (page === 'generator') return <Generator {...props} />
  if (page === 'pricing') return <Pricing {...props} />
  return <Landing {...props} />
}
