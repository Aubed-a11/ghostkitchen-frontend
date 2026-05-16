import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI, analyticsAPI } from '../services/api'
import { useAuthStore, useOrderStore } from '../context/store'
import { useWebSocket } from '../hooks/useWebSocket'
import { StatusBadge, fmtPrice, Loader } from '../components/UI'
import toast from 'react-hot-toast'

const STATUS_COLS = [
  { key: 'RECEIVED', label: '⏳ Attente', next: 'IN_PREPARATION', nextLabel: '→ Prépa.' },
  { key: 'IN_PREPARATION', label: '🍳 Prépa.', next: 'READY', nextLabel: '→ Prêt' },
  { key: 'READY', label: '✅ Prêt', next: 'IN_DELIVERY', nextLabel: '→ Livr.' },
  { key: 'IN_DELIVERY', label: '🛵 Livraison', next: null, nextLabel: null },
]

export default function CuisinePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeOrders, setActiveOrders, updateOrder } = useOrderStore()
  const [tab, setTab] = useState('kanban')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useWebSocket(user?.id, user?.role)

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [])

  const loadOrders = async () => {
    try {
      const { data } = await orderAPI.active()
      setActiveOrders(data)
    } catch (e) {
      toast.error('Erreur chargement commandes')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await analyticsAPI.dashboard()
      setStats(data)
    } catch (e) { /* silently fail */ }
  }

  const handleMove = async (order) => {
    const col = STATUS_COLS.find(c => c.key === order.status)
    if (!col?.next) return
    try {
      const { data } = await orderAPI.updateStatus(order.orderNumber, col.next)
      updateOrder(data)
      toast.success(`${order.orderNumber} → ${col.nextLabel}`)
    } catch (e) {
      toast.error('Erreur mise à jour')
    }
  }

  const colOrders = (key) => activeOrders.filter(o => o.status === key)

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.4)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>👨‍🍳 Cuisine Dashboard</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>Vue temps réel</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadOrders} style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>↻</button>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Quitter</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {[['kanban', '🍳 Kanban'], ['analytics', '📊 Stats'], ['livreurs', '🛵 Livreurs']].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); if (id === 'analytics') loadStats() }}
            style={{
              flex: 1, padding: '11px 6px', fontSize: 12, fontWeight: 600,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              borderBottom: `2px solid ${tab === id ? '#FF6B35' : 'transparent'}`,
              color: tab === id ? '#FF6B35' : '#6B7280', transition: 'all 0.2s',
            }}
          >{label}</button>
        ))}
      </div>

      {/* KANBAN */}
      {tab === 'kanban' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {loading ? <Loader /> : (
            <div style={{ display: 'flex', gap: 10, padding: 12, overflowX: 'auto', flex: 1, scrollbarWidth: 'none', alignItems: 'flex-start' }}>
              {STATUS_COLS.map(col => {
                const orders = colOrders(col.key)
                return (
                  <div key={col.key} style={{ minWidth: 150, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                      background: 'rgba(0,0,0,0.05)', borderRadius: 10, padding: '8px 12px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{col.label}</span>
                      <span style={{ background: '#FF6B35', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                        {orders.length}
                      </span>
                    </div>
                    {orders.map(order => (
                      <div key={order.id} style={{
                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.6)', borderRadius: 14,
                        padding: 12, transition: 'all 0.2s',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{order.orderNumber}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', margin: '2px 0' }}>
                          {order.placedAt ? new Date(order.placedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>
                          {order.items?.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                        </div>
                        {col.next && (
                          <button
                            onClick={() => handleMove(order)}
                            style={{
                              width: '100%', background: '#FF6B35', color: '#fff', border: 'none',
                              borderRadius: 8, padding: '5px 0', fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                            }}
                          >{col.nextLabel}</button>
                        )}
                        {col.key === 'IN_DELIVERY' && (
                          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>✓ En route</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {!stats ? <Loader /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['📦', Math.round(stats.totalOrdersToday), 'Commandes'],
                  ['💰', fmtPrice(stats.revenueToday), 'CA du jour'],
                  ['⏱', `${stats.avgPrepTimeMinutes} min`, 'Temps moyen'],
                  ['✅', `${Math.round(stats.completionRate)}%`, 'Complétion'],
                ].map(([emoji, val, lbl]) => (
                  <div key={lbl} style={{
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.6)', borderRadius: 16, padding: 14,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#FF6B35' }}>{val}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{emoji} {lbl}</div>
                  </div>
                ))}
              </div>

              {stats.topDishes?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🏆 Top plats du jour</h4>
                  {stats.topDishes.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20, width: 28 }}>{d.emoji}</span>
                      <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                      <div style={{ width: 80, height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, d.count * 5)}%`, background: 'linear-gradient(90deg, #FF6B35, #FF8C61)', borderRadius: 20 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 24, textAlign: 'right' }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIVREURS */}
      {tab === 'livreurs' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 16, paddingBottom: 32 }}>
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🛵 Livreurs en ligne</h4>
            {!stats?.livreurs || stats.livreurs.length === 0 ? (
              <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', padding: 20 }}>Aucun livreur connecté</p>
            ) : stats.livreurs.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
                }}>
                  {l.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>⭐ {l.rating?.toFixed(1)} · {l.coursesCompleted} courses</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{fmtPrice(l.cashCollected)}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.online ? '#10B981' : '#EF4444' }} />
              </div>
            ))}
          </div>

          <button
            onClick={() => toast('Notification envoyée à tous les livreurs !', { icon: '📢' })}
            style={{
              width: '100%', marginTop: 12,
              background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
              color: '#fff', border: 'none', borderRadius: 16,
              padding: 14, fontFamily: "'Outfit', sans-serif",
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >📢 Notifier tous les livreurs</button>
        </div>
      )}
    </div>
  )
}
