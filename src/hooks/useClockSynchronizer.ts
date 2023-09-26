import { useEffect, useState } from 'react'
import { useTimeOffset } from './context/useTimeOffset'
import { useSocket } from './context/useSocket'

interface ObservationResponse {
    clientRequestTime: number
    serverResponseTime: number
}

export const useClockSynchronizer = () => {
    const { socket } = useSocket()
    const { setTimeOffset } = useTimeOffset()
    const [observations, setObservations] = useState<number[]>([])
    
    useEffect(() => {
        let counter = 0
        const interval = setInterval(() => {
            socket.emit('clock_sync', { clientRequestTime: Date.now() }, ({ clientRequestTime, serverResponseTime }: ObservationResponse) => {
                setObservations(o => [...o, serverResponseTime - (Date.now() + clientRequestTime) / 2])
                counter++
            })
            if (counter >= 5) clearInterval(interval)
        }, 500)
    }, [])
    
    useEffect(() => {
        if (observations.length) {
            setTimeOffset(Math.floor(observations.reduce((acc, obs) => acc + obs) / observations.length))
        }
    }, [observations])
}
