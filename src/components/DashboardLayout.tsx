import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

interface Tab {
  key: string
  icon: string
  label: string
}

interface Props {
  user: User
  tabs: Tab[]
  activeTab: string
  onTabChange: (tab: string) => void
  title: string
  subtitle: string
  headerAction?: ReactNode
  children: ReactNode
}

export default function DashboardLayout({ user, tabs, activeTab, onTabChange, title, subtitle, headerAction, children }: Props) {
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f4f6f8', display: 'flex' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 240, background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* User info */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#1a2e05', flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                width: '100%', textAlign: 'left', padding: '11px 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: activeTab === tab.key ? 'rgba(163,230,53,0.12)' : 'transparent',
                border: 'none', borderLeft: activeTab === tab.key ? '3px solid #a3e635' : '3px solid transparent',
                color: activeTab === tab.key ? '#a3e635' : '#9ca3af',
                fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s'
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, color: '#444', textAlign: 'center' }}>Ewind · Marketplace de Eventos</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Page header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #e8e8e8', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{title}</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{subtitle}</p>
          </div>
          {headerAction}
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}
