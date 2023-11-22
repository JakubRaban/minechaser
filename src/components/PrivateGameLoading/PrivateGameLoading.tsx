import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../hooks/context/useSocket'
import { useLocation } from 'react-router'
import { LoadingScreen } from '../lib/LoadingScreen/LoadingScreen'

interface PrivateGameLoadingProps {
    singlePlayer?: boolean
}

const PrivateGameLoading: FC<PrivateGameLoadingProps> = ({ singlePlayer }) => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const { state } = useLocation()
    const { restartedGameId: gameId } = state ?? {}

    useEffect(() => {
        socket.on('single_player_game_started', ({ gameId, gameState, playerColor, colorMapping }) => {
            navigate(`/game/${gameId}`, { replace: true, state: { gameState, playerColor, colorMapping } })
        })
        socket.on('private_game_lobby_update', ({ gameId, players }) => {
            navigate(`/game/${gameId}`, { replace: true, state: { players } })
        })
        
        if (singlePlayer) {
            socket.emit('create_single_player_game')
        } else if (gameId) {
            socket.emit('restart_game', { gameId })
        } else {
            socket.emit('create_private_game')
        }
        return () => {
            socket.off('single_player_game_started')
            socket.off('private_game_lobby_update')
        }
    }, [])

    return <LoadingScreen />
}

export default PrivateGameLoading
