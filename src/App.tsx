import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Space } from './types'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const ListingPage = lazy(() => import('./pages/ListingPage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const HostDashboard = lazy(() => import('./pages/HostDashboard'))
const SpaceFormPage = lazy(() => import('./pages/SpaceFormPage'))
const MyQuotesPage = lazy(() => import('./pages/MyQuotesPage'))
const HostQuotesPage = lazy(() => import('./pages/HostQuotesPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

export type Page = 'home' | 'listing' | 'detail' | 'login' | 'signup' | 'host-dashboard' | 'new-space' | 'edit-space' | 'my-quotes' | 'host-quotes' | 'how-it-works' | 'comparison' | 'about'

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ fontSize: 14, color: '#6b7280' }}>Carregando...</div>
  </div>
)

function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [compareSpaces, setCompareSpaces] = useState<Space[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>('guest')
  const [loading, setLoading] = useState(true)
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0)

  const loadUserRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (data) {
      setUserRole(data.role)
      if (data.role === 'host') {
        const { count } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('host_id', userId)
          .eq('status', 'pending')
        setPendingQuotesCount(count || 0)
      } else {
        const { count } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('guest_id', userId)
        setPendingQuotesCount(count || 0)
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserRole(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserRole(session.user.id)
      } else {
        setUserRole('guest')
        setPendingQuotesCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserRole])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    setPage('home')
  }, [])

  const goToPage = useCallback((p: Page, space?: Space) => {
    setPage(p)
    if (space) {
      if (p === 'edit-space') setEditingSpace(space)
      else setSelectedSpace(space)
    }
    if (p === 'new-space') setEditingSpace(null)
    window.scrollTo(0, 0)
  }, [])

  const refreshQuoteCount = useCallback(() => {
    if (user) loadUserRole(user.id)
  }, [user, loadUserRole])

  // Comparação: adiciona/remove espaço (máximo 3)
  const handleCompareToggle = useCallback((space: Space) => {
    setCompareSpaces(prev => {
      const exists = prev.find(s => s.id === space.id)
      if (exists) return prev.filter(s => s.id !== space.id)
      if (prev.length >= 3) {
        alert('Você já selecionou 3 espaços para comparar. Remova um antes de adicionar outro.')
        return prev
      }
      return [...prev, space]
    })
  }, [])

  const handleClearCompare = useCallback(() => {
    setCompareSpaces([])
  }, [])

  const handleRemoveFromCompare = useCallback((id: string) => {
    setCompareSpaces(prev => prev.filter(s => s.id !== id))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Carregando...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-logo" onClick={() => goToPage('home')}>
          <div className="logo-box">EWIND</div>
        </div>
        <div className="nav-center">
          <a onClick={() => goToPage('listing')}>Espaços</a>
          {user && userRole === 'guest' && (
            <a onClick={() => { goToPage('my-quotes'); refreshQuoteCount() }}>
              Meus orçamentos {pendingQuotesCount > 0 && <span className="badge-count">{pendingQuotesCount}</span>}
            </a>
          )}
          {user && userRole === 'host' && (
            <a onClick={() => { goToPage('host-quotes'); refreshQuoteCount() }}>
              Orçamentos {pendingQuotesCount > 0 && <span className="badge-count">{pendingQuotesCount}</span>}
            </a>
          )}
          <a onClick={() => goToPage('how-it-works')}>Como funciona</a>
          <a onClick={() => goToPage('about')}>Quem somos</a>
          <a onClick={() => user ? goToPage('host-dashboard') : goToPage('signup')}>Anuncie</a>
        </div>
        <div className="nav-right">
          {/* Badge de comparação no nav */}
          {compareSpaces.length > 0 && (
            <button
              onClick={() => goToPage('comparison')}
              style={{
                padding: '8px 14px', fontSize: 13, fontWeight: 700,
                background: '#f0fdf4', border: '1.5px solid #a3e635',
                borderRadius: 8, cursor: 'pointer', color: '#1a2e05',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              📊 Comparar <span className="badge-count" style={{ background: '#a3e635', color: '#1a2e05' }}>{compareSpaces.length}</span>
            </button>
          )}
          {user ? (
            <>
              {userRole === 'host' && (
                <button className="btn-primary" onClick={() => goToPage('host-dashboard')}>
                  Meu painel
                </button>
              )}
              <span className="user-greeting">
                Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button className="btn-link" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <button className="btn-link" onClick={() => goToPage('login')}>Entrar</button>
              <button className="btn-primary" onClick={() => goToPage('signup')}>Cadastrar</button>
            </>
          )}
        </div>
      </nav>

      <Suspense fallback={<PageLoader />}>
        {page === 'home' && <HomePage goToPage={goToPage} />}
        {page === 'listing' && (
          <ListingPage
            goToPage={goToPage}
            compareSpaces={compareSpaces}
            onCompareToggle={handleCompareToggle}
            onClearCompare={handleClearCompare}
          />
        )}
        {page === 'detail' && selectedSpace && <DetailPage space={selectedSpace} goToPage={goToPage} user={user} />}
        {page === 'login' && <LoginPage goToPage={goToPage} />}
        {page === 'signup' && <SignupPage goToPage={goToPage} />}
        {page === 'host-dashboard' && user && <HostDashboard user={user} goToPage={goToPage} />}
        {page === 'new-space' && user && <SpaceFormPage user={user} goToPage={goToPage} editingSpace={null} />}
        {page === 'edit-space' && user && editingSpace && <SpaceFormPage user={user} goToPage={goToPage} editingSpace={editingSpace} />}
        {page === 'my-quotes' && user && <MyQuotesPage user={user} goToPage={goToPage} />}
        {page === 'host-quotes' && user && <HostQuotesPage user={user} goToPage={goToPage} />}
        {page === 'how-it-works' && <HowItWorksPage goToPage={goToPage} />}
        {page === 'about' && <AboutPage goToPage={goToPage} />}
        {page === 'comparison' && (
          <ComparisonPage
            spaces={compareSpaces}
            goToPage={goToPage}
            onRemove={handleRemoveFromCompare}
          />
        )}
      </Suspense>
    </div>
  )
}

export default App
