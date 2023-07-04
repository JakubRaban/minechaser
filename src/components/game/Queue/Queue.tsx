import { FC, useEffect, useState } from 'react'
import { useSocket } from '../../../hooks/useSocket'
import { Navigate } from 'react-router-dom'

export const Queue: FC = () => {
    const { socket } = useSocket()
    const [gameId, setGameId] = useState<string | null>(null)

    useEffect(() => {
        socket.emit('join_queue')
        socket.on('game_joined', ({ game_id: gameId }) => setGameId(gameId))
        return () => {
            socket.emit('leave_queue')
            socket.off('game_joined')
        }
    }, [])

    if (!gameId) {
        return <div>You&apos;ll join a new game soon</div>
    }

    return <Navigate to={`/game/${gameId}`} />
}
