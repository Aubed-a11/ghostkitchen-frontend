import { useEffect } from 'react'

export function useWebSocket(userId, role) {
  useEffect(() => {
    // WebSocket desactive en attendant la config HTTPS
    return () => {}
  }, [userId, role])
}
