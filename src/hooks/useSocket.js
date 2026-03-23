import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const useSocket = () => {
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        console.log('🔌 Initializing socket connection...')

        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: 10,
            timeout: 30000,
            forceNew: true
        })

        socketInstance.on('connect', () => {
            console.log('✅ Connected to server with ID:', socketInstance.id)
            setConnected(true)
        })

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server. Reason:', reason)
            setConnected(false)
        })

        socketInstance.on('connect_error', (error) => {
            console.error('🚫 Connection error:', error)
            setConnected(false)
        })

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconnected after', attemptNumber, 'attempts')
            setConnected(true)
        })

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Attempting to reconnect... Attempt:', attemptNumber)
        })

        socketInstance.on('reconnect_error', (error) => {
            console.error('🚫 Reconnection error:', error)
        })

        socketInstance.on('reconnect_failed', () => {
            console.error('💀 Failed to reconnect')
            setConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            console.log('🧹 Cleaning up socket connection')
            socketInstance.close()
        }
    }, [])

    return { socket, connected }
}