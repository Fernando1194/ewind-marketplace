import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Space } from './types'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import DetailPage from './pages/DetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HostDashboard from './pages/HostDashboard'
import SpaceFormPage from './pages/SpaceFormPage'
import MyQuotesPage from './pages/MyQuotesPage'
import HostQuotesPage from './pages/HostQuotesPage'
import './App.css'

export type Page = 'home' | 'listing' | 'detail' | 'login' | 'signup' | 'host-dashboard' | 'new-space' | 'edit-space' | 'my-quotes' | 'host-quotes'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>('guest')
  const [loading, setLoading] = useState(true)
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserRole(session.user.id)
      }
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
  }, [])

  const loadUserRole = async (userId: string) => {
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
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setPage('home')
  }

  const goToPage = (p: Page, space?: Space) => {
    setPage(p)
    if (space) {
      if (p === 'edit-space') {
        setEditingSpace(space)
      } else {
        setSelectedSpace(space)
      }
    }
    if (p === 'new-space') {
      setEditingSpace(null) // Limpa quando vai criar novo
    }
    window.scrollTo(0, 0)
    if (user) loadUserRole(user.id)
  }

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
            <a onClick={() => goToPage('my-quotes')}>
              Meus orçamentos {pendingQuotesCount > 0 && <span className="badge-count">{pendingQuotesCount}</span>}
            </a>
          )}
          {user && userRole === 'host' && (
            <a onClick={() => goToPage('host-quotes')}>
              Orçamentos {pendingQuotesCount > 0 && <span className="badge-count">{pendingQuotesCount}</span>}
            </a>
          )}
          <a>Como funciona</a>
          <a onClick={() => user ? goToPage('host-dashboard') : goToPage('signup')}>Anuncie</a>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              {userRole === 'host' && (
                <button className="btn-primary" onClick={() => goToPage('host-dashboard')}>
                  Meu painel
                </button>
              )}
              <span className="user-greeting">Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
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

      {page === 'home' && <HomePage goToPage={goToPage} />}
      {page === 'listing' && <ListingPage goToPage={goToPage} />}
      {page === 'detail' && selectedSpace && <DetailPage space={selectedSpace} goToPage={goToPage} user={user} />}
      {page === 'login' && <LoginPage goToPage={goToPage} />}
      {page === 'signup' && <SignupPage goToPage={goToPage} />}
      {page === 'host-dashboard' && user && <HostDashboard user={user} goToPage={goToPage} />}
      {page === 'new-space' && user && <SpaceFormPage user={user} goToPage={goToPage} editingSpace={null} />}
      {page === 'edit-space' && user && editingSpace && <SpaceFormPage user={user} goToPage={goToPage} editingSpace={editingSpace} />}
      {page === 'my-quotes' && user && <MyQuotesPage user={user} goToPage={goToPage} />}
      {page === 'host-quotes' && user && <HostQuotesPage user={user} goToPage={goToPage} />}
    </div>
  )
}

export default App
