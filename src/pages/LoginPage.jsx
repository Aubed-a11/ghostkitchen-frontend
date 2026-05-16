import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuthStore } from '../context/store'
import { Button, Input } from '../components/UI'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('+22997000001')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    if (!phone.trim()) return toast.error('Entrez votre numéro')
    setLoading(true)
    try {
      const { data } = await authAPI.sendOtp(phone, name)
      setDevOtp(data.otp) // dev only
      setStep('otp')
      toast.success('Code OTP envoyé !')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur envoi OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error('Code OTP incomplet')
    setLoading(true)
    try {
      const { data } = await authAPI.verifyOtp(phone, otp)
      login({ phone: data.phone, name: data.name, role: data.role, id: data.userId }, data.token)
      toast.success(`Bienvenue ${data.name} !`)
      const roleRoutes = {
        CLIENT: '/home',
        LIVREUR: '/livreur',
        CUISINIER: '/cuisine',
        ADMIN: '/cuisine',
      }
      navigate(roleRoutes[data.role] || '/home')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Code incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      maxWidth: 420, margin: '0 auto',
      padding: '0 20px',
      justifyContent: 'center',
      position: 'relative', zIndex: 1,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, #FF6B35, #FF8C61)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(255,107,53,0.3)',
        }}>🍽️</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E' }}>GhostKitchen Pro</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>Cotonou · Abomey-Calavi · Bénin</p>
      </div>

      {step === 'phone' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: 24, padding: 24,
            border: '1px solid rgba(255,255,255,0.6)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <Input
              label="Numéro de téléphone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+229 97 00 00 01"
            />
            <Input
              label="Votre nom"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Akoué Dossou"
            />
          </div>
          <Button onClick={handleSendOtp} disabled={loading}>
            {loading ? 'Envoi...' : 'Recevoir le code OTP →'}
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {devOtp && (
            <div style={{
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.25)',
              borderRadius: 14, padding: '12px 16px',
              fontSize: 14, color: '#1A1A2E',
            }}>
              🔐 Code OTP (dev) : <strong style={{ fontSize: 18, letterSpacing: 4 }}>{devOtp}</strong>
            </div>
          )}
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: 24, padding: 24,
            border: '1px solid rgba(255,255,255,0.6)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              ✓ Code envoyé au <strong>{phone}</strong>
            </p>
            <Input
              label="Code OTP (6 chiffres)"
              type="number"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 6))}
              placeholder="Ex: 345678"
              style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center' }}
            />
          </div>
          <Button onClick={handleVerifyOtp} disabled={loading}>
            {loading ? 'Vérification...' : 'Connexion →'}
          </Button>
          <Button variant="secondary" onClick={() => setStep('phone')}>
            ← Changer de numéro
          </Button>
        </div>
      )}
    </div>
  )
}
