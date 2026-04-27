import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Generator from './pages/Generator.jsx'
import Pricing from './pages/Pricing.jsx'
import PublicPage from './pages/PublicPage.jsx'
import ShopifyApp from './pages/ShopifyApp.jsx'

function pathToPage(path) {
  if (path.startsWith('/p/')) return 'public'
  if (path === '/shopify-app') return 'shopify'
  if (path === '/generate') return 'generator'
  if (path === '/dashboard') return 'dashboard'
  if (path === '/pricing') return 'pricing'
  if (path === '/login' || path === '/auth') return 'auth'
  return null
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)

      const path = window.location.pathname
      const urlPage = pathToPage(path)

      if (urlPage === 'public') setPage('public')
      else if (urlPage === 'shopify') setPage('shopify')
      else if (urlPage === 'generator') setPage(u ? 'generator' : 'auth')
      else if (urlPage === 'dashboard') setPage(u ? 'dashboard' : 'auth')
      else if (urlPage === 'pricing') setPage('pricing')
      else if (urlPage === 'auth') setPage('auth')
      else setPage(u ? 'dashboard' : 'landing')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      const path = window.location.pathname
      if (!u && !path.startsWith('/p/') && path !== '/pricing' && path !== '/shopify-app') {
        navigate('landing')
      }
    })

    const handlePop = () => {
      const urlPage = pathToPage(window.location.pathname)
      if (urlPage) setPage(urlPage)
    }
    window.addEventListener('popstate', handlePop)
    return () => { subscription.unsubscribe(); window.removeEventListener('popstate', handlePop) }
  }, [])

  const navigate = (p) => {
    const paths = { landing:'/', auth:'/login', dashboard:'/dashboard', generator:'/generate', pricing:'/pricing', shopify:'/shopify-app' }
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
  if (page === 'public') return <PublicPage />
  if (page === 'shopify') return <ShopifyApp />
  if (page === 'auth') return <Auth {...props} />
  if (page === 'dashboard') return <Dashboard {...props} />
  if (page === 'generator') return <Generator {...props} />
  if (page === 'pricing') return <Pricing {...props} />
  return <Landing {...props} />
}
