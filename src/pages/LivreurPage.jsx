import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useAuthStore, useOrderStore } from '../context/store'
import { useWebSocket } from '../hooks/useWebSocket'
import { TopBar, StatusBadge, fmtPrice, Loader } from '../components/UI'
import toast from 'react-hot-toast'

export default function LivreurPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState('courses') // 'courses' | 'active' | 'gains'
  const [available, setAvailable] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useWebSocket(user?.id, user?.role)

  useEffect(() => { loadCourses() }, [])

  const loadCourses = async () => {
    try {
      const { data } = await orderAPI.availableCourses()
      setAvailable(data)
    } catch (e) {
      toast.error('Erreur chargement courses')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderNumber) => {
    try {
      const { data } = await orderAPI.assignLivreur(orderNumber)
      setActiveOrder(data)
      setAvailable(av => av.filter(o => o.orderNumber !== orderNumber))
      setTab('active')
      toast.success(`Course ${orderNumber} acceptée !`)
    } catch (e) {
      toast.error('Erreur acceptation course')
    }
  }

  const handleDelivered = async () => {
    if (!activeOrder) return
    try {
      await orderAPI.updateStatus(activeOrder.orderNumber, 'DELIVERED')
      toast.success('Livraison confirmée ! 🎉')
      setActiveOrder(null)
      setTab('courses')
      loadCourses()
    } catch (e) {
      toast.error('Erreur confirmation')
    }
  }

  const gains = { day: 2500, total: 8500, courses: 5 }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.4)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10B981', marginRight: 6, animation: 'blink 2s infinite' }} />
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>● En ligne</div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Déconnexion
        </button>
      </div>

      {/* Gains summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 20px' }}>
        {[['💰', fmtPrice(gains.day), 'Gains jour'], ['💵', fmtPrice(gains.total), 'Total'], ['🛵', gains.courses, 'Courses']].map(([emoji, val, lbl]) => (
          <div key={lbl} style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 16, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 20 }}>{emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{val}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
        {[['courses', '🚨 Courses'], ['active', '📍 En cours'], ['gains', '📈 Gains']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '12px 8px', fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              background: 'transparent',
              borderBottom: `2px solid ${tab === id ? '#FF6B35' : 'transparent'}`,
              color: tab === id ? '#FF6B35' : '#6B7280',
              transition: 'all 0.2s',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'courses' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? <Loader /> : available.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48 }}>🛵</div>
                <p style={{ color: '#6B7280', marginTop: 12 }}>Aucune course disponible</p>
                <button onClick={loadCourses} style={{ marginTop: 12, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                  Actualiser
                </button>
              </div>
            ) : available.map(order => (
              <div key={order.id} style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 18, padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>📍 {order.deliveryZone}</div>
                  </div>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Prête</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {order.items?.length || 0} articles
                  </span>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {fmtPrice(order.total)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAccept(order.orderNumber)}
                    style={{
                      flex: 1, background: '#FF6B35', color: '#fff', border: 'none',
                      borderRadius: 12, padding: 12, fontFamily: "'Outfit', sans-serif",
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}
                  >✓ Accepter</button>
                  <button
                    onClick={() => setAvailable(av => av.filter(o => o.id !== order.id))}
                    style={{
                      width: 44, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444', borderRadius: 12, cursor: 'pointer', fontSize: 18,
                    }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'active' && (
          <div style={{ padding: 16 }}>
            {!activeOrder ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48 }}>📍</div>
                <p style={{ color: '#6B7280', marginTop: 12 }}>Aucune course active</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  height: 180, background: 'linear-gradient(160deg, #E8F4FD, #C8E6F7)',
                  borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', width: 4, height: '100%', background: 'rgba(255,255,255,0.7)', left: '50%' }} />
                  <span style={{ animation: 'float 2s ease-in-out infinite', zIndex: 2 }}>📍</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>🏁 Navigation → {activeOrder.deliveryZone}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{activeOrder.deliveryAddress}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Détail commande</h4>
                  {activeOrder.items?.map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                      {item.emoji} {item.quantity}x {item.menuItemName}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDelivered}
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                    color: '#fff', border: 'none', borderRadius: 16,
                    padding: 16, fontFamily: "'Outfit', sans-serif",
                    fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                >✓ Confirmer la livraison</button>
              </div>
            )}
          </div>
        )}

        {tab === 'gains' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
              borderRadius: 20, padding: 24, textAlign: 'center', color: '#fff',
            }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{fmtPrice(gains.day)}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{gains.courses} courses complétées aujourd'hui</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💵 Cash en main</h4>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.06)', borderRadius: 20, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: '84%', background: 'linear-gradient(90deg, #FF6B35, #FF8C61)', borderRadius: 20, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280' }}>
                <span>42 000 F collectés</span><span>Max: 50 000 F</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Historique du jour</h4>
              {[{id:'GK-847291',zone:'Cotonou Centre',time:'12:35',gain:500},{id:'GK-847280',zone:'Akpakpa',time:'11:50',gain:500},{id:'GK-847265',zone:'Cadjehoun',time:'10:20',gain:500}].map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.id}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{c.time} · {c.zone}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>+{fmtPrice(c.gain)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
