import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Space, Supplier, EventItem } from './types'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePageNew'))
const ListingPage = lazy(() => import('./pages/ListingPage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const HostDashboard = lazy(() => import('./pages/HostDashboard'))
const SpaceFormPage = lazy(() => import('./pages/SpaceFormPage'))
const MyQuotesPage = lazy(() => import('./pages/MyQuotesPage'))
const HostQuotesPage = lazy(() => import('./pages/HostQuotesPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('./pages/SupplierDetailPage'))
const SupplierFormPage = lazy(() => import('./pages/SupplierFormPage'))
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'))
const EventsListPage = lazy(() => import('./pages/EventsListPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
import CookieBanner, { getCookieConsent, type CookieCategories } from './components/CookieBanner'

const PAGE_TO_URL: Partial<Record<Page, string>> = {
  home: '/',
  listing: '/espacos',
  suppliers: '/fornecedores',
  'how-it-works': '/como-funciona',
  about: '/quem-somos',
  pricing: '/planos',
  terms: '/termos',
  login: '/entrar',
  signup: '/cadastro',
  'host-dashboard': '/painel',
  'supplier-dashboard': '/painel/fornecedor',
  'guest-dashboard': '/painel/visitante',
  'host-quotes': '/painel/orcamentos',
  'my-quotes': '/orcamentos',
  'new-space': '/anunciar/espaco',
  'new-supplier': '/anunciar/servico',
  comparison: '/comparar',
  admin: '/admin',
  events: '/eventos',
  'event-detail': '/eventos/gerenciar',
}

const URL_TO_PAGE: Record<string, Page> = Object.fromEntries(
  Object.entries(PAGE_TO_URL).map(([k, v]) => [v, k as Page])
)


function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)
}
function getSpaceUrl(space) { return '/espacos/' + slugify(space.name) + '-' + space.id.slice(0,8) }
function getSupplierUrl(supplier) { return '/fornecedores/' + slugify(supplier.name) + '-' + supplier.id.slice(0,8) }

function getInitialPage(): Page {
  const path = window.location.pathname
  if (URL_TO_PAGE[path]) return URL_TO_PAGE[path]
  if (path.match(/^\/espacos\/.+-[0-9a-f]{8}$/)) return 'detail'
  if (path.startsWith('/espacos')) return 'listing'
  if (path.match(/^\/fornecedores\/.+-[0-9a-f]{8}$/)) return 'supplier-detail'
  if (path.startsWith('/fornecedores')) return 'suppliers'
  if (path === '/reset-password') return 'reset-password'
  return 'home'
}

export type Page =
  | 'home' | 'listing' | 'detail'
  | 'login' | 'signup'
  | 'host-dashboard' | 'new-space' | 'edit-space'
  | 'my-quotes' | 'host-quotes' | 'guest-dashboard'
  | 'how-it-works' | 'about' | 'comparison'
  | 'suppliers' | 'supplier-detail' | 'new-supplier' | 'edit-supplier' | 'supplier-dashboard'
 
  | 'reset-password' | 'terms' | 'pricing' | 'admin'
  | 'events' | 'event-detail'

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ fontSize: 14, color: '#6b7280' }}>Carregando...</div>
  </div>
)

function App() {
  const [page, setPage] = useState<Page>(getInitialPage)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [compareSpaces, setCompareSpaces] = useState<Space[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string>('guest')
  const [isHost, setIsHost] = useState(false)
  const [isSupplier, setIsSupplier] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0)
  const [pageKey, setPageKey] = useState(0)
  const [cookieCategories, setCookieCategories] = useState<CookieCategories>(() => getCookieConsent().categories)

  const loadUserRole = useCallback(async (userId: string) => {
    // Tentar buscar perfil
    let { data } = await supabase
      .from('profiles')
      .select('role, is_host, is_supplier')
      .eq('id', userId)
      .single()

    // Se não encontrar perfil, criar a partir do user_metadata
    if (!data) {
      const { data: authData } = await supabase.auth.getUser()
      const meta = authData?.user?.user_metadata
      const role = meta?.role || 'guest'
      await supabase.from('profiles').upsert({
        id: userId,
        email: authData?.user?.email,
        full_name: meta?.full_name || '',
        role,
        is_host: role === 'host',
        is_supplier: role === 'supplier',
        updated_at: new Date().toISOString()
      })
      data = { role, is_host: role === 'host', is_supplier: role === 'supplier' }
    }

    const role = data.role || 'guest'
    const isH = !!(data.is_host || role === 'host')
    const isS = !!(data.is_supplier || role === 'supplier')
    setUserRole(role)
    setIsHost(isH)
    setIsSupplier(isS)

    // Badge de orçamentos pendentes
    if (isH || isS) {
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('status', 'pending')
      setPendingQuotesCount(count || 0)
    } else if (role === 'guest') {
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('guest_id', userId)
      setPendingQuotesCount(count || 0)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserRole(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserRole(session.user.id)
      else { setUserRole('guest'); setIsHost(false); setIsSupplier(false); setPendingQuotesCount(0) }
      // Redirecionar para redefinição de senha ao clicar no link do email
      if (event === 'PASSWORD_RECOVERY') {
        setPage('reset-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserRole])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    setPage('home')
  }, [])

  const goToPage = useCallback((p: Page, data?: Space | Supplier) => {
    setMobileMenuOpen(false)
    setPage(p)
    setPageKey(k => k + 1)
    let url = PAGE_TO_URL[p]
    if (p === 'detail' && data && data.city) url = '/espacos/' + data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60) + '-' + data.id.slice(0,8)
    if (p === 'supplier-detail' && data && data.cities) url = '/fornecedores/' + data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60) + '-' + data.id.slice(0,8)
    if (url && window.location.pathname !== url) window.history.pushState({ page: p }, '', url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (data) {
      if (p === 'edit-space') setEditingSpace(data as Space)
      else if (p === 'detail') setSelectedSpace(data as Space)
      else if (p === 'supplier-detail') setSelectedSupplier(data as Supplier)
      else if (p === 'edit-supplier') setEditingSupplier(data as Supplier)
    }
    if (p === 'new-space') setEditingSpace(null)
    if (p === 'new-supplier') setEditingSupplier(null)
    window.scrollTo(0, 0)
  }, [])

  const refreshQuoteCount = useCallback(() => {
    if (user) loadUserRole(user.id)
  }, [user, loadUserRole])

  const handleCompareToggle = useCallback((space: Space) => {
    setCompareSpaces(prev => {
      const exists = prev.find(s => s.id === space.id)
      if (exists) return prev.filter(s => s.id !== space.id)
      if (prev.length >= 3) {
        alert('Máximo de 3 espaços para comparar. Remova um antes de adicionar.')
        return prev
      }
      return [...prev, space]
    })
  }, [])


  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname
      const p = (URL_TO_PAGE[path] || 'home') as Page
      setPage(p); window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])
  const handleClearCompare = useCallback(() => setCompareSpaces([]), [])
  const handleRemoveFromCompare = useCallback((id: string) =>
    setCompareSpaces(prev => prev.filter(s => s.id !== id)), [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Carregando...</div>
      </div>
    )
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  return (
    <div className="app">
      <nav className="nav">
        <button className="nav-hamburger" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Menu">
          <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
        <div className="nav-logo" onClick={() => goToPage('home')}>
          <img src="/logo.png" alt="Ewind" className="logo-img" />
        </div>

        <div className="nav-center">
          <a onClick={() => goToPage('home')} style={{ fontWeight: 600 }}>Início</a>
          <a onClick={() => goToPage('how-it-works')}>Como funciona</a>
          <a onClick={() => goToPage('listing')}>Espaços</a>
          <a onClick={() => goToPage('suppliers')}>Fornecedores</a>

          {/* Nav items por role */}

          <a onClick={() => goToPage('pricing')}>Planos</a>
          <a onClick={() => goToPage('about')}>Quem somos</a>
        </div>

        <div className="nav-right">

          {/* Badge comparação */}
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
              📊 Comparar
              <span className="badge-count" style={{ background: '#a3e635', color: '#1a2e05' }}>
                {compareSpaces.length}
              </span>
            </button>
          )}

          {user ? (
            <>
              {/* Meus eventos — entrada principal (gestor de eventos) */}
              <button className="btn-link" onClick={() => goToPage('events')} style={{ fontWeight: 600 }}>
                🗓️ Meus eventos
              </button>
              {/* Meu painel — todos os perfis */}
              {user?.id === '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b' && (
                <button className="btn-primary" onClick={() => goToPage('admin')}>⚙️ Admin</button>
              )}
              {user && user?.id !== '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b' && (
                <button className="btn-primary" onClick={() => {
                  if (userRole === 'supplier' || isSupplier) goToPage('supplier-dashboard')
                  else if (userRole === 'host' || isHost) goToPage('host-dashboard')
                  else goToPage('guest-dashboard')
                }}>
                  {userRole === 'supplier' || isSupplier ? '🛠️' : userRole === 'host' || isHost ? '🏢' : '👤'} Meu painel{pendingQuotesCount > 0 && <span style={{marginLeft:6,background:'#dc2626',color:'#fff',borderRadius:'50%',padding:'0 6px',fontSize:11,fontWeight:800,lineHeight:'18px',display:'inline-block'}}>{pendingQuotesCount}</span>}
                </button>
              )}

              <span className="user-greeting">Olá, {userName}</span>
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

      {/* MOBILE MENU */}
      <div className={`nav-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a onClick={() => goToPage('home')}>🏠 Início</a>
        <a onClick={() => goToPage('listing')}>🏢 Espaços</a>
        <a onClick={() => goToPage('suppliers')}>🛠️ Fornecedores</a>
        <a onClick={() => goToPage('how-it-works')}>📖 Como funciona</a>
        <a onClick={() => goToPage('pricing')}>💎 Planos</a>
        <a onClick={() => goToPage('about')}>👥 Quem somos</a>
        {user && userRole !== 'guest' && (
          <a onClick={() => goToPage(userRole === 'supplier' ? 'supplier-dashboard' : 'host-dashboard')}>
            {userRole === 'supplier' ? '🛠️' : '🏢'} Meu painel
          </a>
        )}
        <div className="mobile-auth">
          {!user ? (
            <>
              <button className="btn-link" onClick={() => goToPage('login')}>Entrar</button>
              <button className="btn-primary" onClick={() => goToPage('signup')}>Cadastrar</button>
            </>
          ) : (
            <button className="btn-link" onClick={async () => { await supabase.auth.signOut(); setMobileMenuOpen(false) }}>
              Sair da conta
            </button>
          )}
        </div>
      </div>

      <Suspense fallback={<PageLoader />}>
        {/* Páginas públicas */}
        {page === 'home' && <HomePage goToPage={goToPage} />}
        {page === 'listing' && (
          <ListingPage
            goToPage={goToPage}
            compareSpaces={compareSpaces}
            onCompareToggle={handleCompareToggle}
            onClearCompare={handleClearCompare}
          />
        )}
        {page === 'detail' && selectedSpace && (
          <DetailPage space={selectedSpace} goToPage={goToPage} user={user} />
        )}
        {page === 'suppliers' && <SuppliersPage goToPage={goToPage} user={user} />}
        {page === 'supplier-detail' && selectedSupplier && (
          <SupplierDetailPage supplier={selectedSupplier} goToPage={goToPage} user={user} />
        )}
        {page === 'how-it-works' && <HowItWorksPage goToPage={goToPage} />}
        {page === 'about' && <AboutPage goToPage={goToPage} />}
        {page === 'comparison' && (
          <ComparisonPage
            spaces={compareSpaces}
            goToPage={goToPage}
            onRemove={handleRemoveFromCompare}
          />
        )}

        {/* Auth */}
        {page === 'login' && <LoginPage goToPage={goToPage} />}
        {page === 'signup' && <SignupPage goToPage={goToPage} />}

        {/* Área do Host */}
        {page === 'host-dashboard' && user && (
          <HostDashboard user={user} goToPage={goToPage} onSpaceChange={refreshQuoteCount} />
        )}
        {page === 'new-space' && user && userRole !== 'supplier' && (
          <SpaceFormPage user={user} goToPage={goToPage} editingSpace={null} />
        )}
        {page === 'new-space' && user && userRole === 'supplier' && (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🛠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Seu perfil é de fornecedor</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Para anunciar espaços, você precisa de um perfil de locatário.</p>
            <button className="btn-primary" onClick={() => goToPage('supplier-dashboard')}>Voltar ao meu painel</button>
          </div>
        )}
        {page === 'edit-space' && user && userRole !== 'supplier' && editingSpace && (
          <SpaceFormPage user={user} goToPage={goToPage} editingSpace={editingSpace} />
        )}
        {page === 'guest-dashboard' && user && (
          <GuestDashboard user={user} goToPage={goToPage} />
        )}
        {page === 'events' && user && (
          <EventsListPage user={user} goToPage={goToPage} openEvent={(ev: EventItem) => { setSelectedEvent(ev); goToPage('event-detail') }} />
        )}
        {page === 'event-detail' && user && selectedEvent && (
          <EventDetailPage user={user} event={selectedEvent} goToPage={goToPage} back={() => goToPage('events')} />
        )}
        {page === 'event-detail' && user && !selectedEvent && (
          <EventsListPage user={user} goToPage={goToPage} openEvent={(ev: EventItem) => { setSelectedEvent(ev); goToPage('event-detail') }} />
        )}
        {page === 'my-quotes' && user && (
          <MyQuotesPage user={user} goToPage={goToPage} />
        )}
        {page === 'host-quotes' && user && (
          <HostQuotesPage user={user} goToPage={goToPage} userRole={userRole} />
        )}

        {/* Área do Fornecedor */}
        {page === 'reset-password' && <ResetPasswordPage goToPage={goToPage} />}
        {page === 'terms' && <TermsPage goToPage={goToPage} />}
        {page === 'pricing' && <PricingPage goToPage={goToPage} />}
        {page === 'admin' && user?.id === '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b' && <AdminPage goToPage={goToPage} />}
        {page === 'admin' && user?.id !== '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b' && <div style={{padding:40,textAlign:'center'}}><h2>Acesso negado</h2></div>}
        {page === 'supplier-dashboard' && user && (
          <SupplierDashboard user={user} goToPage={goToPage} />
        )}
        {page === 'new-supplier' && user && (
          <SupplierFormPage user={user} goToPage={goToPage} editingSupplier={null} />
        )}
        {page === 'edit-supplier' && user && editingSupplier && (
          <SupplierFormPage user={user} goToPage={goToPage} editingSupplier={editingSupplier} />
        )}
      </Suspense>
      <CookieBanner user={user} onAccept={setCookieCategories} goToPage={goToPage} />
    </div>
  )
}

export default App

