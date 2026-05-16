import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useOrderStore, useAuthStore } from '../context/store'
import { useWebSocket } from '../hooks/useWebSocket'
import { TopBar, StatusBadge, BottomNav, Loader, fmtPrice } from '../components/UI'
import toast from 'react-hot-toast'

const STATUS_STEPS = [
  { key: 'RECEIVED', label: 'Commande reçue', sub: 'Votre commande est confirmée', emoji: '✅' },
  { key: 'IN_PREPARATION', label: 'En préparation', sub: 'La cuisine prépare vos plats...', emoji: '🍳' },
  { key: 'READY', label: 'Prête', sub: 'En attente du livreur', emoji: '📦' },
  { key: 'IN_DELIVERY', label: 'En livraison', sub: 'Le livreur est en route !', emoji: '🛵' },
  { key: 'DELIVERED', label: 'Livré ! 🎉', sub: 'Bon appétit !', emoji: '🏁' },
]

const STATUS_ORDER = ['RECEIVED', 'IN_PREPARATION', 'READY', 'IN_DELIVERY', 'DELIVERED']

// ========================
// TRACKING PAGE
// ========================
export function TrackingPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { currentOrder, updateOrder } = useOrderStore()
  const { user } = useAuthStore()
  const order = state?.order || currentOrder

  // Real-time WebSocket
  useWebSocket(user?.id, user?.role)

  if (!order) return (
    <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>📋</div>
        <p style={{ color: '#6B7280', marginTop: 12 }}>Aucune commande en cours</p>
      </div>
    </div>
  )

  const currentStepIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar
        onBack={() => navigate('/orders')}
        title={`Commande ${order.orderNumber}`}
        subtitle={order.placedAt ? new Date(order.placedAt).toLocaleString('fr-FR') : ''}
        rightSlot={<StatusBadge status={order.status} />}
      />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Order ID */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 18, padding: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {order.orderNumber}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            {order.restaurantName} · {fmtPrice(order.total)}
          </div>
        </div>

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 18, padding: 20,
        }}>
          {STATUS_STEPS.map((step, i) => {
            const isDone = i < currentStepIdx
            const isActive = i === currentStepIdx
            const isPending = i > currentStepIdx
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', paddingBottom: i < STATUS_STEPS.length - 1 ? 20 : 0 }}>
                {/* Line */}
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 15, top: 32, bottom: 0, width: 2,
                    background: isDone ? '#10B981' : 'rgba(0,0,0,0.06)',
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  background: isDone ? '#10B981' : isActive ? '#FF6B35' : 'rgba(0,0,0,0.06)',
                  color: isPending ? '#6B7280' : '#fff',
                  animation: isActive ? 'pulse 1.5s infinite' : 'none',
                  boxShadow: isActive ? '0 0 0 0 rgba(255,107,53,0.4)' : 'none',
                }}>
                  {isDone ? '✓' : step.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isPending ? '#9CA3AF' : '#1A1A2E' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{step.sub}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Items */}
        {order.items?.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 18, padding: 16,
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Détail commande</h4>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                <span>{item.emoji} {item.quantity}x {item.menuItemName}</span>
                <span style={{ fontWeight: 600 }}>{fmtPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Support */}
        <div
          onClick={() => toast('Connexion WhatsApp Support...', { icon: '📱' })}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: 14, padding: 14, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: '#128C7E',
          }}
        >
          📱 Support WhatsApp
        </div>
      </div>
    </div>
  )
}

// ========================
// ORDER HISTORY PAGE
// ========================
export function OrdersHistoryPage() {
  const navigate = useNavigate()
  const { myOrders, setMyOrders } = useOrderStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.myOrders()
      setMyOrders(data)
    } catch (e) {
      toast.error('Erreur chargement commandes')
    } finally {
      setLoading(false)
    }
  }

  const { totalItems } = require('../context/store').useCartStore()

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar onBack={() => navigate('/home')} title="Mes commandes" subtitle="Historique" />

      {loading ? <Loader /> : (
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 64 }}>📋</div>
              <p style={{ color: '#6B7280', marginTop: 12 }}>Aucune commande</p>
            </div>
          ) : myOrders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate('/tracking', { state: { order } })}
              style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 18, padding: 14,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{order.orderNumber}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {order.placedAt ? new Date(order.placedAt).toLocaleDateString('fr-FR') : '—'}
                  {' · '}{order.restaurantName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{fmtPrice(order.total)}</div>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav items={[
        { icon: '🏠', label: 'Accueil', onClick: () => navigate('/home') },
        { icon: '🛒', label: 'Panier', badge: 0, onClick: () => navigate('/cart') },
        { icon: '📋', label: 'Commandes', active: true, onClick: () => {} },
        { icon: '👤', label: 'Profil', onClick: () => navigate('/login') },
      ]} />
    </div>
  )
}
