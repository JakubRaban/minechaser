import { FC, useEffect } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'

export const Queue: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    let joinedSuccessfully = false
    
    useEffect(() => {
        socket.emit('join_queue')
        socket.on('game_joined', ({ gameId, gameState, playerColor }) => {
            joinedSuccessfully = true
            navigate(`/game/${gameId}`, { state: { gameState, playerColor } })
        })
        return () => {
            if (!joinedSuccessfully) {
                socket.emit('leave_queue')
            }
            socket.off('game_joined')
        }
    }, [])
    
    return <div>You&apos;ll join a new game soon</div>
}
