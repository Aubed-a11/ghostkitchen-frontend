import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Inject JWT token on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gk_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gk_token')
      localStorage.removeItem('gk_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ===== AUTH =====
export const authAPI = {
  sendOtp: (phone, name) =>
    api.post('/auth/send-otp', { phone, name }),
  verifyOtp: (phone, otp) =>
    api.post('/auth/verify-otp', { phone, otp }),
}

// ===== RESTAURANTS =====
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getOne: (id) => api.get(`/restaurants/${id}`),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
  getPopular: () => api.get('/restaurants/menu/popular'),
  addMenuItem: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (itemId, data) =>
    api.put(`/restaurants/menu/${itemId}`, data),
}

// ===== ORDERS =====
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  active: () => api.get('/orders/active'),
  availableCourses: () => api.get('/orders/available-courses'),
  updateStatus: (orderNumber, status) =>
    api.patch(`/orders/${orderNumber}/status`, { status }),
  assignLivreur: (orderNumber) =>
    api.patch(`/orders/${orderNumber}/assign-livreur`),
}

// ===== ANALYTICS =====
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
}

export default api
