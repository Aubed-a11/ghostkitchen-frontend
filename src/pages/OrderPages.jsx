import React, { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useCartStore, useAuthStore, useOrderStore } from '../context/store'
import { Button, TopBar, fmtPrice } from '../components/UI'
import toast from 'react-hot-toast'

// =====================
// DISH DETAIL PAGE
// =====================
export function DishDetailPage() {
  const { state } = useLocation()
  const item = state?.item
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const { addItem } = useCartStore()
  const navigate = useNavigate()

  if (!item) { navigate('/home'); return null }

  const handleAdd = () => {
    addItem(item, qty, notes)
    toast.success(`${item.emoji} Ajouté au panier !`)
    navigate('/cart')
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar onBack={() => navigate(-1)} title={item.restaurantName} subtitle={`⏱ ${item.prepTimeMinutes} min`} />

      <div style={{
        height: 200, background: 'linear-gradient(135deg, #FFE0D0, #FFB89A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90,
      }}>
        {item.emoji}
      </div>

      <div style={{ padding: 20, flex: 1 }}>
        <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 600, marginBottom: 6 }}>
          {item.restaurantName}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{item.name}</h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5, marginBottom: 24 }}>{item.description}</p>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Quantité</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 14, padding: '8px 16px',
          }}>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 28, height: 28, borderRadius: 8, background: '#FF6B35', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
            >−</button>
            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              style={{ width: 28, height: 28, borderRadius: 8, background: '#FF6B35', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
            >+</button>
          </div>
        </div>

        <textarea
          placeholder="Notes spéciales (ex: sans piment...)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.6)', borderRadius: 14,
            padding: '12px 16px', fontFamily: "'Outfit', sans-serif", fontSize: 14,
            resize: 'none', outline: 'none', marginBottom: 16,
          }}
        />

        <div style={{ textAlign: 'right', marginBottom: 16, fontSize: 14, color: '#6B7280' }}>
          Total : <strong style={{ fontSize: 18, color: '#1A1A2E' }}>{fmtPrice(item.price * qty)}</strong>
        </div>

        <Button onClick={handleAdd}>🛒 Ajouter au panier</Button>
      </div>
    </div>
  )
}

// =====================
// CART PAGE
// =====================
export function CartPage() {
  const navigate = useNavigate()
  const { items, subtotal, totalItems, updateQty, removeItem, clear } = useCartStore()
  const deliveryFee = 400

  if (items.length === 0) return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar onBack={() => navigate('/home')} title="Mon panier" subtitle="0 article" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
        <div style={{ fontSize: 64 }}>🛒</div>
        <p style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>Votre panier est vide</p>
        <Button onClick={() => navigate('/home')}>Voir le menu →</Button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar onBack={() => navigate('/home')} title="Mon panier" subtitle={`${totalItems} article${totalItems > 1 ? 's' : ''}`} />

      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(({ menuItem, quantity }) => (
          <div key={menuItem.id} style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 18, padding: 14,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{menuItem.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{menuItem.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{fmtPrice(menuItem.price)} × {quantity}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => updateQty(menuItem.id, quantity - 1)}
                style={{ width: 26, height: 26, borderRadius: 8, background: '#FF6B35', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => updateQty(menuItem.id, quantity + 1)}
                style={{ width: 26, height: 26, borderRadius: 8, background: '#FF6B35', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>+</button>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FF6B35', minWidth: 60, textAlign: 'right' }}>
              {fmtPrice(menuItem.price * quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 18, padding: 16, marginBottom: 12,
        }}>
          {[['Sous-total', fmtPrice(subtotal)], ['Livraison', fmtPrice(deliveryFee)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
            <span>Total</span><span>{fmtPrice(subtotal + deliveryFee)}</span>
          </div>
        </div>
        <Button onClick={() => navigate('/checkout')}>
          Commander → {fmtPrice(subtotal + deliveryFee)}
        </Button>
      </div>
    </div>
  )
}

// =====================
// CHECKOUT PAGE
// =====================
export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, restaurantId, clear } = useCartStore()
  const { user } = useAuthStore()
  const { addOrder, setCurrentOrder } = useOrderStore()
  const [zone, setZone] = useState('Cotonou Centre')
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('MTN_MOMO')
  const [loading, setLoading] = useState(false)
  const deliveryFee = 400

  const payments = [
    { id: 'MTN_MOMO', label: 'MTN MoMo', sub: 'Mobile Money MTN', icon: '📱' },
    { id: 'MOOV_MONEY', label: 'Moov Money', sub: 'Mobile Money Moov', icon: '📲' },
    { id: 'CASH', label: 'Cash', sub: 'Paiement à la livraison', icon: '💵' },
  ]

  const handleOrder = async () => {
    if (!address.trim()) return toast.error('Précisez votre adresse')
    setLoading(true)
    try {
      const { data } = await orderAPI.place({
        restaurantId,
        items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity, notes: i.notes })),
        paymentMethod: payment,
        deliveryZone: zone,
        deliveryAddress: address,
      })
      addOrder(data)
      setCurrentOrder(data)
      clear()
      toast.success(`Commande ${data.orderNumber} confirmée !`)
      navigate('/tracking', { state: { order: data } })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <TopBar onBack={() => navigate('/cart')} title="Finaliser" subtitle="Dernière étape" />

      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Delivery */}
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📍 Zone de livraison</h4>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.6)', borderRadius: 14,
              padding: '12px 16px', fontFamily: "'Outfit', sans-serif",
              fontSize: 14, marginBottom: 10, outline: 'none',
            }}
          >
            {['Cotonou Centre', 'Akpakpa', 'Cadjehoun', 'Fidjrossè', 'Abomey-Calavi', 'Dantokpa'].map(z => (
              <option key={z}>{z}</option>
            ))}
          </select>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Adresse précise / repère (ex: En face Sonacop)"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.6)', borderRadius: 14,
              padding: '12px 16px', fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
            }}
          />
        </div>

        {/* Payment */}
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 18, padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💳 Mode de paiement</h4>
          {payments.map(p => (
            <div
              key={p.id}
              onClick={() => setPayment(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${payment === p.id ? 'rgba(255,107,53,0.3)' : 'transparent'}`,
                background: payment === p.id ? 'rgba(255,107,53,0.06)' : 'transparent',
                transition: 'all 0.2s', marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{p.sub}</div>
              </div>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${payment === p.id ? '#FF6B35' : '#9CA3AF'}`,
                background: payment === p.id ? '#FF6B35' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {payment === p.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Total recap */}
        <div style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#6B7280' }}>Total à payer</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#FF6B35' }}>{fmtPrice(subtotal + deliveryFee)}</span>
        </div>

        <Button onClick={handleOrder} disabled={loading}>
          {loading ? '⏳ Envoi...' : '✓ Confirmer la commande'}
        </Button>
      </div>
    </div>
  )
}
