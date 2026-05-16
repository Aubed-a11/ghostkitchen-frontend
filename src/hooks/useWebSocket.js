import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useOrderStore } from '../context/store'

export function useWebSocket(userId, role) {
  const clientRef = useRef(null)
  const { updateOrder, addOrder, setActiveOrders } = useOrderStore()

  useEffect(() => {
    if (!userId) return

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected')

        // Cuisine / Admin: subscribe to all orders
        if (role === 'ADMIN' || role === 'CUISINIER') {
          stompClient.subscribe('/topic/cuisine/orders', (msg) => {
            const order = JSON.parse(msg.body)
            updateOrder(order)
          })
        }

        // Client: subscribe to their own orders
        if (role === 'CLIENT') {
          stompClient.subscribe(`/topic/client/${userId}/order`, (msg) => {
            const order = JSON.parse(msg.body)
            updateOrder(order)
          })
        }

        // Livreur: subscribe to delivery updates
        if (role === 'LIVREUR') {
          stompClient.subscribe(`/topic/livreur/${userId}/order`, (msg) => {
            const order = JSON.parse(msg.body)
            updateOrder(order)
          })
        }
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
    })

    stompClient.activate()
    clientRef.current = stompClient

    return () => {
      stompClient.deactivate()
    }
  }, [userId, role])

  return clientRef
}
