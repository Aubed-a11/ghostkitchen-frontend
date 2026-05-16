import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantAPI } from '../services/api'
import { useAuthStore, useCartStore } from '../context/store'
import { Card, BottomNav, Loader, fmtPrice } from '../components/UI'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [allItems, setAllItems] = useState([])
  const [popular, setPopular] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { addItem, totalItems } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [restRes, popRes] = await Promise.all([
        restaurantAPI.getAll(),
        restaurantAPI.getPopular(),
      ])
      const rests = restRes.data
      setRestaurants(rests)
      setPopular(popRes.data)

      // Load all menus
      const allMenus = await Promise.all(rests.map(r => restaurantAPI.getMenu(r.id)))
      setAllItems(allMenus.flatMap(r => r.data))
    } catch (e) {
      toast.error('Erreur chargement menu')
    } finally {
      setLoading(false)
    }
  }

  const filtered = activeFilter === 'all'
    ? allItems
    : allItems.filter(i => i.restaurantId === parseInt(activeFilter))

  const handleAdd = (item, e) => {
    e.stopPropagation()
    addItem(item)
    toast.success(`${item.emoji} ${item.name} ajouté !`, { duration: 1500 })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader />
    </div>
  )

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 12px',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.4)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>
              Salut {user?.name?.split(' ')[0]} 👋
            </h2>
            <p style={{ fontSize: 12, color: '#6B7280' }}>📍 Cotonou, Bénin</p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E', marginTop: 12 }}>
          Envie de quoi aujourd'hui ?
        </p>
      </div>

      {/* Search bar */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#9CA3AF', fontSize: 14,
        }}>
          🔍 Rechercher un plat...
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 20px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {[{ id: 'all', label: 'Tout' }, ...restaurants.map(r => ({ id: r.id, label: r.name }))].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(String(f.id))}
            style={{
              padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeFilter === String(f.id) ? '#FF6B35' : 'rgba(255,255,255,0.7)',
              color: activeFilter === String(f.id) ? '#fff' : '#6B7280',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Popular */}
      {activeFilter === 'all' && popular.length > 0 && (
        <>
          <div style={{ padding: '0 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>⭐ Populaires</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '0 20px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {popular.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/dish/${item.id}`, { state: { item } })}
                style={{
                  background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: 18, padding: 14, minWidth: 110,
                  textAlign: 'center', cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF6B35' }}>{fmtPrice(item.price)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All items */}
      <div style={{ padding: '0 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🍽️ Tous les plats</h3>
        <span style={{ fontSize: 12, color: '#6B7280' }}>{filtered.length} plats</span>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/dish/${item.id}`, { state: { item } })}
            style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 18, padding: 14,
              display: 'flex', gap: 14, alignItems: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #FFE0D0, #FFB89A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30,
            }}>
              {item.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 600, marginBottom: 2 }}>
                {item.restaurantName}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{fmtPrice(item.price)}</span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>⏱ {item.prepTimeMinutes} min</span>
              </div>
            </div>
            <button
              onClick={(e) => handleAdd(item, e)}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#FF6B35', border: 'none',
                color: '#fff', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >+</button>
          </div>
        ))}
      </div>

      <BottomNav items={[
        { icon: '🏠', label: 'Accueil', active: true, onClick: () => {} },
        { icon: '🛒', label: 'Panier', badge: totalItems, onClick: () => navigate('/cart') },
        { icon: '📋', label: 'Commandes', onClick: () => navigate('/orders') },
        { icon: '👤', label: 'Profil', onClick: () => navigate('/login') },
      ]} />
    </div>
  )
}
