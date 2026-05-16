import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './context/store'
import './styles/global.css'

// Pages
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import { DishDetailPage, CartPage, CheckoutPage } from './pages/OrderPages'
import { TrackingPage, OrdersHistoryPage } from './pages/TrackingPages'
import LivreurPage from './pages/LivreurPage'
import CuisinePage from './pages/CuisinePage'

// ========================
// PROTECTED ROUTE
// ========================
function Protected({ children, allowedRoles }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/home" />
  return children
}

// ========================
// BACKGROUND ORBS
// ========================
function Orbs() {
  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </>
  )
}

// ========================
// MAIN APP
// ========================
export default function App() {
  const { user } = useAuthStore()

  return (
    <BrowserRouter>
      <Orbs />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Client routes */}
        <Route path="/home" element={
          <Protected allowedRoles={['CLIENT']}>
            <HomePage />
          </Protected>
        } />
        <Route path="/dish/:id" element={
          <Protected allowedRoles={['CLIENT']}>
            <DishDetailPage />
          </Protected>
        } />
        <Route path="/cart" element={
          <Protected allowedRoles={['CLIENT']}>
            <CartPage />
          </Protected>
        } />
        <Route path="/checkout" element={
          <Protected allowedRoles={['CLIENT']}>
            <CheckoutPage />
          </Protected>
        } />
        <Route path="/tracking" element={
          <Protected allowedRoles={['CLIENT']}>
            <TrackingPage />
          </Protected>
        } />
        <Route path="/orders" element={
          <Protected allowedRoles={['CLIENT']}>
            <OrdersHistoryPage />
          </Protected>
        } />

        {/* Livreur routes */}
        <Route path="/livreur" element={
          <Protected allowedRoles={['LIVREUR']}>
            <LivreurPage />
          </Protected>
        } />

        {/* Cuisine / Admin routes */}
        <Route path="/cuisine" element={
          <Protected allowedRoles={['CUISINIER', 'ADMIN']}>
            <CuisinePage />
          </Protected>
        } />

        {/* Redirect root */}
        <Route path="/" element={
          user ? (
            user.role === 'CLIENT' ? <Navigate to="/home" /> :
            user.role === 'LIVREUR' ? <Navigate to="/livreur" /> :
            <Navigate to="/cuisine" />
          ) : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            color: '#1A1A2E',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
