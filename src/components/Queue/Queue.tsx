import { FC, useEffect } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'

export const Queue: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    let joinedSuccessfully = false
    
    useEffect(() => {
        socket.emit('join_queue')
        socket.on('public_game_started', ({ gameId, gameState, playerColor, colorMapping }) => {
            joinedSuccessfully = true
            navigate(`/game/${gameId}`, { state: { gameState, playerColor, colorMapping } })
        })
        return () => {
            if (!joinedSuccessfully) {
                socket.emit('leave_queue')
            }
            socket.off('public_game_started')
        }
    }, [])
    
    return <div>You&apos;ll join a new game soon</div>
}
