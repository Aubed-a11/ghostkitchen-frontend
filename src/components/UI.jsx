import React from 'react'

// ===== BUTTON =====
export function Button({ children, variant = 'primary', onClick, disabled, style, className }) {
  const base = {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: '15px',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 20px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s',
    width: '100%',
  }
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
      color: '#fff',
      boxShadow: '0 4px 16px rgba(255,107,53,0.3)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.7)',
      color: '#1A1A2E',
      border: '1px solid rgba(255,255,255,0.6)',
    },
    danger: {
      background: 'rgba(239,68,68,0.1)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.2)',
    },
    success: {
      background: 'rgba(16,185,129,0.1)',
      color: '#10B981',
      border: '1px solid rgba(16,185,129,0.3)',
    },
  }
  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

// ===== CARD =====
export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '20px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ===== INPUT =====
export function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>{label}</label>}
      <input
        {...props}
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '14px',
          padding: '13px 16px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '15px',
          color: '#1A1A2E',
          outline: 'none',
          width: '100%',
          transition: 'all 0.2s',
          ...props.style,
        }}
      />
    </div>
  )
}

// ===== STATUS BADGE =====
export function StatusBadge({ status }) {
  const cfg = {
    RECEIVED: { label: 'Reçue', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
    IN_PREPARATION: { label: 'En prépa.', bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
    READY: { label: 'Prête', bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' },
    IN_DELIVERY: { label: 'En livraison', bg: 'rgba(255,107,53,0.1)', color: '#FF6B35' },
    DELIVERED: { label: 'Livrée ✓', bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
    CANCELLED: { label: 'Annulée', bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  }
  const c = cfg[status] || cfg.RECEIVED
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '4px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600,
    }}>
      {c.label}
    </span>
  )
}

// ===== TOPBAR =====
export function TopBar({ title, subtitle, onBack, rightSlot }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.4)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: 18, color: '#1A1A2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >←</button>
      ) : <div style={{ width: 36 }} />}

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{subtitle}</div>}
      </div>

      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>
        {rightSlot}
      </div>
    </div>
  )
}

// ===== LOADING SPINNER =====
export function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

// ===== BOTTOM NAV =====
export function BottomNav({ items }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.5)',
      display: 'flex', padding: '8px 0 16px', zIndex: 50,
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          onClick={item.onClick}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 22, position: 'relative' }}>
            {item.icon}
            {item.badge > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#FF6B35', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.badge}</span>
            )}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: item.active ? '#FF6B35' : '#6B7280',
          }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ===== FORMAT PRICE =====
export function fmtPrice(n) {
  return Number(n).toLocaleString('fr-FR') + ' F'
}
