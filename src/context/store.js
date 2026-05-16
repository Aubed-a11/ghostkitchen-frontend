import { create } from 'zustand'

// ===== AUTH STORE =====
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('gk_user') || 'null'),
  token: localStorage.getItem('gk_token') || null,

  login: (user, token) => {
    localStorage.setItem('gk_token', token)
    localStorage.setItem('gk_user', JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('gk_token')
    localStorage.removeItem('gk_user')
    set({ user: null, token: null })
  },
}))

// ===== CART STORE =====
export const useCartStore = create((set, get) => ({
  items: [],    // { menuItem, quantity, notes }
  restaurantId: null,
  restaurantName: '',

  addItem: (menuItem, quantity = 1, notes = '') => {
    const { items, restaurantId } = get()
    // Clear cart if different restaurant
    if (restaurantId && restaurantId !== menuItem.restaurantId) {
      if (!window.confirm('Nouveau restaurant ? Le panier sera vidé.')) return
      set({ items: [], restaurantId: null })
    }
    const existing = items.find(i => i.menuItem.id === menuItem.id)
    if (existing) {
      set({ items: items.map(i =>
        i.menuItem.id === menuItem.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      )})
    } else {
      set({
        items: [...items, { menuItem, quantity, notes }],
        restaurantId: menuItem.restaurantId,
        restaurantName: menuItem.restaurantName,
      })
    }
  },

  removeItem: (menuItemId) =>
    set(s => ({ items: s.items.filter(i => i.menuItem.id !== menuItemId) })),

  updateQty: (menuItemId, qty) =>
    set(s => ({
      items: qty <= 0
        ? s.items.filter(i => i.menuItem.id !== menuItemId)
        : s.items.map(i => i.menuItem.id === menuItemId ? { ...i, quantity: qty } : i)
    })),

  clear: () => set({ items: [], restaurantId: null, restaurantName: '' }),

  get subtotal() {
    return get().items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)
  },

  get totalItems() {
    return get().items.reduce((s, i) => s + i.quantity, 0)
  },
}))

// ===== ORDERS STORE =====
export const useOrderStore = create((set) => ({
  activeOrders: [],
  myOrders: [],
  currentOrder: null,

  setActiveOrders: (orders) => set({ activeOrders: orders }),
  setMyOrders: (orders) => set({ myOrders: orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),

  updateOrder: (updatedOrder) => set(s => ({
    activeOrders: s.activeOrders.map(o =>
      o.orderNumber === updatedOrder.orderNumber ? updatedOrder : o
    ),
    myOrders: s.myOrders.map(o =>
      o.orderNumber === updatedOrder.orderNumber ? updatedOrder : o
    ),
    currentOrder: s.currentOrder?.orderNumber === updatedOrder.orderNumber
      ? updatedOrder : s.currentOrder,
  })),

  addOrder: (order) => set(s => ({
    activeOrders: [order, ...s.activeOrders],
    myOrders: [order, ...s.myOrders],
  })),
}))
