import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../hooks/useSocket'

interface PrivateGameLoadingProps {
    singlePlayer?: boolean
}

export const PrivateGameLoading: FC<PrivateGameLoadingProps> = ({ singlePlayer }) => {
    const { socket } = useSocket()
    const navigate = useNavigate()

    useEffect(() => {
        if (singlePlayer) {
            socket.emit('create_single_player_game')
            socket.on('single_player_game_started', ({ gameId, gameState, playerColor, colorMapping }) => {
                navigate(`/game/${gameId}`, { state: { gameState, playerColor, colorMapping } })
            })
        } else {
            socket.emit('create_private_game')
            socket.on('private_game_lobby_update', ({ gameId, players }) => {
                navigate(`/game/${gameId}`, { state: { players } })
            })
        }
        return () => {
            socket.off(singlePlayer ? 'single_player_game_started' : 'private_game_lobby_update')
        }
    }, [])

    return <div>Creating private game...</div>
}
